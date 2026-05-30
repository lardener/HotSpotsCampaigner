import React, { useState, useRef, useEffect, useMemo } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { NodeType } from './NavigationTree';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MonthlyExpensesEditor } from './MonthlyExpensesEditor';
import { DetachmentReadinessSummary } from './DetachmentReadinessSummary';
import { Detachment } from '../types/global.d';
import { AfterActionReportEditor } from './AfterActionReportEditor';

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
  mutation UpdateCampaign($id: ID!, $input: CampaignUpdateInput!) {
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
      status
    }
  }
`;

const ASSIGN_DETACHMENT = gql`
  mutation AssignDetachmentToCampaign($detachmentId: ID!, $campaignId: ID) {
    assignDetachmentToCampaign(detachmentId: $detachmentId, campaignId: $campaignId)
  }
`;

const UPDATE_TRACK = gql`
  mutation UpdateTrack($id: ID!, $input: TrackUpdateInput!) {
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
        status
        monthlyPay
        monthlyMaintenance
        transportationCost
        combatPay
        payRate
        payStep
        salvageTerms
        salvageStep
        supportTerms
        supportStep
        transportTerms
        transportStep
        commandRights
        commandStep
        repairRules {
            armorMultiplier
            internalMultiplier
            crippledMultiplier
            destroyedMultiplier
            nonMechModifier
            mixedTechModifier
            clanTechModifier
        }
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
                model
                variant
                techBase
                tonnage
                asSize
                bv
                pv
            }
            pilots {
                id
                name
                unitType
                gunnery
                piloting
                asSkill
                edgeTokensSkill
                edgeAbilitySkill
                edgeAbilities
                handicap
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
                        id="terminal-overlay-input"
                        type="text"
                        className="table-input mt-10 w-100"
                        autoFocus
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onConfirm(input)}
                        aria-label="Response input"
                        placeholder="Enter value..."
                        title="Enter text and press Enter or CONFIRM"
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

interface Contract {
    id: string;
    employerCategory: string;
    missionType: string;
    primaryContract: boolean;
    payRate: number;
    payStep: number;
    salvageTerms: string;
    salvageStep: number;
    supportTerms: string;
    supportStep: number;
    transportTerms: string;
    transportStep: number;
    commandRights: string;
    commandStep: number;
    trackCount: number;
}

interface ParticipatingDetachment extends Detachment {
    id: string;
    name: string;
    mercenaryCommandId: string; // Ensure this is present for ledger entries
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
    repairRules?: {
        armorMultiplier: number;
        internalMultiplier: number;
        crippledMultiplier: number;
        destroyedMultiplier: number;
        nonMechModifier: number;
        mixedTechModifier: number;
        clanTechModifier: number;
    };
    contracts?: Contract[];
    factions?: { id: string, factionName: string }[];
    tracks?: TrackDetail[];
    participatingDetachments?: ParticipatingDetachment[];
} // Use ParticipatingDetachment

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
    onRefresh?: () => Promise<void>;
    onSyncChange?: (syncing: boolean) => void;
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
    onSelectDetachment,
    onRefresh,
    onSyncChange
}) => {
    const campaignFromProps = managedData?.managedCampaigns.find((c) => c.id === selectedCampaignId);

    // --- Queries & Mutations ---
    const { loading, data: campaignQueryData, refetch: refetchCampaign } = useQuery<any>(GET_CAMPAIGN_INVITES, {
        variables: { campaignId: selectedCampaignId || '' },
        skip: !selectedCampaignId,
        fetchPolicy: 'network-only',
        notifyOnNetworkStatusChange: true
    });

    const [createInvite] = useMutation<CreateInviteData, CreateInviteVars>(CREATE_INVITE);
    const [updateCampaign] = useMutation(UPDATE_CAMPAIGN);
    const [updateTrack] = useMutation(UPDATE_TRACK);
    const [deleteInvite] = useMutation(DELETE_INVITE);
    const [rerollTrack] = useMutation(REROLL_TRACK);
    const [reorderTracks] = useMutation(REORDER_TRACKS);
    const [assignDetachment] = useMutation(ASSIGN_DETACHMENT);

    // --- Refs ---
    const saveTimeoutRef = useRef<Record<string, number>>({});

    // --- State ---
    const [isSyncing, setIsSyncing] = useState(false);
    const [activeToken, setActiveToken] = useState<string | null>(null);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [showMonthlyExpensesEditor, setShowMonthlyExpensesEditor] = useState<number | null>(null); // Stores month index
    const [showAarForTrack, setShowAarForTrack] = useState<TrackDetail | null>(null);
    const [overlay, setOverlay] = useState<{ // Use TerminalOverlayProps
        isOpen: boolean;
        title: string;
        message: string;
        showInput?: boolean;
        onConfirm: (val?: string) => void;
        onCancel?: () => void;
    }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

    const [editingField, setEditingField] = useState<string | null>(null);
    const [activeTrackField, setActiveTrackField] = useState<string | null>(null);
    const [monthlyPay, setMonthlyPay] = useState(500);
    const [monthlyMaintenance, setMonthlyMaintenance] = useState(500);
    const [transportationCost, setTransportationCost] = useState(300);
    const [combatPay, setCombatPay] = useState(500);
    const [armorMult, setArmorMult] = useState(0.5);
    const [internalMult, setInternalMult] = useState(2.0);
    const [crippledMult, setCrippledMult] = useState(3.0);
    const [destroyedMult, setDestroyedMult] = useState(5.0);
    const [nonMechMod, setNonMechMod] = useState(0.5);
    const [mixedTechTax, setMixedTechTax] = useState(1.5);
    const [clanTechTax, setClanTechTax] = useState(2.0);
    const [dragOverMonth, setDragOverMonth] = useState<number | null>(null);
    const [campaignLengthInMonths, setCampaignLengthInMonths] = useState(1);
    const [campaignTrackCount, setCampaignTrackCount] = useState(0);

    // --- Memos ---
    // Merge props data with fresh query data for theater management
    const campaign = useMemo(() => ({
        ...campaignFromProps,
        ...(campaignQueryData?.getCampaign || {}),
        // Ensure contracts are always an array, even if empty from query
        contracts: campaignQueryData?.getCampaign?.contracts || campaignFromProps?.contracts || []
    }), [campaignFromProps, campaignQueryData]);

    const opposition = useMemo(() =>
        campaign?.contracts?.find((c: Contract) => !c.primaryContract),
        [campaign]
    );

    const campaignInvites = campaignQueryData?.getCampaign?.campaignInvites || [];

    // --- Effects ---
    useEffect(() => {
        onSyncChange?.(loading || isSyncing);
    }, [loading, isSyncing, onSyncChange]);

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
        if (campaign.repairRules) {
            setArmorMult(campaign.repairRules.armorMultiplier);
            setInternalMult(campaign.repairRules.internalMultiplier);
            setCrippledMult(campaign.repairRules.crippledMultiplier);
            setDestroyedMult(campaign.repairRules.destroyedMultiplier);
            setNonMechMod(campaign.repairRules.nonMechModifier);
            setMixedTechTax(campaign.repairRules.mixedTechModifier);
            setClanTechTax(campaign.repairRules.clanTechModifier);
        }
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
            if (onRefresh) await onRefresh();
            setIsSyncing(false);
        }, 1000) as unknown as number;
    };

    const handleRepairRuleUpdate = (field: string, value: string | number) => {
        if (!selectedCampaignId) return;
        const key = `camp-repair-${field}`;
        if (saveTimeoutRef.current[key]) clearTimeout(saveTimeoutRef.current[key]);

        saveTimeoutRef.current[key] = setTimeout(async () => {
            setIsSyncing(true);
            const val = parseFloat(value as string) || 0;
            const { __typename, ...currentRules } = (campaign as any).repairRules || {};

            const input = {
                repairRules: {
                    ...currentRules,
                    [field]: val
                }
            };

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

    const handleStatusToggle = () => {
        const isCurrentlyActive = campaign.status === 'ACTIVE';
        const newStatus = isCurrentlyActive ? 'INACTIVE' : 'ACTIVE';

        setOverlay({
            isOpen: true,
            title: isCurrentlyActive ? "DEACTIVATE THEATER" : "ACTIVATE THEATER",
            message: isCurrentlyActive
                ? "WARNING: DEACTIVATING THEATER WILL EJECT ALL DEPLOYED DETACHMENTS. PROCEED?"
                : "RESTORE THEATER TO ACTIVE RECRUITMENT STATUS?",
            onConfirm: async () => {
                setIsSyncing(true);
                await updateCampaign({
                    variables: {
                        id: selectedCampaignId,
                        input: { status: newStatus }
                    }
                });
                await refetchCampaign();
                if (onRefresh) await onRefresh();
                setIsSyncing(false);
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
                setIsSyncing(true);
                await assignDetachment({ variables: { detachmentId: detId, campaignId: null } });
                await refetchCampaign();
                if (onRefresh) await onRefresh();
                setIsSyncing(false);
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
                                <button className="mode-btn theme-red" onClick={onCreateNew}>START NEW CAMPAIGN</button>
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
                                <button
                                    type="button"
                                    className={`mode-btn ${campaign.status === 'ACTIVE' ? 'theme-red' : 'theme-green'}`}
                                    onClick={handleStatusToggle}
                                >
                                    {campaign.status === 'ACTIVE' ? '[ DEACTIVATE THEATER ]' : '[ ACTIVATE THEATER ]'}
                                </button>
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
                                        aria-label="Theater command briefing"
                                    />
                                ) : (
                                    <div
                                        className="markdown-preview cursor-pointer"
                                        style={{
                                            minHeight: '80px',
                                            width: '100%',
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

                            <div className="mt-20 pt-10" style={{ borderTop: '1px solid var(--terminal-border)' }}>
                                <h4 className="restricted-text mb-10" style={{ fontSize: '0.7rem', color: 'var(--terminal-amber)' }}>CAMPAIGN DURATION</h4>
                                <div className="grid-6-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
                                    <div>
                                        <label htmlFor="campaign-length-in-months" className="restricted-text" style={{ fontSize: '0.6rem' }}>MONTHS</label>
                                        {editingField === 'lengthInMonths' ? (
                                            <div className="status-bar theme-amber" style={{ display: 'flex', margin: 0, padding: '2px 5px', height: '24px', alignItems: 'center' }}>
                                                <input id="campaign-length-in-months" type="number" min="1" className="inline-edit" style={{ width: '100%', textAlign: 'center', border: 'none' }}
                                                    value={campaignLengthInMonths} autoFocus
                                                    onChange={(e) => setCampaignLengthInMonths(Math.max(1, parseInt(e.target.value) || 1))}
                                                    onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                                                    onBlur={(e) => { handleUpdate('lengthInMonths', Math.max(1, parseInt(e.target.value) || 1)); setEditingField(null); }}
                                                    placeholder="1"
                                                    title="Number of months for the campaign" />
                                            </div>
                                        ) : (
                                            <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}
                                                onClick={() => setEditingField('lengthInMonths')} onFocus={() => setEditingField('lengthInMonths')} tabIndex={0}>
                                                {campaignLengthInMonths}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="campaign-track-count" className="restricted-text" style={{ fontSize: '0.6rem' }}>TRACKS</label>
                                        {editingField === 'trackCount' ? (
                                            <div className="status-bar theme-amber" style={{ display: 'flex', margin: 0, padding: '2px 5px', height: '24px', alignItems: 'center' }}>
                                                <input id="campaign-track-count" type="number" min="1" className="inline-edit" style={{ width: '100%', textAlign: 'center', border: 'none' }}
                                                    value={campaignTrackCount} autoFocus
                                                    onChange={(e) => setCampaignTrackCount(Math.max(1, parseInt(e.target.value) || 1))}
                                                    onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                                                    onBlur={(e) => { handleUpdate('trackCount', Math.max(1, parseInt(e.target.value) || 1)); setEditingField(null); }}
                                                    placeholder="1"
                                                    title="Number of tracks in the campaign" />
                                            </div>
                                        ) : (
                                            <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}
                                                onClick={() => setEditingField('trackCount')} onFocus={() => setEditingField('trackCount')} tabIndex={0}>
                                                {campaignTrackCount}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <details className="mt-20">
                                <summary className="restricted-text cursor-pointer" style={{ fontSize: '0.7rem', color: 'var(--terminal-amber)' }}>[ ADVANCED THEATER SETTINGS & LOGISTICS ]</summary>
                                <div className="tactical-panel mt-10" style={{ padding: '15px', backgroundColor: 'rgba(0,0,0,0.15)' }}>
                                    <h5 className="restricted-text mb-10" style={{ fontSize: '0.6rem', color: 'var(--terminal-amber)' }}>FINANCIAL PARAMETERS</h5>
                                    <div className="grid-4-col mb-20" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                                        <div>
                                            <label htmlFor="campaign-monthly-pay" className="restricted-text" style={{ fontSize: '0.6rem', color: 'var(--terminal-amber)' }}>BASE PAY</label>
                                            {editingField === 'monthlyPay' ? (
                                                <div className="status-bar theme-amber" style={{ display: 'flex', margin: 0, padding: '2px 5px', height: '24px', alignItems: 'center' }}>
                                                    <input id="campaign-monthly-pay" type="number" min="0" className="inline-edit" style={{ width: '100%', textAlign: 'center', border: 'none' }}
                                                        value={monthlyPay} autoFocus
                                                        onChange={(e) => setMonthlyPay(Math.max(0, parseInt(e.target.value) || 0))}
                                                        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                                                        onBlur={(e) => { handleUpdate('monthlyPay', e.target.value); setEditingField(null); }}
                                                        placeholder="0"
                                                        title="Base monthly pay" />
                                                </div>
                                            ) : (
                                                <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}
                                                    onClick={() => setEditingField('monthlyPay')} onFocus={() => setEditingField('monthlyPay')} tabIndex={0}>
                                                    {monthlyPay}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor="campaign-monthly-maintenance" className="restricted-text" style={{ fontSize: '0.6rem', color: 'var(--terminal-amber)' }}>MAINTENANCE</label>
                                            {editingField === 'monthlyMaintenance' ? (
                                                <div className="status-bar theme-amber" style={{ display: 'flex', margin: 0, padding: '2px 5px', height: '24px', alignItems: 'center' }}>
                                                    <input id="campaign-monthly-maintenance" type="number" min="0" className="inline-edit" style={{ width: '100%', textAlign: 'center', border: 'none' }}
                                                        value={monthlyMaintenance} autoFocus
                                                        onChange={(e) => setMonthlyMaintenance(Math.max(0, parseInt(e.target.value) || 0))}
                                                        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                                                        onBlur={(e) => { handleUpdate('monthlyMaintenance', e.target.value); setEditingField(null); }}
                                                        placeholder="0"
                                                        title="Monthly maintenance cost" />
                                                </div>
                                            ) : (
                                                <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}
                                                    onClick={() => setEditingField('monthlyMaintenance')} onFocus={() => setEditingField('monthlyMaintenance')} tabIndex={0}>
                                                    {monthlyMaintenance}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor="campaign-transportation-cost" className="restricted-text" style={{ fontSize: '0.6rem', color: 'var(--terminal-amber)' }}>TRANS COST</label>
                                            {editingField === 'transportationCost' ? (
                                                <div className="status-bar theme-amber" style={{ display: 'flex', margin: 0, padding: '2px 5px', height: '24px', alignItems: 'center' }}>
                                                    <input id="campaign-transportation-cost" type="number" min="0" className="inline-edit" style={{ width: '100%', textAlign: 'center', border: 'none' }}
                                                        value={transportationCost} autoFocus
                                                        onChange={(e) => setTransportationCost(Math.max(0, parseInt(e.target.value) || 0))}
                                                        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                                                        onBlur={(e) => { handleUpdate('transportationCost', e.target.value); setEditingField(null); }}
                                                        placeholder="0"
                                                        title="Transportation cost" />
                                                </div>
                                            ) : (
                                                <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}
                                                    onClick={() => setEditingField('transportationCost')} onFocus={() => setEditingField('transportationCost')} tabIndex={0}>
                                                    {transportationCost}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor="campaign-combat-pay" className="restricted-text" style={{ fontSize: '0.6rem', color: 'var(--terminal-amber)' }}>COMBAT PAY</label>
                                            {editingField === 'combatPay' ? (
                                                <div className="status-bar theme-amber" style={{ display: 'flex', margin: 0, padding: '2px 5px', height: '24px', alignItems: 'center' }}>
                                                    <input id="campaign-combat-pay" type="number" min="0" className="inline-edit" style={{ width: '100%', textAlign: 'center', border: 'none' }}
                                                        value={combatPay} autoFocus
                                                        onChange={(e) => setCombatPay(Math.max(0, parseInt(e.target.value) || 0))}
                                                        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                                                        onBlur={(e) => { handleUpdate('combatPay', e.target.value); setEditingField(null); }}
                                                        placeholder="0"
                                                        title="Combat pay bonus" />
                                                </div>
                                            ) : (
                                                <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}
                                                    onClick={() => setEditingField('combatPay')} onFocus={() => setEditingField('combatPay')} tabIndex={0}>
                                                    {combatPay}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <h5 className="restricted-text mb-10" style={{ fontSize: '0.6rem', color: 'var(--terminal-amber)' }}>LOGISTICS & REPAIR MULTIPLIERS</h5>
                                    <div className="grid-4-col flex-gap-10" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                                        <div>
                                            <label className="restricted-text sm-text" style={{ fontSize: '0.55rem', color: 'var(--terminal-amber)' }}>ARMOR MULT</label>
                                            {editingField === 'armorMultiplier' ? (
                                                <div className="status-bar theme-amber" style={{ display: 'flex', margin: 0, padding: '2px 5px', height: '24px', alignItems: 'center' }}>
                                                    <input type="number" step="0.1" className="inline-edit" style={{ width: '100%', textAlign: 'center', border: 'none' }}
                                                        value={armorMult} autoFocus
                                                        onChange={(e) => setArmorMult(parseFloat(e.target.value) || 0)}
                                                        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                                                        onBlur={(e) => { handleRepairRuleUpdate('armorMultiplier', e.target.value); setEditingField(null); }}
                                                        title="Repair cost multiplier for armor damage" />
                                                </div>
                                            ) : (
                                                <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}
                                                    onClick={() => setEditingField('armorMultiplier')} tabIndex={0}>
                                                    {armorMult}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="restricted-text sm-text" style={{ fontSize: '0.55rem', color: 'var(--terminal-amber)' }}>INTERNAL MULT</label>
                                            {editingField === 'internalMultiplier' ? (
                                                <div className="status-bar theme-amber" style={{ display: 'flex', margin: 0, padding: '2px 5px', height: '24px', alignItems: 'center' }}>
                                                    <input type="number" step="0.1" className="inline-edit" style={{ width: '100%', textAlign: 'center', border: 'none' }}
                                                        value={internalMult} autoFocus
                                                        onChange={(e) => setInternalMult(parseFloat(e.target.value) || 0)}
                                                        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                                                        onBlur={(e) => { handleRepairRuleUpdate('internalMultiplier', e.target.value); setEditingField(null); }}
                                                        title="Repair cost multiplier for internal damage" />
                                                </div>
                                            ) : (
                                                <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}
                                                    onClick={() => setEditingField('internalMultiplier')} tabIndex={0}>
                                                    {internalMult}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="restricted-text sm-text" style={{ fontSize: '0.55rem', color: 'var(--terminal-amber)' }}>CRIPPLED MULT</label>
                                            {editingField === 'crippledMultiplier' ? (
                                                <div className="status-bar theme-amber" style={{ display: 'flex', margin: 0, padding: '2px 5px', height: '24px', alignItems: 'center' }}>
                                                    <input type="number" step="0.1" className="inline-edit" style={{ width: '100%', textAlign: 'center', border: 'none' }}
                                                        value={crippledMult} autoFocus
                                                        onChange={(e) => setCrippledMult(parseFloat(e.target.value) || 0)}
                                                        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                                                        onBlur={(e) => { handleRepairRuleUpdate('crippledMultiplier', e.target.value); setEditingField(null); }}
                                                        title="Repair cost multiplier for crippled units" />
                                                </div>
                                            ) : (
                                                <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}
                                                    onClick={() => setEditingField('crippledMultiplier')} tabIndex={0}>
                                                    {crippledMult}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="restricted-text sm-text" style={{ fontSize: '0.55rem', color: 'var(--terminal-amber)' }}>DESTROYED MULT</label>
                                            {editingField === 'destroyedMultiplier' ? (
                                                <div className="status-bar theme-amber" style={{ display: 'flex', margin: 0, padding: '2px 5px', height: '24px', alignItems: 'center' }}>
                                                    <input type="number" step="0.1" className="inline-edit" style={{ width: '100%', textAlign: 'center', border: 'none' }}
                                                        value={destroyedMult} autoFocus
                                                        onChange={(e) => setDestroyedMult(parseFloat(e.target.value) || 0)}
                                                        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                                                        onBlur={(e) => { handleRepairRuleUpdate('destroyedMultiplier', e.target.value); setEditingField(null); }}
                                                        title="Repair cost multiplier for destroyed units" />
                                                </div>
                                            ) : (
                                                <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}
                                                    onClick={() => setEditingField('destroyedMultiplier')} tabIndex={0}>
                                                    {destroyedMult}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="restricted-text sm-text" style={{ fontSize: '0.55rem', color: 'var(--terminal-amber)' }}>NON-MECH MOD</label>
                                            {editingField === 'nonMechModifier' ? (
                                                <div className="status-bar theme-amber" style={{ display: 'flex', margin: 0, padding: '2px 5px', height: '24px', alignItems: 'center' }}>
                                                    <input type="number" step="0.1" className="inline-edit" style={{ width: '100%', textAlign: 'center', border: 'none' }}
                                                        value={nonMechMod} autoFocus
                                                        onChange={(e) => setNonMechMod(parseFloat(e.target.value) || 0)}
                                                        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                                                        onBlur={(e) => { handleRepairRuleUpdate('nonMechModifier', e.target.value); setEditingField(null); }}
                                                        title="Adjustment for Vehicles, Battle Armor, and Infantry" />
                                                </div>
                                            ) : (
                                                <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}
                                                    onClick={() => setEditingField('nonMechModifier')} tabIndex={0}>
                                                    {nonMechMod}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="restricted-text sm-text" style={{ fontSize: '0.55rem', color: 'var(--terminal-amber)' }}>MIXED TECH TAX</label>
                                            {editingField === 'mixedTechModifier' ? (
                                                <div className="status-bar theme-amber" style={{ display: 'flex', margin: 0, padding: '2px 5px', height: '24px', alignItems: 'center' }}>
                                                    <input type="number" step="0.1" className="inline-edit" style={{ width: '100%', textAlign: 'center', border: 'none' }}
                                                        value={mixedTechTax} autoFocus
                                                        onChange={(e) => setMixedTechTax(parseFloat(e.target.value) || 0)}
                                                        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                                                        onBlur={(e) => { handleRepairRuleUpdate('mixedTechModifier', e.target.value); setEditingField(null); }}
                                                        title="Repair cost tax for Mixed technology assets" />
                                                </div>
                                            ) : (
                                                <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}
                                                    onClick={() => setEditingField('mixedTechModifier')} tabIndex={0}>
                                                    {mixedTechTax}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="restricted-text sm-text" style={{ fontSize: '0.55rem', color: 'var(--terminal-amber)' }}>CLAN TECH TAX</label>
                                            {editingField === 'clanTechModifier' ? (
                                                <div className="status-bar theme-amber" style={{ display: 'flex', margin: 0, padding: '2px 5px', height: '24px', alignItems: 'center' }}>
                                                    <input type="number" step="0.1" className="inline-edit" style={{ width: '100%', textAlign: 'center', border: 'none' }}
                                                        value={clanTechTax} autoFocus
                                                        onChange={(e) => setClanTechTax(parseFloat(e.target.value) || 0)}
                                                        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                                                        onBlur={(e) => { handleRepairRuleUpdate('clanTechModifier', e.target.value); setEditingField(null); }}
                                                        title="Repair cost tax for pure Clan technology assets" />
                                                </div>
                                            ) : (
                                                <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}
                                                    onClick={() => setEditingField('clanTechModifier')} tabIndex={0}>
                                                    {clanTechTax}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </details>
                            <div className="mt-15">
                                <label className="restricted-text" style={{ color: 'var(--terminal-green)' }}>PRIMARY CONTRACT: {campaign?.primaryEmployer}</label>
                                <div className="grid-5-col mt-5">
                                    <div>
                                        <label className="restricted-text" style={{ fontSize: '0.6rem' }}>PAY (STEP {campaign?.payStep})</label>
                                        <div className="status-bar theme-green" style={{ display: 'block', margin: 0, fontSize: '0.7rem', color: 'var(--terminal-green)', borderColor: 'var(--terminal-green-dim)' }}>
                                            {Math.round((campaign?.payRate || 0) * 100)}%
                                        </div>
                                    </div>
                                    <div>
                                        <label className="restricted-text" style={{ fontSize: '0.6rem' }}>SALVAGE ({campaign?.salvageStep})</label>
                                        <div className="status-bar theme-green" style={{ display: 'block', margin: 0, fontSize: '0.7rem', color: 'var(--terminal-green)', borderColor: 'var(--terminal-green-dim)' }}>
                                            {campaign?.salvageTerms}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="restricted-text" style={{ fontSize: '0.6rem' }}>SUPPORT ({campaign?.supportStep})</label>
                                        <div className="status-bar theme-green" style={{ display: 'block', margin: 0, fontSize: '0.7rem', color: 'var(--terminal-green)', borderColor: 'var(--terminal-green-dim)' }}>
                                            {campaign?.supportTerms}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="restricted-text" style={{ fontSize: '0.6rem' }}>TRANS ({campaign?.transportStep})</label>
                                        <div className="status-bar theme-green" style={{ display: 'block', margin: 0, fontSize: '0.7rem', color: 'var(--terminal-green)', borderColor: 'var(--terminal-green-dim)' }}>
                                            {campaign?.transportTerms}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="restricted-text" style={{ fontSize: '0.6rem' }}>CMD ({campaign?.commandStep})</label>
                                        <div className="status-bar theme-green" style={{ display: 'block', margin: 0, fontSize: '0.7rem', color: 'var(--terminal-green)', borderColor: 'var(--terminal-green-dim)' }}>
                                            {campaign?.commandRights}
                                        </div>
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
                                <div className="status-bar theme-amber mt-15 w-100" style={{ textAlign: 'center', fontSize: '1.2rem', margin: '15px 0 0 0' }}>
                                    {activeToken}
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
                                                <button
                                                    className="mode-btn theme-green"
                                                    style={{ fontSize: '0.6rem', padding: '2px 6px' }}
                                                    onClick={() => setShowMonthlyExpensesEditor(mIdx)}
                                                >
                                                    [ EXPENSES ]
                                                </button>
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
                                                        <div className="status-bar theme-amber" style={{ flex: 1, marginRight: '10px', padding: '0 5px', display: 'flex', alignItems: 'center' }}>
                                                            {activeTrackField === `${track.id}-name` ? (
                                                                <input
                                                                    className="inline-edit"
                                                                    key={`${track.id}-name-${track.trackName}`}
                                                                    style={{ fontWeight: 'bold', width: '100%', border: 'none' }}
                                                                    defaultValue={track.trackName}
                                                                    autoFocus
                                                                    onBlur={() => setActiveTrackField(null)}
                                                                    onChange={(e) => handleTrackUpdate(track.id, 'trackName', e.target.value)}
                                                                    placeholder="DESIGNATION"
                                                                    title="Operational designation"
                                                                    aria-label="Track name"
                                                                />
                                                            ) : (
                                                                <div
                                                                    className="inline-edit cursor-pointer theme-amber"
                                                                    style={{ fontWeight: 'bold', width: '100%', minHeight: '1.2em', padding: '0 2px' }}
                                                                    onClick={() => setActiveTrackField(`${track.id}-name`)}
                                                                >
                                                                    {track.trackName || 'DESIGNATION'}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="restricted-text" style={{ fontSize: '0.6rem' }}>#{track.sequenceOrder + 1}</span>
                                                    </div>
                                                    <div className="flex flex-gap-5 mb-5" style={{ alignItems: 'flex-start' }}>
                                                        <div className="status-bar theme-amber" style={{ flex: 1, padding: '5px', display: 'flex' }}>
                                                            {activeTrackField === `${track.id}-comp` ? (
                                                                <textarea
                                                                    className="inline-edit"
                                                                    key={`${track.id}-comp-${track.complications}`}
                                                                    style={{ fontSize: '0.7rem', width: '100%', resize: 'vertical', border: 'none' }}
                                                                    rows={3}
                                                                    autoFocus
                                                                    onBlur={() => setActiveTrackField(null)}
                                                                    defaultValue={track.complications}
                                                                    onChange={(e) => handleTrackUpdate(track.id, 'complications', e.target.value)}
                                                                    placeholder="COMPLICATIONS"
                                                                    title="Mission complications or modifiers"
                                                                    aria-label="Track complications"
                                                                />
                                                            ) : (
                                                                <div
                                                                    className="inline-edit cursor-pointer theme-amber"
                                                                    style={{ fontSize: '0.7rem', width: '100%', minHeight: '3.6em', whiteSpace: 'pre-wrap', padding: '2px' }}
                                                                    onClick={() => setActiveTrackField(`${track.id}-comp`)}
                                                                >
                                                                    {track.complications || 'COMPLICATIONS'}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <button
                                                            className="mode-btn theme-amber sm-text"
                                                            style={{ padding: '0 5px', height: '18px', fontSize: '0.6rem' }}
                                                            onClick={() => handleReroll(track.id)}
                                                        >REROLL</button>
                                                    </div>
                                                    <div className="flex flex-gap-5 mb-5">
                                                        <div className="status-bar theme-amber" style={{ flex: 1, padding: '0 5px', display: 'flex', alignItems: 'center' }}>
                                                            {activeTrackField === `${track.id}-loc` ? (
                                                                <input
                                                                    className="inline-edit"
                                                                    style={{ fontSize: '0.7rem', width: '100%', border: 'none' }}
                                                                    autoFocus
                                                                    onBlur={() => setActiveTrackField(null)}
                                                                    defaultValue={track.location}
                                                                    onChange={(e) => handleTrackUpdate(track.id, 'location', e.target.value)}
                                                                    placeholder="LOCATION"
                                                                    title="Physical location"
                                                                    aria-label="Track location"
                                                                />
                                                            ) : (
                                                                <div
                                                                    className="inline-edit cursor-pointer theme-amber"
                                                                    style={{ fontSize: '0.7rem', width: '100%', minHeight: '1.2em', padding: '0 2px' }}
                                                                    onClick={() => setActiveTrackField(`${track.id}-loc`)}
                                                                >
                                                                    {track.location || 'LOCATION'}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {track.location && (
                                                            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(track.location)}`} target="_blank" rel="noopener noreferrer" className="mode-btn sm-text" style={{ padding: '0 4px', height: '16px' }}>MAP</a>
                                                        )}
                                                    </div >
                                                    <div className="flex-between">
                                                        <div className="status-bar theme-amber" style={{ width: '60%', padding: '0 5px', display: 'flex', alignItems: 'center' }}>
                                                            {activeTrackField === `${track.id}-time` ? (
                                                                <input
                                                                    type="datetime-local"
                                                                    className="inline-edit"
                                                                    style={{ fontSize: '0.7rem', width: '100%', border: 'none' }}
                                                                    autoFocus
                                                                    onBlur={() => setActiveTrackField(null)}
                                                                    defaultValue={track.nextSession ? track.nextSession.substring(0, 16) : ''}
                                                                    onChange={(e) => handleTrackUpdate(track.id, 'nextSession', e.target.value)}
                                                                    aria-label="Next session time"
                                                                    title="Deployment time"
                                                                />
                                                            ) : (
                                                                <div
                                                                    className="inline-edit cursor-pointer theme-amber"
                                                                    style={{ fontSize: '0.7rem', width: '100%', minHeight: '1.2em', padding: '0 2px' }}
                                                                    onClick={() => setActiveTrackField(`${track.id}-time`)}
                                                                >
                                                                    {track.nextSession ? new Date(track.nextSession).toLocaleString() : 'DEPLOYMENT TIME'}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="status-bar theme-amber" style={{ width: '35%', padding: '0 5px', display: 'flex', alignItems: 'center' }}>
                                                            {activeTrackField === `${track.id}-atk` ? (
                                                                <select
                                                                    className="inline-edit"
                                                                    style={{ fontSize: '0.7rem', width: '100%', border: 'none' }}
                                                                    autoFocus
                                                                    onBlur={() => setActiveTrackField(null)}
                                                                    defaultValue={track.attackerFactionId || ""}
                                                                    onChange={(e) => handleTrackUpdate(track.id, 'attackerFactionId', e.target.value)}
                                                                    aria-label="Attacker faction"
                                                                    title="Attacker"
                                                                >
                                                                    <option value="">[ ATK ]</option>
                                                                    {campaign?.factions?.map((f: { id: string, factionName: string }) => (
                                                                        <option key={f.id} value={f.id}>{f.factionName.substring(0, 3).toUpperCase()}</option>
                                                                    ))}
                                                                </select>
                                                            ) : (
                                                                <div
                                                                    className="inline-edit cursor-pointer theme-amber"
                                                                    style={{ fontSize: '0.7rem', width: '100%', minHeight: '1.2em', padding: '0 2px' }}
                                                                    onClick={() => setActiveTrackField(`${track.id}-atk`)}
                                                                >
                                                                    {track.attackerFactionId ? campaign?.factions?.find((f: any) => f.id === track.attackerFactionId)?.factionName.substring(0, 3).toUpperCase() : '[ ATK ]'}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="mt-10 pt-5" style={{ borderTop: '1px dashed var(--accent-dim)' }}>
                                                        <button
                                                            className="mode-btn theme-red w-100"
                                                            style={{ fontSize: '0.65rem', padding: '4px' }}
                                                            onClick={() => setShowAarForTrack(track)}
                                                        >
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
                                        style={{ cursor: 'pointer' }} // Use DetachmentReadinessSummary
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

            {showMonthlyExpensesEditor !== null && campaign && campaign.participatingDetachments && (
                <MonthlyExpensesEditor
                    campaignDetails={campaign as any} // Cast to any for now, will refine CampaignDetailSummary
                    detachments={campaign.participatingDetachments}
                    currentMonthIndex={showMonthlyExpensesEditor}
                    onClose={() => {
                        setShowMonthlyExpensesEditor(null);
                        refetchCampaign();
                    }}
                    onLedgerEntryAdded={() => refetchCampaign()}
                />
            )}

            {showAarForTrack && campaign && (
                <AfterActionReportEditor
                    campaign={campaign as any}
                    track={showAarForTrack}
                    onClose={async () => {
                        await refetchCampaign();
                        if (onRefresh) await onRefresh();
                        setShowAarForTrack(null);
                    }}
                    onLedgerEntryAdded={async () => {
                        await refetchCampaign();
                        if (onRefresh) await onRefresh();
                    }}
                />
            )}

        </div >
    );
};