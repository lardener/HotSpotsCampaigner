import React, { useState, useRef, useEffect, useMemo } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { NodeType } from './NavigationTree';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DetachmentReadinessSummary } from './DetachmentReadinessSummary';

const CREATE_INVITE = gql`
  mutation CreateInvite($campaignId: ID!, $recipientName: String) {
    createInvite(campaignId: $campaignId, recipientName: $recipientName) {
      token
      recipientName
    }
  }
`;

const DELETE_INVITE = gql`
  mutation DeleteInvite($id: ID!) {
    deleteInvite(id: $id)
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
      monthlyPay
      monthlyMaintenance
      transportationCost
      combatPay
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
      complications
    }
  }
`;

const REROLL_TRACK = gql`
  mutation RerollTrack($id: ID!) {
    rerollTrack(id: $id) {
      id
      trackName
      complications
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
        monthlyPay
        monthlyMaintenance
        transportationCost
        combatPay
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
            complications
        }
      participatingDetachments {
            id
            name
            mercenaryCommandId
            mercenaryCommandName
            units {
                id
                type
                tonnage
                asSize
                bv
                pv
            }
            pilots {
                id
                unitType
                gunnery
                piloting
                asSkill
            }
        }
      campaignInvites {
            id
            token
            recipientName
            expiresAt
            used
        }
    }
}
`;

/**
 * Custom Terminal-themed overlay to replace native browser popups.
 */
const TerminalOverlay: React.FC<{
    title: string;
    message: string;
    showInput?: boolean;
    onConfirm: (val?: string) => void;
    onCancel: () => void;
}> = ({ title, message, showInput, onConfirm, onCancel }) => {
    const [input, setInput] = React.useState('');
    return (
        <div className="terminal-overlay-backdrop" style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div className="tactical-panel theme-amber" style={{ width: '400px', border: '1px solid var(--terminal-amber)' }}>
                <h3 className="zone-header">{title}</h3>
                <p className="restricted-text mt-10">{message}</p>
                {showInput && (
                    <input
                        type="text"
                        className="table-input mt-10 w-100"
                        autoFocus
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onConfirm(input)}
                    />
                )}
                <div className="flex flex-gap-10 mt-20 justify-end">
                    <button className="mode-btn" onClick={onCancel}>CANCEL</button>
                    <button className="mode-btn theme-amber" onClick={() => onConfirm(input)}>CONFIRM</button>
                </div>
            </div>
        </div>
    );
};

interface CreateInviteData {
    createInvite: {
        token: string;
        recipientName: string;
    };
}

interface CreateInviteVars {
    campaignId: string;
    recipientName?: string | null;
}

interface CampaignInvite {
    id: string;
    token: string;
    recipientName?: string;
    expiresAt: string;
    used: boolean;
}

interface ParticipatingDetachment {
    id: string;
    name: string;
    mercenaryCommandId?: string;
    mercenaryCommandName?: string;
    units?: any[];
    pilots?: any[];
}

interface TrackDetail {
    id: string;
    trackName: string;
    sequenceOrder: number;
    location?: string;
    nextSession?: string;
    attackerFactionId?: string;
    monthIndex?: number;
    complications?: string;
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
    monthlyPay?: number;
    monthlyMaintenance?: number;
    transportationCost?: number;
    combatPay?: number;
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
    const [deleteInvite] = useMutation(DELETE_INVITE);
    const [rerollTrack] = useMutation(REROLL_TRACK);
    const [reorderTracks] = useMutation(REORDER_TRACKS);
    const [assignDetachment] = useMutation(ASSIGN_DETACHMENT);
    const [activeToken, setActiveToken] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [copiedToken, setCopiedToken] = useState<string | null>(null);

    const [overlay, setOverlay] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        showInput?: boolean;
        onConfirm: (val?: string) => void;
    }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

    // Merge props data with fresh query data for theater management
    const campaign = useMemo(() => ({
        ...campaignFromProps,
        ...(campaignQueryData?.getCampaign || {})
    }), [campaignFromProps, campaignQueryData]);

    const [editingField, setEditingField] = useState<string | null>(null);
    const [monthlyPay, setMonthlyPay] = useState(campaign?.monthlyPay || 500);
    const [monthlyMaintenance, setMonthlyMaintenance] = useState(campaign?.monthlyMaintenance || 500);
    const [transportationCost, setTransportationCost] = useState(campaign?.transportationCost || 300);
    const [combatPay, setCombatPay] = useState(campaign?.combatPay || 500);
    const saveTimeoutRef = useRef<Record<string, number>>({});
    const [dragOverMonth, setDragOverMonth] = useState<number | null>(null);

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
        setMonthlyPay(campaign?.monthlyPay || 500);
        setMonthlyMaintenance(campaign?.monthlyMaintenance || 500);
        setTransportationCost(campaign?.transportationCost || 300);
        setCombatPay(campaign?.combatPay || 500);
    }, [campaign]);

    const handleGenerateInvite = () => {
        if (!selectedCampaignId) return;
        setOverlay({
            isOpen: true,
            title: "RECRUITMENT PROTOCOL",
            message: "ENTER RECIPIENT NAME (OR IDENTIFIER):",
            showInput: true,
            onConfirm: async (recipientName) => {
                const { data } = await createInvite({ variables: { campaignId: selectedCampaignId, recipientName } });
                if (data?.createInvite) {
                    setActiveToken(data.createInvite.token);
                    refetchCampaign();
                }
                setOverlay(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleCopyToken = (token: string) => {
        navigator.clipboard.writeText(token).then(() => {
            setCopiedToken(token);
            setTimeout(() => setCopiedToken(null), 2000);
        });
    };

    const handleUpdate = (field: string, value: string | number) => {
        if (!selectedCampaignId) return;
        const key = `camp-${field}`;
        if (saveTimeoutRef.current[key]) clearTimeout(saveTimeoutRef.current[key]);

        saveTimeoutRef.current[key] = setTimeout(async () => {
            setIsSyncing(true);
            const input: { [key: string]: any } = { [field]: value };
            // Ensure numbers are parsed correctly for trackCount and lengthInMonths
            const numericFields = ['trackCount', 'lengthInMonths', 'monthlyPay', 'monthlyMaintenance', 'transportationCost', 'combatPay'];
            if (numericFields.includes(field)) {
                const val = parseInt(value as string) || 0;
                // Months and Tracks cannot be below 1 (enforced at call site but safe to repeat)
                if (field === 'trackCount' || field === 'lengthInMonths') {
                    input[field] = Math.max(1, val);
                } else {
                    input[field] = Math.max(0, val);
                }
            }
            await updateCampaign({ variables: { id: selectedCampaignId, input } });
            await refetchCampaign();
            setIsSyncing(false);
        }, 1000) as unknown as number;
    };

    const handleDeleteInvite = (inviteId: string) => {
        setOverlay({
            isOpen: true,
            title: "SECURITY REVOCATION",
            message: "DELETE THIS INVITATION KEY? IT WILL NO LONGER BE VALID.",
            onConfirm: async () => {
                try {
                    await deleteInvite({ variables: { id: inviteId } });
                    await refetchCampaign();
                } catch (err) { console.error(err); }
                setOverlay(prev => ({ ...prev, isOpen: false }));
            }
        });
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

    const handleReroll = async (trackId: string) => {
        setIsSyncing(true);
        try {
            await rerollTrack({ variables: { id: trackId } });
            await refetchCampaign();
        } catch (err) { console.error(err); }
        setIsSyncing(false);
    };
    const handleDrop = async (e: React.DragEvent, targetMonth: number, targetTrackId?: string) => {
        e.preventDefault();
        setDragOverMonth(null);
        const draggedTrackId = e.dataTransfer.getData("trackId");
        if (!draggedTrackId || !campaign?.tracks) return;

        // 1. Prepare sorted tracks list (prioritize month, then existing sequence)
        const tracks = [...campaign.tracks].sort((a, b) => {
            if (a.monthIndex !== b.monthIndex) return (a.monthIndex || 1) - (b.monthIndex || 1);
            return a.sequenceOrder - b.sequenceOrder;
        });

        const draggedTrack = tracks.find(t => t.id === draggedTrackId);
        if (!draggedTrack) return;

        // 2. Filter out the dragged track to find insertion point
        const remainingTracks = tracks.filter(t => t.id !== draggedTrackId);

        // 3. Find insertion index
        let insertIndex = remainingTracks.length;
        if (targetTrackId) {
            insertIndex = remainingTracks.findIndex(t => t.id === targetTrackId);
        } else {
            // dropped on panel, place at the end of the target month
            const tracksBeforeTarget = remainingTracks.filter(t => (t.monthIndex || 1) <= targetMonth);
            insertIndex = tracksBeforeTarget.length;
        }

        // 4. Update the dragged track's monthIndex locally and insert it
        const updatedTrack = { ...draggedTrack, monthIndex: targetMonth };
        const finalOrderedTracks = [...remainingTracks];
        finalOrderedTracks.splice(insertIndex, 0, updatedTrack as any);
        const orderedIds = finalOrderedTracks.map(t => t.id);

        // 5. Sync to backend
        setIsSyncing(true);
        try {
            await updateTrack({ variables: { id: draggedTrackId, input: { monthIndex: targetMonth } } });
            await reorderTracks({ variables: { campaignId: campaign.id, trackIds: orderedIds } });
            await refetchCampaign();
        } catch (err) {
            console.error("Failed to reorder tracks", err);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleRemoveDetachment = (detId: string) => {
        setOverlay({
            isOpen: true,
            title: "COMMAND PROTOCOL",
            message: "EJECT THIS DETACHMENT FROM THE THEATER?",
            onConfirm: async () => {
                await assignDetachment({ variables: { detachmentId: detId, campaignId: null } });
                window.location.reload();
                setOverlay(prev => ({ ...prev, isOpen: false }));
            }
        });
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
                                        onFocus={() => setIsEditingDescription(true)}
                                        tabIndex={0}
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

                            <div className="grid-6-col mt-20 pt-10" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', borderTop: '1px solid var(--terminal-border)' }}>
                                <div>
                                    <label className="restricted-text" style={{ fontSize: '0.6rem' }}>MONTHS</label>
                                    {editingField === 'lengthInMonths' ? (
                                        <div className="status-bar theme-amber" style={{ display: 'flex', margin: 0, padding: '2px 5px', height: '24px', alignItems: 'center' }}>
                                            <input type="number" min="1" className="inline-edit" style={{ width: '100%', textAlign: 'center' }}
                                                value={campaignLengthInMonths} autoFocus
                                                onChange={(e) => setCampaignLengthInMonths(Math.max(1, parseInt(e.target.value) || 1))}
                                                onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                                                onBlur={(e) => { handleUpdate('lengthInMonths', Math.max(1, parseInt(e.target.value) || 1)); setEditingField(null); }} />
                                        </div>
                                    ) : (
                                        <div className="status-bar theme-amber" style={{ display: 'flex', margin: 0, padding: '2px 5px', height: '24px', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                            onClick={() => setEditingField('lengthInMonths')} onFocus={() => setEditingField('lengthInMonths')} tabIndex={0}>
                                            {campaignLengthInMonths}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="restricted-text" style={{ fontSize: '0.6rem' }}>TRACKS</label>
                                    {editingField === 'trackCount' ? (
                                        <div className="status-bar theme-amber" style={{ display: 'flex', margin: 0, padding: '2px 5px', height: '24px', alignItems: 'center' }}>
                                            <input type="number" min="1" className="inline-edit" style={{ width: '100%', textAlign: 'center' }}
                                                value={campaignTrackCount} autoFocus
                                                onChange={(e) => setCampaignTrackCount(Math.max(1, parseInt(e.target.value) || 1))}
                                                onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                                                onBlur={(e) => { handleUpdate('trackCount', Math.max(1, parseInt(e.target.value) || 1)); setEditingField(null); }} />
                                        </div>
                                    ) : (
                                        <div className="status-bar theme-amber" style={{ display: 'flex', margin: 0, padding: '2px 5px', height: '24px', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                            onClick={() => setEditingField('trackCount')} onFocus={() => setEditingField('trackCount')} tabIndex={0}>
                                            {campaignTrackCount}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="restricted-text" style={{ fontSize: '0.6rem' }}>BASE PAY</label>
                                    {editingField === 'monthlyPay' ? (
                                        <div className="status-bar theme-amber" style={{ display: 'flex', margin: 0, padding: '2px 5px', height: '24px', alignItems: 'center' }}>
                                            <input type="number" min="0" className="inline-edit" style={{ width: '100%', textAlign: 'center' }}
                                                value={monthlyPay} autoFocus
                                                onChange={(e) => setMonthlyPay(Math.max(0, parseInt(e.target.value) || 0))}
                                                onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                                                onBlur={(e) => { handleUpdate('monthlyPay', e.target.value); setEditingField(null); }} />
                                        </div>
                                    ) : (
                                        <div className="status-bar theme-amber" style={{ display: 'flex', margin: 0, padding: '2px 5px', height: '24px', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                            onClick={() => setEditingField('monthlyPay')} onFocus={() => setEditingField('monthlyPay')} tabIndex={0}>
                                            {monthlyPay}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="restricted-text" style={{ fontSize: '0.6rem' }}>MAINTENANCE</label>
                                    {editingField === 'monthlyMaintenance' ? (
                                        <div className="status-bar theme-amber" style={{ display: 'flex', margin: 0, padding: '2px 5px', height: '24px', alignItems: 'center' }}>
                                            <input type="number" min="0" className="inline-edit" style={{ width: '100%', textAlign: 'center' }}
                                                value={monthlyMaintenance} autoFocus
                                                onChange={(e) => setMonthlyMaintenance(Math.max(0, parseInt(e.target.value) || 0))}
                                                onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                                                onBlur={(e) => { handleUpdate('monthlyMaintenance', e.target.value); setEditingField(null); }} />
                                        </div>
                                    ) : (
                                        <div className="status-bar theme-amber" style={{ display: 'flex', margin: 0, padding: '2px 5px', height: '24px', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                            onClick={() => setEditingField('monthlyMaintenance')} onFocus={() => setEditingField('monthlyMaintenance')} tabIndex={0}>
                                            {monthlyMaintenance}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="restricted-text" style={{ fontSize: '0.6rem' }}>TRANS COST</label>
                                    {editingField === 'transportationCost' ? (
                                        <div className="status-bar theme-amber" style={{ display: 'flex', margin: 0, padding: '2px 5px', height: '24px', alignItems: 'center' }}>
                                            <input type="number" min="0" className="inline-edit" style={{ width: '100%', textAlign: 'center' }}
                                                value={transportationCost} autoFocus
                                                onChange={(e) => setTransportationCost(Math.max(0, parseInt(e.target.value) || 0))}
                                                onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                                                onBlur={(e) => { handleUpdate('transportationCost', e.target.value); setEditingField(null); }} />
                                        </div>
                                    ) : (
                                        <div className="status-bar theme-amber" style={{ display: 'flex', margin: 0, padding: '2px 5px', height: '24px', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                            onClick={() => setEditingField('transportationCost')} onFocus={() => setEditingField('transportationCost')} tabIndex={0}>
                                            {transportationCost}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="restricted-text" style={{ fontSize: '0.6rem' }}>COMBAT PAY</label>
                                    {editingField === 'combatPay' ? (
                                        <div className="status-bar theme-amber" style={{ display: 'flex', margin: 0, padding: '2px 5px', height: '24px', alignItems: 'center' }}>
                                            <input type="number" min="0" className="inline-edit" style={{ width: '100%', textAlign: 'center' }}
                                                value={combatPay} autoFocus
                                                onChange={(e) => setCombatPay(Math.max(0, parseInt(e.target.value) || 0))}
                                                onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                                                onBlur={(e) => { handleUpdate('combatPay', e.target.value); setEditingField(null); }} />
                                        </div>
                                    ) : (
                                        <div className="status-bar theme-amber" style={{ display: 'flex', margin: 0, padding: '2px 5px', height: '24px', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                            onClick={() => setEditingField('combatPay')} onFocus={() => setEditingField('combatPay')} tabIndex={0}>
                                            {combatPay}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-15">
                                <label className="restricted-text" style={{ color: 'var(--terminal-green)' }}>PRIMARY CONTRACT: {campaign?.primaryEmployer}</label>
                                <div className="grid-5-col mt-5">
                                    <div>
                                        <label className="restricted-text" style={{ fontSize: '0.6rem' }}>PAY (STEP {campaign?.payStep})</label>
                                        <div className="status-bar theme-green" style={{ display: 'block', margin: 0, fontSize: '0.7rem', color: 'var(--terminal-green)', borderColor: 'var(--terminal-green-dim)' }}>{Math.round((campaign?.payRate || 0) * 100)}%</div>
                                    </div>
                                    <div>
                                        <label className="restricted-text" style={{ fontSize: '0.6rem' }}>SALVAGE ({campaign?.salvageStep})</label>
                                        <div className="status-bar theme-green" style={{ display: 'block', margin: 0, fontSize: '0.7rem', color: 'var(--terminal-green)', borderColor: 'var(--terminal-green-dim)' }}>{campaign?.salvageTerms}</div>
                                    </div>
                                    <div>
                                        <label className="restricted-text" style={{ fontSize: '0.6rem' }}>SUPPORT ({campaign?.supportStep})</label>
                                        <div className="status-bar theme-green" style={{ display: 'block', margin: 0, fontSize: '0.7rem', color: 'var(--terminal-green)', borderColor: 'var(--terminal-green-dim)' }}>{campaign?.supportTerms}</div>
                                    </div>
                                    <div>
                                        <label className="restricted-text" style={{ fontSize: '0.6rem' }}>TRANS ({campaign?.transportStep})</label>
                                        <div className="status-bar theme-green" style={{ display: 'block', margin: 0, fontSize: '0.7rem', color: 'var(--terminal-green)', borderColor: 'var(--terminal-green-dim)' }}>{campaign?.transportTerms}</div>
                                    </div>
                                    <div>
                                        <label className="restricted-text" style={{ fontSize: '0.6rem' }}>CMD ({campaign?.commandStep})</label>
                                        <div className="status-bar theme-green" style={{ display: 'block', margin: 0, fontSize: '0.7rem', color: 'var(--terminal-green)', borderColor: 'var(--terminal-green-dim)' }}>{campaign?.commandRights}</div>
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
                                <div className="flex flex-gap-10 mt-15">
                                    <div className="status-bar theme-amber flex-grow" style={{ textAlign: 'center', fontSize: '1.2rem', margin: 0 }}>
                                        {activeToken}
                                    </div>
                                    <button
                                        type="button"
                                        className="mode-btn theme-amber"
                                        onClick={() => handleCopyToken(activeToken)}
                                    >
                                        {copiedToken === activeToken ? 'COPIED' : 'COPY'}
                                    </button>
                                </div>
                            ) : (
                                <button type="button" className="mode-btn theme-blue text-left" style={{ marginTop: '15px', width: '100%' }} onClick={handleGenerateInvite} title="Generate a new invitation key">GENERATE INVITE KEY</button>
                            )}

                            {campaignInvites.length > 0 && (
                                <div style={{ marginTop: '20px', borderTop: '1px dashed var(--accent-dim)', paddingTop: '15px' }}>
                                    <h4 className="restricted-text" style={{ fontSize: '0.7rem', marginBottom: '10px' }}>ACTIVE INVITES</h4>
                                    {campaignInvites.map((invite: CampaignInvite) => (
                                        <div key={invite.id} className="status-bar" style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '5px 0', fontSize: '0.8rem', width: '100%',
                                            // Subdued opacity and line-through for used or expired tokens
                                            opacity: (invite.used || new Date(invite.expiresAt) < new Date()) ? 0.5 : 1,
                                            textDecoration: (invite.used || new Date(invite.expiresAt) < new Date()) ? 'line-through' : 'none'
                                        }}>
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '10px' }}>
                                                {invite.recipientName || 'ANONYMOUS'}: {invite.token.length > 12 ? invite.token.substring(0, 8) + '...' : invite.token} {invite.used && '(USED)'} {new Date(invite.expiresAt) < new Date() && '(EXPIRED)'}
                                            </span>
                                            <div className="flex flex-gap-5">
                                                <button
                                                    className="mode-btn sm-text"
                                                    style={{ padding: '0 4px', height: '18px' }}
                                                    onClick={() => handleCopyToken(invite.token)}
                                                    title="Copy token reference"
                                                >
                                                    {copiedToken === invite.token ? 'OK' : 'COPY'}
                                                </button>
                                                <button className="mode-btn sm-text" style={{ padding: '0 4px', height: '18px', color: 'var(--terminal-alert)', borderColor: 'var(--terminal-alert)' }} onClick={() => handleDeleteInvite(invite.id)}>X</button>
                                            </div>
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
                                        <h4 className="zone-header" style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>[ MONTH {mIdx} ]</span>
                                            <div className="flex flex-gap-10 items-center">
                                                <span className="restricted-text" style={{ fontSize: '0.7rem' }}>[{monthTracks.length} OPS]</span>
                                                <button className="mode-btn theme-green" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>[ EXPENSES ]</button>
                                            </div>
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
                                                            key={`${track.id}-name-${track.trackName}`}
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
                                                            key={`${track.id}-comp-${track.complications}`}
                                                            style={{ fontSize: '0.7rem', flex: 1, color: 'var(--terminal-amber)' }}
                                                            defaultValue={track.complications}
                                                            onChange={(e) => handleTrackUpdate(track.id, 'complications', e.target.value)}
                                                            placeholder="COMPLICATIONS"
                                                            title="Mission complications or modifiers"
                                                        />
                                                        <button
                                                            className="mode-btn theme-amber sm-text"
                                                            style={{ padding: '0 5px', height: '18px', fontSize: '0.6rem' }}
                                                            onClick={() => handleReroll(track.id)}
                                                        >REROLL</button>
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
                                                    </div >
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
                                                    <div className="mt-10 pt-5" style={{ borderTop: '1px dashed var(--accent-dim)' }}>
                                                        <button className="mode-btn theme-red w-100" style={{ fontSize: '0.65rem', padding: '4px' }}>
                                                            [ AFTER ACTION REPORT ]
                                                        </button>
                                                    </div>
                                                </div >
                                            ))}
                                            {
                                                monthTracks.length === 0 && (
                                                    <div className="restricted-text subdued" style={{ textAlign: 'center', padding: '20px', fontSize: '0.7rem' }}>
                                                        NO OPS SCHEDULED
                                                    </div>
                                                )
                                            }
                                        </div >
                                    </div >
                                );
                            })}
                        </div >
                    </div >

                    <div className="dashboard-section tactical-panel">
                        <h3 className="section-title">PARTICIPATING DETACHMENTS</h3>
                        <div className="detachment-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '15px', marginTop: '15px' }}>
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
                                        <div className="asset-type">{det.mercenaryCommandName?.toUpperCase() || 'MERCENARY COMMAND'}</div>
                                        <div className="asset-label" style={{ marginBottom: '10px' }}>{det.name}</div>
                                        <DetachmentReadinessSummary units={det.units || []} pilots={det.pilots || []} />
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
            {overlay.isOpen && (
                <TerminalOverlay
                    title={overlay.title}
                    message={overlay.message}
                    showInput={overlay.showInput}
                    onConfirm={overlay.onConfirm}
                    onCancel={() => setOverlay(prev => ({ ...prev, isOpen: false }))}
                />
            )}
        </div >
    );
};