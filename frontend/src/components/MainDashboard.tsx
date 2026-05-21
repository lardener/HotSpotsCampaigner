import { useState, useEffect, useMemo } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { NavigationTree, TreeItem, NodeType } from './NavigationTree';
import { ActiveCampaignsList } from './ActiveCampaignsList';
import { RandomCampaignGenerator } from './RandomCampaignGenerator';
import { Welcome } from './Welcome';
import { LedgerDashboard } from './LedgerDashboard';
import { CreateCommandForm } from './CreateCommandForm';
import { CommandDashboard } from './CommandDashboard';
import { CampaignTheaterView } from './CampaignTheaterView';

export type TabType = 'my-campaigns' | 'create-campaign' | 'commands' | 'ledger' | 'public-campaigns' | 'command-dashboard';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const GET_MY_COMMANDS = gql`
  query GetMyCommands {
    myCommands {
      id
      name
      totalSupportPoints
      reputation
      experienceLevel
      commandingOfficer
      detachments {
        id
        name
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
    }
  }
`;

interface GetMyCommandsData {
    myCommands: {
        id: string;
        name: string;
        totalSupportPoints: number;
        reputation: number;
        experienceLevel: string;
        commandingOfficer: string;
        detachments?: {
            id: string;
            name: string;
        }[];
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
        }[];
        participatingDetachments?: {
            id: string;
            name: string;
            mercenaryCommandId: string;
        }[];
    }[];
}

interface MainDashboardProps {
    user: { name: string; id: string; displayName?: string | null } | null;
    onLogout: () => void;
    onRefreshProfile?: () => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({ user, onLogout, onRefreshProfile }) => {
    const [activeTab, setActiveTab] = useState<TabType>('my-campaigns');
    const [commands, setCommands] = useState<GetMyCommandsData['myCommands']>([]);
    const [selectedCommandId, setSelectedCommandId] = useState<string | null>(null);
    const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
    const [selectedDetachmentId, setSelectedDetachmentId] = useState<string | null>(null);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [isCreatingCommand, setIsCreatingCommand] = useState(false);
    const [campaignFilter, setCampaignFilter] = useState<string>('ACTIVE');
    const [isEditingName, setIsEditingName] = useState(false);
    const [editName, setEditName] = useState(user?.displayName || user?.name || '');

    // Sync editName when user prop changes
    useEffect(() => {
        setEditName(user?.displayName || user?.name || '');
    }, [user]);

    const { loading, error, data, refetch } = useQuery<GetMyCommandsData>(GET_MY_COMMANDS, {
        skip: !user,
        fetchPolicy: 'network-only' // Ensure we don't just hit the cache after a save
    });

    const { loading: loadingManaged, data: managedData, refetch: refetchManaged } = useQuery<ManagedCampaignsData>(GET_MANAGED_CAMPAIGNS, {
        variables: { status: campaignFilter },
        skip: !user // Removed activeTab restriction so the Tree always has data
    });

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
                cmd.detachments.forEach((det: any) => {
                    deploymentNodes.push({
                        id: `deployment-${det.id}`,
                        label: `${cmd.name} - ${det.name}`,
                        type: 'DEPLOYMENT' as NodeType,
                        metadata: { detachmentId: det.id, commandId: cmd.id }
                    });
                });
            }
        });

        return [
            {
                id: 'root-deployments',
                label: 'CURRENT DEPLOYMENTS',
                type: 'ROOT' as NodeType,
                children: deploymentNodes
            },
            {
                id: 'root-commands',
                label: 'MERCENARY COMMANDS',
                type: 'ROOT' as NodeType,
                children: commands.map(cmd => ({
                    id: cmd.id,
                    label: cmd.name || 'UNNAMED UNIT',
                    type: 'COMMAND' as NodeType,
                    children: cmd.detachments?.map((det: any) => ({
                        id: `cmd-det-${det.id}`,
                        label: det.name,
                        type: 'DETACHMENT' as NodeType,
                        metadata: { detachmentId: det.id, commandId: cmd.id }
                    }))
                }))
            },
            {
                id: 'root-campaigns',
                label: 'MANAGED CAMPAIGNS',
                type: 'ROOT' as NodeType,
                children: managedData?.managedCampaigns.map(camp => ({
                    id: camp.id,
                    label: camp.name,
                    type: 'CAMPAIGN' as NodeType,
                    children: camp.participatingDetachments?.map((det: any) => ({
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
            },
            {
                id: 'root-intel',
                label: 'GLOBAL INTEL',
                type: 'ROOT' as NodeType,
                children: [
                    { id: 'public-intel', label: 'AVAILABLE CONTRACTS', type: 'INTEL' as NodeType },
                    { id: 'create-campaign', label: 'NEW CAMPAIGN', type: 'INTEL' as NodeType }
                ]
            }
        ];
    }, [commands, managedData]);

    const handleTreeSelect = (item: TreeItem) => {
        // 1. Always exit creation mode when navigating via the tree
        setIsCreatingCommand(false);
        setSelectedNodeId(item.id);

        // 2. Map tree nodes to the specific pages described in the plan
        if (item.id === 'root-commands') {
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
        if (activeTab === 'my-campaigns') return 'root-campaigns';
        if (activeTab === 'commands') return 'root-commands';
        if (['command-dashboard', 'ledger'].includes(activeTab)) return selectedCommandId || undefined;
        return undefined;
    };

    const handleDeleteCommand = async (commandId: string, force = false) => {
        if (!force && !window.confirm("ARE YOU SURE YOU WANT TO SCRAP THIS COMMAND? THIS ACTION IS IRREVERSIBLE.")) {
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
                if (window.confirm("WARNING: THIS COMMAND HAS ACTIVE DETACHMENTS IN ONGOING CAMPAIGNS. DELETING WILL FORCE THEIR WITHDRAWAL. PROCEED?")) {
                    handleDeleteCommand(commandId, true);
                }
            } else {
                console.error("Failed to delete command", err);
                alert("COMMUNICATIONS FAILURE: UNABLE TO SCRAP COMMAND.");
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
                    <button type="button" className="login-button" onClick={() => window.location.href = `${API_BASE_URL}/login/oauth2/authorization/google`} title="Login to your account">
                        COMMANDER LOGIN
                    </button>
                </div>
                <div className="container landing-section">
                    <h2 className="section-title">AVAILABLE CAMPAIGNS</h2>
                    <ActiveCampaignsList />
                </div>
                <div className="container landing-section mt-40">
                    <h2 className="section-title">CAMPAIGN GENERATOR</h2>
                    <RandomCampaignGenerator user={undefined} />
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
                    />
                );
            case 'create-campaign':
                return (
                    <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        <header className="dashboard-header">
                            <h1 className="terminal-text">NEW CAMPAIGN ENLISTMENT</h1>
                        </header>
                        <RandomCampaignGenerator
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
                    <div className="container">
                        <header className="dashboard-header">
                            <h1 className="terminal-text">MERCENARY REGISTRY</h1>
                        </header>
                        <div className="command-panels-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
                            {commands.map(cmd => (
                                <div
                                    key={cmd.id}
                                    className={`dashboard-section ${selectedCommandId === cmd.id ? 'active-command-panel' : ''}`}
                                    onClick={() => setSelectedCommandId(cmd.id)} title={`Select ${cmd.name}`}
                                    style={{
                                        cursor: 'pointer',
                                        border: selectedCommandId === cmd.id ? '2px solid var(--accent-primary)' : '1px solid var(--terminal-border)',
                                        transition: 'all 0.2s ease-in-out',
                                        backgroundColor: selectedCommandId === cmd.id ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                                        position: 'relative'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 className="section-title" style={{ margin: 0 }}>{cmd.name || 'UNNAMED UNIT'}</h3>
                                        {selectedCommandId === cmd.id && <span className="restricted-text" style={{ color: 'var(--accent-primary)' }}>[ ACTIVE COMMAND ]</span>}
                                    </div> {/* Added type="button" */}

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '15px' }}>
                                        <div><span className="restricted-text" style={{ fontSize: '0.7rem', display: 'block' }}>COMMANDING OFFICER</span> {cmd.commandingOfficer || 'UNKNOWN'}</div>
                                        <div><span className="restricted-text" style={{ fontSize: '0.7rem', display: 'block' }}>SUPPORT POINTS</span> {cmd.totalSupportPoints || 0}</div>
                                        <div><span className="restricted-text" style={{ fontSize: '0.7rem', display: 'block' }}>REPUTATION</span> {cmd.reputation || 0} ({cmd.experienceLevel || 'Green'})</div> {/* Added title to button */}
                                    </div> {/* Added type="button" */}

                                    {selectedCommandId === cmd.id && (
                                        <div style={{ marginTop: '20px', borderTop: '1px solid #333', paddingTop: '15px', display: 'flex', gap: '10px' }}>
                                            <button type="button"
                                                className="mode-btn"
                                                onClick={(e) => { e.stopPropagation(); setActiveTab('my-campaigns'); }}
                                            >
                                                VIEW OPERATIONS
                                            </button>
                                            <button type="button"
                                                className="mode-btn"
                                                onClick={(e) => { e.stopPropagation(); setActiveTab('ledger'); }}
                                            >
                                                OPEN LEDGER
                                            </button>
                                            <button type="button"
                                                className="mode-btn"
                                                onClick={(e) => { e.stopPropagation(); setActiveTab('command-dashboard'); }}
                                            >
                                                COMMAND DASHBOARD
                                            </button>
                                            <button type="button"
                                                className="mode-btn"
                                                style={{ marginLeft: 'auto', border: '1px solid var(--terminal-alert)', color: 'var(--terminal-alert)' }}
                                                onClick={(e) => { e.stopPropagation(); handleDeleteCommand(cmd.id); }}
                                            >
                                                SCRAP UNIT
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div
                                className="dashboard-section establish-command-placeholder"
                                onClick={() => setIsCreatingCommand(true)}
                                title="Establish a new mercenary command"
                            > {/* Added title to button */}
                                <h3 className="terminal-text" style={{ margin: 0 }}>+ ESTABLISH NEW MERCENARY COMMAND</h3>
                            </div>
                        </div>
                    </div>
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
            default:
                return <Welcome userName={user.name} />;
        }
    };

    return (
        <div className="dashboard-layout vw-100 vh-100 flex overflow-hidden">
            <aside className="sidebar-container flex-col h-100">
                <div className="sidebar-header-main">
                    <div className="flex-center mb-5">
                        <svg width="24" height="24" viewBox="0 0 100 100" className="sidebar-icon-svg">
                            <polygon points="50,10 85,30 85,70 50,90 15,70 15,30" fill="none" stroke="var(--terminal-amber)" strokeWidth="8" />
                            <circle cx="50" cy="50" r="18" fill="none" stroke="var(--terminal-amber)" strokeWidth="4" />
                            <path d="M50 20 L50 80 M20 50 L80 50" stroke="var(--terminal-amber)" strokeWidth="4" />
                        </svg>
                        <span className="sidebar-logo-text">HSC-TACTICAL</span>
                    </div>
                    <div className="restricted-text sidebar-subtitle">COMMAND & CONTROL INTERFACE</div>
                </div>
                <NavigationTree
                    data={treeData}
                    onSelect={handleTreeSelect}
                    selectedId={getSelectedNodeId()}
                />
                <div className="sidebar-footer-main">
                    <div className="user-profile-mini sidebar-user-info">
                        👤 {isEditingName ? (
                            <input
                                className="table-input"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                onBlur={handleNameUpdate}
                                onKeyDown={e => e.key === 'Enter' && handleNameUpdate()}
                                autoFocus
                                style={{ fontSize: '0.8rem', padding: '2px', width: '150px' }}
                                title="Enter to save, click away to cancel"
                            />
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
            </main>
        </div>
    );
};