import React, { useState, useRef, useEffect, useMemo } from 'react';
import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { NodeType } from './NavigationTree';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
      lengthInMonths
      trackCount
    }
  }
`;

const ASSIGN_DETACHMENT = gql`
  mutation AssignDetachmentToCampaign($detachmentId: ID!, $campaignId: ID) {
    assignDetachmentToCampaign(detachmentId: $detachmentId, campaignId: $campaignId)
  }
`;

const UPDATE_TRACK = gql`
  mutation UpdateTrack($id: ID!, $input: TrackInput!) {
    updateTrack(id: $id, input: $input) {
      id
      trackName
      location
      nextSession
      attackerFactionId
      monthIndex
    }
  }
`;

const REORDER_TRACKS = gql`
  mutation ReorderTracks($campaignId: ID!, $trackIds: [ID!]!) {
    reorderTracks(campaignId: $campaignId, trackIds: $trackIds) {
      id
      sequenceOrder
    }
  }
`;

const GET_CAMPAIGN_INVITES = gql`
  query GetCampaignInvites($campaignId: ID!) {
    getCampaign(id: $campaignId) {
      id
      name
      systemName
      description
      lengthInMonths
      trackCount
      factions {
        id
        factionName
      }
      tracks {
        id
        trackName
        sequenceOrder
        location
        nextSession
        attackerFactionId
        monthIndex
      }
      participatingDetachments {
        id
        name
        mercenaryCommandId
      }
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

interface ParticipatingDetachment {
    id: string;
    name: string;
    mercenaryCommandId?: string;
}

interface TrackDetail {
    id: string;
    trackName: string;
    sequenceOrder: number;
    location?: string;
    nextSession?: string;
    attackerFactionId?: string;
    monthIndex?: number;
}

interface CampaignDetail {
    id: string;
    name: string;
    systemName: string;
    description?: string;
    lengthInMonths?: number;
    trackCount?: number;
    status: string;
    primaryEmployer: string;
    secondaryEmployer: string;
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
    factions?: { id: string, factionName: string }[];
    tracks?: TrackDetail[];
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
    const campaignFromProps = managedData?.managedCampaigns.find((c) => c.id === selectedCampaignId);
    const [createInvite] = useMutation<CreateInviteData, CreateInviteVars>(CREATE_INVITE);
    const { data: campaignQueryData, refetch: refetchCampaign } = useQuery<any>(GET_CAMPAIGN_INVITES, {
        variables: { campaignId: selectedCampaignId || '' },
        skip: !selectedCampaignId,
        fetchPolicy: 'network-only'
    });
    const [updateCampaign] = useMutation(UPDATE_CAMPAIGN);
    const [updateTrack] = useMutation(UPDATE_TRACK);
    const [reorderTracks] = useMutation(REORDER_TRACKS);
    const [assignDetachment] = useMutation(ASSIGN_DETACHMENT);
    const [activeToken, setActiveToken] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const saveTimeoutRef = useRef<Record<string, number>>({});
    const [dragOverMonth, setDragOverMonth] = useState<number | null>(null);

    // Merge props data with fresh query data for theater management
    const campaign = useMemo(() => ({
        ...campaignFromProps,
        ...(campaignQueryData?.getCampaign || {})
    }), [campaignFromProps, campaignQueryData]);

    const opposition = campaign?.contracts?.find((c: any) => !c.primaryContract);
    const [campaignLengthInMonths, setCampaignLengthInMonths] = useState(campaign?.lengthInMonths || 1);
    const [campaignTrackCount, setCampaignTrackCount] = useState(campaign?.trackCount || 0);

    const campaignInvites = campaignQueryData?.getCampaign?.campaignInvites || [];

    useEffect(() => {
        const timeouts = saveTimeoutRef.current;
        return () => Object.values(timeouts).forEach(clearTimeout);
    }, []);

    useEffect(() => {
        setCampaignLengthInMonths(campaign?.lengthInMonths || 1);
        setCampaignTrackCount(campaign?.trackCount || 0);
    }, [campaign]);

    const handleGenerateInvite = async () => {
        if (!selectedCampaignId) return;
        const { data } = await createInvite({ variables: { campaignId: selectedCampaignId } });
        if (data?.createInvite) {
            setActiveToken(data.createInvite.token);
            refetchCampaign();
        }
    };

    const handleUpdate = (field: string, value: string | number) => {
        if (!selectedCampaignId) return;
        const key = `camp-${field}`;
        if (saveTimeoutRef.current[key]) clearTimeout(saveTimeoutRef.current[key]);

        saveTimeoutRef.current[key] = setTimeout(async () => {
            setIsSyncing(true);
            const input: { [key: string]: any } = { [field]: value };
            // Ensure numbers are parsed correctly for trackCount and lengthInMonths
            if (field === 'trackCount' || field === 'lengthInMonths') {
                input[field] = parseInt(value as string);
            }
            await updateCampaign({ variables: { id: selectedCampaignId, input } });
            setIsSyncing(false);
            // Refetch to ensure local state is consistent, especially for month options
            // This might be heavy, consider more granular updates if performance is an issue
            // refetchInvites(); // This refetches invites, not campaign details. Need to refetch campaign itself.
        }, 1000) as unknown as number;
    };

    const handleTrackUpdate = (trackId: string, field: string, value: string) => {
        const key = `track-${trackId}-${field}`;
        if (saveTimeoutRef.current[key]) clearTimeout(saveTimeoutRef.current[key]);

        saveTimeoutRef.current[key] = setTimeout(async () => {
            setIsSyncing(true);
            const input: any = { [field]: value };
            if (field === 'monthIndex') {
                input[field] = parseInt(value);
            }
            await updateTrack({ variables: { id: trackId, input } });
            setIsSyncing(false);
        }, 1000) as unknown as number;
    };

    const handleDrop = async (e: React.DragEvent, targetMonth: number, targetTrackId?: string) => {
        e.preventDefault();
        setDragOverMonth(null);
        const draggedTrackId = e.dataTransfer.getData("trackId");
        if (!draggedTrackId || !campaign?.tracks) return;

        // 1. Prepare sorted tracks list
        const tracks = [...campaign.tracks].sort((a, b) => a.sequenceOrder - b.sequenceOrder);
        const draggedTrack = tracks.find(t => t.id === draggedTrackId);
        if (!draggedTrack) return;

        // 2. Filter out the dragged track to find insertion point
        const remainingTracks = tracks.filter(t => t.id !== draggedTrackId);

        // 3. Find insertion index
        let insertIndex = remainingTracks.length;
        if (targetTrackId) {
            insertIndex = remainingTracks.findIndex(t => t.id === targetTrackId);
        } else {
            // dropped on panel, find the last track currently in that month or the boundary after previous month
            const monthTracks = remainingTracks.filter(t => (t.monthIndex || 1) === targetMonth);
            if (monthTracks.length > 0) {
                const lastInMonth = monthTracks[monthTracks.length - 1];
                insertIndex = remainingTracks.findIndex(t => t.id === lastInMonth.id) + 1;
            } else {
                const earlierMonthsTracks = remainingTracks.filter(t => (t.monthIndex || 1) < targetMonth);
                insertIndex = earlierMonthsTracks.length;
            }
        }

        // 4. Update the dragged track's monthIndex locally and insert it
        draggedTrack.monthIndex = targetMonth;
        remainingTracks.splice(insertIndex, 0, draggedTrack);
        const orderedIds = remainingTracks.map(t => t.id);

        // 5. Sync to backend
        setIsSyncing(true);
        await updateTrack({ variables: { id: draggedTrackId, input: { monthIndex: targetMonth } } });
        await reorderTracks({ variables: { campaignId: campaign.id, trackIds: orderedIds } });
        setIsSyncing(false);
        refetchCampaign();
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
                                    <div><span className="restricted-text" style={{ fontSize: '0.7rem', display: 'block' }}>LOCATION</span> {camp.systemName}</div>
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
                                <p className="restricted-text">THEATER COMMAND DATA: {campaign?.systemName?.toUpperCase()} {isSyncing && <span className="pulse">...SYNCHRONIZING</span>}</p>
                            </div>
                            <div className="flex flex-gap-10">
                                <button type="button" className="mode-btn" onClick={onReturnToList}>[ RETURN TO LIST ]</button>
                            </div>
                        </div>
                    </header>

                    <div className="grid-3-col mb-30">
                        <div className="tactical-panel" style={{ gridColumn: 'span 2' }}>
                            <div className="flex-between mb-10">
                                <h3 className="zone-header">THEATER COMMAND DATA</h3>
                                <div className="flex flex-gap-15">
                                    <div className="input-group">
                                        <label htmlFor="campaign-months" className="restricted-text" style={{ fontSize: '0.7rem' }}>MONTHS:</label>
                                        <input
                                            id="campaign-months"
                                            type="number"
                                            className="inline-edit inline-edit-input-small"
                                            value={campaignLengthInMonths}
                                            onChange={(e) => setCampaignLengthInMonths(parseInt(e.target.value) || 1)}
                                            onBlur={(e) => handleUpdate('lengthInMonths', parseInt(e.target.value) || 1)}
                                            title="Total duration of the campaign in months"
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label htmlFor="campaign-tracks" className="restricted-text" style={{ fontSize: '0.7rem' }}>TRACKS:</label>
                                        <input
                                            id="campaign-tracks"
                                            type="number"
                                            className="inline-edit inline-edit-input-small"
                                            value={campaignTrackCount}
                                            onChange={(e) => setCampaignTrackCount(parseInt(e.target.value) || 0)}
                                            onBlur={(e) => handleUpdate('trackCount', parseInt(e.target.value) || 0)}
                                            title="Total number of tracks in the campaign"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10" style={{ width: '100%' }}>
                                {isEditingDescription ? (
                                    <textarea
                                        id="theater-description"
                                        className="table-input"
                                        style={{ height: '180px', width: '100%', display: 'block', fontSize: '0.9rem' }}
                                        defaultValue={campaign?.description}
                                        autoFocus
                                        onBlur={() => setIsEditingDescription(false)}
                                        onChange={(e) => handleUpdate('description', e.target.value)}
                                        placeholder="Enter operational briefing (Markdown supported)..."
                                        title="Exit field to save mission description"
                                    />
                                ) : (
                                    <div
                                        className="markdown-preview"
                                        style={{
                                            minHeight: '80px',
                                            width: '100%',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            lineHeight: '1.4'
                                        }}
                                        onClick={() => setIsEditingDescription(true)}
                                        title="Click to edit theater command briefing"
                                    >
                                        {campaign?.description ? (
                                            <Markdown remarkPlugins={[remarkGfm]}>{campaign.description}</Markdown>
                                        ) : (
                                            <span className="restricted-text">NO OPERATIONAL BRIEFING FILED. CLICK TO INITIALIZE THEATER LORE.</span>
                                        )}
                                    </div>
                                )}
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
                                    {campaignInvites.map((invite: CampaignInvite) => (
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

                    <div className="dashboard-section tactical-panel mb-30">
                        <h3 className="section-title">TRACK OPERATIONS</h3>
                        <div className="month-panel-grid mt-15" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px', alignItems: 'start' }}>
                            {Array.from({ length: Math.max(1, campaignLengthInMonths) }, (_, i) => i + 1).map(mIdx => {
                                const monthTracks = (campaign?.tracks || []).filter((t: TrackDetail) => (t.monthIndex || 1) === mIdx)
                                    .sort((a: TrackDetail, b: TrackDetail) => a.sequenceOrder - b.sequenceOrder);
                                return (
                                    <div
                                        key={mIdx}
                                        className="tactical-panel"
                                        style={{
                                            height: 'auto',
                                            minHeight: '100px',
                                            border: dragOverMonth === mIdx ? '1px solid var(--terminal-green)' : '1px dashed var(--accent-dim)',
                                            padding: '10px',
                                            backgroundColor: dragOverMonth === mIdx ? 'rgba(51, 255, 51, 0.05)' : 'rgba(255, 255, 255, 0.02)'
                                        }}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDragLeave={() => setDragOverMonth(null)}
                                        onDrop={(e) => handleDrop(e, mIdx)}
                                    >
                                        <h4 className="zone-header" style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>[ MONTH {mIdx} ]</span>
                                            <span className="restricted-text" style={{ fontSize: '0.7rem' }}>[{monthTracks.length} OPS]</span>
                                        </h4>
                                        <div className="track-container flex flex-column flex-gap-10" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {monthTracks.map((track: TrackDetail) => (
                                                <div
                                                    key={track.id}
                                                    draggable
                                                    onDragStart={(e) => e.dataTransfer.setData("trackId", track.id)}
                                                    onDrop={(e) => {
                                                        e.stopPropagation(); // prevent panel drop from firing
                                                        handleDrop(e, mIdx, track.id);
                                                    }}
                                                    className="asset-card"
                                                    style={{ padding: '12px', cursor: 'grab', position: 'relative', border: '1px solid var(--accent-dim)', width: '100%', boxSizing: 'border-box' }}
                                                >
                                                    <div className="flex-between mb-5">
                                                        <input
                                                            className="inline-edit"
                                                            style={{ fontWeight: 'bold', width: '75%' }}
                                                            defaultValue={track.trackName}
                                                            onChange={(e) => handleTrackUpdate(track.id, 'trackName', e.target.value)}
                                                            placeholder="DESIGNATION"
                                                            title="Operational designation"
                                                        />
                                                        <span className="restricted-text" style={{ fontSize: '0.6rem' }}>#{track.sequenceOrder + 1}</span>
                                                    </div>
                                                    <div className="flex flex-gap-5 mb-5">
                                                        <input
                                                            className="inline-edit"
                                                            style={{ fontSize: '0.7rem', flex: 1 }}
                                                            defaultValue={track.location}
                                                            onChange={(e) => handleTrackUpdate(track.id, 'location', e.target.value)}
                                                            placeholder="LOCATION"
                                                            title="Physical location"
                                                        />
                                                        {track.location && (
                                                            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(track.location)}`} target="_blank" rel="noopener noreferrer" className="mode-btn sm-text" style={{ padding: '0 4px', height: '16px' }}>MAP</a>
                                                        )}
                                                    </div>
                                                    <div className="flex-between">
                                                        <input
                                                            type="datetime-local"
                                                            className="inline-edit"
                                                            style={{ fontSize: '0.7rem', width: '60%' }}
                                                            defaultValue={track.nextSession ? track.nextSession.substring(0, 16) : ''}
                                                            onChange={(e) => handleTrackUpdate(track.id, 'nextSession', e.target.value)}
                                                            title="Deployment time"
                                                        />
                                                        <select
                                                            className="inline-edit"
                                                            style={{ fontSize: '0.7rem', width: '35%' }}
                                                            defaultValue={track.attackerFactionId || ""}
                                                            onChange={(e) => handleTrackUpdate(track.id, 'attackerFactionId', e.target.value)}
                                                            title="Attacker"
                                                        >
                                                            <option value="">[ ATK ]</option>
                                                            {campaign?.factions?.map((f: { id: string, factionName: string }) => (
                                                                <option key={f.id} value={f.id}>{f.factionName.substring(0, 3).toUpperCase()}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            ))}
                                            {monthTracks.length === 0 && (
                                                <div className="restricted-text subdued" style={{ textAlign: 'center', padding: '20px', fontSize: '0.7rem' }}>
                                                    NO OPS SCHEDULED
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="dashboard-section tactical-panel">
                        <h3 className="section-title">PARTICIPATING DETACHMENTS</h3>
                        <div className="detachment-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
                            {campaign?.participatingDetachments?.map((det: ParticipatingDetachment) => (
                                <div key={det.id} className="asset-card" style={{ position: 'relative' }}>
                                    <div
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => onSelectDetachment({
                                            id: `camp-det-${det.id}`,
                                            label: det.name,
                                            type: 'DETACHMENT',
                                            metadata: { detachmentId: det.id, commandId: det.mercenaryCommandId, campaignId: campaign?.id, managerView: true }
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