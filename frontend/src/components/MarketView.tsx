import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { TacticalMarkdown } from './TacticalMarkdown';
import { useHscActionHandler } from './useHscActionHandler';
import { GetCampaignMarketDocument, SaveMarketMarkdownDocument } from '../types/operations';

type MarketType = 'FREE' | 'EMPLOYER' | 'SCRAPPERS';

interface MarketViewProps {
    campaignId: string;
    marketType: MarketType;
    campaign: any;
    setOverlay: (overlay: any) => void;
}

export const MarketView: React.FC<MarketViewProps> = ({ campaignId, marketType, campaign, setOverlay }) => {
    const { handleHscAction } = useHscActionHandler({
        campaign,
        setOverlay,
    });
    const [isEditing, setIsEditing] = useState(false);
    const [markdown, setMarkdown] = useState('');

    const { data, loading, refetch } = useQuery(GetCampaignMarketDocument, {
        variables: { campaignId }
    });

    const [saveMarkdown] = useMutation(SaveMarketMarkdownDocument);

    useEffect(() => {
        if (data?.campaignMarket) {
            const market = data.campaignMarket;
            if (marketType === 'FREE') {
                setMarkdown(market.freeMarketMarkdown || '# Free Market\nNo units currently available.');
            } else if (marketType === 'SCRAPPERS') {
                setMarkdown(market.scrapperMarketMarkdown || '# Scrappers\' Yard\nWelcome to the scrap heap.');
            } else if (marketType === 'EMPLOYER') {
                // For employer markets, we'll just show a generic message or the first one found for now
                // Real implementation would need a way to select which employer to view/edit
                const firstEmployer = market.employerMarkets?.[0];
                setMarkdown(firstEmployer?.markdown || '# Employer Markets\nNo employer listings available.');
            }
        }
    }, [data, marketType]);

    const handleSave = async () => {
        try {
            await saveMarkdown({
                variables: {
                    campaignId,
                    marketType: marketType.toUpperCase() as any,
                    markdown,
                    factionId: null // Simplified for now
                }
            });
            setIsEditing(false);
            refetch();
        } catch (e) {
            console.error('Failed to save market markdown:', e);
        }
    };

    if (loading) return <div className="restricted-text" style={{ color: 'var(--terminal-amber)' }}>[ LOADING MARKET DATA... ]</div>;

    return (
        <div className="market-view" style={{
            display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', maxWidth: '800px', margin: '0 auto'
        }}>
            <div className="view-header" style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--terminal-amber)', paddingBottom: '10px'
            }}>
                <h3 className="restricted-text" style={{ margin: 0, fontSize: '1rem', color: 'var(--terminal-amber)' }}>
                    {marketType === 'FREE' ? '[ FREE MARKET ]' : marketType === 'EMPLOYER' ? '[ EMPLOYER MARKET ]' : '[ SCRAPPERS\' YARD ]'}
                </h3>
                <button
                    className="mode-btn theme-amber"
                    onClick={() => setIsEditing(!isEditing)}
                    style={{ fontSize: '0.6rem' }}
                >
                    {isEditing ? '[ CLOSE ]' : '[ EDIT ]'}
                </button>
            </div>

            {isEditing ? (
                <div className="edit-mode" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <textarea
                        className="table-input"
                        style={{
                            width: '100%', minHeight: '400px', fontFamily: 'monospace',
                            backgroundColor: 'rgba(0,0,0,0.5)', color: 'var(--terminal-amber)',
                            border: '1px solid var(--terminal-amber)', padding: '10px', fontSize: '0.8rem'
                        }}
                        value={markdown}
                        onChange={(e) => setMarkdown(e.target.value)}
                    />
                    <button
                        className="mode-btn theme-amber"
                        onClick={handleSave}
                        style={{ alignSelf: 'flex-end', fontSize: '0.6rem' }}
                    >[ SAVE CHANGES ]</button>
                </div>
            ) : (
                <div className="view-mode" style={{
                    backgroundColor: 'rgba(0,0,0,0.3)', padding: '20px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px'
                }}>
                    <TacticalMarkdown
                        content={markdown}
                        onAction={handleHscAction}
                    />
                </div>
            )}
        </div>
    );
};