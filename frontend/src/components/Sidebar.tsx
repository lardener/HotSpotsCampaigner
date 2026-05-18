import React from 'react';
import '../styles/Sidebar.css';

export type TabType = 'my-campaigns' | 'create-campaign' | 'commands' | 'ledger' | 'public-campaigns' | 'command-dashboard';

interface SidebarProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    userName?: string;
    onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, userName, onLogout }) => {
    const menuItems = [
        { id: 'commands' as TabType, icon: '🛡️', label: 'Mercenary Commands' },
        { id: 'my-campaigns' as TabType, icon: '🗺️', label: 'My Campaigns' }, // Moved from original position
        { id: 'create-campaign' as TabType, icon: '➕', label: 'New Campaign' },
        { id: 'ledger' as TabType, icon: '📜', label: 'Warchest Ledger' },
        { id: 'public-campaigns' as TabType, icon: '🌐', label: 'Available Campaigns' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <svg width="32" height="32" viewBox="0 0 100 100" style={{ marginBottom: '8px' }}>
                    <polygon points="50,10 85,30 85,70 50,90 15,70 15,30" fill="none" stroke="var(--terminal-amber)" strokeWidth="8"/>
                    <circle cx="50" cy="50" r="18" fill="none" stroke="var(--terminal-amber)" strokeWidth="4"/>
                    <path d="M50 20 L50 80 M20 50 L80 50" stroke="var(--terminal-amber)" strokeWidth="4"/>
                </svg>
                <span className="sidebar-logo">HSC</span>
            </div>
            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => onTabChange(item.id)}
                        title={item.label}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </button>
                ))}
            </nav>
            <div className="sidebar-footer">
                <div className="user-profile-mini">
                    <span className="nav-icon">👤</span>
                    <span className="nav-label">{userName || 'Commander'}</span>
                </div>
                <button className="nav-item logout-btn" onClick={onLogout}>
                    <span className="nav-icon">🚪</span>
                    <span className="nav-label">Logout</span>
                </button>
            </div>
        </aside>
    );
};