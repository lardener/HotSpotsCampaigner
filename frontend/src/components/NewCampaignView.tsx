import React from 'react';
import { CampaignGenerator } from './CampaignGenerator';
import { UpdateCampaignMutation } from '../types/generated';

interface NewCampaignViewProps {
    user: { name: string; id: string } | null;
    onSaveSuccess: (newCampaign: UpdateCampaignMutation['updateCampaign']) => void;
}

export const NewCampaignView: React.FC<NewCampaignViewProps> = ({ user, onSaveSuccess }) => {
    return (
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <header className="dashboard-header">
                <h1 className="terminal-text">NEW CAMPAIGN ENLISTMENT</h1>
            </header>
            <CampaignGenerator
                user={user || undefined}
                onSaveSuccess={onSaveSuccess}
            />
        </div>
    );
};