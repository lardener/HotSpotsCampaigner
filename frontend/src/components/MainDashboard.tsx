/*
 * HotSpots Campaigner - Battletech Mercenaries campaign management SaaS.
 * Copyright (C) 2026 Jose Ferrer
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { useState, useEffect, useMemo, useRef, useCallback, lazy, Suspense } from 'react'
import { useQuery, useMutation, useApolloClient } from '@apollo/client/react'
import { TreeItem, NodeType } from './NavigationTree'
import { ActiveCampaignsList } from './ActiveCampaignsList'
import { ActiveCampaignsBackground } from './ActiveCampaignsBackground'
import { CampaignGenerator } from './CampaignGenerator'
import { CreateCommandForm } from './CreateCommandForm'
import { LedgerDashboard } from './LedgerDashboard'
import { CommandDashboard } from './CommandDashboard'
import { PublicCampaignTheaterView } from './PublicCampaignTheaterView'
import { Sidebar } from './Sidebar'
import { Campaign, UserProfile, MercenaryCommand } from '../types/generated'
import { GetMyCommandsQuery, GetManagedCampaignsQuery } from '../types/operations'
import { MercenaryRegistryBackground } from './MercenaryRegistryBackground'
import { MyDeploymentsList } from './MyDeploymentsList'
import { TerminalOverlay } from './TerminalOverlay'

// Code-split heavy views so they are loaded on demand, shrinking the initial bundle.
const CampaignTheaterView = lazy(() =>
  import('./CampaignTheaterView').then((m) => ({ default: m.CampaignTheaterView })),
)
const MercenaryRegistryView = lazy(() =>
  import('./MercenaryRegistryView').then((m) => ({ default: m.MercenaryRegistryView })),
)
import {
  GetMyCommandsDocument,
  GetManagedCampaignsDocument,
  UpdateUserProfileDocument,
  LoginWithTokenDocument,
  DeleteCommandDocument, // This was already correct
} from '../types/operations'

export type TabType =
  | 'my-campaigns'
  | 'create-campaign'
  | 'commands'
  | 'ledger'
  | 'public-campaigns'
  | 'command-dashboard'
  | 'intel-hub'
  | 'my-deployments'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_GRAPHQL_API_URL || '/api'
const INACTIVITY_TIMEOUT_MS = Number(import.meta.env.VITE_INACTIVITY_TIMEOUT_MS) || 30 * 60 * 1000
const WARNING_THRESHOLD_MS = 2 * 60 * 1000 // Show warning 2 minutes before logout
const LONG_INACTIVITY_PERIOD_MS = 20 * 60 * 1000 // After 20 minutes of inactivity, check every minute
const SHORT_WARNING_PERIOD_MS = 30 * 1000 // Last 30 seconds before logout, check every second

const LAST_ACTIVITY_KEY = 'hsc_last_activity'

interface MainDashboardProps {
  user: UserProfile | null
  onLogout: () => void
  onRefreshProfile?: () => void
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  user,
  onLogout,
  onRefreshProfile,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('intel-hub')
  const [commands, setCommands] = useState<MercenaryCommand[]>([])
  const [selectedCommandId, setSelectedCommandId] = useState<string | null>(null)
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null)
  const [selectedDetachmentId, setSelectedDetachmentId] = useState<string | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [isCreatingCommand, setIsCreatingCommand] = useState(false)
  const [campaignFilter, setCampaignFilter] = useState<string>('ACTIVE')
  const [showInactivityWarning, setShowInactivityWarning] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState(user?.displayName || user?.name || '')
  const [isChildSyncing, setIsChildSyncing] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [publicViewingCampaignId, setPublicViewingCampaignId] = useState<string | null>(null)

  const [overlay, setOverlay] = useState<{
    title: string
    message: string
    onConfirm: (val?: string) => void | Promise<void>
    onCancel?: () => void
    variant?: 'alert' | 'info'
    showInputField?: boolean
    inputPlaceholder?: string
    inputInitialValue?: string
    inputType?: string
    inputLabel?: string
  } | null>(null)

  const client = useApolloClient()

  const handleManualRefresh = async () => {
    setIsChildSyncing(true)
    try {
      await client.refetchQueries({ include: 'active' })
    } catch (err) {
      console.error('Global refresh failed:', err)
    } finally {
      setIsChildSyncing(false)
    }
  }

  const lastActivityTimeRef = useRef<number>(Date.now())
  const lastSyncTimeRef = useRef<number>(0)
  const inactivityTimerRef = useRef<number | null>(null) // To store setTimeout ID
  const [inviteToken, setInviteToken] = useState('')
  const [loginWithToken] = useMutation(LoginWithTokenDocument)

  // Centralize role check
  const isManager = useMemo(() => {
    return user?.role === 'ROLE_AUTHENTICATED'
  }, [user])

  const handleTokenLogin = async () => {
    if (!inviteToken.trim()) return
    try {
      await loginWithToken({ variables: { token: inviteToken } })
      window.location.reload() // Refresh to pick up the new session/role
    } catch (err) {
      console.error('Login failed:', err)
      setOverlay({
        title: 'COMMUNICATIONS ERROR',
        message: 'INVALID OR EXPIRED INVITATION KEY. ACCESS DENIED.',
        onConfirm: () => setOverlay(null),
      })
    }
  }

  const scheduleNextInactivityCheck = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
      inactivityTimerRef.current = null
    }

    if (!user) {
      setShowInactivityWarning(false)
      setRemainingSeconds(0)
      return
    }

    const now = Date.now()
    const timeSinceLastActivity = now - lastActivityTimeRef.current
    const remainingTime = INACTIVITY_TIMEOUT_MS - timeSinceLastActivity

    if (remainingTime <= 0) {
      console.log(`User inactive for over ${INACTIVITY_TIMEOUT_MS / 60000} minutes. Logging out.`)
      localStorage.removeItem(LAST_ACTIVITY_KEY)
      onLogout()
      setShowInactivityWarning(false)
      setRemainingSeconds(0)
      return
    }

    let nextCheckDelay: number
    if (remainingTime <= SHORT_WARNING_PERIOD_MS) {
      // Final 30 seconds
      nextCheckDelay = 1000 // Every second
      setShowInactivityWarning(true)
      setRemainingSeconds(Math.ceil(remainingTime / 1000))
    } else if (remainingTime <= WARNING_THRESHOLD_MS) {
      // 2 minutes to 30 seconds before logout
      nextCheckDelay = 15 * 1000 // Every 15 seconds
      setShowInactivityWarning(true)
      setRemainingSeconds(Math.ceil(remainingTime / 1000))
    } else if (timeSinceLastActivity >= LONG_INACTIVITY_PERIOD_MS) {
      // 20 minutes to 28 minutes of inactivity
      nextCheckDelay = 60 * 1000 // Every minute
      setShowInactivityWarning(false)
      setRemainingSeconds(0)
    } else {
      // Initial 20 minutes of inactivity
      nextCheckDelay = LONG_INACTIVITY_PERIOD_MS - timeSinceLastActivity // Wait until 20m mark
      setShowInactivityWarning(false)
      setRemainingSeconds(0)
    }

    inactivityTimerRef.current = window.setTimeout(
      scheduleNextInactivityCheck,
      Math.max(nextCheckDelay, 5000),
    )
  }, [user, onLogout])

  const resetActivityTimer = useCallback(() => {
    const now = Date.now()
    lastActivityTimeRef.current = now
    setShowInactivityWarning(false)
    setRemainingSeconds(0)

    // Sync with other tabs periodically (throttled to every 30 seconds to avoid localStorage overhead)
    if (now - lastSyncTimeRef.current > 30000) {
      lastSyncTimeRef.current = now
      localStorage.setItem(LAST_ACTIVITY_KEY, now.toString())
    }
    scheduleNextInactivityCheck()
  }, [scheduleNextInactivityCheck])

  useEffect(() => {
    // Initialize from storage to stay in sync with other active tabs upon mount/refresh
    const storedLastActivity = localStorage.getItem(LAST_ACTIVITY_KEY)
    if (storedLastActivity) {
      lastActivityTimeRef.current = parseInt(storedLastActivity, 10)
    }

    if (user) {
      // Reset activity timer locally and globally whenever the user state changes (e.g., successful login)
      const now = Date.now()
      lastActivityTimeRef.current = now
      lastSyncTimeRef.current = now
      localStorage.setItem(LAST_ACTIVITY_KEY, now.toString())
      scheduleNextInactivityCheck()
    }

    // Listen for activity synchronization from other browser tabs
    const handleSync = (e: StorageEvent) => {
      if (e.key === LAST_ACTIVITY_KEY && e.newValue) {
        lastActivityTimeRef.current = parseInt(e.newValue, 10)
        scheduleNextInactivityCheck()
      }
    }
    window.addEventListener('storage', handleSync)

    // Set up event listeners for user activity
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart', 'wheel']
    activityEvents.forEach((event) => {
      document.addEventListener(event, resetActivityTimer)
    })

    return () => {
      window.removeEventListener('storage', handleSync)
      activityEvents.forEach((event) => {
        document.removeEventListener(event, resetActivityTimer)
      })
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }
    }
  }, [user, onLogout, resetActivityTimer, scheduleNextInactivityCheck]) // Re-run effect if user or onLogout changes

  // Sync editName when user prop changes
  useEffect(() => {
    setEditName(user?.displayName || user?.name || '')
  }, [user])

  const { loading, error, data, refetch } = useQuery<GetMyCommandsQuery>(GetMyCommandsDocument, {
    skip: !user,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  })

  const {
    loading: loadingManaged,
    data: managedData,
    refetch: refetchManaged,
  } = useQuery<GetManagedCampaignsQuery>(GetManagedCampaignsDocument, {
    variables: { status: campaignFilter },
    skip: !user,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  })

  // Priority-based initial branch expansion and selection
  const initialJumpPerformed = useRef(false)
  useEffect(() => {
    if (!loading && !loadingManaged && !initialJumpPerformed.current && data && managedData) {
      const myCmds = data.myCommands || []
      const hasDeployments = myCmds
        .filter((cmd): cmd is NonNullable<typeof cmd> => cmd != null)
        .some((cmd) => cmd.detachments?.some((det) => det != null && det.campaignId))
      const hasCommands = myCmds.length > 0
      const hasManaged = (managedData?.managedCampaigns?.length ?? 0) > 0

      if (hasDeployments) {
        setSelectedNodeId('root-deployments')
        setActiveTab('my-deployments')
      } else if (isManager && hasManaged) {
        setSelectedNodeId('root-campaigns')
        setActiveTab('my-campaigns')
      } else if (hasCommands) {
        setSelectedNodeId('root-commands')
        setActiveTab('commands')
      } else {
        // Fallback to Global Intel Hub
        setSelectedNodeId('root-intel')
        setActiveTab('intel-hub')
      }
      initialJumpPerformed.current = true
    }
  }, [loading, loadingManaged, data, managedData, isManager])

  // Add logging to catch the specific reason for the "COMMUNICATIONS BREAKDOWN"
  useEffect(() => {
    if (error) {
      console.error('GraphQL Registry Error:', error)
    }
  }, [error])

  const [deleteCommand] = useMutation(DeleteCommandDocument)
  const [updateUserProfile] = useMutation(UpdateUserProfileDocument)

  const handleNameUpdate = async () => {
    if (!editName.trim()) return setIsEditingName(false)
    try {
      await updateUserProfile({ variables: { displayName: editName } })
      setIsEditingName(false)
      onRefreshProfile?.()
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (data?.myCommands) {
      setCommands(data.myCommands as unknown as MercenaryCommand[]) // Force a fresh reference
      if (data.myCommands.length > 0 && !selectedCommandId) {
        const firstCmd = data.myCommands[0]
        if (firstCmd != null) {
          setSelectedCommandId(firstCmd.id)
        }
      }
    }
  }, [data, selectedCommandId])

  // Map internal state to the TreeItem structure
  const treeData = useMemo((): TreeItem[] => {
    const deploymentNodes: TreeItem[] = []

    // Aggregate all detachments for the "Current Deployments" view
    ;(commands || []).forEach((cmd) => {
      if (cmd != null && cmd.detachments) {
        cmd.detachments.forEach((det) => {
          if (det != null && det.campaignId) {
            deploymentNodes.push({
              id: `deployment-${det.id}`,
              label: `${cmd.name} - ${det.name}${(det as any).campaignRating != null ? ` (Rating: ${(det as any).campaignRating})` : ''}`,
              type: 'DEPLOYMENT' as NodeType,
              metadata: { detachmentId: det.id, commandId: cmd.id },
            })
          }
        })
      }
    })

    const hasDeployments = deploymentNodes.length > 0
    const hasCommands = (commands || []).length > 0
    const hasManaged = (managedData?.managedCampaigns?.length ?? 0) > 0
    const isLoaded = !loading && !loadingManaged

    // Priority logic for initial expansion
    const expandDeployments = hasDeployments
    const expandCommands = !expandDeployments && hasCommands
    const expandManaged = !expandDeployments && !expandCommands && hasManaged
    const expandIntel = isLoaded && !expandDeployments && !expandCommands && !expandManaged

    return [
      {
        id: 'root-deployments',
        label: 'CURRENT DEPLOYMENTS',
        type: 'ROOT' as NodeType,
        initiallyExpanded: expandDeployments,
        children: deploymentNodes,
      },
      {
        id: 'root-commands',
        label: 'MERCENARY COMMANDS',
        type: 'ROOT' as NodeType,
        initiallyExpanded: expandCommands,
        children: (commands || [])
          .filter((cmd): cmd is NonNullable<typeof cmd> => cmd != null)
          .map((cmd) => ({
            id: cmd.id,
            label: cmd.name || 'UNNAMED UNIT',
            type: 'COMMAND' as NodeType,
            children: cmd.detachments
              ?.filter((det): det is NonNullable<typeof det> => det != null)
              .map((det) => ({
                id: `cmd-det-${det.id}`,
                label: `${det.name}${(det as any).campaignRating != null ? ` (Rating: ${(det as any).campaignRating})` : ''}`,
                type: 'DETACHMENT' as NodeType,
                metadata: { detachmentId: det.id, commandId: cmd.id },
              })),
          })),
      },
      ...(isManager
        ? [
            {
              id: 'root-campaigns',
              label: 'MANAGED CAMPAIGNS',
              type: 'ROOT' as NodeType,
              initiallyExpanded: expandManaged,
              children: (managedData?.managedCampaigns || [])
                .filter((camp): camp is NonNullable<typeof camp> => camp != null)
                .map((camp) => ({
                  id: camp.id,
                  label: camp.name || 'Unnamed Campaign',
                  type: 'CAMPAIGN' as NodeType,
                  children: (camp.participatingDetachments || [])
                    .filter((det): det is NonNullable<typeof det> => det != null)
                    .map((det) => ({
                      id: `camp-det-${det.id}`,
                      label: `${det.name}${(det as any).campaignRating != null ? ` (Rating: ${(det as any).campaignRating})` : ''}`,
                      type: 'DETACHMENT' as NodeType,
                      metadata: {
                        detachmentId: det.id,
                        commandId: det.mercenaryCommandId,
                        campaignId: camp.id,
                        managerView: true,
                      },
                    })),
                })),
            },
          ]
        : []),
      {
        id: 'root-intel',
        label: 'GLOBAL INTEL',
        type: 'ROOT' as NodeType,
        initiallyExpanded: expandIntel,
        children: [
          { id: 'public-intel', label: 'AVAILABLE CONTRACTS', type: 'INTEL' as NodeType },
          ...(isManager
            ? [{ id: 'create-campaign', label: 'NEW CAMPAIGN', type: 'INTEL' as NodeType }]
            : []),
        ],
      },
    ]
  }, [commands, managedData, loading, loadingManaged, isManager])

  const handleTreeSelect = (item: TreeItem) => {
    // 1. Always exit creation mode when navigating via the tree
    setIsCreatingCommand(false)
    setPublicViewingCampaignId(null)
    setSelectedNodeId(item.id)

    // 2. Map tree nodes to the specific pages described in the plan
    if (item.id === 'root-deployments') {
      setActiveTab('my-deployments')
    } else if (item.id === 'root-commands') {
      setSelectedDetachmentId(null)
      setActiveTab('commands') // Registry / Aggregate View
    } else if (item.type === 'COMMAND') {
      setSelectedCommandId(item.id)
      setSelectedDetachmentId(null)
      setActiveTab('command-dashboard') // Unit Dossier
    } else if (item.type === 'DETACHMENT' || item.type === 'DEPLOYMENT') {
      if (item.metadata?.commandId) setSelectedCommandId(item.metadata.commandId)
      if (item.metadata?.detachmentId) setSelectedDetachmentId(item.metadata.detachmentId)

      if (item.metadata?.managerView) {
        setActiveTab('command-dashboard')
        return
      }
      setActiveTab('command-dashboard') // Focus the unit dossier for this detachment
    } else if (item.id === 'root-intel') {
      setActiveTab('intel-hub') // Intelligence Overview
    } else if (item.id === 'root-campaigns') {
      setSelectedCampaignId(null)
      setSelectedDetachmentId(null)
      setActiveTab('my-campaigns') // Operational Overview
    } else if (item.type === 'CAMPAIGN') {
      setSelectedCampaignId(item.id)
      setSelectedDetachmentId(null)
      setActiveTab('my-campaigns') // Specific Campaign Focus
    } else if (item.id === 'public-intel') {
      setActiveTab('public-campaigns') // Global Intel
    } else if (item.id === 'create-campaign') {
      setActiveTab('create-campaign') // Creation Tool
    }
  }

  const onCreateNew = () => {
    setActiveTab('create-campaign')
  }

  const getSelectedNodeId = () => {
    if (selectedNodeId) return selectedNodeId
    if (activeTab === 'create-campaign') return 'create-campaign'
    if (activeTab === 'public-campaigns') return 'public-intel'
    if (activeTab === 'my-deployments') return 'root-deployments'
    if (activeTab === 'intel-hub') return 'root-intel'
    if (activeTab === 'my-campaigns') return 'root-campaigns'
    if (activeTab === 'commands') return 'root-commands'
    if (['command-dashboard', 'ledger'].includes(activeTab)) return selectedCommandId || undefined
    return undefined
  }

  const handleDeleteCommand = async (commandId: string, force = false) => {
    if (!force) {
      setOverlay({
        title: 'CONFIRM UNIT DECOMMISSION',
        message: 'ARE YOU SURE YOU WANT TO SCRAP THIS COMMAND? THIS ACTION IS IRREVERSIBLE.',
        variant: 'alert',
        onConfirm: () => {
          setOverlay(null)
          handleDeleteCommand(commandId, true)
        },
        onCancel: () => setOverlay(null),
      })
      return
    }
    try {
      await deleteCommand({ variables: { commandId, force } })
      if (selectedCommandId === commandId) {
        setSelectedCommandId(null)
      }
      fetchCommands()
    } catch (err: any) {
      // GraphQL errors are handled differently; we look for specific message or extension
      if (err.message?.includes('WARNING_ACTIVE_CAMPAIGN')) {
        setOverlay({
          title: 'ACTIVE DEPLOYMENT WARNING',
          message:
            'WARNING: THIS COMMAND HAS ACTIVE DETACHMENTS IN ONGOING CAMPAIGNS. DELETING WILL FORCE THEIR WITHDRAWAL. PROCEED?',
          variant: 'alert',
          onConfirm: () => {
            setOverlay(null)
            handleDeleteCommand(commandId, true)
          },
          onCancel: () => setOverlay(null),
        })
      } else {
        console.error('Failed to delete command', err)
        setOverlay({
          title: 'SYSTEM FAILURE',
          message: 'COMMUNICATIONS FAILURE: UNABLE TO SCRAP COMMAND.',
          variant: 'alert',
          onConfirm: () => setOverlay(null),
        })
      }
    }
  }

  const fetchCommands = async () => {
    try {
      const result = await refetch()
      if (result.data?.myCommands) {
        setCommands(result.data.myCommands as unknown as MercenaryCommand[])
      }
    } catch (err) {
      console.error('Manual refetch failed:', err)
    }
  }

  // If not authenticated, show available campaigns and the generator
  if (!user) {
    if (publicViewingCampaignId) {
      return (
        <div className="public-landing">
          <PublicCampaignTheaterView
            campaignId={publicViewingCampaignId}
            onBack={() => setPublicViewingCampaignId(null)}
          />
        </div>
      )
    }
    return (
      <div className="public-landing">
        <div className="landing-header" style={{ textAlign: 'center' }}>
          <h1 className="main-title">HOTSPOTS: CAMPAIGNER</h1>
          <div
            className="login-options"
            style={{
              display: 'flex',
              gap: '20px',
              alignItems: 'flex-start',
              justifyContent: 'center',
              marginTop: '30px',
            }}
          >
            <button
              type="button"
              className="mode-btn theme-red"
              onClick={() =>
                (window.location.href = `${API_BASE_URL}/login/oauth2/authorization/google`)
              }
              title="Login with your Google account"
              style={{
                height: '36px',
                padding: '0 25px',
                display: 'flex',
                alignItems: 'center',
                boxSizing: 'border-box',
                margin: 0,
                backgroundColor: 'var(--terminal-red)',
                color: 'black',
                opacity: 1,
              }}
            >
              FEDERATED LOGIN
            </button>
            <div
              className="token-login-box"
              style={{
                borderLeft: '2px solid var(--terminal-border)',
                paddingLeft: '20px',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
                height: '36px',
              }}
            >
              <div
                className="status-bar theme-red"
                style={{
                  height: '36px',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  boxSizing: 'border-box',
                  margin: 0,
                }}
              >
                <input
                  type="text"
                  className="table-input"
                  placeholder="ENTER INVITE KEY"
                  value={inviteToken}
                  onChange={(e) => setInviteToken(e.target.value.toUpperCase())}
                  style={{
                    width: '200px',
                    textTransform: 'uppercase',
                    height: '100%',
                    padding: '0 15px',
                    margin: 0,
                    display: 'block',
                    boxSizing: 'border-box',
                    lineHeight: '36px',
                  }}
                />
              </div>
              <button
                type="button"
                className="mode-btn theme-red"
                onClick={handleTokenLogin}
                style={{
                  fontSize: '0.8rem',
                  height: '36px',
                  padding: '0 20px',
                  display: 'flex',
                  alignItems: 'center',
                  boxSizing: 'border-box',
                  margin: 0,
                  backgroundColor: 'var(--terminal-red)',
                  color: 'black',
                  opacity: 1,
                }}
              >
                JOIN
              </button>
            </div>
          </div>
        </div>
        <div className="container landing-section">
          <h2 className="section-title">AVAILABLE CAMPAIGNS</h2>
          <ActiveCampaignsList onSelectCampaign={setPublicViewingCampaignId} />
        </div>
        <div className="container landing-section mt-40">
          <h2 className="section-title">CAMPAIGN GENERATOR</h2>
          <CampaignGenerator user={undefined} />
        </div>
      </div>
    )
  }

  const getThemeClass = () => {
    if (activeTab === 'ledger') return 'theme-green'
    if (activeTab === 'commands' || activeTab === 'command-dashboard') return 'theme-amber'
    if (activeTab === 'my-campaigns') return 'theme-blue'
    if (['create-campaign', 'public-campaigns'].includes(activeTab)) return 'theme-red'
    return 'theme-green'
  }

  const renderTabContent = () => {
    if (loading && (commands || []).length === 0) {
      return <div className="loading-intel">SYNCHRONIZING WITH MERCENARY REGISTRY...</div>
    }

    if (error) {
      return (
        <div className="placeholder-content" style={{ color: 'var(--terminal-alert)' }}>
          <h2>COMMUNICATIONS BREAKDOWN</h2>
          <p>Unable to retrieve registry data. Please verify your connection.</p>
        </div>
      )
    }

    if (isCreatingCommand) {
      return (
        <CreateCommandForm
          user={{ name: user?.name || '', displayName: user?.displayName || undefined }}
          onCancel={() => setIsCreatingCommand(false)}
          onSuccess={(newCmd) => {
            setIsCreatingCommand(false)
            fetchCommands()
            if (newCmd) {
              setSelectedCommandId(newCmd.id)
              setSelectedNodeId(newCmd.id)
            }
            setActiveTab('commands')
          }}
        />
      )
    }

    // Allow access to creation, management, and public tabs even if no command is selected yet
    const commandContextRequired = ['ledger', 'command-dashboard'].includes(activeTab)

    if (!selectedCommandId && commandContextRequired) {
      return (
        <div
          className="placeholder-content"
          style={{
            position: 'relative',
            overflow: 'hidden',
            minHeight: '100%',
            background: 'transparent',
          }}
        >
          <MercenaryRegistryBackground />
          <h2>NO MERCENARY COMMAND DETECTED</h2>
          <p>Register your unit with the Mercenary Review and Bonding Commission.</p>
          <button className="login-button" onClick={() => setIsCreatingCommand(true)}>
            CREATE COMMAND
          </button>
        </div>
      )
    }

    switch (activeTab) {
      case 'my-campaigns':
        return (
          <CampaignTheaterView
            managedData={managedData as { managedCampaigns: Campaign[] } | undefined}
            loadingManaged={loadingManaged}
            selectedCampaignId={selectedCampaignId}
            campaignFilter={campaignFilter}
            onSetFilter={setCampaignFilter}
            onSelectCampaign={(id) => {
              setSelectedCampaignId(id)
              setSelectedNodeId(id)
            }}
            onReturnToList={() => {
              setSelectedCampaignId(null)
              setSelectedNodeId('root-campaigns')
            }}
            onCreateNew={onCreateNew}
            onSelectDetachment={handleTreeSelect}
            onRefresh={handleManualRefresh}
            onSyncChange={setIsChildSyncing}
            userCommands={(commands || []).filter(
              (cmd): cmd is NonNullable<typeof cmd> => cmd != null,
            )}
          />
        )
      case 'create-campaign':
        if (!isManager) {
          return (
            <div className="placeholder-content">
              <h2 style={{ color: 'var(--terminal-alert)' }}>UNAUTHORIZED ACCESS</h2>
              <p className="restricted-text">
                CAMPAIGN AUTHORIZATION REQUIRES COMMAND LEVEL CLEARANCE.
              </p>
              <button className="mode-btn" onClick={() => setActiveTab('commands')}>
                RETURN TO REGISTRY
              </button>
            </div>
          )
        }
        return (
          <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <header className="dashboard-header">
              <h1 className="terminal-text">NEW CAMPAIGN ENLISTMENT</h1>
            </header>
            <CampaignGenerator
              user={{ name: user?.name || '' }}
              onSaveSuccess={(newCampaign) => {
                fetchCommands()
                refetchManaged()
                if (newCampaign?.id) {
                  setSelectedCampaignId(newCampaign.id)
                  setSelectedNodeId(newCampaign.id)
                }
                setActiveTab('my-campaigns')
              }}
            />
          </div>
        )
      case 'commands':
        return (
          <MercenaryRegistryView
            commands={(commands || []).filter((cmd): cmd is NonNullable<typeof cmd> => cmd != null)}
            selectedCommandId={selectedCommandId}
            onSelectCommand={setSelectedCommandId}
            onDeleteCommand={handleDeleteCommand}
            onEstablishCommand={() => setIsCreatingCommand(true)}
            onViewUnitProfile={() => setActiveTab('command-dashboard')}
          />
        )
      case 'ledger': {
        const Dashboard = LedgerDashboard as any
        return selectedCommandId ? (
          <Dashboard
            commandId={selectedCommandId}
            detachmentId={selectedDetachmentId || undefined}
          />
        ) : null
      }
      case 'command-dashboard':
        return selectedCommandId ? (
          <CommandDashboard
            commandId={selectedCommandId}
            detachmentId={selectedDetachmentId || undefined}
            isManagerView={selectedNodeId?.startsWith('camp-det-')}
            onViewCampaign={(campaignId) => {
              setSelectedCampaignId(campaignId)
              setActiveTab('my-campaigns')
            }}
            onRefreshTree={() => {
              refetch()
              refetchManaged()
            }}
            onSyncChange={setIsChildSyncing}
          />
        ) : null
      case 'public-campaigns':
        if (publicViewingCampaignId) {
          return (
            <PublicCampaignTheaterView
              campaignId={publicViewingCampaignId}
              onBack={() => setPublicViewingCampaignId(null)}
            />
          )
        }

        return (
          <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <header className="dashboard-header">
              <h1 className="terminal-text">AVAILABLE CAMPAIGNS</h1>
            </header>{' '}
            {/* Added title to button */}
            <ActiveCampaignsList onSelectCampaign={setPublicViewingCampaignId} />
          </div>
        )
      case 'my-deployments':
        return (
          <MyDeploymentsList
            commands={(commands || []).filter((cmd): cmd is NonNullable<typeof cmd> => cmd != null)}
            onSelectDetachment={handleTreeSelect}
          />
        )
      case 'intel-hub':
        return publicViewingCampaignId ? (
          <PublicCampaignTheaterView
            campaignId={publicViewingCampaignId}
            onBack={() => setPublicViewingCampaignId(null)}
          />
        ) : (
          <div
            className="container"
            style={{
              maxWidth: '1000px',
              margin: '0 auto',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '100%',
              background: 'transparent',
            }}
          >
            <ActiveCampaignsBackground />
            <header className="dashboard-header">
              <h1 className="terminal-text">HINTERLANDS INTELLIGENCE HUB</h1>
              <p className="restricted-text">GLOBAL SIGNAL INTERCEPT ACTIVE</p>
            </header>
            <div className="grid-2-col mt-30">
              <div
                className="dashboard-section establish-command-placeholder"
                style={{ height: '240px', flexDirection: 'column', gap: '15px' }}
                onClick={() => {
                  setActiveTab('public-campaigns')
                  setSelectedNodeId('public-intel')
                }}
              >
                <h2 className="terminal-text" style={{ fontSize: '1.5rem' }}>
                  AVAILABLE CONTRACTS
                </h2>
                <p className="sm-text">BROWSE THEATERS RECRUITING MERCENARY COMMANDS</p>
              </div>
              {isManager && (
                <div
                  className="dashboard-section establish-command-placeholder"
                  style={{ height: '240px', flexDirection: 'column', gap: '15px' }}
                  onClick={() => {
                    setActiveTab('create-campaign')
                    setSelectedNodeId('create-campaign')
                  }}
                >
                  <h2 className="terminal-text" style={{ fontSize: '1.5rem' }}>
                    NEW CAMPAIGN PROTOCOL
                  </h2>
                  <p className="sm-text">AUTHORIZE AND ESTABLISH A NEW CAMPAIGN THEATER</p>
                </div>
              )}
            </div>
          </div>
        )
    }
  }

  return (
    <div className="dashboard-layout vw-100 vh-100 flex overflow-hidden">
      <Sidebar
        treeData={treeData}
        onSelect={handleTreeSelect}
        selectedId={getSelectedNodeId()}
        user={{
          name: user?.name || '',
          id: user?.id || '',
          displayName: user?.displayName || undefined,
          role: user?.role || undefined,
        }}
        onLogout={onLogout}
        syncing={loading || loadingManaged || isChildSyncing}
        onManualRefresh={handleManualRefresh}
        isEditingName={isEditingName}
        setIsEditingName={setIsEditingName}
        editName={editName}
        setEditName={setEditName}
        onNameUpdate={handleNameUpdate}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main
        className={`main-content-wrapper ${getThemeClass()} h-100`}
        style={{ position: 'relative', background: 'transparent' }}
      >
        <Suspense fallback={<div className="loading-intel">DEPLOYING VIEW MODULE...</div>}>
          {renderTabContent()}
        </Suspense>
        {showInactivityWarning && (
          <TerminalOverlay
            title="INACTIVITY WARNING"
            message={`YOUR SESSION IS ABOUT TO EXPIRE DUE TO INACTIVITY. AUTOMATIC LOGOUT IN ${Math.floor(remainingSeconds / 60)}:${(remainingSeconds % 60).toString().padStart(2, '0')}.`}
            confirmLabel="STAY LOGGED IN"
            onConfirm={resetActivityTimer}
            themeClass="theme-red"
            variant="alert"
          />
        )}
        {overlay && (
          <TerminalOverlay
            title={overlay.title}
            message={overlay.message}
            variant={overlay.variant}
            onConfirm={overlay.onConfirm}
            onCancel={overlay.onCancel}
            themeClass={getThemeClass()}
            showInputField={overlay.showInputField}
            inputPlaceholder={overlay.inputPlaceholder}
            inputInitialValue={overlay.inputInitialValue}
            inputType={overlay.inputType}
            inputLabel={overlay.inputLabel}
          />
        )}
      </main>
    </div>
  )
}
