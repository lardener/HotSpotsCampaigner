import React, { useState, useEffect, useMemo } from 'react';
import { useMutation } from '@apollo/client/react';
import { TerminalOverlay } from './TerminalOverlay';
import { Pilot, PilotUpdateInput } from '../types/global.d';
import { HIRE_PILOT, UPDATE_PILOT } from '../types/operations';
import { ADD_LEDGER_ENTRY } from '../types/operations';
import { PilotBackground } from './PilotBackground';
import { gunneryThresholds, pilotingThresholds, edgeTokensThresholds, edgeAbilityThresholds } from '../constants/pilotThresholds';
import { recalcDerived } from '../util/pilotCalculations';

interface PilotEditorProps {
    pilot?: Pilot | null;
    commandId: string;
    detachmentId?: string | null;
    mode: 'create' | 'edit';
    onSave: (pilot: Pilot) => void;
    onCancel: () => void;
    availableSP?: number;
    overridePrice?: number;
    campaignHireCost?: number;
}

export const PilotEditor: React.FC<PilotEditorProps> = ({
    pilot,
    commandId,
    detachmentId,
    mode,
    onSave,
    onCancel,
    availableSP,
    overridePrice,
    campaignHireCost
}) => {
    const UNIT_TYPES = ['BM', 'CV', 'PM', 'IM', 'BA', 'CI'];

    const createDefaultPilot = (): Pilot => ({
        id: '',
        name: 'NEW PILOT',
        gunnery: 4,
        piloting: 5,
        asSkill: 4,
        edgeTokensSkill: 1,
        edgeAbilitySkill: 0,
        edgeAbilities: '',
        unitType: 'BM',
        wounds: 0,
        handicap: 0,
        totalSpEarned: 0,
        gunnerySpEarned: 0,
        pilotingSpEarned: 0,
        edgeTokensSpEarned: 0,
        edgeAbilitySpEarned: 0,
        detachmentId: detachmentId ?? null
    });

    const [formData, setFormData] = useState<Pilot>(() => recalcDerived(pilot ? {
        ...pilot,
        edgeTokensSkill: pilot.edgeTokensSkill ?? null,
        edgeAbilitySkill: pilot.edgeAbilitySkill ?? null,
        edgeAbilities: pilot.edgeAbilities ?? null,
        detachmentId: pilot.detachmentId ?? detachmentId ?? null
    } as Pilot : createDefaultPilot()));

    // Ensure form updates if the pilot prop changes or when initializing for a new detachment
    useEffect(() => {
        setFormData(recalcDerived(pilot ? {
            ...pilot,
            edgeTokensSkill: pilot.edgeTokensSkill ?? null,
            edgeAbilitySkill: pilot.edgeAbilitySkill ?? null,
            edgeAbilities: pilot.edgeAbilities ?? null,
            detachmentId: pilot.detachmentId ?? detachmentId ?? null
        } as Pilot : createDefaultPilot()));
    }, [pilot, detachmentId, mode]);

    const pilotOriginalTotalSp = useMemo(() => {
        if (!pilot) return 0;
        // Calculate actual SP currently allocated to skills to use as a reliable baseline
        return (pilot.gunnerySpEarned || 0) +
            (pilot.pilotingSpEarned || 0) +
            (pilot.edgeTokensSpEarned || 0) +
            (pilot.edgeAbilitySpEarned || 0);
    }, [pilot]);

    const [isSaving, setIsSaving] = useState(false);
    const [overlay, setOverlay] = useState<{
        title: string;
        message: string;
        onConfirm: (val?: string) => void | Promise<void>;
        variant?: 'alert' | 'info';
        children?: React.ReactNode;
        showInputField?: boolean;
        inputPlaceholder?: string;
        inputInitialValue?: string;
        inputType?: string;
        inputLabel?: string;
    } | null>(null);

    const [hirePilot] = useMutation(HIRE_PILOT);
    const [updatePilot] = useMutation(UPDATE_PILOT);
    const [addLedgerEntry] = useMutation(ADD_LEDGER_ENTRY);

    const hiringPrice = useMemo(() => {
        if (overridePrice !== undefined) {
            return overridePrice;
        }
        if (campaignHireCost !== undefined) {
            return campaignHireCost;
        }
        // Fallback to a default from Rules.ts if needed, or a hardcoded value
        // For now, let's assume a default if no campaign cost or override is present.
        return 150; // Example default, should ideally come from global metadata or Rules.ts
    }, [overridePrice, campaignHireCost]);

    const trainingCost = useMemo(() => {
        if (mode !== 'edit' || !pilot) return 0;
        const currentTotal = formData.totalSpEarned || 0;
        return currentTotal - pilotOriginalTotalSp;
    }, [mode, pilotOriginalTotalSp, formData.totalSpEarned]);

    const handleInputChange = (field: keyof Pilot, value: any) => {
        const isNumeric = ['gunnery', 'piloting', 'asSkill', 'wounds', 'handicap', 'totalSpEarned', 'gunnerySpEarned', 'pilotingSpEarned', 'edgeTokensSpEarned', 'edgeAbilitySpEarned'].includes(field);
        setFormData(prev => {
            const next = { ...prev, [field]: isNumeric ? parseInt(value) || 0 : value } as Pilot;
            const updated = recalcDerived(next);

            // Enforce gunnery/piloting distance constraint after recomputation
            if (Math.abs(updated.gunnery - updated.piloting) > 2) {
                setOverlay({
                    title: 'VALIDATION ERROR',
                    message: 'GUNNERY AND PILOTING SKILL CANNOT DIFFER BY MORE THAN 2 POINTS.',
                    variant: 'alert',
                    onConfirm: () => setOverlay(null)
                });
                return prev;
            }

            return updated;
        });
    };

    const handleSave = async (isTraining: boolean = false) => {
        // Validation
        if (!formData.name.trim()) {
            setOverlay({
                title: "VALIDATION ERROR",
                message: "PILOT DESIGNATION REQUIRED. ENTER CALLSIGN.",
                variant: 'alert',
                onConfirm: () => setOverlay(null)
            });
            return;
        }

        if (formData.gunnery < 0 || formData.gunnery > 12) {
            setOverlay({
                title: "VALIDATION ERROR",
                message: "GUNNERY SKILL MUST BE BETWEEN 0 AND 12.",
                variant: 'alert',
                onConfirm: () => setOverlay(null)
            });
            return;
        }

        if (formData.piloting < 0 || formData.piloting > 12) {
            setOverlay({
                title: "VALIDATION ERROR",
                message: "PILOTING SKILL MUST BE BETWEEN 0 AND 12.",
                variant: 'alert',
                onConfirm: () => setOverlay(null)
            });
            return;
        }

        if (formData.asSkill < 0 || formData.asSkill > 12) {
            setOverlay({
                title: "VALIDATION ERROR",
                message: "ALPHA STRIKE SKILL MUST BE BETWEEN 0 AND 12.",
                variant: 'alert',
                onConfirm: () => setOverlay(null)
            });
            return;
        }

        const allocatedSp = (formData.gunnerySpEarned || 0) +
            (formData.pilotingSpEarned || 0) +
            (formData.edgeTokensSpEarned || 0) +
            (formData.edgeAbilitySpEarned || 0);

        if (allocatedSp !== formData.totalSpEarned) {
            setOverlay({
                title: "VALIDATION ERROR",
                message: `ALLOCATED SKILL POINTS (${allocatedSp}) MUST EQUAL TOTAL SP EARNED (${formData.totalSpEarned}).`,
                variant: 'alert',
                onConfirm: () => setOverlay(null)
            });
            return;
        }

        if (isTraining && trainingCost > 0 && availableSP !== undefined && availableSP < trainingCost) {
            setOverlay({
                title: "INSUFFICIENT FUNDS",
                message: `COMMAND WARCHEST (${availableSP} SP) IS INSUFFICIENT FOR THIS TRAINING (${trainingCost} SP).`,
                variant: 'alert',
                onConfirm: () => setOverlay(null)
            });
            return;
        }

        if (mode === 'create' && availableSP !== undefined && availableSP < hiringPrice) {
            setOverlay({
                title: "INSUFFICIENT FUNDS",
                message: `COMMAND WARCHEST (${availableSP} SP) IS INSUFFICIENT FOR THIS RECRUITMENT (${hiringPrice} SP).`,
                variant: 'alert',
                onConfirm: () => setOverlay(null)
            });
            return;
        }

        setIsSaving(true);

        try {
            const input: PilotUpdateInput = {
                name: formData.name,
                gunnery: formData.gunnery,
                piloting: formData.piloting,
                asSkill: formData.asSkill,
                edgeTokensSkill: formData.edgeTokensSkill,
                edgeAbilitySkill: formData.edgeAbilitySkill,
                unitType: formData.unitType,
                wounds: formData.wounds,
                handicap: formData.handicap,
                totalSpEarned: formData.totalSpEarned,
                gunnerySpEarned: formData.gunnerySpEarned,
                pilotingSpEarned: formData.pilotingSpEarned,
                edgeTokensSpEarned: formData.edgeTokensSpEarned,
                edgeAbilitySpEarned: formData.edgeAbilitySpEarned,
                edgeAbilities: formData.edgeAbilities,
                detachmentId: formData.detachmentId || detachmentId || null
            };

            if (mode === 'create') {
                const result = await hirePilot({
                    variables: {
                        commandId,
                        input
                    }
                });

                if (result.data?.hirePilot && detachmentId) {
                    try {
                        await addLedgerEntry({
                            variables: {
                                commandId,
                                detachmentId,
                                input: {
                                    amount: -hiringPrice,
                                    description: `PILOT HIRE: ${formData.name}`.trim()
                                }
                            }
                        });
                    } catch (ledgerErr) { console.error("Ledger entry failed for pilot hire:", ledgerErr); }
                }
                if (result.data?.hirePilot) {
                    onSave(result.data.hirePilot);
                }
            } else if (mode === 'edit' && pilot?.id) {
                const result = await updatePilot({
                    variables: {
                        id: pilot.id,
                        input
                    }
                });
                if (result.data?.updatePilot) {
                    if (isTraining && trainingCost !== 0) {
                        try {
                            const isRefund = trainingCost < 0;
                            await addLedgerEntry({
                                variables: {
                                    commandId,
                                    detachmentId: formData.detachmentId || detachmentId || null,
                                    input: {
                                        amount: -trainingCost,
                                        description: isRefund
                                            ? `TRAINING ADJUSTMENT (REFUND): ${formData.name} (${trainingCost} SP)`.trim()
                                            : `SKILL TRAINING: ${formData.name} (+${trainingCost} SP)`.trim()
                                    }
                                }
                            });
                        } catch (ledgerErr) {
                            console.error("Ledger entry failed for pilot training:", ledgerErr);
                        }
                    }
                    onSave(result.data.updatePilot);
                }
            }
        } catch (err) {
            console.error(err);
            setOverlay({
                title: mode === 'create' ? "RECRUITMENT ERROR" : "UPDATE ERROR",
                message: mode === 'create'
                    ? "PERSONNEL ACQUISITION FAILURE: UNABLE TO HIRE PILOT."
                    : "PERSONNEL DATABASE UPDATE FAILED.",
                variant: 'alert',
                onConfirm: () => setOverlay(null)
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="pilot-editor-container theme-amber">
            <div
                className="pilot-editor-overlay"
                onClick={onCancel}
                style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.97)', zIndex: 9998 }}
            />

            <div className="pilot-card-form terminal-overlay-panel" style={{ zIndex: 9999, maxWidth: '850px', width: '95%', position: 'relative', overflow: 'hidden' }}>
                <PilotBackground />
                <header className="pilot-card-header overlay-header">
                    <h2 className="terminal-text" style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                        <span className="blink-fast" style={{ marginRight: '10px' }}>▶</span>
                        {mode === 'create' ? 'PILOT RECRUITMENT' : 'PILOT RECORD'}
                    </h2>
                    {mode === 'create' && detachmentId && (
                        <button
                            className={`mode-btn ${availableSP !== undefined && availableSP < hiringPrice ? 'theme-amber' : 'theme-blue'}`}
                            onClick={() => handleSave()}
                            disabled={isSaving}
                            style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                            title={
                                availableSP !== undefined && availableSP < hiringPrice ? `INSUFFICIENT FUNDS: ${availableSP} SP AVAILABLE` : `Hire pilot for ${hiringPrice} SP and record transaction`
                            }
                        >
                            {isSaving ? '>> PROCESSING...' : `$ HIRE: ${hiringPrice}`}
                        </button>
                    )}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {mode === 'edit' && trainingCost !== 0 && (
                            <button
                                className="mode-btn theme-blue"
                                onClick={() => handleSave(true)}
                                disabled={isSaving || (trainingCost > 0 && availableSP !== undefined && availableSP < trainingCost)}
                                style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                                title={trainingCost > 0 ? `Commit training for ${trainingCost} SP` : `Process training adjustment/refund for ${Math.abs(trainingCost)} SP`}
                            >
                                {isSaving ? '...' : (trainingCost > 0 ? `TRAIN: ${trainingCost}` : `REFUND: ${Math.abs(trainingCost)}`)}
                            </button>
                        )}
                        <button
                            className="mode-btn theme-green"
                            onClick={() => handleSave(false)}
                            disabled={isSaving}
                            style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                            title="Confirm and save"
                        >
                            {isSaving ? '>> PROCESSING...' : (mode === 'create' ? '✓ HIRE' : '✓ SAVE')}
                        </button>
                        <button
                            className="mode-btn theme-red"
                            onClick={onCancel}
                            disabled={isSaving}
                            style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                            title="Discard changes and return"
                        >
                            ✕ DISCARD
                        </button>
                    </div>
                </header>

                <div className="pilot-editor-scroll-area" style={{ border: '1px solid var(--terminal-border)', margin: '0 10px 8px 10px', padding: '10px 15px', backgroundColor: 'rgba(0, 0, 0, 0.4)', maxHeight: 'calc(100vh - 150px)', overflowY: 'auto' }}>
                    <div className="pilot-card-body">
                        <h3 className="zone-header" style={{ margin: '0 0 5px 0' }}>PERSONNEL DATA</h3>
                        <div className="flex-col flex-gap-5 mb-10">
                            <div className="input-group flex items-center">
                                <label htmlFor="pilot-name" className="restricted-text sm-text" style={{ minWidth: '160px' }}>NAME / CALLSIGN</label>
                                <div className="status-bar theme-amber flex-grow" style={{ padding: '0 5px', display: 'flex', alignItems: 'center' }}>
                                    <input
                                        id="pilot-name"
                                        type="text"
                                        className="table-input w-100"
                                        style={{ border: 'none' }}
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder="PILOT DESIGNATION"
                                        title="Pilot designation or callsign"
                                        maxLength={50}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="input-group flex items-center">
                                <label htmlFor="pilot-unit-type" className="restricted-text sm-text" style={{ minWidth: '160px' }}>UNIT SPECIALTY</label>
                                <div className="status-bar theme-amber flex-grow" style={{ padding: '0 5px', display: 'flex', alignItems: 'center' }}>
                                    <select
                                        id="pilot-unit-type"
                                        className="table-input w-100"
                                        style={{ border: 'none' }}
                                        value={formData.unitType}
                                        onChange={(e) => handleInputChange('unitType', e.target.value)}
                                        title="Select unit type specialization"
                                    >
                                        {UNIT_TYPES.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="input-group flex items-center">
                                <label htmlFor="pilot-wounds" className="restricted-text sm-text" style={{ minWidth: '160px' }}>WOUNDS</label>
                                <div className="status-bar theme-amber flex-grow" style={{ padding: '0 5px', display: 'flex', alignItems: 'center' }}>
                                    <select
                                        id="pilot-wounds"
                                        className="table-input w-100"
                                        style={{ border: 'none' }}
                                        value={formData.wounds}
                                        onChange={(e) => handleInputChange('wounds', e.target.value)}
                                        title="Select pilot wounds (0-6)"
                                    >
                                        {[0, 1, 2, 3, 4, 5, 6].map(v => ( // Changed to display 'FATAL' for 6 wounds
                                            <option key={v} value={v}>{v === 6 ? 'FATAL' : v}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="input-group flex items-center mb-10">
                                <label htmlFor="pilot-edge-ability-description" className="restricted-text sm-text" style={{ minWidth: '160px' }}>EDGE ABILITY</label>
                                <div className="status-bar theme-amber flex-grow" style={{ padding: '0 5px', display: 'flex', alignItems: 'center' }}>
                                    <input
                                        id="pilot-edge-abilities"
                                        type="text"
                                        className="table-input w-100"
                                        style={{ border: 'none' }}
                                        value={formData.edgeAbilities ?? ''}
                                        onChange={(e) => handleInputChange('edgeAbilities', e.target.value)}
                                        placeholder="EDGE ABILITIES"
                                        title="Describe the pilot's edge abilities"
                                        maxLength={120}
                                    />
                                </div>
                            </div>
                        </div>

                        <h3 className="zone-header" style={{ margin: '0 0 5px 0' }}>TACTICAL SKILLS</h3>
                        <div className="flex flex-gap-10 mb-10">
                            {[
                                { label: 'GUNNERY', val: formData.gunnery },
                                { label: 'PILOTING', val: formData.piloting },
                                { label: 'AS SKILL', val: formData.asSkill },
                                { label: 'EDGE TOK', val: formData.edgeTokensSkill },
                                { label: 'EDGE ABIL', val: formData.edgeAbilitySkill },
                                { label: 'HANDICAP', val: formData.handicap }
                            ].map(s => (
                                <div key={s.label} className="tactical-panel sm-text" style={{ padding: '5px 15px', textAlign: 'center', minWidth: '75px' }}>
                                    <div className="restricted-text" style={{ fontSize: '0.55rem', opacity: 0.7, marginBottom: '2px' }}>{s.label}</div>
                                    <div className="terminal-text" style={{ fontSize: '1.2rem' }}>{s.val}</div>
                                </div>
                            ))}
                        </div>

                        <h3 className="zone-header" style={{ margin: '0 0 5px 0' }}>CAREER PROGRESSION</h3>
                        <div className="pilot-skills-section">
                            <div className="flex-between flex-gap-10">
                                <div className="skill-box flex items-center">
                                    <label htmlFor="pilot-total-sp-earned" className="restricted-text xs-text mr-10" style={{ whiteSpace: 'nowrap' }}>TOTAL SP</label>
                                    <div className="status-bar theme-amber" style={{ padding: '0 5px', display: 'flex', alignItems: 'center' }}>
                                        <input
                                            id="pilot-total-sp-earned"
                                            type="number"
                                            className="table-input text-right"
                                            style={{ border: 'none', width: '60px' }}
                                            value={formData.totalSpEarned}
                                            onChange={(e) => handleInputChange('totalSpEarned', e.target.value)}
                                            title="Total SP Earned"
                                        />
                                    </div>
                                </div>
                                <div className="skill-box flex items-center">
                                    <label htmlFor="pilot-gunnery-sp-earned" className="restricted-text xs-text mr-10" style={{ whiteSpace: 'nowrap' }}>GUNNERY</label>
                                    <div className="status-bar theme-amber" style={{ padding: '0 5px', display: 'flex', alignItems: 'center' }}>
                                        <input
                                            id="pilot-gunnery-sp-earned"
                                            type="number"
                                            className="table-input text-right"
                                            style={{ border: 'none', width: '60px' }}
                                            value={formData.gunnerySpEarned}
                                            onChange={(e) => handleInputChange('gunnerySpEarned', e.target.value)}
                                            title="Gunnery SP"
                                        />
                                    </div>
                                </div>
                                <div className="skill-box flex items-center">
                                    <label htmlFor="pilot-piloting-sp-earned" className="restricted-text xs-text mr-10" style={{ whiteSpace: 'nowrap' }}>PILOTING</label>
                                    <div className="status-bar theme-amber" style={{ padding: '0 5px', display: 'flex', alignItems: 'center' }}>
                                        <input
                                            id="pilot-piloting-sp-earned"
                                            type="number"
                                            className="table-input text-right"
                                            style={{ border: 'none', width: '60px' }}
                                            value={formData.pilotingSpEarned}
                                            onChange={(e) => handleInputChange('pilotingSpEarned', e.target.value)}
                                            title="Piloting SP"
                                        />
                                    </div>
                                </div>
                                <div className="skill-box flex items-center">
                                    <label htmlFor="pilot-edge-tokens-sp-earned" className="restricted-text xs-text mr-10" style={{ whiteSpace: 'nowrap' }}>EDGE TOK</label>
                                    <div className="status-bar theme-amber" style={{ padding: '0 5px', display: 'flex', alignItems: 'center' }}>
                                        <input
                                            id="pilot-edge-tokens-sp-earned"
                                            type="number"
                                            className="table-input text-right"
                                            style={{ border: 'none', width: '60px' }}
                                            value={formData.edgeTokensSpEarned}
                                            onChange={(e) => handleInputChange('edgeTokensSpEarned', e.target.value)}
                                            title="Edge Tokens SP"
                                        />
                                    </div>
                                </div>
                                <div className="skill-box flex items-center">
                                    <label htmlFor="pilot-edge-ability-sp-earned" className="restricted-text xs-text mr-10" style={{ whiteSpace: 'nowrap' }}>EDGE ABIL</label>
                                    <div className="status-bar theme-amber" style={{ padding: '0 5px', display: 'flex', alignItems: 'center' }}>
                                        <input
                                            id="pilot-edge-ability-sp-earned"
                                            type="number"
                                            className="table-input text-right"
                                            style={{ border: 'none', width: '60px' }}
                                            value={formData.edgeAbilitySpEarned}
                                            onChange={(e) => handleInputChange('edgeAbilitySpEarned', e.target.value)}
                                            title="Edge Ability SP"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5">
                            <details className="tactical-panel sm-text" style={{ padding: '8px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                                <summary className="restricted-text cursor-pointer" style={{ fontSize: '0.65rem' }}>VIEW SP THRESHOLD REFERENCE DATA</summary>
                                <div className="grid-4-col mt-10 flex-gap-20">
                                    {[{ title: 'GUNNERY', data: gunneryThresholds }, { title: 'PILOTING', data: pilotingThresholds }, { title: 'EDGE TOK', data: edgeTokensThresholds }, { title: 'EDGE ABIL', data: edgeAbilityThresholds }].map(table => (
                                        <div key={table.title}>
                                            <span className="restricted-text xs-text">{table.title}</span>
                                            <table className="tactical-table xs-text mt-5">
                                                <thead>
                                                    <tr>
                                                        <th className="text-center">LVL</th>
                                                        <th className="text-center">SP</th>
                                                        <th className="text-center">H</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {table.data.map((row, idx) => (
                                                        <tr key={idx}>
                                                            <td className="text-center">{row.skill}</td>
                                                            <td className="text-center">{row.sp}</td>
                                                            <td className="text-center">{row.handicap}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ))}
                                </div>
                            </details>
                        </div>
                    </div>

                    <footer className="pilot-card-footer overlay-body" style={{ marginTop: '5px', paddingTop: '5px', borderTop: '1px dashed var(--terminal-border)' }}>
                        <span className="restricted-text" style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                            {mode === 'create' ? 'NEW PERSONNEL FILE' : 'EXISTING PERSONNEL RECORD'}
                        </span>
                    </footer>
                </div>
            </div>

            {overlay && (
                <TerminalOverlay
                    title={overlay.title}
                    message={overlay.message}
                    variant={overlay.variant}
                    onConfirm={overlay.onConfirm}
                    onCancel={() => setOverlay(null)}
                    themeClass="theme-amber"
                    showInputField={overlay.showInputField}
                    inputPlaceholder={overlay.inputPlaceholder}
                    inputInitialValue={overlay.inputInitialValue}
                    inputType={overlay.inputType}
                    inputLabel={overlay.inputLabel}
                >
                    {overlay.children}
                </TerminalOverlay>
            )}

            <style>{`
    /* Custom Scrollbar Styles for Pilot Editor (Amber Theme) */
    .pilot-editor-scroll-area::-webkit-scrollbar { width: 8px; }
    .pilot-editor-scroll-area::-webkit-scrollbar-track { 
        background: var(--terminal-bg, #050705);
        border-radius: 10px;
    }
    .pilot-editor-scroll-area::-webkit-scrollbar-thumb {
        background-color: var(--terminal-amber);
        border-radius: 10px;
        border: 2px solid var(--terminal-bg, #050705);
    }
    .pilot-editor-scroll-area {
        scrollbar-width: thin;
        scrollbar-color: var(--terminal-amber) var(--terminal-bg, #050705);
    }

    .theme-amber.cursor-pointer:hover { background-color: rgba(255, 176, 0, 0.15); box-shadow: 0 0 5px rgba(255, 176, 0, 0.1); }
    .theme-blue.cursor-pointer:hover { background-color: rgba(0, 191, 255, 0.15); box-shadow: 0 0 5px rgba(0, 191, 255, 0.1); }
    .theme-green.cursor-pointer:hover { background-color: rgba(51, 255, 51, 0.15); box-shadow: 0 0 5px rgba(51, 255, 51, 0.1); }
    .theme-red.cursor-pointer:hover { background-color: rgba(255, 51, 51, 0.15); box-shadow: 0 0 5px rgba(255, 51, 51, 0.1); }

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
`}</style>
        </div>
    );
};
