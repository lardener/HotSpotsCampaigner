import React from 'react';
import { NavigationTree, TreeItem } from './NavigationTree';
import '../styles/Sidebar.css';

interface SidebarProps {
    treeData: TreeItem[];
    onSelect: (item: TreeItem) => void;
    selectedId?: string;
    user: { name: string; id: string; role?: string; displayName?: string | null } | null;
    onLogout: () => void;
    syncing: boolean;
    onManualRefresh: () => void;
    isEditingName: boolean;
    setIsEditingName: (val: boolean) => void;
    editName: string;
    setEditName: (val: string) => void;
    onNameUpdate: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    treeData,
    onSelect,
    selectedId,
    user,
    onLogout,
    syncing,
    onManualRefresh,
    isEditingName,
    setIsEditingName,
    editName,
    setEditName,
    onNameUpdate
}) => {
    return (
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
                    {syncing ? (
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
                            onClick={onManualRefresh}
                            title="Manual synchronization of all active tactical data"
                        >RESYNC</button>
                    )}
                </div>
            </div>
            <div className="sidebar-content-scroll" style={{ overflowY: 'auto', padding: '10px 0' }}>
                <NavigationTree
                    data={treeData}
                    onSelect={onSelect}
                    selectedId={selectedId}
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
                                onBlur={onNameUpdate}
                                onKeyDown={e => e.key === 'Enter' && onNameUpdate()}
                                autoFocus
                                style={{ fontSize: '0.8rem', padding: '2px', width: '150px', border: 'none' }}
                                title="Enter to save, click away to cancel"
                            />
                        </div>
                    ) : (
                        <span onClick={() => setIsEditingName(true)} style={{ cursor: 'pointer' }} title="Click to set callsign">
                            {user?.displayName || user?.name || 'Commander'}
                        </span>
                    )}
                </div>
                <button type="button" className="mode-btn logout-btn sidebar-logout-btn" onClick={onLogout} title="Disconnect from the system">DISCONNECT NEURAL LINK</button>
            </div>
        </aside>
    );
};