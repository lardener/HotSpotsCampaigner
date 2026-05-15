import React, { useState, useEffect } from 'react';
import * as campaignApi from '../services/campaignApi';

export const ActiveCampaignsList: React.FC = () => {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const data = await campaignApi.getActiveCampaigns(0, 10);
                setCampaigns(data.content);
            } catch (err) {
                console.error("Failed to fetch theater intel", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCampaigns();
    }, []);

    if (loading) return <div className="loading-intel">DECRYPTING THEATER INTEL...</div>;

    return (
        <section className="active-campaigns-container">
            <h2 className="section-title">ACTIVE THEATER DEPLOYMENTS</h2>
            <p className="restricted-text">SITUATION REPORT: HINTERLANDS REGION</p>

            <div className="search-placeholder" style={{ margin: '20px 0', padding: '10px', border: '1px dashed #444', color: '#666' }}>
                [ SEARCH FILTERS: RECRUITMENT STATUS / REGION / FACTION ]
            </div>

            <div className="campaign-list">
                {campaigns.length === 0 ? (
                    <p>No active deployments reported in this sector.</p>
                ) : (
                    campaigns.map(c => (
                        <div key={c.id} className="campaign-card" style={{ border: '1px solid #333', padding: '15px', marginBottom: '15px', background: 'rgba(0,0,0,0.2)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <h3>{c.name}</h3>
                                <span className="status-tag" style={{ color: '#c00' }}>ACTIVE</span>
                            </div>
                            <p><strong>Location:</strong> {c.systemName}</p>
                            <div style={{ display: 'flex', gap: '20px', fontSize: '0.85em', color: '#aaa' }}>
                                <span><strong>Primary:</strong> {c.primaryEmployer}</span>
                                <span><strong>Opposition:</strong> {c.secondaryEmployer}</span>
                                <span><strong>Tracks:</strong> {c.trackCount}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
};