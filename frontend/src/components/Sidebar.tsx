import React from 'react';
import '../styles/Sidebar.css';

export type TabType = 'my-campaigns' | 'create-campaign' | 'commands' | 'ledger' | 'public-campaigns' | 'unit-profile';

interface SidebarProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    userName?: string;
    onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, userName, onLogout }) => {
    const menuItems = [
        { id: 'my-campaigns' as TabType, icon: '🗺️', label: 'My Campaigns' },
        { id: 'create-campaign' as TabType, icon: '➕', label: 'New Campaign' },
        { id: 'commands' as TabType, icon: '🛡️', label: 'Mercenary Commands' },
        { id: 'ledger' as TabType, icon: '📜', label: 'Warchest Ledger' },
        { id: 'public-campaigns' as TabType, icon: '🌐', label: 'Active Theater' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
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