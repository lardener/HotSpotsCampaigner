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
import { useHscActionHandler } from './useHscActionHandler';

interface ScrapperDrawButtonProps {
    campaignId: string;
    campaign: any;
    setOverlay: (overlay: any) => void;
}

export const ScrapperDrawButton: React.FC<ScrapperDrawButtonProps> = ({ campaignId, campaign, setOverlay }) => {
    const { handleHscAction } = useHscActionHandler({
        campaign,
        setOverlay,
    });

    const handleDraw = () => {
        // We use a fixed fee from the plan, but in a real scenario this might come from the campaign market data
        const fee = 50000;
        handleHscAction(`hsc://market/scrappers/draw?campaign=${campaignId}&fee=${fee}`);
    };

    return (
        <button
            className="mode-btn theme-amber"
            onClick={handleDraw}
            style={{
                padding: '15px 30px', fontSize: '1rem', fontWeight: 'bold',
                boxShadow: '0 0 15px var(--terminal-amber)', cursor: 'pointer'
            }}
        >
            [ DRAW FROM THE SCRAP HEAP — 50,000 C-BILLS ]
        </button>
    );
};