import React from 'react';
import { RandomCampaignGenerator } from './RandomCampaignGenerator';

interface NewCampaignViewProps {
    user: { name: string; id: string } | null;
    onSaveSuccess: (newCampaign: any) => void;
}

export const NewCampaignView: React.FC<NewCampaignViewProps> = ({ user, onSaveSuccess }) => {
    return (
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <header className="dashboard-header">
                <h1 className="terminal-text">NEW CAMPAIGN ENLISTMENT</h1>
            </header>
            <RandomCampaignGenerator
                user={user || undefined}
                onSaveSuccess={onSaveSuccess}
            />
        </div>
    );
};