import React from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_ACTIVE_CAMPAIGNS } from '../types/operations';
import { ActiveCampaignsData } from '../types/graphql.d';

interface ActiveCampaignsListProps {
    onSelectCampaign?: (id: string) => void;
}

export const ActiveCampaignsList: React.FC<ActiveCampaignsListProps> = ({ onSelectCampaign }) => {
    const { loading, error, data } = useQuery<ActiveCampaignsData>(GET_ACTIVE_CAMPAIGNS, {
        variables: { page: 0, size: 10 }
    });

    if (loading) return <div className="loading-intel">DECRYPTING THEATER INTEL...</div>;

    if (error) return (
        <div className="error-message">COMMUNICATIONS FAILURE: UNABLE TO ACCESS THEATER DATA.</div>
    );

    const campaigns = data?.publicActiveCampaigns || [];

    return (
        <section className="active-campaigns-container">
            <h2 className="section-title">ACTIVE THEATER DEPLOYMENTS</h2>
            <p className="restricted-text">SITUATION REPORT: HINTERLANDS REGION</p>

            <div className="search-placeholder mb-20 mt-20 recruitment-box border-dashed-gray">
                <span title="Search filters for recruitment status, region, or faction">[ SEARCH FILTERS: RECRUITMENT STATUS / REGION / FACTION ]</span>
            </div>

            <div className="campaign-list">
                {campaigns.length === 0 ? (
                    <p>No active deployments reported in this sector.</p>
                ) : (
                    campaigns.map(c => (
                        <div 
                            key={c.id} 
                            className={`campaign-card tactical-panel mb-15 bg-dark-card ${onSelectCampaign ? 'cursor-pointer' : ''}`}
                            onClick={() => onSelectCampaign?.(c.id)}
                            title={onSelectCampaign ? "Click to view theater intel" : undefined}
                        >
                            <div className="flex-between">
                                <h3 style={{ color: 'var(--accent-primary)' }}>{c.name}</h3>
                                <span className="status-tag" style={{ color: 'var(--accent-primary)' }}>[ ACTIVE ]</span>
                            </div>
                            <div className="flex flex-gap-20 fs-09em accent-dim-text">
                                <span><strong>Primary:</strong> {c.primaryEmployer}</span>
                                <span><strong>Opposition:</strong> {c.secondaryEmployer}</span>
                                <span><strong>Tracks:</strong> {c.trackCount}</span>
                            </div>
                            {c.participatingDetachments && c.participatingDetachments.length > 0 && (
                                <div className="mt-10" style={{ borderTop: '1px dashed var(--accent-dim)', paddingTop: '10px' }}>
                                    <div className="restricted-text xs-text mb-5">DEPLOYED FORCES</div>
                                    <div className="flex flex-wrap flex-gap-10">
                                        {c.participatingDetachments.map(d => (
                                            <span key={d.id} className="sm-text" style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '4px' }}>
                                                {d.name} <span style={{ color: 'var(--terminal-amber)' }}>({d.campaignRating || 0})</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </section>
    );
};