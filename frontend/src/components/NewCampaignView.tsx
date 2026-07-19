/*
 * HotSpots Campaigner - Battletech Mercenaries campaign management SaaS.
 * Copyright (C) 2026 Jose Ferrer
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import React from 'react';
import { CampaignGenerator } from './CampaignGenerator';
import { UpdateCampaignMutation } from '../types/operations';

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