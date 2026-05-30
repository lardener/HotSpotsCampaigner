import { useState, useEffect, useMemo, useRef } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation, useApolloClient } from '@apollo/client/react';
import { NavigationTree, TreeItem, NodeType } from './NavigationTree';
import { ActiveCampaignsList } from './ActiveCampaignsList';
import { CampaignGenerator } from './CampaignGenerator';
import { CreateCommandForm } from './CreateCommandForm';
import { Welcome } from './Welcome';
import { LedgerDashboard } from './LedgerDashboard';
import { CommandDashboard } from './CommandDashboard';
import { CampaignTheaterView } from './CampaignTheaterView';
import { MercenaryRegistryView } from './MercenaryRegistryView';
import { Detachment } from '../types/global.d';
import { MyDeploymentsList } from './MyDeploymentsList';
import { TerminalOverlay } from './TerminalOverlay';

export type TabType = 'my-campaigns' | 'create-campaign' | 'commands' | 'ledger' | 'public-campaigns' | 'command-dashboard' | 'intel-hub' | 'my-deployments';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const INACTIVITY_TIMEOUT_MS = Number(import.meta.env.VITE_INACTIVITY_TIMEOUT_MS) || 30 * 60 * 1000;

const GET_MY_COMMANDS = gql`
  query GetMyCommands {
    myCommands {
      id
      name
      totalSupportPoints
      reputation
      commandingOfficer
      detachments {
        id
        name
        campaignId
        campaignName
      }
    }
  }
`;

const GET_MANAGED_CAMPAIGNS = gql`
  query GetManagedCampaigns($status: String) {
    managedCampaigns(status: $status) {
      id
      name
      systemName
      description
      status
      trackCount
      primaryEmployer
      secondaryEmployer
      payRate
      salvageTerms
      supportTerms
      transportTerms
      commandRights
      payStep
      salvageStep
      supportStep
      transportStep
      commandStep
      contracts {
        id
        employerCategory
        missionType
        payRate
        payStep
        salvageTerms
        salvageStep
        supportTerms
        supportStep
        transportTerms
        transportStep
        commandRights
        commandStep
        primaryContract
      }
      factions {
        id
        factionName
      }
      tracks {
        id
        trackName
        sequenceOrder
        location
        nextSession
        attackerFactionId
        monthIndex
      }
      participatingDetachments {
        id
        name
        mercenaryCommandId
      }
    }
  }
`;

const DELETE_COMMAND = gql`
  mutation DeleteCommand($commandId: ID!, $force: Boolean) {
    deleteCommand(commandId: $commandId, force: $force)
  }
`;

const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($displayName: String!) {
    updateUserProfile(displayName: $displayName) {
      id
      displayName
      role
    }
  }
`;

const LOGIN_WITH_TOKEN = gql`
  mutation LoginWithToken($token: String!) {
    loginWithToken(token: $token)
  }
`;

interface GetMyCommandsData {
    myCommands: {
        id: string;
        name: string;
        totalSupportPoints: number;
        reputation: number;
        commandingOfficer: string;
        detachments?: Detachment[];
    }[];
}

interface ManagedCampaignsData {
    managedCampaigns: {
        id: string;
        name: string;
        systemName: string;
        description: string;
        status: string;
        trackCount: number;
        primaryEmployer: string;
        secondaryEmployer: string;
        payRate: number;
        salvageTerms: string;
        supportTerms: string;
        transportTerms: string;
        commandRights: string;
        payStep: number;
        salvageStep: number;
        supportStep: number;
        transportStep: number;
        commandStep: number;
        contracts: {
            id: string;
            employerCategory: string;
            missionType: string;
            payRate: number;
            payStep: number;
            salvageTerms: string;
            salvageStep: number;
            supportTerms: string;
            supportStep: number;
            transportTerms: string;
            transportStep: number;
            commandRights: string;
            commandStep: number;
            primaryContract: boolean;
        }[];
        factions: {
            id: string;
            factionName: string;
        }[];
        tracks: {
            id: string;
            trackName: string;
            sequenceOrder: number;
            location?: string;
            nextSession?: string;
            attackerFactionId?: string;
            monthIndex?: number;
        }[];
        participatingDetachments?: Detachment[];

    }[];
}

interface MainDashboardProps {
    user: { name: string; id: string; role?: string; displayName?: string | null } | null;
    onLogout: () => void;
    onRefreshProfile?: () => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({ user, onLogout, onRefreshProfile }) => {
    const [activeTab, setActiveTab] = useState<TabType>('intel-hub');
    const [commands, setCommands] = useState<GetMyCommandsData['myCommands']>([]);
    const [selectedCommandId, setSelectedCommandId] = useState<string | null>(null);
    const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
    const [selectedDetachmentId, setSelectedDetachmentId] = useState<string | null>(null);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [isCreatingCommand, setIsCreatingCommand] = useState(false);
    const [campaignFilter, setCampaignFilter] = useState<string>('ACTIVE');
    const [isEditingName, setIsEditingName] = useState(false);
    const [editName, setEditName] = useState(user?.displayName || user?.name || '');
    const [isChildSyncing, setIsChildSyncing] = useState(false);

    const [overlay, setOverlay] = useState<{
        title: string;
        message: string;
        onConfirm: () => void;
        onCancel?: () => void;
        variant?: 'alert' | 'info';
    } | null>(null);

    const client = useApolloClient();

    const handleManualRefresh = async () => {
        setIsChildSyncing(true);
        try {
            await client.refetchQueries({ include: "active" });
        } catch (err) {
            console.error("Global refresh failed:", err);
        } finally {
            setIsChildSyncing(false);
        }
    };

    const lastActivityTimeRef = useRef(Date.now());
    const [inviteToken, setInviteToken] = useState('');
    const [loginWithToken] = useMutation(LOGIN_WITH_TOKEN);

    // Centralize role check
    const isManager = useMemo(() => {
        return user?.role === 'ROLE_AUTHENTICATED';
    }, [user]);

    const handleTokenLogin = async () => {
        if (!inviteToken.trim()) return;
        try {
            await loginWithToken({ variables: { token: inviteToken } });
            window.location.reload(); // Refresh to pick up the new session/role
        } catch (err) {
            console.error("Login failed:", err);
            setOverlay({
                title: "COMMUNICATIONS ERROR",
                message: "INVALID OR EXPIRED INVITATION KEY. ACCESS DENIED.",
                onConfirm: () => setOverlay(null)
            });
        }
    };

    const resetActivityTimer = () => {
        lastActivityTimeRef.current = Date.now();
    };

    useEffect(() => {
        // Set up event listeners for user activity
        const activityEvents = ['mousemove', 'keydown', 'click'];
        activityEvents.forEach(event => {
            document.addEventListener(event, resetActivityTimer);
        });

        // Set up interval to check for inactivity
        const inactivityInterval = setInterval(() => {
            if (user && Date.now() - lastActivityTimeRef.current > INACTIVITY_TIMEOUT_MS) {
                console.log("User inactive for over 30 minutes. Logging out.");
                onLogout(); // Trigger logout
            }
        }, 15 * 1000); // Check every 15 seconds

        // Clean up event listeners and interval on component unmount
        return () => {
            activityEvents.forEach(event => {
                document.removeEventListener(event, resetActivityTimer);
            });
            clearInterval(inactivityInterval);
        };
    }, [user, onLogout]); // Re-run effect if user or onLogout changes

    // Sync editName when user prop changes
    useEffect(() => {
        setEditName(user?.displayName || user?.name || '');
    }, [user]);

    const { loading, error, data, refetch } = useQuery<GetMyCommandsData>(GET_MY_COMMANDS, {
        skip: !user,
        fetchPolicy: 'network-only',
        notifyOnNetworkStatusChange: true
    });

    const { loading: loadingManaged, data: managedData, refetch: refetchManaged } = useQuery<ManagedCampaignsData>(GET_MANAGED_CAMPAIGNS, {
        variables: { status: campaignFilter },
        skip: !user,
        notifyOnNetworkStatusChange: true
    });

    // Priority-based initial branch expansion and selection
    const initialJumpPerformed = useRef(false);
    useEffect(() => {
        if (!loading && !loadingManaged && !initialJumpPerformed.current && data && managedData) {
            const myCmds = data.myCommands || [];
            const hasDeployments = myCmds.some(cmd => cmd.detachments?.some((det: any) => det.campaignId));
            const hasCommands = myCmds.length > 0;
            const hasManaged = (managedData?.managedCampaigns?.length ?? 0) > 0;

            if (hasDeployments) {
                setSelectedNodeId('root-deployments');
                setActiveTab('my-deployments');
            } else if (isManager && hasManaged) {
                setSelectedNodeId('root-campaigns');
                setActiveTab('my-campaigns');
            } else if (hasCommands) {
                setSelectedNodeId('root-commands');
                setActiveTab('commands');
            } else {
                // Fallback to Global Intel Hub
                setSelectedNodeId('root-intel');
                setActiveTab('intel-hub');
            }
            initialJumpPerformed.current = true;
        }
    }, [loading, loadingManaged, data, managedData, isManager]);

    // Add logging to catch the specific reason for the "COMMUNICATIONS BREAKDOWN"
    useEffect(() => {
        if (error) {
            console.error("GraphQL Registry Error:", error);
        }
    }, [error]);

    const [deleteCommand] = useMutation(DELETE_COMMAND);
    const [updateUserProfile] = useMutation(UPDATE_USER_PROFILE);

    const handleNameUpdate = async () => {
        if (!editName.trim()) return setIsEditingName(false);
        try {
            await updateUserProfile({ variables: { displayName: editName } });
            setIsEditingName(false);
            onRefreshProfile?.();
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (data?.myCommands) {
            setCommands([...data.myCommands]); // Force a fresh reference
            if (data.myCommands.length > 0 && !selectedCommandId) {
                setSelectedCommandId(data.myCommands[0].id);
            }
        }
    }, [data, selectedCommandId]);

    // Map internal state to the TreeItem structure
    const treeData = useMemo((): TreeItem[] => {
        const deploymentNodes: TreeItem[] = [];

        // Aggregate all detachments for the "Current Deployments" view
        commands.forEach(cmd => {
            if (cmd.detachments) {
                cmd.detachments.forEach((det: Detachment) => {
                    if (det.campaignId) {
                        deploymentNodes.push({
                            id: `deployment-${det.id}`,
                            label: `${cmd.name} - ${det.name}`,
                            type: 'DEPLOYMENT' as NodeType,
                            metadata: { detachmentId: det.id, commandId: cmd.id }
                        });
                    }
                });
            }
        });

        const hasDeployments = deploymentNodes.length > 0;
        const hasCommands = commands.length > 0;
        const hasManaged = (managedData?.managedCampaigns?.length ?? 0) > 0;
        const isLoaded = !loading && !loadingManaged;

        // Priority logic for initial expansion
        const expandDeployments = hasDeployments;
        const expandCommands = !expandDeployments && hasCommands;
        const expandManaged = !expandDeployments && !expandCommands && hasManaged;
        const expandIntel = isLoaded && !expandDeployments && !expandCommands && !expandManaged;

        return [
            {
                id: 'root-deployments',
                label: 'CURRENT DEPLOYMENTS',
                type: 'ROOT' as NodeType,
                initiallyExpanded: expandDeployments,
                children: deploymentNodes
            },
            {
                id: 'root-commands',
                label: 'MERCENARY COMMANDS',
                type: 'ROOT' as NodeType,
                initiallyExpanded: expandCommands,
                children: commands.map(cmd => ({
                    id: cmd.id,
                    label: cmd.name || 'UNNAMED UNIT',
                    type: 'COMMAND' as NodeType,
                    children: cmd.detachments?.map((det: Detachment) => ({
                        id: `cmd-det-${det.id}`,
                        label: det.name,
                        type: 'DETACHMENT' as NodeType,
                        metadata: { detachmentId: det.id, commandId: cmd.id }
                    }))
                }))
            },
            ...(isManager ? [{
                id: 'root-campaigns',
                label: 'MANAGED CAMPAIGNS',
                type: 'ROOT' as NodeType,
                initiallyExpanded: expandManaged,
                children: managedData?.managedCampaigns.map(camp => ({
                    id: camp.id,
                    label: camp.name,
                    type: 'CAMPAIGN' as NodeType,
                    children: camp.participatingDetachments?.map((det: Detachment) => ({
                        id: `camp-det-${det.id}`,
                        label: det.name,
                        type: 'DETACHMENT' as NodeType,
                        metadata: {
                            detachmentId: det.id,
                            commandId: det.mercenaryCommandId,
                            campaignId: camp.id,
                            managerView: true
                        }
                    }))
                }))
            }] : []),
            {
                id: 'root-intel',
                label: 'GLOBAL INTEL',
                type: 'ROOT' as NodeType,
                initiallyExpanded: expandIntel,
                children: [
                    { id: 'public-intel', label: 'AVAILABLE CONTRACTS', type: 'INTEL' as NodeType },
                    ...(isManager ? [
                        { id: 'create-campaign', label: 'NEW CAMPAIGN', type: 'INTEL' as NodeType }
                    ] : [])
                ]
            }
        ];
    }, [commands, managedData, loading, loadingManaged, isManager]);

    const handleTreeSelect = (item: TreeItem) => {
        // 1. Always exit creation mode when navigating via the tree
        setIsCreatingCommand(false);
        setSelectedNodeId(item.id);

        // 2. Map tree nodes to the specific pages described in the plan
        if (item.id === 'root-deployments') {
            setActiveTab('my-deployments');
        } else if (item.id === 'root-commands') {
            setSelectedDetachmentId(null);
            setActiveTab('commands'); // Registry / Aggregate View
        } else if (item.type === 'COMMAND') {
            setSelectedCommandId(item.id);
            setSelectedDetachmentId(null);
            setActiveTab('command-dashboard'); // Unit Dossier
        } else if (item.type === 'DETACHMENT' || item.type === 'DEPLOYMENT') {
            if (item.metadata?.commandId) setSelectedCommandId(item.metadata.commandId);
            if (item.metadata?.detachmentId) setSelectedDetachmentId(item.metadata.detachmentId);

            if (item.metadata?.managerView) {
                setActiveTab('command-dashboard');
                return;
            }
            setActiveTab('command-dashboard'); // Focus the unit dossier for this detachment
        } else if (item.id === 'root-intel') {
            setActiveTab('intel-hub'); // Intelligence Overview
        } else if (item.id === 'root-campaigns') {
            setSelectedCampaignId(null);
            setSelectedDetachmentId(null);
            setActiveTab('my-campaigns'); // Operational Overview
        } else if (item.type === 'CAMPAIGN') {
            setSelectedCampaignId(item.id);
            setSelectedDetachmentId(null);
            setActiveTab('my-campaigns'); // Specific Campaign Focus
        } else if (item.id === 'public-intel') {
            setActiveTab('public-campaigns'); // Global Intel
        } else if (item.id === 'create-campaign') {
            setActiveTab('create-campaign'); // Creation Tool
        }
    };

    const onCreateNew = () => {
        setActiveTab('create-campaign');
    };

    const getSelectedNodeId = () => {
        if (selectedNodeId) return selectedNodeId;
        if (activeTab === 'create-campaign') return 'create-campaign';
        if (activeTab === 'public-campaigns') return 'public-intel';
        if (activeTab === 'my-deployments') return 'root-deployments';
        if (activeTab === 'intel-hub') return 'root-intel';
        if (activeTab === 'my-campaigns') return 'root-campaigns';
        if (activeTab === 'commands') return 'root-commands';
        if (['command-dashboard', 'ledger'].includes(activeTab)) return selectedCommandId || undefined;
        return undefined;
    };

    const handleDeleteCommand = async (commandId: string, force = false) => {
        if (!force) {
            setOverlay({
                title: "CONFIRM UNIT DECOMMISSION",
                message: "ARE YOU SURE YOU WANT TO SCRAP THIS COMMAND? THIS ACTION IS IRREVERSIBLE.",
                variant: 'alert',
                onConfirm: () => { setOverlay(null); handleDeleteCommand(commandId, true); },
                onCancel: () => setOverlay(null)
            });
            return;
        }
        try {
            await deleteCommand({ variables: { commandId, force } });
            if (selectedCommandId === commandId) {
                setSelectedCommandId(null);
            }
            fetchCommands();
        } catch (err: any) {
            // GraphQL errors are handled differently; we look for specific message or extension
            if (err.message?.includes("WARNING_ACTIVE_CAMPAIGN")) {
                setOverlay({
                    title: "ACTIVE DEPLOYMENT WARNING",
                    message: "WARNING: THIS COMMAND HAS ACTIVE DETACHMENTS IN ONGOING CAMPAIGNS. DELETING WILL FORCE THEIR WITHDRAWAL. PROCEED?",
                    variant: 'alert',
                    onConfirm: () => { setOverlay(null); handleDeleteCommand(commandId, true); },
                    onCancel: () => setOverlay(null)
                });
            } else {
                console.error("Failed to delete command", err);
                setOverlay({
                    title: "SYSTEM FAILURE",
                    message: "COMMUNICATIONS FAILURE: UNABLE TO SCRAP COMMAND.",
                    variant: 'alert',
                    onConfirm: () => setOverlay(null)
                });
            }
        }
    };

    const fetchCommands = async () => {
        try {
            const result = await refetch();
            if (result.data?.myCommands) {
                setCommands([...result.data.myCommands]);
            }
        } catch (err) {
            console.error("Manual refetch failed:", err);
        }
    };

    // If not authenticated, show available campaigns and the generator
    if (!user) {
        return (
            <div className="public-landing">
                <div className="landing-header">
                    <h1 className="main-title">HOTSPOTS: CAMPAIGNER</h1>
                    <div className="login-options" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <button type="button" className="mode-btn theme-red" onClick={() => window.location.href = `${API_BASE_URL}/login/oauth2/authorization/google`} title="Login to your account" style={{ padding: '10px 20px' }}>
                            FEDERATED LOGIN
                        </button>
                        <div className="token-login-box" style={{ borderLeft: '2px solid var(--terminal-border)', paddingLeft: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <div className="status-bar theme-red" style={{ padding: '0 5px', display: 'flex', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    className="table-input"
                                    placeholder="ENTER INVITE KEY"
                                    value={inviteToken}
                                    onChange={(e) => setInviteToken(e.target.value.toUpperCase())}
                                    style={{ width: '180px', textTransform: 'uppercase', border: 'none' }}
                                />
                            </div>
                            <button
                                type="button"
                                className="mode-btn theme-red"
                                onClick={handleTokenLogin}
                                style={{ fontSize: '0.8rem', padding: '5px 15px' }}
                            >
                                JOIN
                            </button>
                        </div>
                    </div>
                </div>
                <div className="container landing-section">
                    <h2 className="section-title">AVAILABLE CAMPAIGNS</h2>
                    <ActiveCampaignsList />
                </div>
                <div className="container landing-section mt-40">
                    <h2 className="section-title">CAMPAIGN GENERATOR</h2>
                    <CampaignGenerator user={undefined} />
                </div>
            </div>
        );
    }

    const getThemeClass = () => {
        if (activeTab === 'ledger') return 'theme-green';
        if (activeTab === 'commands' || activeTab === 'command-dashboard') return 'theme-amber';
        if (activeTab === 'my-campaigns') return 'theme-blue';
        if (['create-campaign', 'public-campaigns'].includes(activeTab)) return 'theme-red';
        return 'theme-green';
    };

    const renderTabContent = () => {
        if (loading && commands.length === 0) {
            return <div className="loading-intel">SYNCHRONIZING WITH MERCENARY REGISTRY...</div>;
        }

        if (error) {
            return <div className="placeholder-content" style={{ color: 'var(--terminal-alert)' }}>
                <h2>COMMUNICATIONS BREAKDOWN</h2>
                <p>Unable to retrieve registry data. Please verify your connection.</p>
            </div>;
        }

        if (isCreatingCommand) {
            return (
                <CreateCommandForm
                    user={user}
                    onCancel={() => setIsCreatingCommand(false)}
                    onSuccess={(newCmd) => {
                        setIsCreatingCommand(false);
                        fetchCommands();
                        setSelectedCommandId(newCmd.id);
                        setSelectedNodeId(newCmd.id);
                        setActiveTab('commands');
                    }}
                />
            );
        }

        // Allow access to creation, management, and public tabs even if no command is selected yet
        const commandContextRequired = ['ledger', 'command-dashboard'].includes(activeTab);

        if (!selectedCommandId && commandContextRequired) {
            return (
                <div className="placeholder-content">
                    <h2>NO MERCENARY COMMAND DETECTED</h2>
                    <p>Register your unit with the Mercenary Review and Bonding Commission.</p>
                    <button className="login-button" onClick={() => setIsCreatingCommand(true)}>CREATE COMMAND</button>
                </div>
            );
        }

        switch (activeTab) {
            case 'my-campaigns':
                if (!isManager) {
                    return (
                        <div className="placeholder-content">
                            <h2 style={{ color: 'var(--terminal-alert)' }}>UNAUTHORIZED ACCESS</h2>
                            <p className="restricted-text">THEATER MANAGEMENT PROTOCOLS ARE RESTRICTED TO CERTIFIED MANAGERS.</p>
                            <button className="mode-btn" onClick={() => setActiveTab('commands')}>RETURN TO REGISTRY</button>
                        </div>
                    );
                }
                return (
                    <CampaignTheaterView
                        managedData={managedData as any}
                        loadingManaged={loadingManaged}
                        selectedCampaignId={selectedCampaignId}
                        campaignFilter={campaignFilter}
                        onSetFilter={setCampaignFilter}
                        onSelectCampaign={(id) => { setSelectedCampaignId(id); setSelectedNodeId(id); }}
                        onReturnToList={() => { setSelectedCampaignId(null); setSelectedNodeId('root-campaigns'); }}
                        onCreateNew={onCreateNew}
                        onSelectDetachment={handleTreeSelect}
                        onRefresh={handleManualRefresh}
                        onSyncChange={setIsChildSyncing}
                    />
                );
            case 'create-campaign':
                if (!isManager) {
                    return (
                        <div className="placeholder-content">
                            <h2 style={{ color: 'var(--terminal-alert)' }}>UNAUTHORIZED ACCESS</h2>
                            <p className="restricted-text">CAMPAIGN AUTHORIZATION REQUIRES COMMAND LEVEL CLEARANCE.</p>
                            <button className="mode-btn" onClick={() => setActiveTab('commands')}>RETURN TO REGISTRY</button>
                        </div>
                    );
                }
                return (
                    <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        <header className="dashboard-header">
                            <h1 className="terminal-text">NEW CAMPAIGN ENLISTMENT</h1>
                        </header>
                        <CampaignGenerator
                            user={user}
                            onSaveSuccess={(newCampaign) => {
                                fetchCommands();
                                refetchManaged();
                                setSelectedCampaignId(newCampaign.id);
                                setSelectedNodeId(newCampaign.id);
                                setActiveTab('my-campaigns');
                            }}
                        />
                    </div>
                );
            case 'commands':
                return (
                    <MercenaryRegistryView
                        commands={commands}
                        selectedCommandId={selectedCommandId}
                        onSelectCommand={setSelectedCommandId}
                        onDeleteCommand={handleDeleteCommand}
                        onEstablishCommand={() => setIsCreatingCommand(true)}
                        onViewUnitProfile={() => setActiveTab('command-dashboard')}
                    />
                );
            case 'ledger':
                const Dashboard = LedgerDashboard as any;
                return selectedCommandId ? (
                    <Dashboard commandId={selectedCommandId} detachmentId={selectedDetachmentId || undefined} />
                ) : null;
            case 'command-dashboard':
                return selectedCommandId ? (
                    <CommandDashboard
                        commandId={selectedCommandId}
                        detachmentId={selectedDetachmentId || undefined}
                        isManagerView={selectedNodeId?.startsWith('camp-det-')}
                        onViewCampaign={(campaignId) => {
                            setSelectedCampaignId(campaignId);
                            setActiveTab('my-campaigns');
                        }}
                        onRefreshTree={() => {
                            refetch();
                            refetchManaged();
                        }}
                        onSyncChange={setIsChildSyncing}
                    />
                ) : null;
            case 'public-campaigns':
                return (
                    <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        <header className="dashboard-header">
                            <h1 className="terminal-text">AVAILABLE CAMPAIGNS</h1>
                        </header> {/* Added title to button */}
                        <ActiveCampaignsList />
                    </div>
                );
            case 'my-deployments':
                return (
                    <MyDeploymentsList
                        commands={commands}
                        onSelectDetachment={handleTreeSelect}
                    />
                );
            case 'intel-hub':
                return (
                    <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        <header className="dashboard-header">
                            <h1 className="terminal-text">HINTERLANDS INTELLIGENCE HUB</h1>
                            <p className="restricted-text">GLOBAL SIGNAL INTERCEPT ACTIVE</p>
                        </header>
                        <div className="grid-2-col mt-30">
                            <div
                                className="dashboard-section establish-command-placeholder"
                                style={{ height: '240px', flexDirection: 'column', gap: '15px' }}
                                onClick={() => { setActiveTab('public-campaigns'); setSelectedNodeId('public-intel'); }}
                            >
                                <h2 className="terminal-text" style={{ fontSize: '1.5rem' }}>AVAILABLE CONTRACTS</h2>
                                <p className="sm-text">BROWSE THEATERS RECRUITING MERCENARY COMMANDS</p>
                            </div>
                            {isManager && <div
                                className="dashboard-section establish-command-placeholder"
                                style={{ height: '240px', flexDirection: 'column', gap: '15px' }}
                                onClick={() => { setActiveTab('create-campaign'); setSelectedNodeId('create-campaign'); }}
                            >
                                <h2 className="terminal-text" style={{ fontSize: '1.5rem' }}>NEW CAMPAIGN PROTOCOL</h2>
                                <p className="sm-text">AUTHORIZE AND ESTABLISH A NEW CAMPAIGN THEATER</p>
                            </div>}
                        </div>
                    </div>
                );
            default:
                return <Welcome userName={user.name} />;
        }
    };

    return (
        <div className="dashboard-layout vw-100 vh-100 flex overflow-hidden">
            <aside className="sidebar-container" style={{ display: 'grid', gridTemplateRows: 'auto 1fr auto', height: '100vh', width: '280px', borderRight: '1px solid var(--terminal-border)' }}>
                <div className="sidebar-header-main" style={{ padding: '20px', borderBottom: '1px solid var(--terminal-border)', position: 'static' }}>
                    <div className="flex-center mb-5">
                        <svg width="24" height="24" viewBox="0 0 100 100" className="sidebar-icon-svg">
                            <polygon points="50,10 85,30 85,70 50,90 15,70 15,30" fill="none" stroke="var(--terminal-amber)" strokeWidth="8" />
                            <circle cx="50" cy="50" r="18" fill="none" stroke="var(--terminal-amber)" strokeWidth="4" />
                            <path d="M50 20 L50 80 M20 50 L80 50" stroke="var(--terminal-amber)" strokeWidth="4" />
                        </svg>
                        <span className="sidebar-logo-text">HSC-TACTICAL</span>
                    </div>
                    <div className="restricted-text sidebar-subtitle" style={{ textAlign: 'center' }}>COMMAND & CONTROL INTERFACE</div>
                    <div style={{ borderBottom: '1px solid var(--terminal-border)', opacity: 0.3, marginTop: '8px' }} />
                    <div className="flex items-center mt-5" style={{ gap: '10px', height: '20px', justifyContent: 'center' }}>
                        {(loading || loadingManaged || isChildSyncing) ? (
                            <span
                                className="pulse"
                                style={{ fontSize: '0.6rem', color: 'var(--terminal-amber)', border: '1px solid var(--terminal-amber)', padding: '0 4px' }}
                                title="Synchronizing mercenary registry, campaign theater data, and active tactical updates."
                            >SYNCING</span>
                        ) : (
                            <button
                                type="button"
                                className="mode-btn theme-amber"
                                style={{ padding: '0 4px', fontSize: '0.6rem', height: '18px' }}
                                onClick={handleManualRefresh}
                                title="Manual synchronization of all active tactical data"
                            >RESYNC</button>
                        )}
                    </div>
                </div>
                <div className="sidebar-content-scroll" style={{ overflowY: 'auto', padding: '10px 0' }}>
                    <NavigationTree
                        data={treeData}
                        onSelect={handleTreeSelect}
                        selectedId={getSelectedNodeId()}
                    />
                </div>
                <div className="sidebar-footer-main" style={{ padding: '20px', borderTop: '1px solid var(--terminal-border)', backgroundColor: 'rgba(0,0,0,0.3)', position: 'static' }}>
                    <div className="user-profile-mini sidebar-user-info">
                        👤 {isEditingName ? (
                            <div className="status-bar theme-amber" style={{ display: 'inline-flex', padding: '0 5px', alignItems: 'center' }}>
                                <input
                                    className="table-input"
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    onBlur={handleNameUpdate}
                                    onKeyDown={e => e.key === 'Enter' && handleNameUpdate()}
                                    autoFocus
                                    style={{ fontSize: '0.8rem', padding: '2px', width: '150px', border: 'none' }}
                                    title="Enter to save, click away to cancel"
                                />
                            </div>
                        ) : (
                            <span onClick={() => setIsEditingName(true)} style={{ cursor: 'pointer' }} title="Click to set callsign">
                                {user?.displayName || user?.name}
                            </span>
                        )}
                    </div>
                    <button type="button" className="mode-btn logout-btn sidebar-logout-btn" onClick={onLogout} title="Disconnect from the system">DISCONNECT NEURAL LINK</button>
                </div>
            </aside>
            <main className={`main-content-wrapper ${getThemeClass()} h-100`}>
                {renderTabContent()}
                {overlay && (
                    <TerminalOverlay
                        title={overlay.title}
                        message={overlay.message}
                        variant={overlay.variant}
                        onConfirm={overlay.onConfirm}
                        onCancel={overlay.onCancel}
                        themeClass={getThemeClass()}
                    />
                )}
            </main>
        </div>
    );
};