import React from 'react';
import { ActiveCampaignsList } from './ActiveCampaignsList';

export const GlobalIntelView: React.FC = () => {
    return (
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <header className="dashboard-header">
                <h1 className="terminal-text">AVAILABLE CAMPAIGNS</h1>
            </header>
            <ActiveCampaignsList />
        </div>
    );
};