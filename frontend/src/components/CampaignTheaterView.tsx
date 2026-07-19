/*
 * HotSpots Campaigner - Battletech Mercenaries campaign management SaaS.
 * Copyright (C) 2026 Jose Ferrer
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useQuery, useMutation, MutationTuple } from '@apollo/client/react';
import { EditableTrackCard } from './EditableTrackCard';
import { CombatUnitEditor } from './CombatUnitEditor';
import { NodeType, TreeItemMetadata } from './NavigationTree';
import { PilotEditor } from './PilotEditor';
import { TacticalMarkdown } from './TacticalMarkdown';
import { MonthlyExpensesEditor } from './MonthlyExpensesEditor';
import { DetachmentReadinessSummary } from './DetachmentReadinessSummary';
import { RecruitmentOverlay } from './RecruitmentOverlay';
import { MarketDashboard } from './MarketDashboard';
import { TerminalOverlay } from './TerminalOverlay'; // Import the shared TerminalOverlay
import {
    UNIT_STATUS_OPTIONS as FALLBACK_STATUSES,
    UNIT_TYPES as FALLBACK_TYPES,
    TECH_BASES as FALLBACK_TECH
} from './Rules';
import {
    Detachment,
    Campaign,
    Contract,
    CombatUnit,
    Pilot,
    CampaignUpdateInput,
    TrackUpdateInput,
    MercenaryCommand,
    CampaignTrack,
} from '../types/generated';
import {
    GetCampaignMetadataQuery,
    GetCampaignDetailsQuery,
    UpdateCampaignMutation,
    RerollTrackMutation
} from '../types/operations';
import {
    GetCampaignMetadataDocument as GET_METADATA,
    GetCampaignDetailsDocument as GET_CAMPAIGN_DETAILS,
    UpdateCampaignDocument as UPDATE_CAMPAIGN,
    UpdateTrackDocument as UPDATE_TRACK,
    AssignDetachmentToCampaignDocument as ASSIGN_DETACHMENT,
    RerollTrackDocument as REROLL_TRACK,
    ReorderTracksDocument as REORDER_TRACKS
} from '../types/operations';
import { UnitType, UnitStatus, TechBase } from '../types/helpers';
import { AfterActionReportEditor } from './AfterActionReportEditor';
import { useHscActionHandler } from './useHscActionHandler';
import { CampaignTheaterBackground } from './CampaignTheaterBackground';

interface CampaignTheaterViewProps {
    managedData: { managedCampaigns: Campaign[] } | undefined;
    loadingManaged: boolean;
    selectedCampaignId: string | null;
    campaignFilter: string;
    onSetFilter: (filter: string) => void;
    onSelectCampaign: (id: string) => void;
    onReturnToList: () => void;
    onCreateNew: () => void;
    onSelectDetachment: (item: { id: string, label: string, type: NodeType, metadata: TreeItemMetadata }) => void;
    onRefresh?: () => Promise<void>;
    onSyncChange?: (syncing: boolean) => void;
    userCommands?: MercenaryCommand[];
}

interface TheaterCampaign extends Omit<Campaign, 'isManager' | 'isParticipant'> {
    isManager?: boolean;
    isParticipant?: boolean;
}

/**
 * Custom hook to manage campaign theater state and server synchronization.
 */
const useTheaterCampaignSync = (
    managedData: { managedCampaigns: Campaign[] } | undefined,
    campaignQueryData: GetCampaignDetailsQuery | undefined,
    metaData: GetCampaignMetadataQuery | undefined,
    selectedCampaignId: string | null,
    queryLoading: boolean,
    updateCampaign: MutationTuple<UpdateCampaignMutation, { id: string, input: CampaignUpdateInput }>[0],
    rerollTrack: MutationTuple<RerollTrackMutation, { id: string }>[0],
    refetchCampaign: () => Promise<any>,
    onSyncChange?: (syncing: boolean) => void,
    onRefresh?: () => Promise<void>,
    userCommands?: MercenaryCommand[]
) => {
    const [isSyncing, setIsSyncing] = useState(false);
    const saveTimeoutRef = useRef<Record<string, number>>({});

    // Local UI states for advanced parameters
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
    const [omnimechMod, setOmnimechMod] = useState(0.5);
    const [purchaseMult, setPurchaseMult] = useState(40);
    const [sellMult, setSellMult] = useState(20);
    const [rearmTon, setRearmTon] = useState(10);
    const [rearmAS, setRearmAS] = useState(20);
    const [hireMW, setHireMW] = useState(100);
    const [hirePilot, setHirePilot] = useState(150);
    const [hireBA, setHireBA] = useState(20);
    const [healWound, setHealWound] = useState(30);
    const [healMonth, setHealMonth] = useState(2);
    const [healBA, setHealBA] = useState(10);
    const [trainCmd, setTrainCmd] = useState(500);
    const [trainForm, setTrainForm] = useState(250);
    const [ability1, setAbility1] = useState(250);
    const [ability2, setAbility2] = useState(500);
    const [ability3, setAbility3] = useState(750);
    const [replaceAbility, setReplaceAbility] = useState(250);
    const [campaignLengthInMonths, setCampaignLengthInMonths] = useState(1);
    const [campaignTrackCount, setCampaignTrackCount] = useState(0);

    // Merge props data with fresh query data for theater management
    const campaign: TheaterCampaign = useMemo(() => {
        const campaignFromProps = managedData?.managedCampaigns.find((c) => c.id === selectedCampaignId);
        const baseCampaign = (campaignFromProps || {}) as Partial<TheaterCampaign>;

        // Ensure detailed query data only applies to the matching campaign ID.
        // This prevents data bleeding from previous theater views during loading.
        const queryCampaign = (campaignQueryData?.getCampaign?.id === selectedCampaignId)
            ? (campaignQueryData.getCampaign as Partial<TheaterCampaign>)
            : {};

        const localIsParticipant = userCommands?.some(cmd =>
            (cmd.detachments || []).filter((d): d is Detachment => d != null).some((det: Detachment) => det.campaignId === selectedCampaignId)
        ) || false;

        return {
            ...baseCampaign,
            ...queryCampaign,
            isManager: queryCampaign.isManager ?? !!campaignFromProps,
            isParticipant: queryCampaign.isParticipant ?? localIsParticipant,
            id: queryCampaign.id || baseCampaign.id || selectedCampaignId || '',
            contracts: queryCampaign.contracts || baseCampaign.contracts || []
        } as TheaterCampaign;
    }, [managedData, campaignQueryData, selectedCampaignId, userCommands]);

    // Derived state for theater layout
    const displayMonthCount = useMemo(() => {
        const trackMax = (campaign.tracks || []).filter((t): t is CampaignTrack => t != null).reduce((max: number, t: CampaignTrack) => Math.max(max, t.monthIndex || 1), 0);
        return Math.max(campaignLengthInMonths, trackMax, 1);
    }, [campaignLengthInMonths, campaign?.tracks]);

    const opposition = useMemo(() =>
        (campaign?.contracts || []).filter((c): c is Contract => c != null).find((c: Contract) => !c.primaryContract),
        [campaign]
    );

    const campaignInvites = (campaignQueryData?.getCampaign?.campaignInvites || []).filter((i): i is any => i != null) as any[];

    useEffect(() => {
        onSyncChange?.(queryLoading || isSyncing);
    }, [queryLoading, isSyncing, onSyncChange]);

    useEffect(() => {
        const timeouts = saveTimeoutRef.current;
        return () => Object.values(timeouts).forEach(clearTimeout);
    }, []);

    // Sync local input states with campaign data on load/refetch
    useEffect(() => {
        if (!campaign || !selectedCampaignId) return;

        setCampaignLengthInMonths(campaign?.lengthInMonths || 1);
        setCampaignTrackCount(campaign?.trackCount || 0);
        setMonthlyPay(campaign?.monthlyPay || 500);
        setMonthlyMaintenance(campaign?.monthlyMaintenance || 500);
        setTransportationCost(campaign?.transportationCost || 300);
        setCombatPay(campaign?.combatPay || 500);

        // Always reset repair and activity costs to defaults before applying campaign values.
        // This prevents data bleeding between campaigns when switching theaters.
        setArmorMult(campaign.armorMultiplier ?? (metaData?.publicCampaignMetadata as any)?.armorMultiplier ?? 0.5);
        setInternalMult(campaign.internalMultiplier ?? (metaData?.publicCampaignMetadata as any)?.internalMultiplier ?? 2.0);
        setCrippledMult(campaign.crippledMultiplier ?? (metaData?.publicCampaignMetadata as any)?.crippledMultiplier ?? 3.0);
        setDestroyedMult(campaign.destroyedMultiplier ?? (metaData?.publicCampaignMetadata as any)?.destroyedMultiplier ?? 5.0);
        setNonMechMod(campaign.nonMechModifier ?? (metaData?.publicCampaignMetadata as any)?.nonMechModifier ?? 0.5);
        setMixedTechTax(campaign.mixedTechModifier ?? (metaData?.publicCampaignMetadata as any)?.mixedTechModifier ?? 1.5);
        setClanTechTax(campaign.clanTechModifier ?? (metaData?.publicCampaignMetadata as any)?.clanTechModifier ?? 2.0);

        setOmnimechMod(campaign.omnimechReconfigureModifier ?? (metaData?.publicCampaignMetadata as any)?.omnimechReconfigureModifier ?? 0.5);
        setPurchaseMult(campaign.pvPurchaseUnitMultiplier ?? (metaData?.publicCampaignMetadata as any)?.pvPurchaseUnitMultiplier ?? 40);
        setSellMult(campaign.pvSellUnitMultiplier ?? (metaData?.publicCampaignMetadata as any)?.pvSellUnitMultiplier ?? 20);
        setRearmTon(campaign.rearmCostPerTon ?? (metaData?.publicCampaignMetadata as any)?.rearmCostPerTon ?? 10);
        setRearmAS(campaign.rearmCostPerTonAlphaStrike ?? (metaData?.publicCampaignMetadata as any)?.rearmCostPerTonAlphaStrike ?? 20);
        setHireMW(campaign.hireMechWarriorCost ?? (metaData?.publicCampaignMetadata as any)?.hireMechWarriorCost ?? 100);
        setHirePilot(campaign.hireNamedPilotCost ?? (metaData?.publicCampaignMetadata as any)?.hireNamedPilotCost ?? 150);
        setHireBA(campaign.hireBattleArmorCost ?? (metaData?.publicCampaignMetadata as any)?.hireBattleArmorCost ?? 20);
        setHealWound(campaign.healMechWarriorPerWoundBoxCost ?? (metaData?.publicCampaignMetadata as any)?.healMechWarriorPerWoundBoxCost ?? 30);
        setHealMonth(campaign.healMechWarriorPerMonthLimit ?? (metaData?.publicCampaignMetadata as any)?.healMechWarriorPerMonthLimit ?? 2);
        setHealBA(campaign.healBattleArmorCost ?? (metaData?.publicCampaignMetadata as any)?.healBattleArmorCost ?? 10);
        setTrainCmd(campaign.trainFormationCommanderCost ?? (metaData?.publicCampaignMetadata as any)?.trainFormationCommanderCost ?? 500);
        setTrainForm(campaign.changeFormationTrainingCost ?? (metaData?.publicCampaignMetadata as any)?.changeFormationTrainingCost ?? 250);
        setAbility1(campaign.learnCommandAbility1Cost ?? (metaData?.publicCampaignMetadata as any)?.learnCommandAbility1Cost ?? 250);
        setAbility2(campaign.learnCommandAbility2Cost ?? (metaData?.publicCampaignMetadata as any)?.learnCommandAbility2Cost ?? 500);
        setAbility3(campaign.learnCommandAbility3Cost ?? (metaData?.publicCampaignMetadata as any)?.learnCommandAbility3Cost ?? 750);
        setReplaceAbility(campaign.replaceCommandAbilityCost ?? (metaData?.publicCampaignMetadata as any)?.replaceCommandAbilityCost ?? 250);
    }, [campaign, selectedCampaignId, metaData]);

    const handleUpdate = (field: string, value: string | number) => {
        const targetId = selectedCampaignId;
        if (!targetId) return;
        const key = `camp-${field}`;
        if (saveTimeoutRef.current[key]) clearTimeout(saveTimeoutRef.current[key]);

        saveTimeoutRef.current[key] = setTimeout(async () => {
            if (selectedCampaignId !== targetId) return;
            setIsSyncing(true);
            let valToUse = value;
            const numericFields = ['trackCount', 'lengthInMonths', 'monthlyPay', 'monthlyMaintenance', 'transportationCost', 'combatPay'];
            if (numericFields.includes(field)) {
                const parsed = parseInt(value as string) || 0;
                valToUse = (field === 'trackCount' || field === 'lengthInMonths') ? Math.max(1, parsed) : Math.max(0, parsed);
            }
            const input = { [field]: valToUse } as unknown as CampaignUpdateInput;
            await updateCampaign({ variables: { id: targetId, input } });
            await refetchCampaign();
            if (onRefresh) await onRefresh();
            setIsSyncing(false);
        }, 5000) as unknown as number;
    };

    const handleRepairRuleUpdate = (field: string, value: string | number) => {
        const targetId = selectedCampaignId;
        if (!targetId) return;
        const key = `camp-repair-${field}`;
        if (saveTimeoutRef.current[key]) clearTimeout(saveTimeoutRef.current[key]);

        saveTimeoutRef.current[key] = setTimeout(async () => {
            if (selectedCampaignId !== targetId) return;
            setIsSyncing(true);
            const input = { [field]: parseFloat(value as string) || 0 } as unknown as CampaignUpdateInput;

            await updateCampaign({ variables: { id: targetId, input } });
            await refetchCampaign();
            setIsSyncing(false);
        }, 5000) as unknown as number;
    };

    const handleActivityCostUpdate = (field: string, value: string | number) => {
        const targetId = selectedCampaignId;
        if (!targetId) return;
        const key = `camp-activity-${field}`;
        if (saveTimeoutRef.current[key]) clearTimeout(saveTimeoutRef.current[key]);

        saveTimeoutRef.current[key] = setTimeout(async () => {
            if (selectedCampaignId !== targetId) return;
            setIsSyncing(true);
            const isFloat = field === 'omnimechReconfigureModifier';
            const val = isFloat ? parseFloat(value as string) : parseInt(value as string);
            const input = { [field]: isNaN(val) ? 0 : val } as unknown as CampaignUpdateInput;

            await updateCampaign({ variables: { id: targetId, input } });
            await refetchCampaign();
            setIsSyncing(false);
        }, 5000) as unknown as number;
    };

    const handleReroll = async (trackId: string) => {
        setIsSyncing(true);
        try {
            await rerollTrack({ variables: { id: trackId } });
            await refetchCampaign();
            if (onRefresh) await onRefresh();
        } catch (err) { console.error(err); }
        setIsSyncing(false);
    };

    const performStatusUpdate = async (newStatus: string) => {
        setIsSyncing(true);
        if (!selectedCampaignId) return;
        await updateCampaign({
            variables: {
                id: selectedCampaignId,
                input: { status: newStatus } as unknown as CampaignUpdateInput
            }
        });
        await refetchCampaign();
        if (onRefresh) await onRefresh();
        setIsSyncing(false);
    };

    return {
        campaign,
        isSyncing,
        setIsSyncing,
        displayMonthCount,
        opposition,
        campaignInvites,
        params: {
            monthlyPay, setMonthlyPay,
            monthlyMaintenance, setMonthlyMaintenance,
            transportationCost, setTransportationCost,
            combatPay, setCombatPay,
            armorMult, setArmorMult,
            internalMult, setInternalMult,
            crippledMult, setCrippledMult,
            destroyedMult, setDestroyedMult,
            nonMechMod, setNonMechMod,
            mixedTechTax, setMixedTechTax,
            clanTechTax, setClanTechTax,
            omnimechMod, setOmnimechMod,
            purchaseMult, setPurchaseMult,
            sellMult, setSellMult,
            rearmTon, setRearmTon,
            rearmAS, setRearmAS,
            hireMW, setHireMW,
            hirePilot, setHirePilot,
            hireBA, setHireBA,
            healWound, setHealWound,
            healMonth, setHealMonth,
            healBA, setHealBA,
            trainCmd, setTrainCmd,
            trainForm, setTrainForm,
            ability1, setAbility1,
            ability2, setAbility2,
            ability3, setAbility3,
            replaceAbility, setReplaceAbility,
            campaignLengthInMonths, setCampaignLengthInMonths,
            campaignTrackCount, setCampaignTrackCount
        },
        handleUpdate,
        handleRepairRuleUpdate,
        handleActivityCostUpdate,
        handleReroll,
        performStatusUpdate
    };
};

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
    onSyncChange,
    userCommands
}) => {
    // --- Queries & Mutations ---
    const { loading, data: campaignQueryData, refetch: refetchCampaign } = useQuery<GetCampaignDetailsQuery>(GET_CAMPAIGN_DETAILS, {
        variables: { campaignId: selectedCampaignId || '' },
        skip: !selectedCampaignId,
        fetchPolicy: 'cache-and-network',
        notifyOnNetworkStatusChange: true
    });
    const { data: metaData } = useQuery<GetCampaignMetadataQuery>(GET_METADATA);

    const [updateCampaign] = useMutation(UPDATE_CAMPAIGN);
    const [updateTrack] = useMutation(UPDATE_TRACK);
    const [rerollTrack] = useMutation(REROLL_TRACK);
    const [reorderTracks] = useMutation(REORDER_TRACKS);
    const [assignDetachment] = useMutation(ASSIGN_DETACHMENT);

    // --- State ---
    const saveTimeoutRef = useRef<Record<string, number>>({});
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [showMonthlyExpensesEditor, setShowMonthlyExpensesEditor] = useState<number | null>(null); // Stores month index
    const [showAarForTrack, setShowAarForTrack] = useState<CampaignTrack | null>(null);
    const [showRecruitment, setShowRecruitment] = useState(false);
    const [showMarket, setShowMarket] = useState(false);
    const [overlay, setOverlay] = useState<{ // Use TerminalOverlayProps
        isOpen: boolean;
        title: string;
        message: string;
        children?: React.ReactNode;
        variant?: 'alert' | 'info';
        onConfirm: (val?: string) => void | Promise<void>;
        onCancel?: () => void;
        showInputField?: boolean;
        inputPlaceholder?: string;
        inputInitialValue?: string;
        inputType?: string;
        inputLabel?: string;
    }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

    const [dragOverMonth, setDragOverMonth] = useState<number | null>(null);

    const {
        campaign,
        isSyncing,
        setIsSyncing,
        displayMonthCount,
        opposition,
        campaignInvites,
        params,
        handleUpdate,
        handleRepairRuleUpdate,
        handleActivityCostUpdate,
        handleReroll,
        performStatusUpdate
    } = useTheaterCampaignSync(
        managedData,
        campaignQueryData,
        metaData,
        selectedCampaignId,
        loading,
        updateCampaign as any,
        rerollTrack,
        refetchCampaign,
        onSyncChange,
        onRefresh,
        userCommands
    );

    const {
        monthlyPay, setMonthlyPay,
        monthlyMaintenance, setMonthlyMaintenance,
        transportationCost, setTransportationCost,
        combatPay, setCombatPay,
        armorMult, setArmorMult,
        internalMult, setInternalMult,
        crippledMult, setCrippledMult,
        destroyedMult, setDestroyedMult,
        nonMechMod, setNonMechMod,
        mixedTechTax, setMixedTechTax,
        clanTechTax, setClanTechTax,
        omnimechMod, setOmnimechMod,
        purchaseMult, setPurchaseMult,
        sellMult, setSellMult,
        rearmTon, setRearmTon,
        rearmAS, setRearmAS,
        hireMW, setHireMW,
        hirePilot, setHirePilot,
        hireBA, setHireBA,
        healWound, setHealWound,
        healMonth, setHealMonth,
        healBA, setHealBA,
        trainCmd, setTrainCmd,
        trainForm, setTrainForm,
        ability1, setAbility1,
        ability2, setAbility2,
        ability3, setAbility3,
        replaceAbility, setReplaceAbility,
        campaignLengthInMonths, setCampaignLengthInMonths,
        campaignTrackCount, setCampaignTrackCount
    } = params;

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
                await performStatusUpdate(newStatus);
                setOverlay(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const {
        handleHscAction,
        showProcureEditor, procureAssetData, procureTargetDetachment, handleProcureSave, handleProcureCancel,
        showHireEditor, hirePilotData, hireTargetDetachment, handleHireSave, handleHireCancel,
    } = useHscActionHandler({
        campaign: campaign as any,
        userCommands,
        setOverlay: (o: any) => {
            if (o === null) setOverlay(prev => ({ ...prev, isOpen: false }));
            else setOverlay({ ...o, isOpen: true });
        },
        onActionComplete: async () => {
            await refetchCampaign();
            if (onRefresh) await onRefresh();
        },
        metaData
    });

    const handleTrackUpdate = (trackId: string, field: string, value: string) => {
        const key = `track-${trackId}-${field}`;
        if (saveTimeoutRef.current[key]) clearTimeout(saveTimeoutRef.current[key]);

        saveTimeoutRef.current[key] = setTimeout(async () => {
            setIsSyncing(true);
            const valToUse = field === 'monthIndex' ? parseInt(value) : value;
            const input = { [field]: valToUse } as unknown as TrackUpdateInput;
            await updateTrack({ variables: { id: trackId, input } });
            await refetchCampaign();
            if (onRefresh) await onRefresh();
            setIsSyncing(false);
        }, 5000) as unknown as number;
    };

    const handleDrop = async (e: React.DragEvent, targetMonth: number, targetTrackId?: string) => {
        e.preventDefault();
        setDragOverMonth(null);
        const draggedTrackId = e.dataTransfer.getData("trackId");
        if (!draggedTrackId || !campaign?.tracks) return;

        // 1. Prepare sorted tracks list (prioritize month, then existing sequence)
        const tracks = [...(campaign.tracks || [])].filter((t): t is CampaignTrack => t != null).sort((a, b) => {
            if (a.monthIndex !== b.monthIndex) return (a.monthIndex || 1) - (b.monthIndex || 1);
            return (a.sequenceOrder || 0) - (b.sequenceOrder || 0);
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
            await updateTrack({ variables: { id: draggedTrackId, input: { monthIndex: targetMonth } as unknown as TrackUpdateInput } });
            await reorderTracks({ variables: { campaignId: campaign.id, trackIds: orderedIds } });
            await refetchCampaign();
            if (onRefresh) await onRefresh();
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
        <div className="container" style={{ position: 'relative', overflow: 'hidden', background: 'transparent', minHeight: '100%' }}>
            <CampaignTheaterBackground />
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

                        {(managedData?.managedCampaigns || []).filter((c): c is any => c != null).map((camp) => (
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

                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 1.5fr 1fr', gap: '20px', marginTop: '15px' }}>
                                    <div><span className="restricted-text" style={{ fontSize: '0.7rem', display: 'block' }}>PRIMARY EMPLOYER</span> {camp.primaryEmployer || 'UNKNOWN'}</div>
                                    <div><span className="restricted-text" style={{ fontSize: '0.7rem', display: 'block' }}>OPPOSITION</span> {camp.secondaryEmployer || 'UNKNOWN'}</div>
                                    <div><span className="restricted-text" style={{ fontSize: '0.7rem', display: 'block' }}>LOCATION</span> {camp.systemName}</div>
                                    <div><span className="restricted-text" style={{ fontSize: '0.7rem', display: 'block' }}>TRACKS</span> {camp.trackCount}</div>
                                    <div>
                                        <span className="restricted-text" style={{ fontSize: '0.7rem', display: 'block' }}>DETACHMENTS</span>
                                        <div style={{ maxHeight: '60px', overflowY: 'auto' }}>
                                            {(camp.participatingDetachments || []).filter((d: Detachment | null | undefined): d is Detachment => d != null).map((d: Detachment) => (
                                                <div key={d.id} className="sm-text" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    • {d.name} {d.campaignRating != null && <span style={{ color: 'var(--terminal-amber)' }}>({d.campaignRating})</span>}
                                                </div>
                                            ))}
                                            {((camp.participatingDetachments || []).filter((d: Detachment | null | undefined): d is Detachment => d != null).length === 0) && <span className="sm-text subdued">NONE</span>}
                                        </div>
                                    </div>
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
                (() => {
                    if (loading && !campaignQueryData) {
                        return <div className="loading-intel pulse" style={{ padding: '100px', textAlign: 'center' }}>RETRIEVING THEATER DATA...</div>;
                    }

                    if (!campaign?.id || campaign.id !== selectedCampaignId) {
                        return (
                            <div className="placeholder-content">
                                <h2 className="terminal-text">DATA SYNCHRONIZATION ERROR</h2>
                                <p className="restricted-text">UNABLE TO RETRIEVE OPERATIONAL RECORD FOR THEATER: {selectedCampaignId}</p>
                                <button className="mode-btn" onClick={onReturnToList}>RETURN TO LIST</button>
                            </div>
                        );
                    }

                    return (
                        <>
                            <header className="dashboard-header">
                                <div className="flex-between">
                                    <div>
                                        <h1 className="terminal-text">{campaign?.name}</h1>
                                        <p className="restricted-text">THEATER COMMAND DATA: {campaign?.systemName?.toUpperCase()} {isSyncing && <span className="pulse">...SYNCHRONIZING</span>}</p>
                                    </div>
                                    <div className="flex flex-gap-10">
                                        {campaign.isManager && (
                                            <button
                                                type="button"
                                                className={`mode-btn ${campaign.status === 'ACTIVE' ? 'theme-red' : 'theme-green'}`}
                                                onClick={handleStatusToggle}
                                            >
                                                {campaign.status === 'ACTIVE' ? '[ DEACTIVATE THEATER ]' : '[ ACTIVATE THEATER ]'}
                                            </button>
                                        )}
                                        {!campaign.isManager && campaign.isParticipant && (
                                            <div className="status-bar theme-blue" style={{ padding: '0 15px', height: '32px', display: 'flex', alignItems: 'center' }}>
                                                <span className="restricted-text" style={{ fontSize: '0.7rem' }}>[ THEATER STATUS: DEPLOYED ]</span>
                                            </div>
                                        )}
                                        {!campaign.isManager && !campaign.isParticipant && (
                                            <div className="status-bar theme-amber" style={{ padding: '0 15px', height: '32px', display: 'flex', alignItems: 'center' }}>
                                                <span className="restricted-text" style={{ fontSize: '0.7rem' }}>[ THEATER STATUS: PUBLIC INTEL ]</span>
                                            </div>
                                        )}
                                        <button type="button" className="mode-btn" onClick={onReturnToList}>[ RETURN TO LIST ]</button>
                                    </div>
                                </div>
                            </header>

                            <div className="mb-30">
                                <div className="tactical-panel">
                                    <div className="flex-between mb-10">
                                        <h3 className="zone-header">THEATER COMMAND DATA</h3>
                                        {campaign.isManager && <button
                                            className="mode-btn theme-amber"
                                            style={{ fontSize: '0.6rem', padding: '2px 6px' }}
                                            onClick={() => setIsEditingDescription(!isEditingDescription)}
                                        >
                                            {isEditingDescription ? '[ CLOSE ]' : '[ EDIT ]'}
                                        </button>}
                                    </div>

                                    <div className="mt-10" style={{ width: '100%' }}>
                                        {isEditingDescription ? (
                                            <div className="status-bar theme-amber" style={{ padding: '5px' }}>
                                                <textarea
                                                    id="theater-description"
                                                    className="table-input"
                                                    style={{ height: '180px', width: '100%', display: 'block', fontSize: '0.9rem' }}
                                                    defaultValue={campaign?.description ?? undefined}
                                                    autoFocus
                                                    onChange={(e) => handleUpdate('description', e.target.value)}
                                                    placeholder="Enter operational briefing (Markdown supported)..."
                                                    title="Exit field to save mission description"
                                                    aria-label="Theater command briefing"
                                                />
                                            </div>
                                        ) : (
                                            <div
                                                className="markdown-preview"
                                                style={{
                                                    minHeight: '80px',
                                                    width: '100%',
                                                    fontSize: '0.9rem',
                                                    lineHeight: '1.4'
                                                }}
                                            >
                                                <div style={{ flex: 1 }}>
                                                    {campaign?.description ? (
                                                        <TacticalMarkdown
                                                            content={campaign.description}
                                                            onAction={handleHscAction}
                                                        />
                                                    ) : (
                                                        <span className="restricted-text subdued">NO OPERATIONAL BRIEFING FILED. CLICK EDIT TO INITIALIZE THEATER LORE.</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-20 pt-10" style={{ borderTop: '1px solid var(--terminal-border)' }}>
                                        <h4 className="restricted-text mb-10" style={{ fontSize: '0.7rem', color: 'var(--terminal-amber)' }}>CAMPAIGN DURATION</h4>
                                        <div className="grid-6-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
                                            <div>
                                                <label htmlFor="campaign-length-in-months" className="restricted-text" style={{ fontSize: '0.6rem' }}>MONTHS</label>
                                                <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}>
                                                    <input id="campaign-length-in-months" type="number" min="1" className="table-input" style={{ width: '100%', textAlign: 'center', border: 'none' }}
                                                        value={campaignLengthInMonths} disabled={!campaign.isManager}
                                                        onChange={(e) => setCampaignLengthInMonths(Math.max(1, parseInt(e.target.value) || 1))}
                                                        onBlur={(e) => handleUpdate('lengthInMonths', Math.max(1, parseInt(e.target.value) || 1))}
                                                        title="Number of months for the campaign" />
                                                </div>
                                            </div>
                                            <div>
                                                <label htmlFor="campaign-track-count" className="restricted-text" style={{ fontSize: '0.6rem' }}>TRACKS</label>
                                                <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}>
                                                    <input id="campaign-track-count" type="number" min="1" className="table-input" style={{ width: '100%', textAlign: 'center', border: 'none' }}
                                                        value={campaignTrackCount} disabled={!campaign.isManager}
                                                        onChange={(e) => setCampaignTrackCount(Math.max(1, parseInt(e.target.value) || 1))}
                                                        onBlur={(e) => handleUpdate('trackCount', Math.max(1, parseInt(e.target.value) || 1))}
                                                        title="Number of tracks in the campaign" />
                                                </div>
                                            </div>
                                            {campaign.isManager && <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                                                <button
                                                    type="button"
                                                    className="mode-btn theme-amber"
                                                    style={{ height: '24px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                    onClick={() => setShowRecruitment(true)}
                                                    title="Open recruitment management"
                                                >[ RECRUITING ]</button>
                                            </div>}
                                            {campaign.isManager && <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                                                <button
                                                    type="button"
                                                    className="mode-btn theme-amber"
                                                    style={{ height: '24px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                    onClick={() => setShowMarket(true)}
                                                    title="Open unit market"
                                                >[ THEATER MARKET ]</button>
                                            </div>}
                                        </div>
                                    </div>

                                    <details className="mt-20">
                                        <summary className="restricted-text cursor-pointer" style={{ fontSize: '0.7rem', color: 'var(--terminal-amber)' }}>[ ADVANCED THEATER SETTINGS & LOGISTICS ]</summary>
                                        <div className="tactical-panel mt-10" style={{ padding: '15px', backgroundColor: 'rgba(0,0,0,0.15)' }}>
                                            <h5 className="restricted-text mb-10" style={{ fontSize: '0.6rem', color: 'var(--terminal-amber)' }}>FINANCIAL PARAMETERS</h5>
                                            <div className="grid-4-col mb-20" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                                                <div>
                                                    <label htmlFor="campaign-monthly-pay" className="restricted-text" style={{ fontSize: '0.6rem', color: 'var(--terminal-amber)' }}>BASE PAY</label>
                                                    <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}>
                                                        <input id="campaign-monthly-pay" type="number" min="0" className="table-input" style={{ width: '100%', textAlign: 'center', border: 'none' }} disabled={!campaign.isManager}
                                                            value={monthlyPay}
                                                            onChange={(e) => setMonthlyPay(Math.max(0, parseInt(e.target.value) || 0))}
                                                            onBlur={(e) => handleUpdate('monthlyPay', e.target.value)}
                                                            placeholder="0"
                                                            title="Base monthly pay" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label htmlFor="campaign-monthly-maintenance" className="restricted-text" style={{ fontSize: '0.6rem', color: 'var(--terminal-amber)' }}>MAINTENANCE</label>
                                                    <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}>
                                                        <input id="campaign-monthly-maintenance" type="number" min="0" className="table-input" style={{ width: '100%', textAlign: 'center', border: 'none' }} disabled={!campaign.isManager}
                                                            value={monthlyMaintenance}
                                                            onChange={(e) => setMonthlyMaintenance(Math.max(0, parseInt(e.target.value) || 0))}
                                                            onBlur={(e) => handleUpdate('monthlyMaintenance', e.target.value)}
                                                            placeholder="0"
                                                            title="Monthly maintenance cost" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label htmlFor="campaign-transportation-cost" className="restricted-text" style={{ fontSize: '0.6rem', color: 'var(--terminal-amber)' }}>TRANS COST</label>
                                                    <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}>
                                                        <input id="campaign-transportation-cost" type="number" min="0" className="table-input" style={{ width: '100%', textAlign: 'center', border: 'none' }} disabled={!campaign.isManager}
                                                            value={transportationCost}
                                                            onChange={(e) => setTransportationCost(Math.max(0, parseInt(e.target.value) || 0))}
                                                            onBlur={(e) => handleUpdate('transportationCost', e.target.value)}
                                                            placeholder="0"
                                                            title="Transportation cost" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label htmlFor="campaign-combat-pay" className="restricted-text" style={{ fontSize: '0.6rem', color: 'var(--terminal-amber)' }}>COMBAT PAY</label>
                                                    <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}>
                                                        <input id="campaign-combat-pay" type="number" min="0" className="table-input" style={{ width: '100%', textAlign: 'center', border: 'none' }} disabled={!campaign.isManager}
                                                            value={combatPay}
                                                            onChange={(e) => setCombatPay(Math.max(0, parseInt(e.target.value) || 0))}
                                                            onBlur={(e) => handleUpdate('combatPay', e.target.value)}
                                                            placeholder="0"
                                                            title="Combat pay bonus" />
                                                    </div>
                                                </div>
                                            </div>

                                            <h5 className="restricted-text mb-10" style={{ fontSize: '0.6rem', color: 'var(--terminal-amber)' }}>ACTIVITY COSTS</h5>
                                            <div className="grid-7-col flex-gap-10 mb-20" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
                                                <div>
                                                    <label className="restricted-text sm-text" style={{ fontSize: '0.55rem', color: 'var(--terminal-amber)' }}>REARM TON</label>
                                                    <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}>
                                                        <input type="number" className="table-input" style={{ width: '100%', textAlign: 'center', border: 'none' }} disabled={!campaign.isManager}
                                                            value={rearmTon}
                                                            onChange={(e) => setRearmTon(parseInt(e.target.value) || 0)}
                                                            onBlur={(e) => handleActivityCostUpdate('rearmCostPerTon', e.target.value)}
                                                            title="Rearm cost per ton" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="restricted-text sm-text" style={{ fontSize: '0.55rem', color: 'var(--terminal-amber)' }}>REARM AS</label>
                                                    <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}>
                                                        <input type="number" className="table-input" style={{ width: '100%', textAlign: 'center', border: 'none' }} disabled={!campaign.isManager}
                                                            value={rearmAS}
                                                            onChange={(e) => setRearmAS(parseInt(e.target.value) || 0)}
                                                            onBlur={(e) => handleActivityCostUpdate('rearmCostPerTonAlphaStrike', e.target.value)}
                                                            title="Rearm cost per ton (Alpha Strike)" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="restricted-text sm-text" style={{ fontSize: '0.55rem', color: 'var(--terminal-amber)' }}>HIRE MW</label>
                                                    <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}>
                                                        <input type="number" className="table-input" style={{ width: '100%', textAlign: 'center', border: 'none' }} disabled={!campaign.isManager}
                                                            value={hireMW}
                                                            onChange={(e) => setHireMW(parseInt(e.target.value) || 0)}
                                                            onBlur={(e) => handleActivityCostUpdate('hireMechWarriorCost', e.target.value)}
                                                            title="Hire MechWarrior cost" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="restricted-text sm-text" style={{ fontSize: '0.55rem', color: 'var(--terminal-amber)' }}>HIRE PILOT</label>
                                                    <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}>
                                                        <input type="number" className="table-input" style={{ width: '100%', textAlign: 'center', border: 'none' }} disabled={!campaign.isManager}
                                                            value={hirePilot}
                                                            onChange={(e) => setHirePilot(parseInt(e.target.value) || 0)}
                                                            onBlur={(e) => handleActivityCostUpdate('hireNamedPilotCost', e.target.value)}
                                                            title="Hire named pilot cost" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="restricted-text sm-text" style={{ fontSize: '0.55rem', color: 'var(--terminal-amber)' }}>HIRE BA</label>
                                                    <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}>
                                                        <input type="number" className="table-input" style={{ width: '100%', textAlign: 'center', border: 'none' }} disabled={!campaign.isManager}
                                                            value={hireBA}
                                                            onChange={(e) => setHireBA(parseInt(e.target.value) || 0)}
                                                            onBlur={(e) => handleActivityCostUpdate('hireBattleArmorCost', e.target.value)}
                                                            title="Hire Battle Armor cost" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="restricted-text sm-text" style={{ fontSize: '0.55rem', color: 'var(--terminal-amber)' }}>HEAL WOUND</label>
                                                    <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}>
                                                        <input type="number" className="table-input" style={{ width: '100%', textAlign: 'center', border: 'none' }} disabled={!campaign.isManager}
                                                            value={healWound}
                                                            onChange={(e) => setHealWound(parseInt(e.target.value) || 0)}
                                                            onBlur={(e) => handleActivityCostUpdate('healMechWarriorPerWoundBoxCost', e.target.value)}
                                                            title="Heal MechWarrior per wound box cost" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="restricted-text sm-text" style={{ fontSize: '0.55rem', color: 'var(--terminal-amber)' }}>HEAL MONTH</label>
                                                    <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}>
                                                        <input type="number" className="table-input" style={{ width: '100%', textAlign: 'center', border: 'none' }} disabled={!campaign.isManager}
                                                            value={healMonth}
                                                            onChange={(e) => setHealMonth(parseInt(e.target.value) || 0)}
                                                            onBlur={(e) => handleActivityCostUpdate('healMechWarriorPerMonthLimit', e.target.value)}
                                                            title="Heal MechWarrior per month limit" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="restricted-text sm-text" style={{ fontSize: '0.55rem', color: 'var(--terminal-amber)' }}>HEAL BA</label>
                                                    <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}>
                                                        <input type="number" className="table-input" style={{ width: '100%', textAlign: 'center', border: 'none' }} disabled={!campaign.isManager}
                                                            value={healBA}
                                                            onChange={(e) => setHealBA(parseInt(e.target.value) || 0)}
                                                            onBlur={(e) => handleActivityCostUpdate('healBattleArmorCost', e.target.value)}
                                                            title="Heal Battle Armor cost" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="restricted-text sm-text" style={{ fontSize: '0.55rem', color: 'var(--terminal-amber)' }}>TRAIN CMD</label>
                                                    <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}>
                                                        <input type="number" className="table-input" style={{ width: '100%', textAlign: 'center', border: 'none' }} disabled={!campaign.isManager}
                                                            value={trainCmd}
                                                            onChange={(e) => setTrainCmd(parseInt(e.target.value) || 0)}
                                                            onBlur={(e) => handleActivityCostUpdate('trainFormationCommanderCost', e.target.value)}
                                                            title="Train formation commander cost" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="restricted-text sm-text" style={{ fontSize: '0.55rem', color: 'var(--terminal-amber)' }}>TRAIN FORM</label>
                                                    <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}>
                                                        <input type="number" className="table-input" style={{ width: '100%', textAlign: 'center', border: 'none' }} disabled={!campaign.isManager}
                                                            value={trainForm}
                                                            onChange={(e) => setTrainForm(parseInt(e.target.value) || 0)}
                                                            onBlur={(e) => handleActivityCostUpdate('changeFormationTrainingCost', e.target.value)}
                                                            title="Change formation training cost" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="restricted-text sm-text" style={{ fontSize: '0.55rem', color: 'var(--terminal-amber)' }}>ABILITY 1</label>
                                                    <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}>
                                                        <input type="number" className="table-input" style={{ width: '100%', textAlign: 'center', border: 'none' }} disabled={!campaign.isManager}
                                                            value={ability1}
                                                            onChange={(e) => setAbility1(parseInt(e.target.value) || 0)}
                                                            onBlur={(e) => handleActivityCostUpdate('learnCommandAbility1Cost', e.target.value)}
                                                            title="Learn first ability cost" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="restricted-text sm-text" style={{ fontSize: '0.55rem', color: 'var(--terminal-amber)' }}>ABILITY 2</label>
                                                    <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}>
                                                        <input type="number" className="table-input" style={{ width: '100%', textAlign: 'center', border: 'none' }} disabled={!campaign.isManager}
                                                            value={ability2}
                                                            onChange={(e) => setAbility2(parseInt(e.target.value) || 0)}
                                                            onBlur={(e) => handleActivityCostUpdate('learnCommandAbility2Cost', e.target.value)}
                                                            title="Learn second ability cost" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="restricted-text sm-text" style={{ fontSize: '0.55rem', color: 'var(--terminal-amber)' }}>ABILITY 3</label>
                                                    <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}>
                                                        <input type="number" className="table-input" style={{ width: '100%', textAlign: 'center', border: 'none' }} disabled={!campaign.isManager}
                                                            value={ability3}
                                                            onChange={(e) => setAbility3(parseInt(e.target.value) || 0)}
                                                            onBlur={(e) => handleActivityCostUpdate('learnCommandAbility3Cost', e.target.value)}
                                                            title="Learn third ability cost" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="restricted-text sm-text" style={{ fontSize: '0.55rem', color: 'var(--terminal-amber)' }}>REPLACE ABIL</label>
                                                    <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}>
                                                        <input type="number" className="table-input" style={{ width: '100%', textAlign: 'center', border: 'none' }} disabled={!campaign.isManager}
                                                            value={replaceAbility}
                                                            onChange={(e) => setReplaceAbility(parseInt(e.target.value) || 0)}
                                                            onBlur={(e) => handleActivityCostUpdate('replaceCommandAbilityCost', e.target.value)}
                                                            title="Replace ability cost" />
                                                    </div>
                                                </div>
                                            </div>

                                            <h5 className="restricted-text mb-10" style={{ fontSize: '0.6rem', color: 'var(--terminal-amber)' }}>LOGISTICS & REPAIR MULTIPLIERS</h5>
                                            <div className="grid-5-col flex-gap-10" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                                                <div>
                                                    <label className="restricted-text sm-text" style={{ fontSize: '0.55rem', color: 'var(--terminal-amber)' }}>OMNI MOD</label>
                                                    <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}>
                                                        <input type="number" step="0.1" className="table-input" style={{ width: '100%', textAlign: 'center', border: 'none' }} disabled={!campaign.isManager}
                                                            value={omnimechMod}
                                                            onChange={(e) => setOmnimechMod(parseFloat(e.target.value) || 0)}
                                                            onBlur={(e) => handleActivityCostUpdate('omnimechReconfigureModifier', e.target.value)}
                                                            title="OmniMech reconfiguration cost modifier" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="restricted-text sm-text" style={{ fontSize: '0.55rem', color: 'var(--terminal-amber)' }}>BUY MULT</label>
                                                    <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}>
                                                        <input type="number" className="table-input" style={{ width: '100%', textAlign: 'center', border: 'none' }} disabled={!campaign.isManager}
                                                            value={purchaseMult}
                                                            onChange={(e) => setPurchaseMult(parseInt(e.target.value) || 0)}
                                                            onBlur={(e) => handleActivityCostUpdate('pvPurchaseUnitMultiplier', e.target.value)}
                                                            title="Purchase unit multiplier" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="restricted-text sm-text" style={{ fontSize: '0.55rem', color: 'var(--terminal-amber)' }}>SELL MULT</label>
                                                    <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}>
                                                        <input type="number" className="table-input" style={{ width: '100%', textAlign: 'center', border: 'none' }} disabled={!campaign.isManager}
                                                            value={sellMult}
                                                            onChange={(e) => setSellMult(parseInt(e.target.value) || 0)}
                                                            onBlur={(e) => handleActivityCostUpdate('pvSellUnitMultiplier', e.target.value)}
                                                            title="Sell unit multiplier" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="restricted-text sm-text" style={{ fontSize: '0.55rem', color: 'var(--terminal-amber)' }}>ARMOR MULT</label>
                                                    <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}>
                                                        <input type="number" step="0.1" className="table-input" style={{ width: '100%', textAlign: 'center', border: 'none' }} disabled={!campaign.isManager}
                                                            value={armorMult}
                                                            onChange={(e) => setArmorMult(parseFloat(e.target.value) || 0)}
                                                            onBlur={(e) => handleRepairRuleUpdate('armorMultiplier', e.target.value)}
                                                            title="Repair cost multiplier for armor damage" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="restricted-text sm-text" style={{ fontSize: '0.55rem', color: 'var(--terminal-amber)' }}>INTERNAL MULT</label>
                                                    <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}>
                                                        <input type="number" step="0.1" className="table-input" style={{ width: '100%', textAlign: 'center', border: 'none' }} disabled={!campaign.isManager}
                                                            value={internalMult}
                                                            onChange={(e) => setInternalMult(parseFloat(e.target.value) || 0)}
                                                            onBlur={(e) => handleRepairRuleUpdate('internalMultiplier', e.target.value)}
                                                            title="Repair cost multiplier for internal damage" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="restricted-text sm-text" style={{ fontSize: '0.55rem', color: 'var(--terminal-amber)' }}>CRIPPLED MULT</label>
                                                    <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}>
                                                        <input type="number" step="0.1" className="table-input" style={{ width: '100%', textAlign: 'center', border: 'none' }} disabled={!campaign.isManager}
                                                            value={crippledMult}
                                                            onChange={(e) => setCrippledMult(parseFloat(e.target.value) || 0)}
                                                            onBlur={(e) => handleRepairRuleUpdate('crippledMultiplier', e.target.value)}
                                                            title="Repair cost multiplier for crippled units" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="restricted-text sm-text" style={{ fontSize: '0.55rem', color: 'var(--terminal-amber)' }}>DESTROYED MULT</label>
                                                    <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}>
                                                        <input type="number" step="0.1" className="table-input" style={{ width: '100%', textAlign: 'center', border: 'none' }} disabled={!campaign.isManager}
                                                            value={destroyedMult}
                                                            onChange={(e) => setDestroyedMult(parseFloat(e.target.value) || 0)}
                                                            onBlur={(e) => handleRepairRuleUpdate('destroyedMultiplier', e.target.value)}
                                                            title="Repair cost multiplier for destroyed units" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="restricted-text sm-text" style={{ fontSize: '0.55rem', color: 'var(--terminal-amber)' }}>NON-MECH MOD</label>
                                                    <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}>
                                                        <input type="number" step="0.1" className="table-input" style={{ width: '100%', textAlign: 'center', border: 'none' }} disabled={!campaign.isManager}
                                                            value={nonMechMod}
                                                            onChange={(e) => setNonMechMod(parseFloat(e.target.value) || 0)}
                                                            onBlur={(e) => handleRepairRuleUpdate('nonMechModifier', e.target.value)}
                                                            title="Adjustment for Vehicles, Battle Armor, and Infantry" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="restricted-text sm-text" style={{ fontSize: '0.55rem', color: 'var(--terminal-amber)' }}>MIXED TECH TAX</label>
                                                    <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}>
                                                        <input type="number" step="0.1" className="table-input" style={{ width: '100%', textAlign: 'center', border: 'none' }} disabled={!campaign.isManager}
                                                            value={mixedTechTax}
                                                            onChange={(e) => setMixedTechTax(parseFloat(e.target.value) || 0)}
                                                            onBlur={(e) => handleRepairRuleUpdate('mixedTechModifier', e.target.value)}
                                                            title="Repair cost tax for Mixed technology assets" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="restricted-text sm-text" style={{ fontSize: '0.55rem', color: 'var(--terminal-amber)' }}>CLAN TECH TAX</label>
                                                    <div className="status-bar theme-amber cursor-pointer" style={{ display: 'flex', margin: 0, padding: '0 5px', height: '24px', alignItems: 'center', justifyContent: 'center' }}>
                                                        <input type="number" step="0.1" className="table-input" style={{ width: '100%', textAlign: 'center', border: 'none' }} disabled={!campaign.isManager}
                                                            value={clanTechTax}
                                                            onChange={(e) => setClanTechTax(parseFloat(e.target.value) || 0)}
                                                            onBlur={(e) => handleRepairRuleUpdate('clanTechModifier', e.target.value)}
                                                            title="Repair cost tax for pure Clan technology assets" />
                                                    </div>
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
                            </div>

                            <div className="dashboard-section tactical-panel mb-30">
                                <h3 className="section-title">TRACK OPERATIONS</h3>
                                <div className="month-panel-grid mt-15" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px', alignItems: 'start' }}>
                                    {Array.from({ length: displayMonthCount }, (_, i) => i + 1).map(mIdx => {
                                        const monthTracks = (campaign?.tracks || []).filter((t): t is CampaignTrack => t != null).filter((t: CampaignTrack) => (t.monthIndex || 1) === mIdx)
                                            .sort((a: CampaignTrack, b: CampaignTrack) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0));
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
                                                onDragOver={(e) => {
                                                    if (campaign.isManager) e.preventDefault();
                                                }}
                                                onDragLeave={() => setDragOverMonth(null)}
                                                onDrop={(e) => {
                                                    if (campaign.isManager) handleDrop(e, mIdx);
                                                }}
                                            >
                                                <h4 className="zone-header" style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div className="flex items-center" style={{ gap: '10px' }}>
                                                        <span>[ MONTH {mIdx} ]</span>
                                                        <span className="restricted-text" style={{ fontSize: '0.7rem' }}>
                                                            [{monthTracks.length} OPS]
                                                        </span>
                                                    </div>
                                                    {campaign.isManager && <button
                                                        className="mode-btn theme-blue"
                                                        style={{ fontSize: '0.6rem', padding: '2px 6px' }}
                                                        onClick={() => setShowMonthlyExpensesEditor(mIdx)}
                                                    >
                                                        [ EXPENSES ]
                                                    </button>}
                                                </h4>
                                                <div className="track-container flex flex-column flex-gap-10" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    {monthTracks.map((track: CampaignTrack) => (
                                                        <EditableTrackCard
                                                            key={track.id}
                                                            track={track}
                                                            campaign={campaign as any}
                                                            metaData={metaData}
                                                            handleTrackUpdate={campaign.isManager ? handleTrackUpdate : () => { }}
                                                            handleReroll={campaign.isManager ? handleReroll : async () => { }}
                                                            setShowAarForTrack={setShowAarForTrack}
                                                            onDrop={(e, targetTrackId) => handleDrop(e, mIdx, targetTrackId)}
                                                        />
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
                                    {(campaign?.participatingDetachments || []).filter((d): d is Detachment => d != null).map((det: Detachment) => (
                                        <div key={det.id} className="asset-card" style={{ position: 'relative' }}>
                                            <div
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => onSelectDetachment({
                                                    id: `camp-det-${det.id}`,
                                                    label: det.name || 'UNKNOWN DETACHMENT',
                                                    type: 'DETACHMENT',
                                                    metadata: { detachmentId: det.id, commandId: det.mercenaryCommandId, campaignId: campaign?.id, managerView: true }
                                                })}
                                            >
                                                <div className="asset-type">{det.mercenaryCommandName?.toUpperCase() || 'MERCENARY COMMAND'}</div>
                                                <div className="asset-label" style={{ marginBottom: '10px', borderBottom: '1px solid var(--accent-dim)', paddingBottom: '5px', display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>{det.name || 'UNKNOWN DETACHMENT'}</span>
                                                    {det.campaignRating != null && <span style={{ color: 'var(--terminal-amber)', fontSize: '0.8rem' }}>RATING: {det.campaignRating}</span>}
                                                </div>
                                                <DetachmentReadinessSummary
                                                    units={(det.units || []).filter((u): u is CombatUnit => u != null)}
                                                    pilots={(det.pilots || []).filter((p): p is Pilot => p != null)}
                                                />
                                            </div>
                                            {campaign.isManager && <button type="button" className="mode-btn" style={{ position: 'absolute', top: '5px', right: '5px', padding: '2px 5px', fontSize: '0.6rem', color: 'var(--terminal-alert)' }} onClick={() => handleRemoveDetachment(det.id)}>EJECT</button>}
                                        </div>
                                    ))}
                                    {(!campaign?.participatingDetachments || campaign.participatingDetachments.length === 0) && (
                                        <div className="restricted-text">NO DETACHMENTS CURRENTLY DEPLOYED IN THIS THEATER.</div>
                                    )}
                                </div>
                            </div>
                        </>
                    );
                })()
            )
            }
            {
                overlay.isOpen && (
                    <TerminalOverlay
                        title={overlay.title}
                        message={overlay.message}
                        variant={overlay.variant}
                        onConfirm={overlay.onConfirm}
                        onCancel={() => setOverlay(prev => ({ ...prev, isOpen: false }))}
                        showInputField={overlay.showInputField}
                        inputPlaceholder={overlay.inputPlaceholder}
                        inputInitialValue={overlay.inputInitialValue}
                        inputType={overlay.inputType}
                        inputLabel={overlay.inputLabel}
                    >
                        {overlay.children}
                    </TerminalOverlay>
                )
            }

            {
                showRecruitment && campaign && (
                    <RecruitmentOverlay
                        campaignId={campaign.id}
                        invites={campaignInvites}
                        onClose={() => setShowRecruitment(false)}
                        onRefresh={() => refetchCampaign()}
                    />
                )
            }

            {
                showMarket && campaign && (
                    <MarketDashboard
                        campaignId={campaign.id}
                        onClose={() => setShowMarket(false)}
                        onRefresh={() => refetchCampaign()}
                        campaign={campaign}
                        setOverlay={setOverlay}
                        userCommands={userCommands}
                    />
                )
            }

            {
                showProcureEditor && procureAssetData && procureTargetDetachment && (
                    <CombatUnitEditor
                        mode="create"
                        commandId={procureTargetDetachment.mercenaryCommandId || ''}
                        detachmentId={procureTargetDetachment.id}
                        availableSP={procureTargetDetachment.totalSupportPoints}
                        unit={{
                            ...procureAssetData,
                            id: '',
                            type: (procureAssetData.type as UnitType) || 'BM',
                            model: procureAssetData.model || 'NEW UNIT',
                            variant: procureAssetData.variant || '',
                            techBase: procureAssetData.techBase || 'Inner Sphere',
                            tonnage: procureAssetData.tonnage || 0,
                            asSize: procureAssetData.asSize || 0,
                            bv: procureAssetData.bv || 0,
                            pv: procureAssetData.pv || 0,
                            status: (metaData?.publicCampaignMetadata?.unitStatuses?.[0] as UnitStatus) || 'OPERATIONAL',
                            detachmentId: procureTargetDetachment.id
                        } as CombatUnit}
                        unitTypes={(metaData?.publicCampaignMetadata?.unitTypes || FALLBACK_TYPES) as UnitType[]}
                        unitStatuses={(metaData?.publicCampaignMetadata?.unitStatuses || FALLBACK_STATUSES) as UnitStatus[]}
                        techBases={(metaData?.publicCampaignMetadata?.techBases || FALLBACK_TECH) as TechBase[]}
                        onSave={handleProcureSave}
                        onCancel={handleProcureCancel}
                        overridePrice={procureAssetData.overridePrice}
                    />
                )
            }

            {
                showHireEditor && hirePilotData && hireTargetDetachment && (
                    <PilotEditor
                        mode="create"
                        commandId={hireTargetDetachment.mercenaryCommandId || ''}
                        detachmentId={hireTargetDetachment.id}
                        availableSP={hireTargetDetachment.totalSupportPoints}
                        pilot={{
                            ...hirePilotData,
                            id: '',
                            name: hirePilotData.name || 'NEW PILOT',
                            gunnery: 4,
                            piloting: 5,
                            asSkill: 4,
                            edgeTokensSkill: null,
                            edgeAbilitySkill: null,
                            edgeAbilities: hirePilotData.edgeAbilities ?? null,
                            unitType: hirePilotData.unitType || 'BM',
                            wounds: hirePilotData.wounds || 0,
                            handicap: 0,
                            totalSpEarned: hirePilotData.totalSpEarned || 0,
                            gunnerySpEarned: hirePilotData.gunnerySpEarned || 0,
                            pilotingSpEarned: hirePilotData.pilotingSpEarned || 0,
                            edgeTokensSpEarned: hirePilotData.edgeTokensSpEarned || 0,
                            edgeAbilitySpEarned: hirePilotData.edgeAbilitySpEarned || 0,
                            detachmentId: hireTargetDetachment.id
                        } as Pilot}
                        onSave={handleHireSave}
                        onCancel={handleHireCancel}
                        overridePrice={hirePilotData.overridePrice}
                        campaignHireCost={campaign.hireNamedPilotCost ?? undefined}
                    />
                )
            }

            {
                showMonthlyExpensesEditor !== null && campaign && (campaign.participatingDetachments || []).filter((d): d is Detachment => d != null).length > 0 && (
                    <MonthlyExpensesEditor
                        campaignDetails={campaign}
                        detachments={(campaign.participatingDetachments || []).filter((d): d is Detachment => d != null)}
                        currentMonthIndex={showMonthlyExpensesEditor}
                        onClose={() => {
                            setShowMonthlyExpensesEditor(null);
                            refetchCampaign();
                            if (onRefresh) onRefresh(); // Trigger global refresh for ledger

                        }}
                        onLedgerEntryAdded={() => {
                            refetchCampaign();
                            if (onRefresh) onRefresh(); // Trigger global refresh for ledger
                        }}
                    />
                )
            }

            {
                showAarForTrack && campaign && (
                    <AfterActionReportEditor
                        campaign={campaign as any}
                        track={showAarForTrack as any}
                        metaData={metaData as any}
                        onClose={async () => {
                            await refetchCampaign();
                            if (onRefresh) await onRefresh();
                            setShowAarForTrack(null);
                        }}
                        onLedgerEntryAdded={async () => {
                            await refetchCampaign();
                            if (onRefresh) await onRefresh();
                        }}
                        userCommands={userCommands as any}
                    />
                )
            }

            <style>{`
                .container {
                    background: transparent !important;
                }
                .tactical-panel, .dashboard-section, .asset-card {
                    background-color: rgba(5, 7, 5, 0.3) !important;
                    backdrop-filter: blur(1px);
                }
                .theme-amber .cursor-pointer:hover { background-color: rgba(255, 176, 0, 0.15); box-shadow: 0 0 5px rgba(255, 176, 0, 0.1); }
                .theme-blue .cursor-pointer:hover { background-color: rgba(0, 191, 255, 0.15); box-shadow: 0 0 5px rgba(0, 191, 255, 0.1); }
                .theme-green .cursor-pointer:hover { background-color: rgba(51, 255, 51, 0.15); box-shadow: 0 0 5px rgba(51, 255, 51, 0.1); }
                .theme-red .cursor-pointer:hover { background-color: rgba(255, 51, 51, 0.15); box-shadow: 0 0 5px rgba(255, 51, 51, 0.1); }

                .status-bar:focus-within { 
                    background-color: rgba(255, 255, 255, 0.05); 
                    box-shadow: 0 0 8px rgba(255, 255, 255, 0.1); 
                }
                .theme-amber .status-bar:focus-within { border-color: var(--terminal-amber); box-shadow: 0 0 8px rgba(255, 176, 0, 0.3); }
                .theme-blue .status-bar:focus-within { border-color: var(--terminal-blue); box-shadow: 0 0 8px rgba(0, 191, 255, 0.3); }
                .theme-green .status-bar:focus-within { border-color: var(--terminal-green); box-shadow: 0 0 8px rgba(51, 255, 51, 0.3); }
                .theme-red .status-bar:focus-within { border-color: var(--terminal-red); box-shadow: 0 0 8px rgba(255, 51, 51, 0.3); }

                .status-bar input.table-input, .status-bar select.table-input, .status-bar textarea.table-input {
                    background: transparent !important;
                    color: inherit !important;
                    outline: none !important;
                    border: none !important;
                    box-shadow: none !important;
                }
                .markdown-preview :is(h1, h2, h3, h4, h5, h6) {
                    color: var(--terminal-amber);
                    margin-top: 1em;
                    margin-bottom: 0.5em;
                    border-bottom: 1px dashed rgba(255, 176, 0, 0.3);
                    padding-bottom: 0.2em;
                    text-transform: uppercase;
                }
            `}</style>
        </div >
    );
};