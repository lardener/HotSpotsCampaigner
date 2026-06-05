import React from 'react';
import { useQuery } from '@apollo/client/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DetachmentReadinessSummary } from './DetachmentReadinessSummary';
import { GET_CAMPAIGN_DETAILS } from '../types/operations';
import { CampaignDetailsData } from '../types/graphql.d';
import { TrackDetail, Detachment } from '../types/global.d';

interface PublicCampaignTheaterViewProps {
    campaignId: string;
    onBack: () => void;
}

export const PublicCampaignTheaterView: React.FC<PublicCampaignTheaterViewProps> = ({ campaignId, onBack }) => {
    const { loading, error, data } = useQuery<CampaignDetailsData>(GET_CAMPAIGN_DETAILS, {
        variables: { campaignId },
        fetchPolicy: 'network-only'
    });

    if (loading) return <div className="loading-intel pulse">ACCESSING THEATER DATA...</div>;
    if (error) return <div className="error-message">COMMUNICATIONS FAILURE: {error.message}</div>;

    const campaign = data?.getCampaign;
    if (!campaign) return <div className="error-message">THEATER NOT FOUND.</div>;

    const trackMax = (campaign.tracks || []).reduce((max, t) => Math.max(max, t.monthIndex || 1), 0);
    const displayMonthCount = Math.max(campaign.lengthInMonths || 1, trackMax, 1);

    return (
        <div className="container theme-blue">
            <header className="dashboard-header">
                <div className="flex-between">
                    <div>
                        <h1 className="terminal-text">{campaign.name}</h1>
                        <p className="restricted-text">THEATER INTEL: {campaign.systemName?.toUpperCase()} [ READ-ONLY ]</p>
                    </div>
                    <button type="button" className="mode-btn" onClick={onBack}>[ RETURN ]</button>
                </div>
            </header>

            <div className="grid-3-col mb-30">
                <div className="tactical-panel" style={{ gridColumn: 'span 3' }}>
                    <h3 className="zone-header">THEATER BRIEFING</h3>
                    <div className="mt-10 markdown-preview" style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                        {campaign.description ? (
                            <Markdown remarkPlugins={[remarkGfm]}>{campaign.description}</Markdown>
                        ) : (
                            <span className="restricted-text subdued">NO OPERATIONAL BRIEFING FILED.</span>
                        )}
                    </div>

                    <div className="mt-20 pt-10 grid-4-col" style={{ borderTop: '1px solid var(--terminal-border)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                        <div>
                            <span className="restricted-text sm-text block-label">EMPLOYER</span>
                            <div className="status-bar theme-green">{campaign.primaryEmployer}</div>
                        </div>
                        <div>
                            <span className="restricted-text sm-text block-label">OPPOSITION</span>
                            <div className="status-bar theme-red">{campaign.secondaryEmployer}</div>
                        </div>
                        <div>
                            <span className="restricted-text sm-text block-label">MONTHS</span>
                            <div className="status-bar theme-amber text-center">{campaign.lengthInMonths}</div>
                        </div>
                        <div>
                            <span className="restricted-text sm-text block-label">TRACKS</span>
                            <div className="status-bar theme-amber text-center">{campaign.trackCount}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard-section tactical-panel mb-30">
                <h3 className="section-title">THEATER OPERATIONS</h3>
                <div className="month-panel-grid mt-15" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                    {Array.from({ length: displayMonthCount }, (_, i) => i + 1).map(mIdx => {
                        const monthTracks = (campaign.tracks || []).filter((t: TrackDetail) => (t.monthIndex || 1) === mIdx)
                            .sort((a: TrackDetail, b: TrackDetail) => a.sequenceOrder - b.sequenceOrder);
                        return (
                            <div key={mIdx} className="tactical-panel" style={{ border: '1px dashed var(--accent-dim)', padding: '10px' }}>
                                <h4 className="zone-header" style={{ marginBottom: '10px' }}>[ MONTH {mIdx} ]</h4>
                                <div className="track-container flex flex-column flex-gap-10">
                                    {monthTracks.map((track: TrackDetail) => (
                                        <div key={track.id} className="asset-card" style={{ padding: '12px', border: '1px solid var(--accent-dim)' }}>
                                            <div className="flex-between mb-5">
                                                <div className="status-bar theme-amber" style={{ flex: 1, fontWeight: 'bold' }}>{track.trackName}</div>
                                                <span className="restricted-text sm-text ml-10">#{track.sequenceOrder + 1}</span>
                                            </div>
                                            {track.location && (
                                                <div className="restricted-text xs-text mt-5">WHERE: {track.location}</div>
                                            )}
                                            {track.nextSession && (
                                                <div className="restricted-text xs-text">WHEN: {new Date(track.nextSession).toLocaleString()}</div>
                                            )}
                                        </div>
                                    ))}
                                    {monthTracks.length === 0 && <div className="restricted-text subdued text-center py-10">NO OPS SCHEDULED</div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="dashboard-section tactical-panel">
                <h3 className="section-title">DEPLOYED FORCES</h3>
                <div className="detachment-grid mt-15" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '15px' }}>
                    {campaign.participatingDetachments?.map((det: Detachment) => (
                        <div key={det.id} className="asset-card">
                            <div className="asset-type">{det.mercenaryCommandName?.toUpperCase() || 'MERCENARY COMMAND'}</div>
                            <div className="asset-label" style={{ marginBottom: '10px', borderBottom: '1px solid var(--accent-dim)', paddingBottom: '5px', display: 'flex', justifyContent: 'space-between' }}>
                                <span>{det.name}</span>
                                <span style={{ color: 'var(--terminal-amber)', fontSize: '0.8rem' }}>RATING: {det.campaignRating || 0}</span>
                            </div>
                            <DetachmentReadinessSummary
                                units={det.units || []}
                                pilots={det.pilots || []}
                                compact
                            />
                        </div>
                    ))}
                    {(!campaign.participatingDetachments || campaign.participatingDetachments.length === 0) && (
                        <div className="restricted-text">NO DETACHMENTS REPORTED.</div>
                    )}
                </div>
            </div>

            <style>{`
                .sm-text { font-size: 0.75rem; }
                .xs-text { font-size: 0.65rem; }
                .block-label { display: block; margin-bottom: 2px; }
                .py-10 { padding-top: 10px; padding-bottom: 10px; }
                .markdown-preview :is(h1, h2, h3, h4, h5, h6) {
                    color: var(--terminal-amber);
                    margin-top: 1em;
                    margin-bottom: 0.5em;
                    border-bottom: 1px dashed rgba(255, 176, 0, 0.3);
                    padding-bottom: 0.2em;
                    text-transform: uppercase;
                }
            `}</style>
        </div>
    );
};