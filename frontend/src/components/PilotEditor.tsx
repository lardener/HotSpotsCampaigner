import React, { useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { TerminalOverlay } from './TerminalOverlay';

interface PilotData {
    id: string;
    name: string;
    gunnery: number;
    piloting: number;
    asSkill: number;
    unitType: string;
    wounds: number;
    handicap: string;
    totalSpEarned: number;
    gunnerySpEarned: number;
    pilotingSpEarned: number;
    edgeTokensSpEarned: number;
    edgeAbilitySpEarned: number;
    detachmentId?: string | null;
}

interface PilotEditorProps {
    pilot?: PilotData | null;
    commandId: string;
    mode: 'create' | 'edit';
    onSave: (pilot: PilotData) => void;
    onCancel: () => void;
}

const HIRE_PILOT = gql`
  mutation HirePilot($commandId: ID!, $input: PilotInput!) {
    hirePilot(commandId: $commandId, input: $input) {
      id
      name
      gunnery
      piloting
      asSkill
      unitType
      wounds
      handicap
      totalSpEarned
      gunnerySpEarned
      pilotingSpEarned
      edgeTokensSpEarned
      edgeAbilitySpEarned
      detachmentId
    }
  }
`;

const UPDATE_PILOT = gql`
  mutation UpdatePilot($id: ID!, $input: PilotInput!) {
    updatePilot(id: $id, input: $input) { 
      id
      name
      gunnery
      piloting
      asSkill
      unitType
      wounds
      handicap
      totalSpEarned
      gunnerySpEarned
      pilotingSpEarned
      edgeTokensSpEarned
      edgeAbilitySpEarned
      detachmentId
    }
  }
`;

interface PilotInput {
    name?: string;
    gunnery?: number;
    piloting?: number;
    asSkill?: number;
    unitType?: string;
    wounds?: number;
    handicap?: string;
    totalSpEarned?: number;
    gunnerySpEarned?: number;
    pilotingSpEarned?: number;
    edgeTokensSpEarned?: number;
    edgeAbilitySpEarned?: number;
    detachmentId?: string | null;
}

interface UpdatePilotVars {
    id: string;
    input: PilotInput;
}

interface UpdatePilotData {
    updatePilot: PilotData;
}

interface HirePilotData {
    hirePilot: PilotData & { detachmentId?: string | null };
}

interface HirePilotVars {
    commandId: string;
    input: PilotInput;
}

export const PilotEditor: React.FC<PilotEditorProps> = ({
    pilot,
    commandId,
    mode,
    onSave,
    onCancel
}) => {
    const UNIT_TYPES = ['BM', 'CV', 'PM', 'IM', 'BA', 'CI'];

    const [formData, setFormData] = useState<PilotData>(
        pilot || {
            id: '',
            name: 'NEW PILOT',
            gunnery: 4,
            piloting: 5,
            asSkill: 4,
            unitType: 'BM',
            wounds: 0,
            handicap: '',
            totalSpEarned: 0,
            gunnerySpEarned: 0,
            pilotingSpEarned: 0,
            edgeTokensSpEarned: 0,
            edgeAbilitySpEarned: 0
        }
    );

    const [isSaving, setIsSaving] = useState(false);
    const [overlay, setOverlay] = useState<{
        title: string;
        message: string;
        onConfirm: () => void;
        variant?: 'alert' | 'info';
        children?: React.ReactNode;
    } | null>(null);

    const [hirePilot] = useMutation<HirePilotData, HirePilotVars>(HIRE_PILOT);
    const [updatePilot] = useMutation<UpdatePilotData, UpdatePilotVars>(UPDATE_PILOT);

    const handleInputChange = (field: keyof PilotData, value: any) => {
        const isNumeric = ['gunnery', 'piloting', 'asSkill', 'wounds', 'totalSpEarned', 'gunnerySpEarned', 'pilotingSpEarned', 'edgeTokensSpEarned', 'edgeAbilitySpEarned'].includes(field);
        setFormData(prev => ({
            ...prev,
            [field]: isNumeric ? parseInt(value) || 0 : value
        }));
    };

    const handleSave = async () => {
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

        setIsSaving(true);

        try {
            const input: PilotInput = {
                name: formData.name,
                gunnery: formData.gunnery,
                piloting: formData.piloting,
                asSkill: formData.asSkill,
                unitType: formData.unitType,
                wounds: formData.wounds,
                handicap: formData.handicap,
                totalSpEarned: formData.totalSpEarned,
                gunnerySpEarned: formData.gunnerySpEarned,
                pilotingSpEarned: formData.pilotingSpEarned,
                edgeTokensSpEarned: formData.edgeTokensSpEarned,
                edgeAbilitySpEarned: formData.edgeAbilitySpEarned
            };

            if (mode === 'create') {
                const result = await hirePilot({
                    variables: {
                        commandId,
                        input
                    }
                });

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

            <div className="pilot-card-form terminal-overlay-panel" style={{ zIndex: 9999 }}>
                <header className="pilot-card-header overlay-header">
                    <h2 className="terminal-text" style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                        <span className="blink-fast" style={{ marginRight: '10px' }}>▶</span>
                        {mode === 'create' ? 'PILOT RECRUITMENT' : 'PILOT RECORD'}
                    </h2>
                    <button
                        className="mode-btn close-btn"
                        onClick={onCancel}
                        style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                        title="Cancel and return to dashboard"
                    >
                        ✕ CANCEL
                    </button>
                </header>

                <div style={{ border: '1px solid var(--terminal-border)', margin: '0 10px 10px 10px', padding: '15px', backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
                    <div className="pilot-card-body">
                        {/* Name / Callsign Section */}
                        <div className="pilot-name-section">
                            <label className="restricted-text form-label">NAME / CALLSIGN:</label>
                            <input
                                type="text"
                                className="table-input pilot-name-input"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="PILOT DESIGNATION"
                                maxLength={50}
                                autoFocus
                            />
                        </div>

                        {/* Unit Type / Status Section */}
                        <div className="pilot-meta-section">
                            <div className="input-group">
                                <label className="restricted-text form-label">UNIT TYPE:</label>
                                <select
                                    className="table-input"
                                    value={formData.unitType}
                                    onChange={(e) => handleInputChange('unitType', e.target.value)}
                                    title="Select unit type specialization"
                                >
                                    {UNIT_TYPES.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="input-group">
                                <label className="restricted-text form-label">WOUNDS:</label>
                                <input
                                    type="number"
                                    className="table-input"
                                    value={formData.wounds}
                                    onChange={(e) => handleInputChange('wounds', e.target.value)}
                                    min="0"
                                    max="6"
                                />
                            </div>
                        </div>

                        <div className="pilot-meta-section">
                            <div className="input-group" style={{ width: '100%' }}>
                                <label className="restricted-text form-label">HANDICAP / TRAITS:</label>
                                <input
                                    type="text"
                                    className="table-input"
                                    value={formData.handicap}
                                    onChange={(e) => handleInputChange('handicap', e.target.value)}
                                    placeholder="NONE"
                                />
                            </div>
                        </div>

                        {/* Skills Grid - Modeled after Campaign Pilot Card */}
                        <div className="pilot-skills-section">
                            <div className="skills-grid">
                                {/* Gunnery */}
                                <div className="skill-box">
                                    <label className="restricted-text skill-label">GUNNERY</label>
                                    <input
                                        type="number"
                                        className="table-input skill-input"
                                        value={formData.gunnery}
                                        onChange={(e) => handleInputChange('gunnery', e.target.value)}
                                        min="0"
                                        max="12"
                                        title="Gunnery skill (0-12)"
                                    />
                                </div>

                                {/* Piloting */}
                                <div className="skill-box">
                                    <label className="restricted-text skill-label">PILOTING</label>
                                    <input
                                        type="number"
                                        className="table-input skill-input"
                                        value={formData.piloting}
                                        onChange={(e) => handleInputChange('piloting', e.target.value)}
                                        min="0"
                                        max="12"
                                        title="Piloting skill (0-12)"
                                    />
                                </div>

                                {/* Alpha Strike Skill */}
                                <div className="skill-box">
                                    <label className="restricted-text skill-label">AS SKILL</label>
                                    <input
                                        type="number"
                                        className="table-input skill-input"
                                        value={formData.asSkill}
                                        onChange={(e) => handleInputChange('asSkill', e.target.value)}
                                        min="0"
                                        max="12"
                                        title="Alpha Strike skill (0-12)"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pilot-skills-section" style={{ borderTop: '1px dashed var(--terminal-border)', paddingTop: '15px', marginTop: '10px' }}>
                            <label className="restricted-text form-label">SKILL POINT (SP) PROGRESSION:</label>
                            <div className="skills-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                                <div className="skill-box">
                                    <label className="restricted-text skill-label">TOTAL</label>
                                    <input
                                        type="number"
                                        className="table-input skill-input"
                                        value={formData.totalSpEarned}
                                        onChange={(e) => handleInputChange('totalSpEarned', e.target.value)}
                                        title="Total SP Earned"
                                    />
                                </div>
                                <div className="skill-box">
                                    <label className="restricted-text skill-label">GUNNERY</label>
                                    <input
                                        type="number"
                                        className="table-input skill-input"
                                        value={formData.gunnerySpEarned}
                                        onChange={(e) => handleInputChange('gunnerySpEarned', e.target.value)}
                                        title="Gunnery SP"
                                    />
                                </div>
                                <div className="skill-box">
                                    <label className="restricted-text skill-label">PILOTING</label>
                                    <input
                                        type="number"
                                        className="table-input skill-input"
                                        value={formData.pilotingSpEarned}
                                        onChange={(e) => handleInputChange('pilotingSpEarned', e.target.value)}
                                        title="Piloting SP"
                                    />
                                </div>
                                <div className="skill-box">
                                    <label className="restricted-text skill-label">EDGE TOK</label>
                                    <input
                                        type="number"
                                        className="table-input skill-input"
                                        value={formData.edgeTokensSpEarned}
                                        onChange={(e) => handleInputChange('edgeTokensSpEarned', e.target.value)}
                                        title="Edge Tokens SP"
                                    />
                                </div>
                                <div className="skill-box">
                                    <label className="restricted-text skill-label">EDGE ABIL</label>
                                    <input
                                        type="number"
                                        className="table-input skill-input"
                                        value={formData.edgeAbilitySpEarned}
                                        onChange={(e) => handleInputChange('edgeAbilitySpEarned', e.target.value)}
                                        title="Edge Ability SP"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pilot-actions-section">
                            <button
                                className="mode-btn"
                                onClick={handleSave}
                                disabled={isSaving}
                                style={{
                                    flex: 1,
                                    borderColor: 'var(--terminal-green)',
                                    color: 'var(--terminal-green)'
                                }}
                            >
                                {isSaving ? '>> PROCESSING...' : '✓ CONFIRM RECORD'}
                            </button>
                            <button
                                className="mode-btn"
                                onClick={onCancel}
                                disabled={isSaving}
                                style={{
                                    flex: 1,
                                    borderColor: 'var(--terminal-alert)',
                                    color: 'var(--terminal-alert)'
                                }}
                            >
                                ✕ DISCARD CHANGES
                            </button>
                        </div>
                    </div>

                    <footer className="pilot-card-footer overlay-body" style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed var(--terminal-border)' }}>
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
                >
                    {overlay.children}
                </TerminalOverlay>
            )}
        </div>
    );
};
