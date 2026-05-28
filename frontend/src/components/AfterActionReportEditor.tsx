import React, { useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { TerminalOverlay } from './TerminalOverlay';
import { ADD_LEDGER_ENTRY } from './LedgerEntryForm';
import { CombatUnit, Pilot } from '../types/global.d';
import { UNIT_STATUS_OPTIONS as FALLBACK_STATUSES } from './Rules';
import { parseMultiplier, parseSupportTerms } from '../util/contractUtils';

const GET_METADATA = gql`
  query GetMetadata {
    publicCampaignMetadata {
      unitStatuses
      repairRules {
        armorMultiplier
        internalMultiplier
        crippledMultiplier
        destroyedMultiplier
        nonMechModifier
        mixedTechModifier
        clanTechModifier
      }
    }
  }
`;

interface MetadataData {
    publicCampaignMetadata: {
        unitStatuses: string[];
        repairRules: {
            armorMultiplier: number;
            internalMultiplier: number;
            crippledMultiplier: number;
            destroyedMultiplier: number;
            nonMechModifier: number;
            mixedTechModifier: number;
            clanTechModifier: number;
        };
    };
}

interface DetachmentAarState {
    selectedContractId: string;
    selectedLevel: number;
    outcomeMultiplier: number;
    salvageValue: number;
    customAward: number;
}

interface AfterActionReportEditorProps {
    campaign: any;
    track: any;
    onClose: () => void | Promise<void>;
    onLedgerEntryAdded?: () => void | Promise<void>;
}

const AMMO_COST_PER_TON = 10;
const INJURY_HEAL_COST = 30;

// New helper function to calculate financial implications of a unit's status
const calculateUnitFinancials = (unit: CombatUnit, status: string, rules: any, statuses: string[]): {
    baseRepairCost: number;
    baseReplacementValue: number;
    damageMultiplier: number;
    unitModifier: number;
    techTax: number;
    isTrulyDestroyed: boolean;
} => {
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
        damageMultiplier,
        unitModifier,
        techTax,
        isTrulyDestroyed,
    };
};

export const AfterActionReportEditor: React.FC<AfterActionReportEditorProps> = ({ campaign, track, onClose, onLedgerEntryAdded }) => {
    const [addLedgerEntry] = useMutation(ADD_LEDGER_ENTRY);
    const { loading: metadataLoading, data: metaData } = useQuery<MetadataData>(GET_METADATA);

    const [detachmentAars, setDetachmentAars] = useState<Record<string, DetachmentAarState>>({});
    const [unitStates, setUnitStates] = useState<Record<string, { status: string, ammo: number }>>({});
    const [pilotStates, setPilotStates] = useState<Record<string, { injuries: number, healed: number }>>({});
    const [notices, setNotices] = useState<Record<string, string>>({});
    const [errorStates, setErrorStates] = useState<Record<string, string>>({});
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
    const [isFinalizing, setIsFinalizing] = useState(false);

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

    useEffect(() => {
        const initialAars: Record<string, DetachmentAarState> = {};
        campaign.participatingDetachments?.forEach((det: any) => {
            initialAars[det.id] = {
                selectedContractId: campaign.contracts?.[0]?.id || '',
                selectedLevel: 1,
                outcomeMultiplier: 1.0,
                salvageValue: 0,
                customAward: 0
            };
        });
        setDetachmentAars(initialAars);
    }, [campaign, track]);

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

    const unitStatuses = metaData?.publicCampaignMetadata?.unitStatuses || FALLBACK_STATUSES;
    const repairRules = campaign?.repairRules || metaData?.publicCampaignMetadata?.repairRules;

    const getDetachmentTerms = (detId: string) => {
        const state = detachmentAars[detId] || { selectedContractId: '', selectedLevel: 1, outcomeMultiplier: 1, salvageValue: 0, customAward: 0 };
        const contract = campaign.contracts?.find((c: any) => c.id === state.selectedContractId) || campaign;

        return {
            support: parseSupportTerms(contract.supportTerms || ''),
            salvageCoverage: parseMultiplier(contract.salvageTerms || ''),
            payRate: contract.payRate || 1.0,
            ...state
        };
    };

    const handleAwardToDetachment = async (detId: string, cmdId: string) => {
        const noticeKey = `${detId}-award`;
        const terms = getDetachmentTerms(detId);
        const totalPayAward = Math.round((campaign.combatPay || 0) * terms.outcomeMultiplier * terms.payRate * terms.selectedLevel);
        const totalSalvageAward = Math.round(terms.salvageValue * terms.salvageCoverage);
        const total = totalPayAward + totalSalvageAward + terms.customAward;

        if (total === 0) return;

        setErrorStates(prev => {
            const next = { ...prev };
            delete next[noticeKey];
            return next;
        });
        setLoadingStates(prev => ({ ...prev, [noticeKey]: true }));

        const description = `AAR AWARD: ${track.trackName} (PAY x${terms.outcomeMultiplier} [LVL ${terms.selectedLevel}], SALVAGE ${terms.salvageCoverage * 100}%)`;

        setDetachmentAars(prev => ({
            ...prev,
            [detId]: { ...prev[detId], salvageValue: 0, customAward: 0 }
        }));

        try {
            await addLedgerEntry({
                variables: {
                    commandId: cmdId,
                    detachmentId: detId,
                    amount: total,
                    description: description,
                    monthIndex: track.monthIndex || 1,
                    campaignName: campaign.name
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

    const handleProcessUnit = async (detId: string, cmdId: string, unit: CombatUnit) => {
        const noticeKey = `${unit.id}-logistics`;
        const terms = getDetachmentTerms(detId);
        const state = unitStates[unit.id] || { status: unitStatuses[0], ammo: 0 };

        const { baseRepairCost, baseReplacementValue, isTrulyDestroyed } = calculateUnitFinancials(unit, state.status, repairRules, unitStatuses);

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
            const ammoCost = state.ammo * AMMO_COST_PER_TON;
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

        if (finalAmount === 0) return;
        setErrorStates(prev => {
            const next = { ...prev };
            delete next[noticeKey];
            return next;
        });
        setLoadingStates(prev => ({ ...prev, [noticeKey]: true }));

        try {
            await addLedgerEntry({
                variables: {
                    commandId: cmdId,
                    detachmentId: detId,
                    amount: finalAmount,
                    description: description,
                    monthIndex: track.monthIndex || 1,
                    campaignName: campaign.name
                }
            });
            await onLedgerEntryAdded?.();
            addNotice(noticeKey, `✓ ${isTrulyDestroyed ? 'REPLACEMENT' : 'LOGISTICS'} COMMITTED: ${Math.abs(finalAmount)} SP`);
        } catch (err) {
            setErrorStates(prev => ({ ...prev, [noticeKey]: `${isTrulyDestroyed ? 'REPLACEMENT' : 'LOGISTICS'} FAILURE: DATA UPLOAD ABORTED.` }));
            console.error(`${isTrulyDestroyed ? 'Replacement' : 'Logistics'} error:`, err);
        } finally {
            setLoadingStates(prev => ({ ...prev, [noticeKey]: false }));
        }
    };

    const handleProcessPilot = async (detId: string, cmdId: string, pilot: Pilot) => {
        const noticeKey = `${pilot.id}-medical`;
        const terms = getDetachmentTerms(detId);
        const state = pilotStates[pilot.id] || { injuries: 0, healed: 0 };
        const totalCost = state.healed * INJURY_HEAL_COST;

        let finalCost = 0;
        if (terms.support.type === 'BATTLE') {
            // Battle terms cover 100% of medical
            finalCost = 0;
        } else if (terms.support.type === 'STRAIGHT') {
            finalCost = Math.round(totalCost * (1 - terms.support.pct)) * -1;
        } else {
            finalCost = totalCost * -1;
        }

        if (finalCost === 0) return;

        setErrorStates(prev => {
            const next = { ...prev };
            delete next[noticeKey];
            return next;
        });
        setLoadingStates(prev => ({ ...prev, [noticeKey]: true }));

        try {
            await addLedgerEntry({
                variables: {
                    commandId: cmdId,
                    detachmentId: detId,
                    amount: finalCost,
                    description: `AAR MEDICAL: ${pilot.name} - ${track.trackName} (${terms.support.type} ${terms.support.pct * 100}%)`,
                    monthIndex: track.monthIndex || 1,
                    campaignName: campaign.name
                }
            });
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
            await onClose();
        } finally {
            setIsFinalizing(false);
        }
    };

    return (
        <TerminalOverlay
            title={`AFTER ACTION REPORT: ${track.trackName.toUpperCase()}`}
            message="OPERATIONAL DEBRIEFING & LOGISTICS RECONCILIATION"
            onConfirm={handleFinalize}
            confirmLabel={isFinalizing ? "SYNCHRONIZING..." : "FINALIZE REPORT"}
            themeClass="theme-red"
            loading={isFinalizing}
        >
            <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}>
                {campaign.participatingDetachments?.map((det: any) => (
                    <div key={det.id} className="dashboard-section mb-20" style={{ border: '1px solid var(--accent-dim)', padding: '15px', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                        <div className="flex-between mb-15" style={{ borderBottom: '1px solid var(--accent-dim)', paddingBottom: '8px' }}>
                            <h4 className="terminal-text" style={{ margin: 0 }}>{det.name.toUpperCase()}</h4>
                            <span className="restricted-text sm-text">{det.mercenaryCommandName}</span>
                        </div>

                        <section className="mb-20">
                            <h5 className="restricted-text mb-10">MISSION AWARDS</h5>
                            <div className="grid-5-col flex-gap-10">
                                <div>
                                    <label className="xs-text opacity-70">CONTRACT</label>
                                    <select
                                        className="table-input w-100"
                                        value={detachmentAars[det.id]?.selectedContractId}
                                        onChange={(e) => { const val = e.target.value; setDetachmentAars(prev => ({ ...prev, [det.id]: { ...prev[det.id], selectedContractId: val } })); }}
                                        title="Select contract for this detachment"
                                    >
                                        {campaign.contracts?.map((c: any) => (
                                            <option key={c.id} value={c.id}>{c.primaryContract ? 'PRIMARY' : 'OPPOSITION'} ({c.employerCategory})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="xs-text opacity-70">LEVEL</label>
                                    <select
                                        className="table-input w-100"
                                        value={detachmentAars[det.id]?.selectedLevel}
                                        onChange={(e) => { const val = parseInt(e.target.value); setDetachmentAars(prev => ({ ...prev, [det.id]: { ...prev[det.id], selectedLevel: val } })); }}
                                        title="Select deployment level"
                                    >
                                        {[1, 2, 3].map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="xs-text opacity-70">OUTCOME</label>
                                    <select
                                        className="table-input w-100"
                                        value={detachmentAars[det.id]?.outcomeMultiplier}
                                        onChange={(e) => { const val = parseFloat(e.target.value); setDetachmentAars(prev => ({ ...prev, [det.id]: { ...prev[det.id], outcomeMultiplier: val } })); }}
                                        title="Select track outcome multiplier"
                                    >
                                        <option value="0.5">UNSUCCESSFUL (50%)</option>
                                        <option value="1">SUCCESSFUL (100%)</option>
                                        <option value="1.5">SUCCESSFUL W/ BONUS (150%)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="xs-text opacity-70">SALVAGE (SP)</label>
                                    <input
                                        type="number"
                                        className="table-input w-100"
                                        value={detachmentAars[det.id]?.salvageValue}
                                        onChange={(e) => { const val = parseInt(e.target.value) || 0; setDetachmentAars(prev => ({ ...prev, [det.id]: { ...prev[det.id], salvageValue: val } })); }}
                                        title="Enter raw salvage value"
                                    />
                                </div>
                                <div>
                                    <label className="xs-text opacity-70">MISC (SP)</label>
                                    <input
                                        type="number"
                                        className="table-input w-100"
                                        value={detachmentAars[det.id]?.customAward}
                                        onChange={(e) => { const val = parseInt(e.target.value) || 0; setDetachmentAars(prev => ({ ...prev, [det.id]: { ...prev[det.id], customAward: val } })); }}
                                        title="Enter misc adjustment"
                                    />
                                </div>
                            </div>

                            <div className="flex-between mt-10">
                                <div className="status-bar theme-green sm-text flex-grow mr-10" style={{ padding: '4px 10px' }}>
                                    {(() => {
                                        const t = getDetachmentTerms(det.id);
                                        const pay = Math.round((campaign.combatPay || 0) * t.outcomeMultiplier * t.payRate * t.selectedLevel);
                                        const salv = Math.round(t.salvageValue * t.salvageCoverage);
                                        return (
                                            <>
                                                TOTAL AWARD: {pay + salv + t.customAward} SP
                                                <span className="opacity-70 ml-10">(Pay: {pay} | Salvage: {salv} @ {t.salvageCoverage * 100}%)</span>
                                            </>
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
                                    disabled={loadingStates[`${det.id}-award`]}
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
                                            const state = unitStates[u.id] || { status: u.status || unitStatuses[0], ammo: 0 };
                                            const terms = getDetachmentTerms(det.id);
                                            const { baseRepairCost, baseReplacementValue, techTax, isTrulyDestroyed } = calculateUnitFinancials(u, state.status, repairRules, unitStatuses);

                                            let displayAmount = 0;
                                            let tooltip = '';
                                            let ammoInputDisabled = false;

                                            if (isTrulyDestroyed) {
                                                if (terms.support.type === 'BATTLE') {
                                                    displayAmount = -1 * Math.ceil(baseReplacementValue * terms.support.pct);
                                                    tooltip = `Replacement Value: ${u.bv} BV * 0.5${techTax !== 1 ? ` * ${techTax} (Tech)` : ''} = ${baseReplacementValue} SP\n` +
                                                        `Battle Support: ${terms.support.pct * 100}% = +${displayAmount} SP`;
                                                } else {
                                                    displayAmount = 0;
                                                    tooltip = `Replacement Value: ${baseReplacementValue} SP\n` +
                                                        `${terms.support.type} terms do not provide unit replacement pay.`;
                                                }
                                                ammoInputDisabled = true;
                                            } else {
                                                const repairCost = Math.ceil(baseRepairCost);
                                                const ammoCost = state.ammo * AMMO_COST_PER_TON;
                                                const totalRawCost = repairCost + ammoCost;

                                                if (terms.support.type === 'BATTLE') {
                                                    displayAmount = 0;
                                                } else {
                                                    displayAmount = Math.ceil(totalRawCost * (1 - terms.support.pct)) * -1;
                                                }

                                                tooltip = `Base Repair: ${repairCost} SP\n` +
                                                    `Ammo: ${state.ammo}T x ${AMMO_COST_PER_TON} SP/T = ${state.ammo * AMMO_COST_PER_TON} SP\n` +
                                                    `Coverage: ${terms.support.type === 'BATTLE' ? '100% (BATTLE)' : `${terms.support.pct * 100}% (STRAIGHT)`}`;
                                            }

                                            const unitNoticeKey = `${u.id}-logistics`;
                                            return (
                                                <tr key={u.id}>
                                                    <td>{u.model} {u.variant}</td>
                                                    <td>
                                                        <select
                                                            className="inline-edit"
                                                            value={state.status}
                                                            onChange={(e) => {
                                                                setUnitStates(prev => ({
                                                                    ...prev,
                                                                    [u.id]: { ...state, status: e.target.value }
                                                                }));
                                                            }}
                                                            title="Select unit status"
                                                        >
                                                            {unitStatuses.map((s: string) => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    </td>
                                                    <td className="text-center">
                                                        {isTrulyDestroyed ? (
                                                            <span className="restricted-text">N/A</span>
                                                        ) : (
                                                            <input
                                                                type="number"
                                                                className="inline-edit w-40px"
                                                                value={state.ammo}
                                                                onChange={(e) => {
                                                                    setUnitStates(prev => ({
                                                                        ...prev,
                                                                        [u.id]: { ...state, ammo: parseInt(e.target.value) || 0 }
                                                                    }));
                                                                }}
                                                                title="Enter tons of ammunition to rearm"
                                                                disabled={ammoInputDisabled}
                                                            />
                                                        )}
                                                    </td>
                                                    <td className="text-right" title={tooltip}>{displayAmount > 0 ? `+${displayAmount}` : displayAmount}</td>
                                                    <td className="text-right">
                                                        <button
                                                            className="mode-btn sm-text"
                                                            onClick={() => handleProcessUnit(det.id, det.mercenaryCommandId, u)}
                                                            disabled={loadingStates[unitNoticeKey]}
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
                                    const isTrulyDestroyed = (unitStates[u.id]?.status || u.status) === unitStatuses[5];
                                    return notices[`${u.id}-logistics`] && !isTrulyDestroyed && (
                                        <div key={`notice-${u.id}`} className="restricted-text theme-green xs-text mt-5 text-center">{u.model}: {notices[`${u.id}-logistics`]}</div>
                                    );
                                })}
                                {det.units?.map((u: any) => {
                                    const isTrulyDestroyed = (unitStates[u.id]?.status || u.status) === unitStatuses[5];
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
                                            const state = pilotStates[p.id] || { injuries: 0, healed: 0 };
                                            const terms = getDetachmentTerms(det.id);
                                            const rawMedicalCost = state.healed * INJURY_HEAL_COST;
                                            const noticeKey = `${p.id}-medical`;

                                            let pilotDisplayCost = 0;
                                            if (terms.support.type === 'BATTLE') {
                                                // Battle terms cover 100% of medical, so display 0 cost to mercenary
                                                pilotDisplayCost = 0;
                                            } else if (terms.support.type === 'STRAIGHT') {
                                                // Straight terms cover a percentage, so mercenary pays (1 - pct)
                                                pilotDisplayCost = Math.round(rawMedicalCost * (1 - terms.support.pct));
                                            } else {
                                                // None covers 0%, so mercenary pays full raw cost
                                                pilotDisplayCost = Math.round(rawMedicalCost);
                                            }
                                            return (
                                                <tr key={p.id}>
                                                    <td>{p.name}</td>
                                                    <td>
                                                        <select
                                                            className="inline-edit"
                                                            value={state.injuries}
                                                            onChange={(e) => {
                                                                setPilotStates(prev => ({
                                                                    ...prev,
                                                                    [p.id]: { ...state, injuries: parseInt(e.target.value) }
                                                                }));
                                                            }}
                                                            title="Select total pilot injuries"
                                                        >
                                                            {[0, 1, 2, 3, 4, 5, 6].map(v => <option key={v} value={v}>{v}</option>)}
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <select
                                                            className="inline-edit"
                                                            value={state.healed}
                                                            onChange={(e) => {
                                                                setPilotStates(prev => ({
                                                                    ...prev,
                                                                    [p.id]: { ...state, healed: parseInt(e.target.value) }
                                                                }));
                                                            }}
                                                            title="Select number of injuries healed"
                                                        >
                                                            {[0, 1, 2].map(v => <option key={v} value={v}>{v}</option>)}
                                                        </select>
                                                    </td>
                                                    <td className="text-right">{pilotDisplayCost}</td>
                                                    <td className="text-right">
                                                        <button
                                                            className="mode-btn sm-text"
                                                            onClick={() => handleProcessPilot(det.id, det.mercenaryCommandId, p)} // The actual ledger entry amount is calculated inside handleProcessPilot
                                                            disabled={loadingStates[noticeKey] || pilotDisplayCost === 0}
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

            <style>{`
                .w-40px { width: 40px; }
                .sm-text { font-size: 0.75rem; }
                .xs-text { font-size: 0.65rem; }
                .theme-red { --accent-dim: rgba(255, 51, 51, 0.2); }
            `}</style>
        </TerminalOverlay>
    );
};