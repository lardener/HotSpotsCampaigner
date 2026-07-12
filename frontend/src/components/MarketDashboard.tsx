import React, { useState } from 'react';
import { MarketBackground } from './MarketBackground';
import { MarketView } from './MarketView';
import { ScrapperDrawButton } from './ScrapperDrawButton';
import { TerminalOverlay } from './TerminalOverlay';

export type MarketType = 'FREE' | 'EMPLOYER' | 'SCRAPPERS';

interface MarketDashboardProps {
    campaignId: string;
    onClose: () => void;
    onRefresh?: () => Promise<any>;
    campaign: any;
    setOverlay: (overlay: any) => void;
}

export const MarketDashboard: React.FC<MarketDashboardProps> = ({ campaignId, onClose, campaign, setOverlay }) => {
    const [activeTab, setActiveTab] = useState<MarketType>('FREE');

    return (
        <TerminalOverlay
            title="[ THEATER MARKET ]"
            message=""
            onConfirm={() => { }}
            onCancel={onClose}
        >
            <MarketBackground />

            <div className="market-container" style={{
                display: 'flex', flexDirection: 'column', height: '100%',
                padding: '20px', color: 'var(--terminal-amber)', fontFamily: 'monospace'
            }}>
                <div className="market-tabs" style={{
                    display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--terminal-amber)', paddingBottom: '10px'
                }}>
                    <button
                        className={`mode-btn ${activeTab === 'FREE' ? 'theme-amber' : ''}`}
                        onClick={() => setActiveTab('FREE')}
                        style={{ fontSize: '0.8rem' }}
                    >[ FREE MARKET ]</button>
                    <button
                        className={`mode-btn ${activeTab === 'EMPLOYER' ? 'theme-amber' : ''}`}
                        onClick={() => setActiveTab('EMPLOYER')}
                        style={{ fontSize: '0.8rem' }}
                    >[ EMPLOYER MARKETS ]</button>
                    <button
                        className={`mode-btn ${activeTab === 'SCRAPPERS' ? 'theme-amber' : ''}`}
                        onClick={() => setActiveTab('SCRAPPERS')}
                        style={{ fontSize: '0.8rem' }}
                    >[ SCRAPPERS' YARD ]</button>
                </div>

                <div className="market-content" style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
                    {activeTab === 'FREE' && (
                        <MarketView
                            campaignId={campaignId}
                            marketType="FREE"
                            campaign={campaign}
                            setOverlay={setOverlay}
                        />
                    )}
                    {activeTab === 'EMPLOYER' && (
                        <MarketView
                            campaignId={campaignId}
                            marketType="EMPLOYER"
                            campaign={campaign}
                            setOverlay={setOverlay}
                        />
                    )}
                    {activeTab === 'SCRAPPERS' && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '20px' }}>
                            <MarketView
                                campaignId={campaignId}
                                marketType="SCRAPPERS"
                                campaign={campaign}
                                setOverlay={setOverlay}
                            />
                            <ScrapperDrawButton
                                campaignId={campaignId}
                                campaign={campaign}
                                setOverlay={setOverlay}
                            />
                        </div>
                    )}
                </div>
            </div>
        </TerminalOverlay>
    );
};