import React, { useState, useEffect } from 'react';
import { Sidebar, TabType } from './Sidebar';
import { ActiveCampaignsList } from './ActiveCampaignsList';
import { RandomCampaignGenerator } from './RandomCampaignGenerator';
import { Welcome } from './Welcome';
import { ForceDashboard } from './ForceDashboard';
import { LedgerDashboard } from './LedgerDashboard';
import * as forceApi from '../services/forceApi';
import { CreateCommandForm } from './CreateCommandForm';

interface MainDashboardProps {
    user: { name: string; id: string } | null;
    onLogout: () => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState<TabType>('my-campaigns');
    const [commands, setCommands] = useState<any[]>([]);
    const [selectedCommandId, setSelectedCommandId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isCreatingCommand, setIsCreatingCommand] = useState(false);

    const handleDeleteCommand = async (commandId: string, force = false) => {
        if (!force && !window.confirm("ARE YOU SURE YOU WANT TO SCRAP THIS COMMAND? THIS ACTION IS IRREVERSIBLE.")) {
            return;
        }

        try {
            await forceApi.deleteCommand(commandId, force);
            if (selectedCommandId === commandId) {
                setSelectedCommandId(null);
            }
            fetchCommands();
        } catch (err: any) {
            if (err.status === 409) {
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
        setLoading(true);
        try {
            // Assuming forceApi.getCommands exists to fetch user's mercenary units
            const data = await forceApi.getCommands();
            setCommands(data);
            if (data.length > 0 && !selectedCommandId) {
                setSelectedCommandId(data[0].id);
            }
        } catch (err) {
            console.error("Failed to load commands", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchCommands();
        }
    }, [user]);

    // If not authenticated, only show the public theater list
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
                    <ActiveCampaignsList />
                </div>
                <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', marginTop: '40px' }}>
                    <h2 className="section-title">CAMPAIGN GENERATOR</h2>
                    <RandomCampaignGenerator user={undefined} />
                </div>
            </div>
        );
    }

    const renderTabContent = () => {
        if (loading) return <div className="loading-intel">SYNCHRONIZING COMMS...</div>;

        if (isCreatingCommand) {
            return (
                <CreateCommandForm
                    user={user}
                    onCancel={() => setIsCreatingCommand(false)}
                    onSuccess={(newCmd) => {
                        setIsCreatingCommand(false);
                        fetchCommands();
                        setSelectedCommandId(newCmd.id);
                        setActiveTab('commands');
                    }}
                />
            );
        }

        // Allow access to creation, management, and public tabs even if no command is selected yet
        const commandContextRequired = ['my-campaigns', 'ledger'].includes(activeTab);

        if (!selectedCommandId && commandContextRequired) {
            return (
                <div className="placeholder-content">
                    <h2>NO MERCENARY COMMAND DETECTED</h2>
                    <p>Register your command to begin operations.</p>
                    <button className="login-button" onClick={() => setIsCreatingCommand(true)}>CREATE COMMAND</button>
                </div>
            );
        }

        switch (activeTab) {
            case 'my-campaigns':
                return (
                    <div>
                        <Welcome userName={user.name} />
                        {selectedCommandId && <ForceDashboard commandId={selectedCommandId} initialMode="OPERATIONS" />}
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
                            onSaveSuccess={() => {
                                fetchCommands();
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
                                        border: selectedCommandId === cmd.id ? '2px solid #c00' : '1px solid #444',
                                        transition: 'all 0.2s ease-in-out',
                                        backgroundColor: selectedCommandId === cmd.id ? 'rgba(192, 0, 0, 0.05)' : 'transparent',
                                        position: 'relative'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 className="section-title" style={{ margin: 0 }}>{cmd.name || 'UNNAMED UNIT'}</h3>
                                        {selectedCommandId === cmd.id && <span className="restricted-text" style={{ color: '#c00' }}>[ ACTIVE COMMAND ]</span>}
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
                                                style={{ opacity: 0.6 }}
                                                onClick={(e) => { e.stopPropagation(); }}
                                            >
                                                UNIT PROFILE
                                            </button>
                                            <button
                                                className="mode-btn"
                                                style={{ marginLeft: 'auto', border: '1px solid #c00', color: '#c00' }}
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
                return selectedCommandId ? (
                    <LedgerDashboard commandId={selectedCommandId} />
                ) : null;
            case 'public-campaigns':
                return <ActiveCampaignsList />;
            default:
                return <Welcome userName={user.name} />;
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                userName={user.name}
                onLogout={onLogout}
            />
            <main className="main-content-wrapper">
                {user && selectedCommandId && commands.length > 1 && (
                    <div className="command-selector-header" style={{ marginBottom: '20px', textAlign: 'right' }}>
                        <label htmlFor="command-select" className="restricted-text" style={{ fontSize: '0.8rem' }}>
                            ACTIVE COMMAND:
                        </label>
                        <select
                            id="command-select"
                            value={selectedCommandId}
                            onChange={(e) => setSelectedCommandId(e.target.value)}
                            className="mode-btn"
                            style={{ marginLeft: '10px', textTransform: 'uppercase', padding: '5px 10px', cursor: 'pointer' }}
                        >
                            {commands.map(cmd => (
                                <option key={cmd.id} value={cmd.id}>{cmd.name || 'UNNAMED COMMAND'}</option>
                            ))}
                        </select>
                    </div>
                )}
                {renderTabContent()}
            </main>
        </div>
    );
};