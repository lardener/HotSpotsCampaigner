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

export type TabType = 'my-campaigns' | 'create-campaign' | 'commands' | 'ledger' | 'public-campaigns' | 'command-dashboard';

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
        callsign
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
      status
      trackCount
      primaryEmployer
      participatingDetachments {
        id
        callsign
      }
    }
  }
`;

const DELETE_COMMAND = gql`
  mutation DeleteCommand($commandId: ID!, $force: Boolean) {
    deleteCommand(commandId: $commandId, force: $force)
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
            callsign: string;
        }[];
    }[];
}

interface ManagedCampaignsData {
    managedCampaigns: {
        id: string;
        name: string;
        systemName: string;
        status: string;
        trackCount: number;
        primaryEmployer: string;
        participatingDetachments?: {
            id: string;
            callsign: string;
        }[];
    }[];
}

interface MainDashboardProps {
    user: { name: string; id: string } | null;
    onLogout: () => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState<TabType>('my-campaigns');
    const [commands, setCommands] = useState<any[]>([]);
    const [selectedCommandId, setSelectedCommandId] = useState<string | null>(null);
    const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
    const [selectedDetachmentId, setSelectedDetachmentId] = useState<string | null>(null);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [isCreatingCommand, setIsCreatingCommand] = useState(false);
    const [campaignFilter, setCampaignFilter] = useState<string>('ACTIVE');

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
                        label: `${cmd.name} - ${det.callsign}`,
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
                        label: det.callsign,
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
                        label: det.callsign,
                        type: 'DETACHMENT' as NodeType,
                        metadata: { detachmentId: det.id, campaignId: camp.id }
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
            setActiveTab('ledger'); // Deployment-specific ledger
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
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <h1 className="main-title">HOTSPOTS: CAMPAIGNER</h1>
                    <button className="login-button" onClick={() => window.location.href = 'http://localhost:8080/login/oauth2/authorization/google'}>
                        COMMANDER LOGIN
                    </button>
                </div>
                <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <h2 className="section-title">AVAILABLE CAMPAIGNS</h2>
                    <ActiveCampaignsList />
                </div>
                <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', marginTop: '40px' }}>
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
                const campaign = managedData?.managedCampaigns.find(c => c.id === selectedCampaignId);

                return (
                    <div className="container">
                        {!selectedCampaignId ? (
                            <>
                                <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h1 className="terminal-text">CAMPAIGN OPERATIONS</h1>
                                        <p className="restricted-text">THEATER MANAGEMENT PROTOCOL</p>
                                    </div>
                                    <button
                                        className="mode-btn"
                                        onClick={() => setCampaignFilter(campaignFilter === 'ACTIVE' ? 'ALL' : 'ACTIVE')}
                                    >
                                        {campaignFilter === 'ACTIVE' ? '[ VIEWING: ACTIVE ONLY ]' : '[ VIEWING: ALL THEATERS ]'}
                                    </button>
                                </header>

                                <div className="command-panels-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
                                    {loadingManaged && <div className="loading-intel">RETRIEVING THEATER DATA...</div>}

                                    {managedData?.managedCampaigns.map(camp => (
                                        <div
                                            key={camp.id}
                                            className="dashboard-section"
                                            style={{
                                                border: '1px solid var(--accent-dim)',
                                                backgroundColor: camp.status === 'ACTIVE' ? 'rgba(51, 255, 51, 0.02)' : 'transparent',
                                                position: 'relative'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <h3 className="section-title" style={{ margin: 0, color: 'var(--terminal-green)' }}>{camp.name}</h3>
                                                <span className="restricted-text" style={{ color: camp.status === 'ACTIVE' ? 'var(--terminal-amber)' : 'var(--accent-dim)' }}>
                                                    [ STATUS: {camp.status} ]
                                                </span>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '20px', marginTop: '15px' }}>
                                                <div><span className="restricted-text" style={{ fontSize: '0.7rem', display: 'block' }}>PRIMARY EMPLOYER</span> {camp.primaryEmployer || 'UNKNOWN'}</div>
                                                <div><span className="restricted-text" style={{ fontSize: '0.7rem', display: 'block' }}>SYSTEM</span> {camp.systemName}</div>
                                                <div><span className="restricted-text" style={{ fontSize: '0.7rem', display: 'block' }}>TRACKS</span> {camp.trackCount}</div>
                                                <div className="text-right" style={{ alignSelf: 'end' }}>
                                                    <button className="mode-btn" style={{ fontSize: '0.8rem' }} onClick={() => { setSelectedCampaignId(camp.id); setSelectedNodeId(camp.id); }}>MANAGE THEATER</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {!loadingManaged && managedData?.managedCampaigns.length === 0 && (
                                        <div className="placeholder-content" style={{ border: '1px dashed #444' }}>
                                            <h3 className="terminal-text">NO MANAGED CAMPAIGNS FOUND</h3>
                                            <p>Initialize a new operation via the New Campaign Enlistment protocol.</p>
                                            <button className="login-button" onClick={() => setActiveTab('create-campaign')}>START NEW CAMPAIGN</button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <header className="dashboard-header">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h1 className="terminal-text">{campaign?.name}</h1>
                                            <p className="restricted-text">THEATER COMMAND DATA: {campaign?.systemName.toUpperCase()}</p>
                                        </div>
                                        <button className="mode-btn" onClick={() => { setSelectedCampaignId(null); setSelectedNodeId('root-campaigns'); }}>[ RETURN TO LIST ]</button>
                                    </div>
                                </header>
                                <div className="dashboard-section tactical-panel">
                                    <h3 className="section-title">PARTICIPATING DETACHMENTS</h3>
                                    <div className="detachment-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
                                        {campaign?.participatingDetachments?.map(det => (
                                            <div key={det.id} className="asset-card" style={{ cursor: 'pointer' }} onClick={() => handleTreeSelect({ id: `camp-det-${det.id}`, label: det.callsign, type: 'DETACHMENT', metadata: { detachmentId: det.id, campaignId: campaign.id } })}>
                                                <div className="asset-type">DETACHMENT</div>
                                                <div className="asset-label">{det.callsign}</div>
                                            </div>
                                        ))}
                                        {(!campaign?.participatingDetachments || campaign.participatingDetachments.length === 0) && (
                                            <div className="restricted-text">NO DETACHMENTS CURRENTLY DEPLOYED IN THIS THEATER.</div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
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
                                    onClick={() => setSelectedCommandId(cmd.id)}
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
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '15px' }}>
                                        <div><span className="restricted-text" style={{ fontSize: '0.7rem', display: 'block' }}>COMMANDING OFFICER</span> {cmd.commandingOfficer || 'UNKNOWN'}</div>
                                        <div><span className="restricted-text" style={{ fontSize: '0.7rem', display: 'block' }}>SUPPORT POINTS</span> {cmd.totalSupportPoints || 0}</div>
                                        <div><span className="restricted-text" style={{ fontSize: '0.7rem', display: 'block' }}>REPUTATION</span> {cmd.reputation || 0} ({cmd.experienceLevel || 'Green'})</div>
                                    </div>

                                    {selectedCommandId === cmd.id && (
                                        <div style={{ marginTop: '20px', borderTop: '1px solid #333', paddingTop: '15px', display: 'flex', gap: '10px' }}>
                                            <button
                                                className="mode-btn"
                                                onClick={(e) => { e.stopPropagation(); setActiveTab('my-campaigns'); }}
                                            >
                                                VIEW OPERATIONS
                                            </button>
                                            <button
                                                className="mode-btn"
                                                onClick={(e) => { e.stopPropagation(); setActiveTab('ledger'); }}
                                            >
                                                OPEN LEDGER
                                            </button>
                                            <button
                                                className="mode-btn"
                                                onClick={(e) => { e.stopPropagation(); setActiveTab('command-dashboard'); }}
                                            >
                                                COMMAND DASHBOARD
                                            </button>
                                            <button
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
                                className="dashboard-section"
                                onClick={() => setIsCreatingCommand(true)}
                                style={{
                                    cursor: 'pointer',
                                    border: '1px dashed #666',
                                    textAlign: 'center',
                                    padding: '30px',
                                    opacity: 0.7,
                                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
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
                    <CommandDashboard commandId={selectedCommandId} />
                ) : null;
            case 'public-campaigns':
                return (
                    <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        <header className="dashboard-header">
                            <h1 className="terminal-text">AVAILABLE CAMPAIGNS</h1>
                        </header>
                        <ActiveCampaignsList />
                    </div>
                );
            default:
                return <Welcome userName={user.name} />;
        }
    };

    return (
        <div className="dashboard-layout" style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--terminal-bg)' }}>
            <aside className="sidebar-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--terminal-bg)', width: '280px', borderRight: '1px solid var(--terminal-border)', flexShrink: 0 }}>
                <div className="sidebar-header" style={{ padding: '20px', borderBottom: '1px solid var(--terminal-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                        <svg width="24" height="24" viewBox="0 0 100 100" style={{ marginRight: '10px', filter: 'drop-shadow(0 0 5px var(--terminal-amber-dim))' }}>
                            <polygon points="50,10 85,30 85,70 50,90 15,70 15,30" fill="none" stroke="var(--terminal-amber)" strokeWidth="8" />
                            <circle cx="50" cy="50" r="18" fill="none" stroke="var(--terminal-amber)" strokeWidth="4" />
                            <path d="M50 20 L50 80 M20 50 L80 50" stroke="var(--terminal-amber)" strokeWidth="4" />
                        </svg>
                        <span className="sidebar-logo" style={{ color: 'var(--terminal-amber)', fontWeight: 'bold', fontSize: '1.2rem', textShadow: '0 0 10px var(--terminal-amber-dim)' }}>HSC-TACTICAL</span>
                    </div>
                    <div className="restricted-text" style={{ fontSize: '0.6rem', marginTop: '4px' }}>COMMAND & CONTROL INTERFACE</div>
                </div>
                <NavigationTree
                    data={treeData}
                    onSelect={handleTreeSelect}
                    selectedId={getSelectedNodeId()}
                />
                <div className="sidebar-footer" style={{ marginTop: 'auto', padding: '15px', borderTop: '1px solid var(--terminal-border)' }}>
                    <div className="user-profile-mini" style={{ fontSize: '0.8rem', marginBottom: '10px', color: '#888' }}>
                        👤 {user.name}
                    </div>
                    <button className="mode-btn logout-btn" onClick={onLogout} style={{ width: '100%', fontSize: '0.7rem' }}>DISCONNECT NEURAL LINK</button>
                </div>
            </aside>
            <main className={`main-content-wrapper ${getThemeClass()}`} style={{ flex: 1, height: '100vh', overflowY: 'auto', backgroundColor: 'var(--terminal-bg)', padding: '20px', borderLeft: '1px solid var(--terminal-border)' }}>
                {renderTabContent()}
            </main>
        </div>
    );
};