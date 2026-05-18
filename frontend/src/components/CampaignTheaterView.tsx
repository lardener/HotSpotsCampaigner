import React from 'react';

interface CampaignTheaterViewProps {
    managedData: any;
    loadingManaged: boolean;
    selectedCampaignId: string | null;
    campaignFilter: string;
    onSetFilter: (filter: string) => void;
    onSelectCampaign: (id: string) => void;
    onReturnToList: () => void;
    onCreateNew: () => void;
    onSelectDetachment: (item: any) => void;
}

export const CampaignTheaterView: React.FC<CampaignTheaterViewProps> = ({
    managedData,
    loadingManaged,
    selectedCampaignId,
    campaignFilter,
    onSetFilter,
    onSelectCampaign,
    onReturnToList,
    onCreateNew,
    onSelectDetachment
}) => {
    const campaign = managedData?.managedCampaigns.find((c: any) => c.id === selectedCampaignId);

    return (
        <div className="container">
            {!selectedCampaignId ? (
                <>
                    <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 className="terminal-text">CAMPAIGN OPERATIONS</h1>
                            <p className="restricted-text">THEATER MANAGEMENT PROTOCOL</p>
                        </div>
                        <button
                            className="mode-btn"
                            onClick={() => onSetFilter(campaignFilter === 'ACTIVE' ? 'ALL' : 'ACTIVE')}
                        >
                            {campaignFilter === 'ACTIVE' ? '[ VIEWING: ACTIVE ONLY ]' : '[ VIEWING: ALL THEATERS ]'}
                        </button>
                    </header>

                    <div className="command-panels-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
                        {loadingManaged && <div className="loading-intel">RETRIEVING THEATER DATA...</div>}

                        {managedData?.managedCampaigns.map((camp: any) => (
                            <div
                                key={camp.id}
                                className="dashboard-section"
                                style={{
                                    border: '1px solid var(--accent-dim)',
                                    backgroundColor: camp.status === 'ACTIVE' ? 'rgba(51, 255, 51, 0.02)' : 'transparent',
                                    position: 'relative'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 className="section-title" style={{ margin: 0, color: 'var(--terminal-green)' }}>{camp.name}</h3>
                                    <span className="restricted-text" style={{ color: camp.status === 'ACTIVE' ? 'var(--terminal-amber)' : 'var(--accent-dim)' }}>
                                        [ STATUS: {camp.status} ]
                                    </span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '20px', marginTop: '15px' }}>
                                    <div><span className="restricted-text" style={{ fontSize: '0.7rem', display: 'block' }}>PRIMARY EMPLOYER</span> {camp.primaryEmployer || 'UNKNOWN'}</div>
                                    <div><span className="restricted-text" style={{ fontSize: '0.7rem', display: 'block' }}>SYSTEM</span> {camp.systemName}</div>
                                    <div><span className="restricted-text" style={{ fontSize: '0.7rem', display: 'block' }}>TRACKS</span> {camp.trackCount}</div>
                                    <div className="text-right" style={{ alignSelf: 'end' }}>
                                        <button className="mode-btn" style={{ fontSize: '0.8rem' }} onClick={() => onSelectCampaign(camp.id)}>MANAGE THEATER</button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {!loadingManaged && managedData?.managedCampaigns.length === 0 && (
                            <div className="placeholder-content" style={{ border: '1px dashed #444' }}>
                                <h3 className="terminal-text">NO MANAGED CAMPAIGNS FOUND</h3>
                                <p>Initialize a new operation via the New Campaign Enlistment protocol.</p>
                                <button className="login-button" onClick={onCreateNew}>START NEW CAMPAIGN</button>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <header className="dashboard-header">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h1 className="terminal-text">{campaign?.name}</h1>
                                <p className="restricted-text">THEATER COMMAND DATA: {campaign?.systemName.toUpperCase()}</p>
                            </div>
                            <button className="mode-btn" onClick={onReturnToList}>[ RETURN TO LIST ]</button>
                        </div>
                    </header>
                    <div className="dashboard-section tactical-panel">
                        <h3 className="section-title">PARTICIPATING DETACHMENTS</h3>
                        <div className="detachment-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
                            {campaign?.participatingDetachments?.map((det: any) => (
                                <div key={det.id} className="asset-card" style={{ cursor: 'pointer' }} onClick={() => onSelectDetachment({ id: `camp-det-${det.id}`, label: det.name, type: 'DETACHMENT', metadata: { detachmentId: det.id, campaignId: campaign.id } })}>
                                    <div className="asset-type">DETACHMENT</div>
                                    <div className="asset-label">{det.name}</div>
                                </div>
                            ))}
                            {(!campaign?.participatingDetachments || campaign.participatingDetachments.length === 0) && (
                                <div className="restricted-text">NO DETACHMENTS CURRENTLY DEPLOYED IN THIS THEATER.</div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};