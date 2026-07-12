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