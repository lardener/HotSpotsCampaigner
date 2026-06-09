import React, { useState, useEffect, useReducer } from 'react';
import { ApolloCache } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { TerminalOverlay } from './TerminalOverlay';
import { TacticalMarkdown } from './TacticalMarkdown';
import { CombatUnitEditor } from './CombatUnitEditor';
import { PilotEditor } from './PilotEditor';
import { CombatUnit, Pilot, DetachmentAarState, CampaignDetail, TrackDetail, NumericInput } from '../types/global.d';
import { useHscActionHandler } from './useHscActionHandler';
import { UNIT_STATUS_OPTIONS as FALLBACK_STATUSES } from './Rules';
import { parseMultiplier, parseSupportTerms, parseNumericInput, isInputInvalid } from '../util/contractUtils';
import { MetadataDataMinimal } from '../types/graphql.d';
import {
    GET_METADATA,
    UPDATE_UNIT,
    UPDATE_PILOT,
    DELETE_PILOT,
    UPDATE_TRACK,
    DELETE_UNIT,
    ADD_LEDGER_ENTRY
} from '../types/operations';
import { AarBackground } from './AarBackground';

export interface AarDataState {
    detachmentAars: Record<string, DetachmentAarState>;
    unitStates: Record<string, { status: string; ammo: NumericInput }>;
    pilotStates: Record<string, { injuries: number; healed: number }>;
    afterActionNarrative: string;
    isNarrativeDirty: boolean;
}

export type AarAction =
    | { type: 'SYNC_PROPS'; campaign: CampaignDetail; track: TrackDetail; unitStatuses: string[] }
    | { type: 'UPDATE_DETACHMENT_AAR'; detId: string; patch: Partial<DetachmentAarState> }
    | { type: 'UPDATE_UNIT_STATE'; unitId: string; patch: Partial<{ status: string; ammo: NumericInput }> }
    | { type: 'UPDATE_PILOT_STATE'; pilotId: string; patch: Partial<{ injuries: number; healed: number }> }
    | { type: 'SET_NARRATIVE'; narrative: string }
    | { type: 'MARK_NARRATIVE_CLEAN' };

export const aarReducer = (state: AarDataState, action: AarAction): AarDataState => {
    switch (action.type) {
        case 'SYNC_PROPS': {
            const { campaign, track, unitStatuses } = action;
            const nextAars: Record<string, DetachmentAarState> = {};
            const nextUnits: Record<string, { status: string; ammo: NumericInput }> = {};
            const nextPilots: Record<string, { injuries: number; healed: number }> = {};

            campaign.participatingDetachments?.forEach((det) => {
                // Merge existing local state with incoming prop data to preserve user input
                nextAars[det.id] = state.detachmentAars[det.id] || {
                    selectedContractId: campaign.contracts?.[0]?.id || '',
                    selectedLevel: 1,
                    outcomeMultiplier: 1.0,
                    salvageValue: 0,
                    customAward: 0
                };

                det.units?.forEach((u) => {
                    nextUnits[u.id] = state.unitStates[u.id] || {
                        status: u.status || unitStatuses[0],
                        ammo: 0
                    };
                });
                det.pilots?.forEach((p) => {
                    nextPilots[p.id] = state.pilotStates[p.id] || {
                        injuries: p.wounds || 0,
                        healed: 0
                    };
                });
            });

            return {
                ...state,
                detachmentAars: nextAars,
                unitStates: nextUnits,
                pilotStates: nextPilots,
                afterActionNarrative: state.isNarrativeDirty ? state.afterActionNarrative : (track.afterActionNarrative || ''),
                isNarrativeDirty: state.isNarrativeDirty
            };
        }
        case 'UPDATE_DETACHMENT_AAR':
            return {
                ...state,
                detachmentAars: {
                    ...state.detachmentAars,
                    [action.detId]: { ...state.detachmentAars[action.detId], ...action.patch }
                }
            };
        case 'UPDATE_UNIT_STATE':
            return {
                ...state,
                unitStates: {
                    ...state.unitStates,
                    [action.unitId]: { ...state.unitStates[action.unitId], ...action.patch }
                }
            };
        case 'UPDATE_PILOT_STATE':
            return {
                ...state,
                pilotStates: {
                    ...state.pilotStates,
                    [action.pilotId]: { ...state.pilotStates[action.pilotId], ...action.patch }
                }
            };
        case 'MARK_NARRATIVE_CLEAN':
            return { ...state, isNarrativeDirty: false };
        case 'SET_NARRATIVE':
            return { ...state, afterActionNarrative: action.narrative, isNarrativeDirty: true };
        default:
            return state;
    }
};

const useAarState = (campaign: CampaignDetail, track: TrackDetail, unitStatuses: string[]) => {
    const [state, dispatch] = useReducer(aarReducer, {
        detachmentAars: {},
        unitStates: {},
        pilotStates: {},
        afterActionNarrative: '',
        isNarrativeDirty: false
    });

    useEffect(() => {
        dispatch({ type: 'SYNC_PROPS', campaign, track, unitStatuses });
    }, [campaign, track, unitStatuses]);

    return [state, dispatch] as const;
};

export const calculatePilotFinancials = (pState: { healed: number }, terms: any, healCost: number) => {
    const rawMedicalCost = pState.healed * healCost;
    let mercenaryCost = 0;

    if (terms.support.type === 'BATTLE') {
        mercenaryCost = 0;
    } else if (terms.support.type === 'STRAIGHT') {
        mercenaryCost = Math.round(rawMedicalCost * (1 - terms.support.pct));
    } else {
        mercenaryCost = rawMedicalCost;
    }

    return {
        rawMedicalCost,
        mercenaryCost,
        mercenaryCostSigned: mercenaryCost * -1,
        healed: pState.healed,
        injuryHealCost: healCost,
        supportType: terms.support.type,
        supportPct: terms.support.pct
    };
};

export const calculateAwardFinancials = (campaign: CampaignDetail, terms: any) => {
    const baseCombatPay = campaign.combatPay || 0;

    // Convert potential string inputs to numbers for calculation
    const sValue = parseNumericInput(terms.salvageValue);
    const cAward = parseNumericInput(terms.customAward);

    const payAward = Math.round(baseCombatPay * terms.outcomeMultiplier * terms.selectedLevel);
    const salvageAward = Math.round(sValue * terms.salvageCoverage);
    const total = payAward + salvageAward + cAward;

    return {
        baseCombatPay,
        outcomeMultiplier: terms.outcomeMultiplier,
        payRate: terms.payRate,
        selectedLevel: terms.selectedLevel,
        payAward,
        salvageValue: terms.salvageValue,
        salvageCoverage: terms.salvageCoverage,
        salvageAward,
        customAward: terms.customAward,
        total
    };
};

interface AfterActionReportEditorProps {
    campaign: CampaignDetail;
    track: TrackDetail;
    metaData?: MetadataDataMinimal;
    onClose: () => void | Promise<void>;
    onLedgerEntryAdded?: () => void | Promise<void>;
    userCommands?: any[];
}

// New helper function to calculate financial implications of a unit's status
export const calculateUnitFinancials = (unit: CombatUnit, status: string, rules: Partial<CampaignDetail> | undefined, statuses: string[]) => {
    const [operational, armor, internal, crippled, destroyed, trulyDestroyed] = statuses;

    const isTrulyDestroyed = status === trulyDestroyed;
    let baseRepairCost = 0;
    let baseReplacementValue = 0;
    let damageMultiplier = 0;
    let unitModifier = 1.0;
    let techTax = 1.0;

    // Determine tech level multiplier based on specific tech base
    if (unit.techBase === 'Clan') {
        techTax = (rules?.clanTechModifier ?? 2.0);
    } else if (unit.techBase === 'Mixed') {
        techTax = (rules?.mixedTechModifier ?? 1.5);
    }

    if (isTrulyDestroyed) {
        // For truly destroyed units, calculate replacement value modified by tech tax
        baseReplacementValue = (unit.bv || 0) * 0.5 * techTax;
    } else {
        // For other statuses, calculate repair cost
        const multipliers: Record<string, number> = {
            [operational || 'OPERATIONAL']: 0.0,
            [armor || 'ARMOR DAMAGE']: rules?.armorMultiplier ?? 0.5,
            [internal || 'INTERNAL DAMAGE']: rules?.internalMultiplier ?? 2.0,
            [crippled || 'CRIPPLED']: rules?.crippledMultiplier ?? 3.0,
            [destroyed || 'DESTROYED']: rules?.destroyedMultiplier ?? 5.0,
        };

        damageMultiplier = multipliers[status] || 0;
        baseRepairCost = (unit.tonnage || 0) * damageMultiplier;

        if (['CV', 'BA', 'CI'].includes(unit.type)) {
            unitModifier = (rules?.nonMechModifier ?? 0.5);
            baseRepairCost *= unitModifier;
        }

        // Apply tech level multiplier to repair cost
        baseRepairCost *= techTax;
    }

    return {
        baseRepairCost,
        baseReplacementValue,
        isTrulyDestroyed,
        techTax,
        damageMultiplier,
        unitModifier,
        tonnage: unit.tonnage || 0,
        bv: unit.bv || 0,
        techBase: unit.techBase,
        statusLabel: status
    };
};

export const AfterActionReportEditor: React.FC<AfterActionReportEditorProps> = ({ campaign, track, metaData: propMetaData, onClose, onLedgerEntryAdded, userCommands }) => {
    const [addLedgerEntry] = useMutation(ADD_LEDGER_ENTRY);
    const [updateUnit] = useMutation(UPDATE_UNIT);
    const [updatePilot] = useMutation(UPDATE_PILOT);
    const [deletePilot] = useMutation(DELETE_PILOT, { // Removed <any> from ApolloCache
        update(cache: ApolloCache, { data }: any, { variables }: any) {
            if (data?.deletePilot && variables?.pilotId) {
                cache.evict({ id: cache.identify({ __typename: 'Pilot', id: variables.pilotId }) });
                cache.gc();
            }
        }
    });
    const [updateTrack] = useMutation(UPDATE_TRACK);
    const [deleteUnit] = useMutation(DELETE_UNIT, { // Removed <any> from ApolloCache
        update(cache: ApolloCache, { data }: any, { variables }: any) {
            if (data?.deleteUnit && variables?.unitId) {
                cache.evict({ id: cache.identify({ __typename: 'CombatUnit', id: variables.unitId }) });
                cache.gc();
            }
        }
    });
    const { loading: metadataLoading, data: queryMetaData } = useQuery<MetadataDataMinimal>(GET_METADATA, {
        skip: !!propMetaData
    });

    const metaData = propMetaData || queryMetaData;

    const unitStatuses = (metaData?.publicCampaignMetadata as any)?.unitStatuses || FALLBACK_STATUSES;
    const [state, dispatch] = useAarState(campaign, track, unitStatuses);
    const [isEditingNarrative, setIsEditingNarrative] = useState(false);
    const [notices, setNotices] = useState<Record<string, string>>({});
    const [errorStates, setErrorStates] = useState<Record<string, string>>({});
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
    const [isFinalizing, setIsFinalizing] = useState(false);

    const [overlay, setOverlay] = useState<{
        title: string;
        message: string;
        onConfirm: (val?: string) => void | Promise<void>;
        onCancel?: () => void;
        variant?: 'alert' | 'info';
        children?: React.ReactNode;
        showInputField?: boolean;
        inputPlaceholder?: string;
        inputInitialValue?: string;
        inputType?: string;
        inputLabel?: string;
    } | null>(null);

    const {
        handleHscAction,
        showProcureEditor, procureAssetData, procureTargetDetachment, handleProcureSave, handleProcureCancel,
        showHireEditor, hirePilotData, hireTargetDetachment, handleHireSave, handleHireCancel,
    } = useHscActionHandler({
        campaign, userCommands, setOverlay, onActionComplete: onLedgerEntryAdded
    });

    const addNotice = (key: string, msg: string) => {
        setNotices(prev => ({ ...prev, [key]: msg }));
        setTimeout(() => {
            setNotices(prev => {
                const next = { ...prev };
                delete next[key];
                return next;
            });
        }, 5000);
    };

    if (metadataLoading) {
        return (
            <TerminalOverlay
                title="LOGISTICS LINK"
                message="SYNCHRONIZING OPERATIONAL PARAMETERS..."
                onConfirm={onClose}
                confirmLabel="ABORT"
                themeClass="theme-red"
            >
                <div className="loading-intel pulse text-center" style={{ padding: '40px' }}>&gt;&gt; ACCESSING COMSTAR RELAY...</div>
            </TerminalOverlay>
        );
    }

    const repairRules = campaign || metaData?.publicCampaignMetadata;

    const ammoCostPerTon = campaign.rearmCostPerTon ?? metaData?.publicCampaignMetadata?.rearmCostPerTon ?? 10;
    const injuryHealCost = campaign.healMechWarriorPerWoundBoxCost ?? metaData?.publicCampaignMetadata?.healMechWarriorPerWoundBoxCost ?? 30;
    const healMonthLimit = campaign.healMechWarriorPerMonthLimit ?? metaData?.publicCampaignMetadata?.healMechWarriorPerMonthLimit ?? 2;

    const getDetachmentTerms = (detId: string) => {
        const detAar = state.detachmentAars[detId] || { selectedContractId: '', selectedLevel: 1, outcomeMultiplier: 1.0, salvageValue: 0, customAward: 0 };
        const contract = campaign.contracts?.find((c: any) => c.id === detAar.selectedContractId) || campaign;

        return {
            support: parseSupportTerms(contract.supportTerms || ''),
            salvageCoverage: parseMultiplier(contract.salvageTerms || ''),
            payRate: contract.payRate || 1.0,
            ...detAar
        };
    };

    const handleAwardToDetachment = async (detId: string, cmdId: string) => {
        const detAar = state.detachmentAars[detId];
        if (!detAar) return;

        const noticeKey = `${detId}-award`;
        // Resolve contract based on the current selection in the reducer state
        const contract = campaign.contracts?.find((c: any) => c.id === detAar.selectedContractId) || campaign;

        const financials = calculateAwardFinancials(campaign, {
            ...detAar,
            payRate: contract.payRate || 1.0,
            salvageCoverage: parseMultiplier(contract.salvageTerms || '')
        });
        const total = financials.total;

        if (total === 0) return;

        setErrorStates(prev => {
            const next = { ...prev };
            delete next[noticeKey];
            return next;
        });
        setLoadingStates(prev => ({ ...prev, [noticeKey]: true }));

        const description = `AAR AWARD: ${track.trackName} (PAY x${financials.outcomeMultiplier} [LVL ${financials.selectedLevel}], SALVAGE ${financials.salvageCoverage * 100}%)`;

        dispatch({ type: 'UPDATE_DETACHMENT_AAR', detId, patch: { salvageValue: 0, customAward: 0 } });

        try {
            await addLedgerEntry({
                variables: {
                    commandId: cmdId,
                    detachmentId: detId,
                    input: {
                        amount: total,
                        description: description,
                        monthIndex: track.monthIndex || 1,
                        campaignId: campaign.id,
                        campaignName: campaign.name
                    }
                }
            });
            await onLedgerEntryAdded?.();
            addNotice(noticeKey, `✓ AWARD COMMITTED: ${total} SP`);
        } catch (err) {
            setErrorStates(prev => ({ ...prev, [noticeKey]: "COMMUNICATIONS FAILURE: AWARD NOT COMMITTED." }));
            console.error("Award error:", err);
        } finally {
            setLoadingStates(prev => ({ ...prev, [noticeKey]: false }));
        }
    };

    const handleProcessUnit = (detId: string, cmdId: string, unit: CombatUnit) => {
        const uState = state.unitStates[unit.id] || { status: unit.status || unitStatuses[0], ammo: 0 };
        const { isTrulyDestroyed } = calculateUnitFinancials(unit, uState.status, repairRules, unitStatuses);

        if (isTrulyDestroyed) {
            setOverlay({
                title: "CONFIRM ASSET DISPOSAL",
                message: `UNIT ${unit.model} IS TRULY DESTROYED. COMMITTING THIS ROW WILL PERMANENTLY REMOVE THE ASSET FROM THE REGISTRY. PROCEED?`,
                variant: 'alert',
                onConfirm: () => {
                    setOverlay(null);
                    commitUnitLogistics(detId, cmdId, unit);
                },
                onCancel: () => setOverlay(null)
            });
        } else {
            commitUnitLogistics(detId, cmdId, unit);
        }
    };

    const commitUnitLogistics = async (detId: string, cmdId: string, unit: CombatUnit) => {
        const detAar = state.detachmentAars[detId];
        if (!detAar) return;

        const noticeKey = `${unit.id}-logistics`;
        const contract = campaign.contracts?.find((c: any) => c.id === detAar.selectedContractId) || campaign;
        const terms = {
            support: parseSupportTerms(contract.supportTerms || ''),
            ...detAar
        };
        const uState = state.unitStates[unit.id] || { status: unit.status || unitStatuses[0], ammo: 0 };

        // Ensure ammo is parsed correctly from potentially string state
        const ammoTons = parseNumericInput(uState.ammo);

        const { baseRepairCost, baseReplacementValue, isTrulyDestroyed } = calculateUnitFinancials(unit, uState.status, repairRules, unitStatuses);

        let finalAmount = 0;
        let description = ''; // Determine financial outcome based on support term type

        if (isTrulyDestroyed) {
            if (terms.support.type === 'BATTLE') {
                // Battle terms pay out a percentage of unit value
                finalAmount = Math.round(baseReplacementValue * terms.support.pct);
                description = `AAR REPLACEMENT: ${unit.model} ${unit.variant} - ${track.trackName} (BATTLE ${terms.support.pct * 100}%)`;
            } else {
                // Straight or None terms pay 0 for destroyed units
                finalAmount = 0;
                description = `AAR ASSET LOSS: ${unit.model} ${unit.variant} - ${track.trackName} (NO REPLACEMENT)`;
            }
        } else {
            const repairCost = Math.ceil(baseRepairCost);
            const ammoCost = ammoTons * ammoCostPerTon;
            const totalRawCost = repairCost + ammoCost;

            if (terms.support.type === 'BATTLE') {
                // Battle terms cover 100% of logistics
                finalAmount = 0;
                description = `AAR LOGISTICS: ${unit.model} ${unit.variant} - ${track.trackName} (BATTLE COVERED 100%)`;
            } else if (terms.support.type === 'STRAIGHT') {
                // Straight terms cover a specific percentage
                finalAmount = Math.ceil(totalRawCost * (1 - terms.support.pct)) * -1;
                description = `AAR LOGISTICS: ${unit.model} ${unit.variant} - ${track.trackName} (STRAIGHT ${terms.support.pct * 100}%)`;
            } else {
                // None covers 0%
                finalAmount = Math.ceil(totalRawCost) * -1;
                description = `AAR LOGISTICS: ${unit.model} ${unit.variant} - ${track.trackName} (NO COVERAGE)`;
            }
        }

        setErrorStates(prev => {
            const next = { ...prev };
            delete next[noticeKey];
            return next;
        });
        setLoadingStates(prev => ({ ...prev, [noticeKey]: true }));

        try {
            if (finalAmount !== 0) {
                await addLedgerEntry({
                    variables: {
                        commandId: cmdId,
                        detachmentId: detId,
                        input: {
                            amount: finalAmount,
                            description: description,
                            monthIndex: track.monthIndex || 1,
                            campaignId: campaign.id,
                            campaignName: campaign.name
                        }
                    }
                });
            }

            if (isTrulyDestroyed) {
                await deleteUnit({ variables: { unitId: unit.id } });
            } else {
                // Restore unit to operational status in DB and local state
                await updateUnit({ variables: { id: unit.id, input: { status: unitStatuses[0] } } });
                dispatch({ type: 'UPDATE_UNIT_STATE', unitId: unit.id, patch: { status: unitStatuses[0], ammo: 0 } });
            }

            await onLedgerEntryAdded?.();
            addNotice(noticeKey, `✓ LOGISTICS COMPLETE: ${finalAmount !== 0 ? Math.abs(finalAmount) + ' SP RECORDED' : 'STATUS RESTORED'}`);
        } catch (err) {
            setErrorStates(prev => ({ ...prev, [noticeKey]: "LOGISTICS FAILURE: DATA UPLOAD ABORTED." }));
            console.error("Logistics error:", err);
        } finally {
            setLoadingStates(prev => ({ ...prev, [noticeKey]: false }));
        }
    };

    const handleProcessPilot = async (detId: string, cmdId: string, pilot: Pilot) => {
        const detAar = state.detachmentAars[detId];
        if (!detAar) return;

        const noticeKey = `${pilot.id}-medical`;
        const contract = campaign.contracts?.find((c: any) => c.id === detAar.selectedContractId) || campaign;
        const terms = {
            support: parseSupportTerms(contract.supportTerms || ''),
            ...detAar
        };
        const pState = state.pilotStates[pilot.id] || { injuries: 0, healed: 0 };

        // Check for pilot death (6 injuries)
        const isPilotDead = pState.injuries === 6;

        if (isPilotDead) {
            setOverlay({
                title: "CONFIRM PERSONNEL FATALITY",
                message: `PILOT ${pilot.name} HAS SUSTAINED 6 INJURIES. COMMITTING THIS ROW WILL PERMANENTLY REMOVE THE PILOT FROM THE REGISTRY. NO COMPENSATION IS DUE. PROCEED?`,
                variant: 'alert',
                onConfirm: () => {
                    setOverlay(null);
                    commitPilotLogistics(detId, cmdId, pilot, pState, terms, noticeKey, true);
                },
                onCancel: () => setOverlay(null)
            });
        } else {
            commitPilotLogistics(detId, cmdId, pilot, pState, terms, noticeKey, false);
        }
    };

    const commitPilotLogistics = async (detId: string, cmdId: string, pilot: Pilot, pState: { injuries: number; healed: number; }, terms: any, noticeKey: string, isPilotDead: boolean) => {
        const financials = calculatePilotFinancials(pState, terms, injuryHealCost);
        const finalCost = financials.mercenaryCostSigned;

        setErrorStates(prev => {
            const next = { ...prev };
            delete next[noticeKey];
            return next;
        });
        setLoadingStates(prev => ({ ...prev, [noticeKey]: true }));

        try { // If pilot is dead, no compensation is due, so skip ledger entry
            if (!isPilotDead && finalCost !== 0) {
                if (finalCost !== 0) {
                    await addLedgerEntry({
                        variables: {
                            commandId: cmdId,
                            detachmentId: detId,
                            input: {
                                amount: finalCost,
                                description: `AAR MEDICAL: ${pilot.name} - ${track.trackName} (${financials.supportType} ${financials.supportPct * 100}%)`,
                                monthIndex: track.monthIndex || 1,
                                campaignId: campaign.id,
                                campaignName: campaign.name
                            }
                        }
                    });
                }
            }

            if (isPilotDead) {
                await deletePilot({ variables: { pilotId: pilot.id } });
            } else {
                // Calculate final wounds (Injuried minus Healed) and update database
                const newWounds = Math.max(0, pState.injuries - pState.healed);
                await updatePilot({ variables: { id: pilot.id, input: { wounds: newWounds } } });
                dispatch({ type: 'UPDATE_PILOT_STATE', pilotId: pilot.id, patch: { injuries: newWounds, healed: 0 } });
            }

            await onLedgerEntryAdded?.();
            addNotice(noticeKey, `✓ MEDICAL COMMITTED: ${Math.abs(finalCost)} SP`);
        } catch (err) {
            setErrorStates(prev => ({ ...prev, [noticeKey]: "MEDICAL DATABASE ERROR: RECORD REJECTED." }));
            console.error("Medical error:", err);
        } finally {
            setLoadingStates(prev => ({ ...prev, [noticeKey]: false }));
        }
    };

    const handleFinalize = async () => {
        if (isFinalizing) return;
        setIsFinalizing(true);
        try {
            await syncNarrative();
            await onClose();
        } finally {
            setIsFinalizing(false);
        }
    };

    const syncNarrative = async () => {
        if (state.isNarrativeDirty) {
            await updateTrack({
                variables: {
                    id: track.id,
                    input: { afterActionNarrative: state.afterActionNarrative }
                }
            });
            dispatch({ type: 'MARK_NARRATIVE_CLEAN' });
        }
    };

    const handleNarrativeBlur = () => {
        setIsEditingNarrative(false);
        syncNarrative();
    };

    return (
        <TerminalOverlay
            title={`AFTER ACTION REPORT: ${track.trackName.toUpperCase()}`}
            message="OPERATIONAL DEBRIEFING & LOGISTICS RECONCILIATION"
            onConfirm={handleFinalize}
            onCancel={onClose}
            confirmLabel={isFinalizing ? "SYNCHRONIZING..." : "CLOSE DEBRIEFING"}
            themeClass="theme-red"
            loading={isFinalizing}
        >
            <AarBackground />
            <div className="aar-bg-overlay" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px', paddingTop: '15px', position: 'relative', overflowX: 'hidden', background: 'transparent' }}>

                <div className="tactical-panel narrative-editor mb-20 theme-red" data-id="AAR-NARRATIVE">
                    <div className="flex-between mb-10" style={{ borderBottom: '1px solid var(--terminal-amber-dim)', paddingBottom: '5px' }}>
                        <h3 className="zone-header" style={{ margin: 0 }}>OPERATIONAL DEBRIEFING</h3>
                        <button
                            className="mode-btn"
                            style={{ fontSize: '0.6rem', padding: '2px 6px' }}
                            onClick={() => setIsEditingNarrative(!isEditingNarrative)}
                        >
                            {isEditingNarrative ? '[ CLOSE ]' : '[ EDIT ]'}
                        </button>
                    </div>
                    {isEditingNarrative ? (
                        <div className="status-bar theme-red" style={{ padding: '5px' }}>
                            <textarea
                                className="table-input w-100"
                                style={{ height: '180px', fontSize: '0.9rem' }}
                                value={state.afterActionNarrative}
                                onChange={(e) => dispatch({ type: 'SET_NARRATIVE', narrative: e.target.value })}
                                onBlur={handleNarrativeBlur}
                                autoFocus
                                placeholder="Document the engagement history..."
                            />
                        </div>
                    ) : (
                        <div
                            className="markdown-preview"
                            style={{ minHeight: '60px', fontSize: '0.9rem', lineHeight: '1.4' }}
                        >
                            <div style={{ flex: 1 }}>
                                {state.afterActionNarrative ? (
                                    <TacticalMarkdown
                                        content={state.afterActionNarrative}
                                        onAction={handleHscAction}
                                    />
                                ) : (
                                    <span className="restricted-text subdued">NO NARRATIVE RECORDED. CLICK EDIT TO INITIALIZE DEBRIEFING.</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {campaign.participatingDetachments?.map((det: any) => (
                    <div key={det.id} className="dashboard-section mb-20" style={{ border: '1px solid var(--accent-dim)', padding: '15px', backgroundColor: 'transparent' }}>
                        <div className="flex-between mb-15" style={{ borderBottom: '1px solid var(--accent-dim)', paddingBottom: '8px' }}>
                            <h4 className="terminal-text" style={{ margin: 0 }}>{det.name.toUpperCase()}</h4>
                            <span className="restricted-text sm-text">{det.mercenaryCommandName}</span>
                        </div>

                        <section className="mb-20">
                            <h5 className="restricted-text mb-10">MISSION AWARDS</h5>
                            <div className="grid-5-col flex-gap-10" style={{ alignItems: 'center' }}>
                                <div className="flex-col items-center">
                                    <label className="xs-text opacity-70" style={{ marginBottom: '4px' }}>CONTRACT</label>
                                    <div className="status-bar theme-red cursor-pointer" style={{ padding: '0 5px' }}>
                                        <select
                                            className="table-input w-100"
                                            style={{ border: 'none' }}
                                            value={state.detachmentAars[det.id]?.selectedContractId}
                                            onChange={(e) => dispatch({ type: 'UPDATE_DETACHMENT_AAR', detId: det.id, patch: { selectedContractId: e.target.value } })}
                                            title="Select contract for this detachment"
                                        >
                                            {campaign.contracts?.map((c: any) => (
                                                <option key={c.id} value={c.id}>{c.primaryContract ? 'PRIMARY' : 'OPPOSITION'} ({c.employerCategory})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex-col items-center">
                                    <label className="xs-text opacity-70" style={{ marginBottom: '4px' }}>LEVEL</label>
                                    <div className="status-bar theme-red cursor-pointer" style={{ padding: '0 5px' }}>
                                        <select
                                            className="table-input w-100"
                                            style={{ border: 'none' }}
                                            value={state.detachmentAars[det.id]?.selectedLevel}
                                            onChange={(e) => dispatch({ type: 'UPDATE_DETACHMENT_AAR', detId: det.id, patch: { selectedLevel: parseInt(e.target.value) } })}
                                            title="Select deployment level"
                                        >
                                            {[1, 2, 3].map(v => <option key={v} value={v}>{v}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex-col items-center">
                                    <label className="xs-text opacity-70" style={{ marginBottom: '4px' }}>OUTCOME</label>
                                    <div className="status-bar theme-red cursor-pointer" style={{ padding: '0 5px' }}>
                                        <select
                                            className="table-input w-100"
                                            style={{ border: 'none' }}
                                            value={state.detachmentAars[det.id]?.outcomeMultiplier}
                                            onChange={(e) => dispatch({ type: 'UPDATE_DETACHMENT_AAR', detId: det.id, patch: { outcomeMultiplier: parseFloat(e.target.value) } })}
                                            title="Select track outcome multiplier"
                                        >
                                            <option value="0">NO COMBAT PAY (0%)</option>
                                            <option value="0.5">UNSUCCESSFUL (50%)</option>
                                            <option value="1">SUCCESSFUL (100%)</option>
                                            <option value="1.5">SUCCESSFUL W/ BONUS (150%)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex-col items-center">
                                    <label className="xs-text opacity-70" style={{ marginBottom: '4px' }}>SALVAGE (SP)</label>
                                    <div className={`status-bar theme-red ${isInputInvalid(state.detachmentAars[det.id]?.salvageValue) ? 'invalid' : ''}`} style={{ padding: '0 5px' }}>
                                        <input
                                            type="number"
                                            className="table-input w-100"
                                            style={{ border: 'none' }}
                                            value={state.detachmentAars[det.id]?.salvageValue}
                                            onChange={(e) => dispatch({ type: 'UPDATE_DETACHMENT_AAR', detId: det.id, patch: { salvageValue: e.target.value } })}
                                            title="Enter raw salvage value"
                                        />
                                    </div>
                                </div>
                                <div className="flex-col items-center">
                                    <label className="xs-text opacity-70" style={{ marginBottom: '4px' }}>MISC (SP)</label>
                                    <div className={`status-bar theme-red ${isInputInvalid(state.detachmentAars[det.id]?.customAward) ? 'invalid' : ''}`} style={{ padding: '0 5px' }}>
                                        <input
                                            type="number"
                                            className="table-input w-100"
                                            style={{ border: 'none' }}
                                            value={state.detachmentAars[det.id]?.customAward}
                                            onChange={(e) => dispatch({ type: 'UPDATE_DETACHMENT_AAR', detId: det.id, patch: { customAward: e.target.value } })}
                                            title="Enter misc adjustment"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex-between mt-10">
                                <div className="status-bar theme-green sm-text flex-grow mr-10" style={{ padding: '4px 10px' }}>
                                    {(() => {
                                        const t = getDetachmentTerms(det.id);
                                        const financials = calculateAwardFinancials(campaign, t);
                                        const tooltip = `Combat Pay: ${financials.baseCombatPay} SP * ${financials.outcomeMultiplier} (Outcome) * ${financials.selectedLevel} (Level) = ${financials.payAward} SP\n` +
                                            `Salvage: ${financials.salvageValue} SP * ${financials.salvageCoverage} (Coverage) = ${financials.salvageAward} SP\n` +
                                            `Misc: ${financials.customAward} SP`;
                                        const terms = getDetachmentTerms(det.id);
                                        return (
                                            <div title={tooltip}>
                                                TOTAL AWARD: {financials.total} SP
                                                <span className="opacity-70 ml-10">(Pay: {financials.payAward} | Support: {terms.support.type}/{terms.support.pct * 100}% | Salvage: {financials.salvageAward} @ {financials.salvageCoverage * 100}%)</span>
                                            </div>
                                        );
                                    })()}
                                </div>
                                {notices[`${det.id}-award`] && (
                                    <div className="restricted-text theme-green xs-text mr-10 blink-slow">{notices[`${det.id}-award`]}</div>
                                )}
                                {errorStates[`${det.id}-award`] && (
                                    <div className="restricted-text xs-text mr-10 blink-slow" style={{ color: 'var(--terminal-alert)' }}>{errorStates[`${det.id}-award`]}</div>
                                )}
                                <button
                                    className="mode-btn theme-green sm-text"
                                    style={{ padding: '4px 15px' }}
                                    onClick={() => handleAwardToDetachment(det.id, det.mercenaryCommandId)}
                                    disabled={
                                        loadingStates[`${det.id}-award`] ||
                                        isInputInvalid(state.detachmentAars[det.id]?.salvageValue) || 
                                        state.detachmentAars[det.id]?.salvageValue === '-' ||
                                        isInputInvalid(state.detachmentAars[det.id]?.customAward) || 
                                        state.detachmentAars[det.id]?.customAward === '-'
                                    }
                                >
                                    {loadingStates[`${det.id}-award`] ? '[ COMMITTING... ]' : '[ COMMIT AWARD ]'}
                                </button>
                            </div>
                        </section>

                        <div className="grid-2-col" style={{ gap: '20px' }}>
                            <div>
                                <h5 className="restricted-text mb-10">COMBAT UNITS</h5>
                                <table className="tactical-table sm-text">
                                    <thead>
                                        <tr>
                                            <th className="text-left">UNIT</th>
                                            <th title="Unit Operational Status">STATUS</th>
                                            <th title="Rearm Ammunition">AMMO</th>
                                            <th className="text-right">COST</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {det.units?.map((u: any) => {
                                            const uState = state.unitStates[u.id] || { status: u.status || unitStatuses[0], ammo: 0 };
                                            const ammoTons = parseNumericInput(uState.ammo);
                                            const terms = getDetachmentTerms(det.id);
                                            const financials = calculateUnitFinancials(u, uState.status, repairRules, unitStatuses);
                                            const { baseRepairCost, baseReplacementValue, isTrulyDestroyed, techTax } = financials;

                                            let displayAmount = 0;
                                            let tooltip = '';
                                            let ammoInputDisabled = false;

                                            if (isTrulyDestroyed) {
                                                if (terms.support.type === 'BATTLE') {
                                                    displayAmount = -1 * Math.ceil(baseReplacementValue * terms.support.pct);
                                                    tooltip = `Replacement Value: ${financials.bv} BV * 0.5${techTax !== 1 ? ` * ${techTax} (Tech)` : ''} = ${baseReplacementValue} SP\n` +
                                                        `Battle Support: ${terms.support.pct * 100}% = +${displayAmount} SP`;
                                                } else {
                                                    displayAmount = 0;
                                                    tooltip = `Replacement Value: ${baseReplacementValue} SP\n` +
                                                        `${terms.support.type} terms do not provide unit replacement pay.`;
                                                }
                                                ammoInputDisabled = true;
                                            } else {
                                                const repairCost = Math.ceil(baseRepairCost);
                                                const ammoCost = ammoTons * ammoCostPerTon;
                                                const totalRawCost = repairCost + ammoCost;

                                                if (terms.support.type === 'BATTLE') {
                                                    displayAmount = 0;
                                                } else {
                                                    displayAmount = Math.ceil(totalRawCost * (1 - terms.support.pct)) * -1;
                                                }

                                                tooltip = `Base Repair: ${financials.tonnage}T * ${financials.damageMultiplier} (Status)${financials.unitModifier !== 1 ? ` * ${financials.unitModifier} (Type)` : ''}${techTax !== 1 ? ` * ${techTax} (Tech)` : ''} = ${repairCost} SP\n` +
                                                    `Ammo: ${uState.ammo}T x ${ammoCostPerTon} SP/T = ${ammoTons * ammoCostPerTon} SP\n` +
                                                    `Coverage: ${terms.support.type === 'BATTLE' ? '100% (BATTLE)' : `${terms.support.pct * 100}% (STRAIGHT)`}`;
                                            }

                                            const unitNoticeKey = `${u.id}-logistics`;
                                            return (
                                                <tr key={u.id}>
                                                    <td>{u.model} {u.variant}</td>
                                                    <td>
                                                        <div className="status-bar theme-red cursor-pointer" style={{ padding: '0 5px' }}>
                                                            <select
                                                                className="table-input w-100"
                                                                style={{ border: 'none' }}
                                                                value={uState.status}
                                                                onChange={(e) => {
                                                                    const newStatus = e.target.value;
                                                                    dispatch({ type: 'UPDATE_UNIT_STATE', unitId: u.id, patch: { status: newStatus } });
                                                                    updateUnit({ variables: { id: u.id, input: { status: newStatus } } });
                                                                }}
                                                                title="Select unit status"
                                                            >
                                                                {unitStatuses.map((s: string) => <option key={s} value={s}>{s}</option>)}
                                                            </select>
                                                        </div>
                                                    </td>
                                                    <td className="text-center">
                                                        {isTrulyDestroyed ? (
                                                            <span className="restricted-text">N/A</span>
                                                        ) : (
                                                            <div className={`status-bar theme-red ${isInputInvalid(uState.ammo) ? 'invalid' : ''}`} style={{ padding: '0 5px', width: '50px', margin: '0 auto' }}>
                                                                <input
                                                                    type="number"
                                                                    className="table-input w-100 text-center"
                                                                    style={{ border: 'none' }}
                                                                    value={uState.ammo}
                                                                    onChange={(e) => {
                                                                        dispatch({ type: 'UPDATE_UNIT_STATE', unitId: u.id, patch: { ammo: e.target.value } });
                                                                    }}
                                                                    title="Enter tons of ammunition to rearm"
                                                                    disabled={ammoInputDisabled}
                                                                />
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="text-right" title={tooltip}>{displayAmount > 0 ? `+${displayAmount}` : displayAmount}</td>
                                                    <td className="text-right">
                                                        <button
                                                            className="mode-btn sm-text"
                                                            onClick={() => handleProcessUnit(det.id, det.mercenaryCommandId, u)}
                                                            disabled={loadingStates[unitNoticeKey] || isInputInvalid(uState.ammo) || uState.ammo === '-'}
                                                            title="Commit unit logistics"
                                                        >
                                                            {loadingStates[unitNoticeKey] ? '...' : 'COMMIT'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                {det.units?.map((u: any) => {
                                    const isTrulyDestroyed = (state.unitStates[u.id]?.status || u.status) === unitStatuses[5];
                                    return notices[`${u.id}-logistics`] && !isTrulyDestroyed && (
                                        <div key={`notice-${u.id}`} className="restricted-text theme-green xs-text mt-5 text-center">{u.model}: {notices[`${u.id}-logistics`]}</div>
                                    );
                                })}
                                {det.units?.map((u: any) => {
                                    const isTrulyDestroyed = (state.unitStates[u.id]?.status || u.status) === unitStatuses[5];
                                    return errorStates[`${u.id}-logistics`] && !isTrulyDestroyed && (
                                        <div key={`error-${u.id}`} className="restricted-text xs-text mt-5 text-center blink-slow" style={{ color: 'var(--terminal-alert)' }}>{u.model}: {errorStates[`${u.id}-logistics`]}</div>
                                    );
                                })}
                            </div>

                            <div>
                                <h5 className="restricted-text mb-10">PILOTS</h5>
                                <table className="tactical-table sm-text">
                                    <thead>
                                        <tr>
                                            <th className="text-left">PILOT</th>
                                            <th>INJURIES</th>
                                            <th>HEALED</th>
                                            <th className="text-right">COST</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody> {/* Use pilot.id for key */}
                                        {det.pilots?.map((p: any) => {
                                            const pState = state.pilotStates[p.id] || { injuries: p.wounds || 0, healed: 0 };
                                            const terms = getDetachmentTerms(det.id);
                                            const financials = calculatePilotFinancials(pState, terms, injuryHealCost);
                                            const noticeKey = `${p.id}-medical`;

                                            const tooltip = `Medical Cost: ${financials.healed} injuries x ${financials.injuryHealCost} SP = ${financials.rawMedicalCost} SP\n` +
                                                `Support: ${financials.supportType === 'BATTLE' ? '100% (BATTLE)' : `${financials.supportPct * 100}% (${financials.supportType})`}`;

                                            const pilotDisplayCost = financials.mercenaryCostSigned;
                                            return (
                                                <tr key={p.id}>
                                                    <td>{p.name}</td>
                                                    <td>
                                                        <div className="status-bar theme-red cursor-pointer" style={{ padding: '0 5px' }}>
                                                            <select
                                                                className="table-input w-100"
                                                                style={{ border: 'none' }}
                                                                value={pState.injuries}
                                                                onChange={(e) => {
                                                                    const val = parseInt(e.target.value);
                                                                    dispatch({ type: 'UPDATE_PILOT_STATE', pilotId: p.id, patch: { injuries: val } });
                                                                    updatePilot({ variables: { id: p.id, input: { wounds: val } } });
                                                                }}
                                                                title="Select total pilot injuries"
                                                            >
                                                                {[0, 1, 2, 3, 4, 5, 6].map(v => <option key={v} value={v}>{v === 6 ? 'FATAL' : v}</option>)}
                                                            </select>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="status-bar theme-red cursor-pointer" style={{ padding: '0 5px' }}>
                                                            <select
                                                                className="table-input w-100"
                                                                style={{ border: 'none' }}
                                                                value={pState.healed}
                                                                onChange={(e) => {
                                                                    dispatch({ type: 'UPDATE_PILOT_STATE', pilotId: p.id, patch: { healed: parseInt(e.target.value) } });
                                                                }}
                                                                title="Select number of injuries healed"
                                                            >
                                                                {[...Array(healMonthLimit + 1).keys()].map(v => <option key={v} value={v}>{v}</option>)}
                                                            </select>
                                                        </div>
                                                    </td>
                                                    <td className="text-right" title={tooltip}>{pilotDisplayCost > 0 ? `+${pilotDisplayCost}` : pilotDisplayCost}</td>
                                                    <td className="text-right">
                                                        <button
                                                            className="mode-btn sm-text"
                                                            onClick={() => handleProcessPilot(det.id, det.mercenaryCommandId, p)} // The actual ledger entry amount is calculated inside handleProcessPilot
                                                            disabled={loadingStates[noticeKey]}
                                                            title="Commit pilot healing"
                                                        >
                                                            {loadingStates[noticeKey] ? '...' : 'COMMIT'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                {det.pilots?.map((p: any) => notices[`${p.id}-medical`] && (
                                    <div key={p.id} className="restricted-text theme-green xs-text mt-5 text-center">
                                        {p.name}: {notices[`${p.id}-medical`]}
                                    </div>
                                ))}
                                {det.pilots?.map((p: any) => errorStates[`${p.id}-medical`] && (
                                    <div key={p.id} className="restricted-text xs-text mt-5 text-center blink-slow" style={{ color: 'var(--terminal-alert)' }}>
                                        {p.name}: {errorStates[`${p.id}-medical`]}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {overlay && (
                <TerminalOverlay
                    title={overlay.title}
                    message={overlay.message}
                    variant={overlay.variant}
                    onConfirm={overlay.onConfirm}
                    onCancel={overlay.onCancel}
                    themeClass="theme-red"
                    showInputField={overlay.showInputField}
                    inputPlaceholder={overlay.inputPlaceholder}
                    inputInitialValue={overlay.inputInitialValue}
                    inputType={overlay.inputType}
                    inputLabel={overlay.inputLabel}
                >
                    {overlay.children}
                </TerminalOverlay>
            )}

            {showProcureEditor && procureAssetData && procureTargetDetachment && (
                <CombatUnitEditor
                    mode="create"
                    commandId={procureTargetDetachment.mercenaryCommandId}
                    detachmentId={procureTargetDetachment.id}
                    availableSP={procureTargetDetachment.totalSupportPoints}
                    unit={{ ...procureAssetData, id: '', status: (metaData?.publicCampaignMetadata as any)?.unitStatuses?.[0] || 'OPERATIONAL' }}
                    unitTypes={(metaData?.publicCampaignMetadata as any)?.unitTypes || ['BM', 'CV', 'PM', 'IM', 'BA', 'CI']}
                    unitStatuses={(metaData?.publicCampaignMetadata as any)?.unitStatuses || FALLBACK_STATUSES}
                    techBases={(metaData?.publicCampaignMetadata as any)?.techBases || ['Inner Sphere', 'Clan', 'Mixed']}
                    onSave={handleProcureSave}
                    onCancel={handleProcureCancel}
                    overridePrice={procureAssetData.overridePrice}
                />
            )}

            {showHireEditor && hirePilotData && hireTargetDetachment && (
                <PilotEditor
                    mode="create"
                    commandId={hireTargetDetachment.mercenaryCommandId}
                    detachmentId={hireTargetDetachment.id}
                    availableSP={hireTargetDetachment.totalSupportPoints}
                    pilot={{ ...hirePilotData, id: '' }}
                    onSave={handleHireSave}
                    onCancel={handleHireCancel}
                    overridePrice={hirePilotData.overridePrice}
                    campaignHireCost={campaign.hireNamedPilotCost}
                />
            )}

            <style>{`
                /* Custom Scrollbar Styles for After Action Report (Red Theme) */
                .aar-bg-overlay::-webkit-scrollbar { width: 8px; }
                .aar-bg-overlay::-webkit-scrollbar-track { 
                    background: var(--terminal-bg, #050705);
                    border-radius: 10px;
                }
                .aar-bg-overlay::-webkit-scrollbar-thumb {
                    background-color: var(--terminal-red);
                    border-radius: 10px;
                    border: 2px solid var(--terminal-bg, #050705);
                }
                .aar-bg-overlay {
                    scrollbar-width: thin;
                    scrollbar-color: var(--terminal-red) var(--terminal-bg, #050705);
                }

                .w-40px { width: 40px; }
                .sm-text { font-size: 0.75rem; }
                .xs-text { font-size: 0.65rem; }
                .theme-red { --accent-dim: rgba(255, 51, 51, 0.2); }
                .tactical-panel, .dashboard-section {
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
                .theme-red .status-bar:focus-within { border-color: var(--terminal-red); box-shadow: 0 0 8px rgba(255, 51, 51, 0.3); }

                .status-bar input.table-input, .status-bar select.table-input, .status-bar textarea.table-input {
                    background: transparent !important;
                    color: inherit !important;
                    outline: none !important;
                    border: none !important;
                    box-shadow: none !important;
                }

                /* Markdown Header Styling for Terminal Aesthetic */
                .markdown-preview :is(h1, h2, h3, h4, h5, h6) {
                    color: var(--terminal-amber); /* Primary header color */
                    margin-top: 1em;
                    margin-bottom: 0.5em;
                    border-bottom: 1px dashed rgba(255, 176, 0, 0.3);
                    padding-bottom: 0.2em;
                    font-family: inherit;
                    text-transform: uppercase;
                }
                .markdown-preview h1 { font-size: 1.4rem; color: var(--terminal-red); border-bottom: 2px solid var(--terminal-red); }
                .markdown-preview h2 { font-size: 1.2rem; border-bottom: 1px solid var(--terminal-amber); }
                .markdown-preview h3 { font-size: 1.1rem; }
                .markdown-preview h4 { font-size: 1.0rem; }
                .markdown-preview h5 { font-size: 0.9rem; }
                .markdown-preview h6 { font-size: 0.8rem; opacity: 0.8; }
                
                /* Ensure lists and paragraphs match the terminal look */
                .markdown-preview p { margin-bottom: 1em; line-height: 1.5; }
                .markdown-preview ul { padding-left: 20px; margin-bottom: 1em; list-style-type: square; }
            `}</style>
        </TerminalOverlay>
    );
};