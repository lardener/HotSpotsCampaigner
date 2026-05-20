import React, { useState, useRef, useEffect } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { useQuery } from '@apollo/client/react';
import { NodeType } from './NavigationTree';

const CREATE_INVITE = gql`
  mutation CreateInvite($campaignId: ID!) {
    createInvite(campaignId: $campaignId) {
      token
    }
  }
`;

const UPDATE_CAMPAIGN = gql`
  mutation UpdateCampaign($id: ID!, $input: CampaignInput!) {
    updateCampaign(id: $id, input: $input) {
      id
      systemName
      description
    }
  }
`;

const ASSIGN_DETACHMENT = gql`
  mutation AssignDetachmentToCampaign($detachmentId: ID!, $campaignId: ID) {
    assignDetachmentToCampaign(detachmentId: $detachmentId, campaignId: $campaignId)
  }
`;

const GET_CAMPAIGN_INVITES = gql`
  query GetCampaignInvites($campaignId: ID!) {
    getCampaign(id: $campaignId) {
      campaignInvites {
        id
        token
        expiresAt
        used
      }
    }
  }
`;

interface CreateInviteData {
    createInvite: {
        token: string;
    };
}

interface CreateInviteVars {
    campaignId: string;
}

interface CampaignInvite {
    id: string;
    token: string;
    expiresAt: string;
    used: boolean;
}

interface GetCampaignInvitesData {
    getCampaign: {
        campaignInvites: CampaignInvite[];
    };
}

interface ParticipatingDetachment {
    id: string;
    name: string;
    mercenaryCommandId?: string;
}

interface CampaignDetail {
    id: string;
    name: string;
    systemName: string;
    description?: string;
    status: string;
    primaryEmployer: string;
    secondaryEmployer: string;
    trackCount: number;
    payRate?: number;
    payStep?: number;
    salvageTerms?: string;
    salvageStep?: number;
    supportTerms?: string;
    supportStep?: number;
    transportTerms?: string;
    transportStep?: number;
    commandRights?: string;
    commandStep?: number;
    contracts?: any[];
    participatingDetachments?: ParticipatingDetachment[];
}

interface CampaignTheaterViewProps {
    managedData: { managedCampaigns: CampaignDetail[] } | undefined;
    loadingManaged: boolean;
    selectedCampaignId: string | null;
    campaignFilter: string;
    onSetFilter: (filter: string) => void;
    onSelectCampaign: (id: string) => void;
    onReturnToList: () => void;
    onCreateNew: () => void;
    onSelectDetachment: (item: { id: string, label: string, type: NodeType, metadata: any }) => void;
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
    const campaign = managedData?.managedCampaigns.find((c) => c.id === selectedCampaignId);
    const opposition = campaign?.contracts?.find((c) => !c.primaryContract);
    const [createInvite] = useMutation<CreateInviteData, CreateInviteVars>(CREATE_INVITE);
    const { data: invitesData, refetch: refetchInvites } = useQuery<GetCampaignInvitesData>(GET_CAMPAIGN_INVITES, {
        variables: { campaignId: selectedCampaignId || '' },
        skip: !selectedCampaignId,
        fetchPolicy: 'network-only'
    });
    const [updateCampaign] = useMutation(UPDATE_CAMPAIGN);
    const [assignDetachment] = useMutation(ASSIGN_DETACHMENT);
    const [activeToken, setActiveToken] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const saveTimeoutRef = useRef<Record<string, number>>({});

    const campaignInvites = invitesData?.getCampaign?.campaignInvites || [];

    useEffect(() => {
        const timeouts = saveTimeoutRef.current;
        return () => Object.values(timeouts).forEach(clearTimeout);
    }, []);

    const handleGenerateInvite = async () => {
        if (!selectedCampaignId) return;
        const { data } = await createInvite({ variables: { campaignId: selectedCampaignId } });
        if (data?.createInvite) {
            setActiveToken(data.createInvite.token);
            refetchInvites(); // Refetch the list of invites to show the new one
        }
    };

    const handleUpdate = (field: string, value: string) => {
        if (!selectedCampaignId) return;
        const key = `camp-${field}`;
        if (saveTimeoutRef.current[key]) clearTimeout(saveTimeoutRef.current[key]);

        saveTimeoutRef.current[key] = setTimeout(async () => {
            setIsSyncing(true);
            await updateCampaign({ variables: { id: selectedCampaignId, input: { [field]: value } } });
            setIsSyncing(false);
        }, 1000) as unknown as number;
    };

    const handleRemoveDetachment = async (detId: string) => {
        if (window.confirm("EJECT THIS DETACHMENT FROM THE THEATER?")) {
            await assignDetachment({ variables: { detachmentId: detId, campaignId: null } });
            window.location.reload();
        }
    };

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

                        {managedData?.managedCampaigns.map((camp) => (
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

                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 1fr', gap: '20px', marginTop: '15px' }}>
                                    <div><span className="restricted-text" style={{ fontSize: '0.7rem', display: 'block' }}>PRIMARY EMPLOYER</span> {camp.primaryEmployer || 'UNKNOWN'}</div>
                                    <div><span className="restricted-text" style={{ fontSize: '0.7rem', display: 'block' }}>OPPOSITION</span> {camp.secondaryEmployer || 'UNKNOWN'}</div>
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
                        <div className="flex-between">
                            <div>
                                <h1 className="terminal-text">{campaign?.name}</h1>
                                <p className="restricted-text">THEATER COMMAND DATA: {campaign?.systemName.toUpperCase()} {isSyncing && <span className="pulse">...SYNCHRONIZING</span>}</p>
                            </div>
                            <button type="button" className="mode-btn" onClick={onReturnToList}>[ RETURN TO LIST ]</button>
                        </div>
                    </header>

                    <div className="grid-3-col mb-30">
                        <div className="tactical-panel" style={{ gridColumn: 'span 2' }}>
                            <h3 className="zone-header">THEATER INTEL</h3>
                            <div className="form-group"> {/* Added title to input */}
                                <label htmlFor="theater-location" className="restricted-text">LOCATION</label>
                                <input id="theater-location" className="table-input" defaultValue={campaign?.systemName} onChange={(e) => handleUpdate('systemName', e.target.value)} placeholder="Star System Name..." title="Geographic center of operations" />
                            </div>
                            <div className="form-group mt-10"> {/* Added title to textarea */}
                                <label htmlFor="theater-description" className="restricted-text">MISSION DESCRIPTION</label>
                                <textarea id="theater-description" className="table-input" style={{ height: '80px' }} defaultValue={campaign?.description} onChange={(e) => handleUpdate('description', e.target.value)} placeholder="Operational details and briefing lore..." title="Primary mission summary" />
                            </div>

                            <div className="mt-15">
                                <label className="restricted-text" style={{ color: 'var(--terminal-green)' }}>PRIMARY CONTRACT: {campaign?.primaryEmployer}</label>
                                <div className="grid-5-col mt-5">
                                    <div>
                                        <label className="restricted-text" style={{ fontSize: '0.6rem' }}>PAY (STEP {campaign?.payStep})</label>
                                        <div className="status-bar" style={{ display: 'block', margin: 0, fontSize: '0.7rem' }}>{Math.round((campaign?.payRate || 0) * 100)}%</div>
                                    </div>
                                    <div>
                                        <label className="restricted-text" style={{ fontSize: '0.6rem' }}>SALVAGE ({campaign?.salvageStep})</label>
                                        <div className="status-bar" style={{ display: 'block', margin: 0, fontSize: '0.7rem' }}>{campaign?.salvageTerms}</div>
                                    </div>
                                    <div>
                                        <label className="restricted-text" style={{ fontSize: '0.6rem' }}>SUPPORT ({campaign?.supportStep})</label>
                                        <div className="status-bar" style={{ display: 'block', margin: 0, fontSize: '0.7rem' }}>{campaign?.supportTerms}</div>
                                    </div>
                                    <div>
                                        <label className="restricted-text" style={{ fontSize: '0.6rem' }}>TRANS ({campaign?.transportStep})</label>
                                        <div className="status-bar" style={{ display: 'block', margin: 0, fontSize: '0.7rem' }}>{campaign?.transportTerms}</div>
                                    </div>
                                    <div>
                                        <label className="restricted-text" style={{ fontSize: '0.6rem' }}>CMD ({campaign?.commandStep})</label>
                                        <div className="status-bar" style={{ display: 'block', margin: 0, fontSize: '0.7rem' }}>{campaign?.commandRights}</div>
                                    </div>
                                </div>
                            </div>

                            {opposition && (
                                <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--terminal-border)' }}>
                                    <label className="restricted-text" style={{ color: 'var(--terminal-red)' }}>OPPOSITION CONTRACT: {opposition.employerCategory}</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginTop: '5px' }}>
                                        <div>
                                            <label className="restricted-text" style={{ fontSize: '0.6rem' }}>PAY ({opposition.payStep})</label>
                                            <div className="status-bar" style={{ display: 'block', margin: 0, fontSize: '0.7rem', color: 'var(--terminal-red)', borderColor: 'var(--terminal-red-dim)' }}>{Math.round((opposition.payRate || 0) * 100)}%</div>
                                        </div>
                                        <div>
                                            <label className="restricted-text" style={{ fontSize: '0.6rem' }}>SALVAGE ({opposition.salvageStep})</label>
                                            <div className="status-bar" style={{ display: 'block', margin: 0, fontSize: '0.7rem', color: 'var(--terminal-red)', borderColor: 'var(--terminal-red-dim)' }}>{opposition.salvageTerms}</div>
                                        </div>
                                        <div>
                                            <label className="restricted-text" style={{ fontSize: '0.6rem' }}>SUPPORT ({opposition.supportStep})</label>
                                            <div className="status-bar" style={{ display: 'block', margin: 0, fontSize: '0.7rem', color: 'var(--terminal-red)', borderColor: 'var(--terminal-red-dim)' }}>{opposition.supportTerms}</div>
                                        </div>
                                        <div>
                                            <label className="restricted-text" style={{ fontSize: '0.6rem' }}>TRANS ({opposition.transportStep})</label>
                                            <div className="status-bar" style={{ display: 'block', margin: 0, fontSize: '0.7rem', color: 'var(--terminal-red)', borderColor: 'var(--terminal-red-dim)' }}>{opposition.transportTerms}</div>
                                        </div>
                                        <div>
                                            <label className="restricted-text" style={{ fontSize: '0.6rem' }}>CMD ({opposition.commandStep})</label>
                                            <div className="status-bar" style={{ display: 'block', margin: 0, fontSize: '0.7rem', color: 'var(--terminal-red)', borderColor: 'var(--terminal-red-dim)' }}>{opposition.commandRights}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="tactical-panel">
                            <h3 className="zone-header">RECRUITMENT</h3>
                            <p className="restricted-text" style={{ fontSize: '0.7rem' }}>ISSUE AN INVITATION KEY TO ALLOW MERCENARY COMMANDS TO JOIN THIS THEATER.</p>
                            {activeToken ? (
                                <div className="status-bar theme-amber" style={{ width: '100%', textAlign: 'center', fontSize: '1.2rem', marginTop: '15px' }}>
                                    {activeToken}
                                </div>
                            ) : (
                                <button type="button" className="login-button" style={{ marginTop: '15px' }} onClick={handleGenerateInvite} title="Generate a new invitation key">GENERATE INVITE KEY</button>
                            )}

                            {campaignInvites.length > 0 && (
                                <div style={{ marginTop: '20px', borderTop: '1px dashed var(--accent-dim)', paddingTop: '15px' }}>
                                    <h4 className="restricted-text" style={{ fontSize: '0.7rem', marginBottom: '10px' }}>ACTIVE INVITES</h4>
                                    {campaignInvites.map(invite => (
                                        <div key={invite.id} className="status-bar" style={{
                                            display: 'block', margin: '5px 0', fontSize: '0.8rem', width: '100%',
                                            // Subdued opacity and line-through for used or expired tokens
                                            opacity: (invite.used || new Date(invite.expiresAt) < new Date()) ? 0.5 : 1,
                                            textDecoration: (invite.used || new Date(invite.expiresAt) < new Date()) ? 'line-through' : 'none'
                                        }}>
                                            {invite.token} {invite.used && '(USED)'} {new Date(invite.expiresAt) < new Date() && '(EXPIRED)'}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="dashboard-section tactical-panel">
                        <h3 className="section-title">PARTICIPATING DETACHMENTS</h3>
                        <div className="detachment-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
                            {campaign?.participatingDetachments?.map((det) => (
                                <div key={det.id} className="asset-card" style={{ position: 'relative' }}>
                                    <div
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => onSelectDetachment({
                                            id: `camp-det-${det.id}`,
                                            label: det.name,
                                            type: 'DETACHMENT',
                                            metadata: { detachmentId: det.id, commandId: det.mercenaryCommandId, campaignId: campaign.id, managerView: true }
                                        })}
                                    >
                                        <div className="asset-type">DETACHMENT</div>
                                        <div className="asset-label">{det.name}</div>
                                    </div>
                                    <button type="button" className="mode-btn" style={{ position: 'absolute', top: '5px', right: '5px', padding: '2px 5px', fontSize: '0.6rem', color: 'var(--terminal-alert)' }} onClick={() => handleRemoveDetachment(det.id)}>EJECT</button>
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