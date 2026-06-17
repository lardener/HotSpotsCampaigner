import React, { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_ACTIVE_CAMPAIGNS } from '../types/operations';
import { ActiveCampaignsData } from '../types/graphql.d';
import { ActiveCampaignsBackground } from './ActiveCampaignsBackground';

interface ActiveCampaignsListProps {
    onSelectCampaign?: (id: string) => void;
}

export const ActiveCampaignsList: React.FC<ActiveCampaignsListProps> = ({ onSelectCampaign }) => {
    const { loading, error, data } = useQuery<ActiveCampaignsData>(GET_ACTIVE_CAMPAIGNS, {
        variables: { page: 0, size: 10 },
        fetchPolicy: 'cache-and-network',
        notifyOnNetworkStatusChange: true
    });
    const [searchTerm, setSearchTerm] = useState('');

    const campaigns = data?.publicActiveCampaigns || [];

    const filteredCampaigns = useMemo(() => {
        const terms = searchTerm.toLowerCase().split(/\s+/).filter(t => t.length > 0);
        if (terms.length === 0) return campaigns;

        return campaigns.filter(c => {
            return terms.some(term => {
                const inCampaignFields = [
                    c.name,
                    c.systemName,
                    (c as any).description,
                    c.primaryEmployer,
                    c.secondaryEmployer
                ].some(field => field?.toLowerCase().includes(term));

                const inDetachments = (c as any).participatingDetachments?.some((det: any) =>
                    det.name?.toLowerCase().includes(term) ||
                    det.mercenaryCommandName?.toLowerCase().includes(term)
                );

                return inCampaignFields || inDetachments;
            });
        });
    }, [campaigns, searchTerm]);

    if (loading && !data) return <div className="loading-intel">DECRYPTING THEATER INTEL...</div>;

    if (error) return (
        <div className="error-message">COMMUNICATIONS FAILURE: UNABLE TO ACCESS THEATER DATA.</div>
    );

    return (
        <section className="active-campaigns-container" style={{ position: 'relative' }}>
            <ActiveCampaignsBackground />
            <h2 className="section-title">ACTIVE THEATER DEPLOYMENTS</h2>
            <p className="restricted-text">SITUATION REPORT: INNER SPHERE</p>

            <div className="mb-20 mt-20 recruitment-box border-dashed-gray status-bar" style={{ padding: '0 10px', display: 'flex', alignItems: 'center', height: '40px', transition: 'all 0.2s ease' }}>
                <span className="restricted-text sm-text mr-10" style={{ whiteSpace: 'nowrap' }}>SEARCH INTEL:</span>
                <input
                    type="text"
                    className="table-input w-100"
                    placeholder="FILTER BY NAME, FACTION, OR DETACHMENT..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    title="Filter campaigns by name, system, description, employers, or participating forces"
                />
                {searchTerm && (
                    <button className="mode-btn theme-red sm-text" style={{ padding: '2px 8px', marginLeft: '10px' }} onClick={() => setSearchTerm('')}>CLEAR</button>
                )}
            </div>

            <div className="campaign-list">
                {filteredCampaigns.length === 0 ? (
                    <p>{searchTerm ? 'No intel matches current search parameters.' : 'No active deployments reported in this sector.'}</p>
                ) : (
                    filteredCampaigns.map(c => (
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
            <style>{`
                .active-campaigns-container {
                    background: transparent !important;
                }
                .campaign-list {
                    background: transparent !important;
                }
                .campaign-card.bg-dark-card {
                    background-color: rgba(5, 7, 5, 0.4) !important;
                    backdrop-filter: blur(1px);
                }
                .recruitment-box {
                    background-color: rgba(0, 0, 0, 0.3) !important;
                }
                .status-bar:focus-within { 
                    background-color: rgba(255, 255, 255, 0.05); 
                    box-shadow: 0 0 8px rgba(255, 255, 255, 0.1); 
                }
                .theme-amber .status-bar:focus-within { border-color: var(--terminal-amber); box-shadow: 0 0 8px rgba(255, 176, 0, 0.3); }
                .theme-green .status-bar:focus-within { border-color: var(--terminal-green); box-shadow: 0 0 8px rgba(51, 255, 51, 0.3); }
                .theme-blue .status-bar:focus-within { border-color: var(--terminal-blue); box-shadow: 0 0 8px rgba(0, 191, 255, 0.3); }
                .theme-red .status-bar:focus-within { border-color: var(--terminal-red); box-shadow: 0 0 8px rgba(255, 51, 51, 0.3); }

                .status-bar input.table-input, .status-bar select.table-input, .status-bar textarea.table-input {
                    background: transparent !important;
                    color: inherit !important;
                    outline: none !important;
                    border: none !important;
                    box-shadow: none !important;
                }
                .status-bar input.table-input::placeholder {
                    color: inherit;
                    opacity: 0.5;
                }
            `}</style>
        </section>
    );
};