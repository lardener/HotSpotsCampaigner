import React from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

const GET_ACTIVE_CAMPAIGNS = gql`
  query GetActiveCampaigns($page: Int, $size: Int) {
    activeCampaigns(page: $page, size: $size) {
      id
      name
      systemName
      status
      trackCount
      primaryEmployer
      secondaryEmployer
    }
  }
`;

interface ActiveCampaignsData {
    activeCampaigns: {
        id: string;
        name: string;
        systemName: string;
        status: string;
        trackCount: number;
        primaryEmployer: string;
        secondaryEmployer: string;
    }[];
}

export const ActiveCampaignsList: React.FC = () => {
    const { loading, error, data } = useQuery<ActiveCampaignsData>(GET_ACTIVE_CAMPAIGNS, {
        variables: { page: 0, size: 10 }
    });

    if (loading) return <div className="loading-intel">DECRYPTING THEATER INTEL...</div>;

    if (error) return (
        <div className="error-message">COMMUNICATIONS FAILURE: UNABLE TO ACCESS THEATER DATA.</div>
    );

    const campaigns = data?.activeCampaigns || [];

    return (
        <section className="active-campaigns-container">
            <h2 className="section-title">ACTIVE THEATER DEPLOYMENTS</h2>
            <p className="restricted-text">SITUATION REPORT: HINTERLANDS REGION</p>

            <div className="search-placeholder" style={{ margin: '20px 0', padding: '10px', border: '1px dashed #444', color: '#666' }}>
                <span title="Search filters for recruitment status, region, or faction">[ SEARCH FILTERS: RECRUITMENT STATUS / REGION / FACTION ]</span>
            </div>

            <div className="campaign-list">
                {campaigns.length === 0 ? (
                    <p>No active deployments reported in this sector.</p>
                ) : (
                    campaigns.map(c => (
                        <div key={c.id} className="campaign-card" style={{ border: '1px solid var(--terminal-border)', padding: '15px', marginBottom: '15px', background: 'rgba(5,7,5,0.4)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ color: 'var(--accent-primary)' }}>{c.name}</h3>
                                <span className="status-tag" style={{ color: 'var(--accent-primary)' }}>[ ACTIVE ]</span>
                            </div>
                            <p><strong>Location:</strong> {c.systemName}</p>
                            <div style={{ display: 'flex', gap: '20px', fontSize: '0.85em', color: 'var(--accent-dim)' }}>
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