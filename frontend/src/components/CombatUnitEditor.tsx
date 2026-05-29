import React, { useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import {
    useFloating,
    useInteractions,
    useRole,
    useDismiss,
    FloatingPortal,
    FloatingOverlay,
    FloatingFocusManager,
} from '@floating-ui/react';
import { TerminalOverlay } from './TerminalOverlay';
import { CombatUnit, CombatUnitUpdateInput } from '../types/global.d';

interface CombatUnitEditorProps {
    unit?: CombatUnit | null;
    commandId: string;
    detachmentId?: string | null; // Add detachmentId to props
    mode: 'create' | 'edit';
    onSave: (unit: CombatUnit) => void;
    onCancel: () => void;
    unitTypes: string[];
    unitStatuses: string[];
    techBases: string[];
}

const ADD_UNIT = gql`
  mutation AddCombatUnit($commandId: ID!, $input: CombatUnitUpdateInput!) {
    addCombatUnit(commandId: $commandId, input: $input) {
      id
      model
      type
      variant
      techBase
      tonnage
      asSize
      bv
      pv
      status
      detachmentId
    }
  }
`;

const UPDATE_UNIT = gql`
  mutation UpdateUnit($id: ID!, $input: CombatUnitUpdateInput!) {
    updateCombatUnit(id: $id, input: $input) { 
      id
      type
      model
      variant
      techBase
      tonnage
      asSize
      bv
      pv
      status
    }
  }
`;

const IMPORT_ASSETS = gql`
  mutation ImportAssets($commandId: ID!, $detachmentId: ID, $link: String!) {
    importCombatUnitsFromLink(commandId: $commandId, detachmentId: $detachmentId, link: $link) {
      id
      model
      variant
      type
      techBase
      tonnage
      asSize
      bv
      pv
    }
  }
`;

interface AddUnitVars {
    commandId: string;
    input: CombatUnitUpdateInput;
}

interface UpdateUnitVars {
    id: string;
    input: CombatUnitUpdateInput;
}

interface AddUnitData {
    addCombatUnit: CombatUnit;
}

interface UpdateUnitData {
    updateCombatUnit: CombatUnit;
}

interface ImportAssetsVars {
    commandId: string;
    detachmentId: string | null;
    link: string;
}

export const CombatUnitEditor: React.FC<CombatUnitEditorProps> = ({
    unit,
    commandId,
    mode,
    onSave,
    onCancel,
    unitTypes,
    unitStatuses,
    techBases,
    detachmentId // Destructure detachmentId from props
}) => {
    const createDefaultUnit = () => ({
        id: '',
        model: 'NEW UNIT',
        type: unitTypes[0] || 'BM',
        variant: '',
        techBase: techBases[0] || 'IS',
        tonnage: 0,
        asSize: 0,
        bv: 0,
        pv: 0,
        status: unitStatuses[0] || 'ACTIVE',
        detachmentId: detachmentId || null // Use the prop detachmentId if available
    });

    const [formData, setFormData] = useState<CombatUnit>(unit || createDefaultUnit());

    // Ensure form updates if the unit prop changes (e.g. clicking edit on a different unit while editor is open)
    useEffect(() => {
        setFormData(unit || createDefaultUnit());
    }, [unit]);

    const [importLink, setImportLink] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [overlay, setOverlay] = useState<{
        title: string;
        message: string;
        onConfirm: () => void;
        variant?: 'alert' | 'info';
        children?: React.ReactNode;
    } | null>(null);

    const { refs, context } = useFloating({
        open: true,
        onOpenChange: (open) => !open && onCancel(),
    });

    const dismiss = useDismiss(context);
    const role = useRole(context, { role: 'dialog' });
    const { getFloatingProps } = useInteractions([dismiss, role]);

    const [addUnit] = useMutation<AddUnitData, AddUnitVars>(ADD_UNIT);
    const [updateUnit] = useMutation<UpdateUnitData, UpdateUnitVars>(UPDATE_UNIT);
    const [importAssets] = useMutation<any, ImportAssetsVars>(IMPORT_ASSETS);

    const handleInputChange = (field: keyof CombatUnit, value: any) => {
        const isNumeric = ['tonnage', 'asSize', 'bv', 'pv'].includes(field);
        setFormData(prev => ({
            ...prev,
            [field]: isNumeric ? (parseInt(value) || 0) : value
        }));
    };

    const handleSave = async () => {
        if (!formData.model.trim()) {
            setOverlay({
                title: "VALIDATION ERROR",
                message: "UNIT MODEL DESIGNATION REQUIRED.",
                variant: 'alert',
                onConfirm: () => setOverlay(null)
            });
            return;
        }

        setIsSaving(true);
        try {
            const input: CombatUnitUpdateInput = {
                model: formData.model,
                type: formData.type,
                variant: formData.variant,
                techBase: formData.techBase,
                tonnage: formData.tonnage,
                asSize: formData.asSize,
                bv: formData.bv,
                pv: formData.pv,
                status: formData.status,
                detachmentId: detachmentId || null // Use the prop detachmentId for new units
            };

            if (mode === 'create') {
                const result = await addUnit({
                    variables: {
                        commandId,
                        input
                    }
                });

                if (result.data?.addCombatUnit) {
                    onSave(result.data.addCombatUnit);
                }
            } else if (mode === 'edit' && unit?.id) {
                const result = await updateUnit({
                    variables: {
                        id: unit.id,
                        input
                    }
                });

                if (result.data?.updateCombatUnit) {
                    onSave(result.data.updateCombatUnit);
                }
            }
        } catch (err) {
            console.error(err);
            setOverlay({
                title: mode === 'create' ? "PROCUREMENT ERROR" : "UPDATE ERROR",
                message: mode === 'create'
                    ? "ASSET ACQUISITION FAILURE: UNABLE TO PROCURE UNIT."
                    : "ASSET DATABASE UPDATE FAILED.",
                variant: 'alert',
                onConfirm: () => setOverlay(null)
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleImport = async () => {
        if (!importLink.trim()) {
            setOverlay({
                title: "VALIDATION ERROR",
                message: "LINK URL REQUIRED. PROVIDE EXTERNAL DATA SOURCE.",
                variant: 'alert',
                onConfirm: () => setOverlay(null)
            });
            return;
        }

        setIsSaving(true);
        try {
            const result = await importAssets({
                variables: {
                    commandId,
                    detachmentId: detachmentId || null, // Use the prop detachmentId for imported units
                    link: importLink
                }
            });

            if (result.data?.importCombatUnitsFromLink?.length > 0) {
                const imported = result.data.importCombatUnitsFromLink[0];
                setFormData(prev => ({
                    ...prev,
                    model: imported.model || prev.model,
                    variant: imported.variant || prev.variant,
                    type: imported.type || prev.type,
                    techBase: imported.techBase || prev.techBase,
                    tonnage: imported.tonnage || prev.tonnage,
                    asSize: imported.asSize || prev.asSize,
                    bv: imported.bv || prev.bv,
                    pv: imported.pv || prev.pv,
                }));
                setImportLink('');
            }
        } catch (err) {
            console.error(err);
            setOverlay({
                title: "DATA SCRAPE FAILURE",
                message: "LINK FORMAT NOT RECOGNIZED OR SITE UNREACHABLE.",
                variant: 'alert',
                onConfirm: () => setOverlay(null)
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <FloatingPortal>
            <FloatingOverlay
                className="terminal-overlay-backdrop theme-amber"
                lockScroll
                style={{ zIndex: 9998, display: 'grid', placeItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.97)' }}
            >
                <FloatingFocusManager context={context}>
                    <div
                        className="mech-card-form terminal-overlay-panel"
                        ref={refs.setFloating}
                        {...getFloatingProps()}
                        style={{ zIndex: 9999, maxWidth: '900px', width: '95%', position: 'relative' }}
                    >
                        <header className="mech-card-header overlay-header">
                            <h2 className="terminal-text" style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                                <span className="blink-fast" style={{ marginRight: '10px' }}>▶</span>
                                {mode === 'create' ? 'UNIT PROCUREMENT' : 'UNIT RECORD'}
                            </h2>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button
                                    className="mode-btn theme-green"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                                    title="Confirm and save"
                                >
                                    {isSaving ? '>> PROCESSING...' : (mode === 'create' ? '✓ PROCURE' : '✓ SAVE')}
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

                        <div style={{ border: '1px solid var(--terminal-border)', margin: '0 10px 8px 10px', padding: '10px 15px', backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
                            <div className="mech-card-body">
                                {mode === 'create' && (
                                    <div className="mb-20 pb-15" style={{ borderBottom: '1px dashed var(--accent-dim)' }}>
                                        <h3 className="zone-header" style={{ margin: '0 0 10px 0' }}>IMPORT DATA SOURCE</h3>
                                        <div className="flex flex-gap-10">
                                            <input
                                                id="import-link"
                                                type="text"
                                                className="table-input flex-grow inline-edit-input"
                                                value={importLink}
                                                onChange={(e) => setImportLink(e.target.value)}
                                                placeholder="MASTER UNIT LIST LINK (MUL)..."
                                                title="External data source URL"
                                            />
                                            <button
                                                type="button"
                                                className="mode-btn theme-green"
                                                onClick={handleImport}
                                                disabled={isSaving || !importLink.trim()}
                                                style={{ padding: '4px 15px', fontSize: '0.7rem' }}
                                            >
                                                {isSaving ? 'SCRAPING...' : '✓ IMPORT'}
                                            </button>
                                        </div>
                                        <div className="restricted-text xs-text mt-5" style={{ opacity: 0.7 }}>
                                            SUPPORTED SOURCES: Master Unit List (MUL), Mordel.net
                                        </div>
                                    </div>
                                )}
                                <h3 className="zone-header" style={{ margin: '0 0 5px 0' }}>ASSET PARAMETERS</h3>
                                <div className="flex-col flex-gap-5 mb-10">
                                    <div className="input-group flex items-center">
                                        <label htmlFor="mech-model" className="restricted-text sm-text" style={{ minWidth: '160px' }}>MODEL</label>
                                        <input
                                            id="mech-model"
                                            type="text"
                                            className="table-input flex-grow inline-edit-input"
                                            value={formData.model}
                                            onChange={(e) => handleInputChange('model', e.target.value)}
                                            placeholder="UNIT MODEL DESIGNATION"
                                            title="Unit chassis model"
                                            maxLength={50}
                                            autoFocus
                                        />
                                    </div>

                                    <div className="input-group flex items-center">
                                        <label htmlFor="mech-variant" className="restricted-text sm-text" style={{ minWidth: '160px' }}>VARIANT</label>
                                        <input
                                            id="mech-variant"
                                            type="text"
                                            className="table-input flex-grow inline-edit-input"
                                            value={formData.variant}
                                            onChange={(e) => handleInputChange('variant', e.target.value)}
                                            placeholder="VARIANT CODE (E.G., SHD-2K)"
                                            title="Unit variant designation"
                                            maxLength={30}
                                        />
                                    </div>

                                    <div className="flex flex-gap-10">
                                        <div className="input-group flex items-center" style={{ flex: 1 }}>
                                            <label htmlFor="mech-type" className="restricted-text sm-text" style={{ minWidth: '100px' }}>TYPE</label>
                                            <select
                                                id="mech-type"
                                                className="table-input flex-grow inline-edit-input"
                                                value={formData.type}
                                                onChange={(e) => handleInputChange('type', e.target.value)}
                                                title="Unit classification"
                                            >
                                                {unitTypes.map(t => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="input-group flex items-center" style={{ flex: 1 }}>
                                            <label htmlFor="mech-tech" className="restricted-text sm-text" style={{ minWidth: '80px' }}>TECH</label>
                                            <select
                                                id="mech-tech"
                                                className="table-input flex-grow inline-edit-input"
                                                value={formData.techBase}
                                                onChange={(e) => handleInputChange('techBase', e.target.value)}
                                                title="Technology base"
                                            >
                                                {techBases.map(t => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="input-group flex items-center" style={{ flex: 1 }}>
                                            <label htmlFor="mech-status" className="restricted-text sm-text" style={{ minWidth: '100px' }}>STATUS</label>
                                            <select
                                                id="mech-status"
                                                className="table-input flex-grow inline-edit-input"
                                                value={formData.status}
                                                onChange={(e) => handleInputChange('status', e.target.value)}
                                                title="Operational status"
                                            >
                                                {unitStatuses.map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="zone-header" style={{ margin: '0 0 5px 0' }}>SPECIFICATIONS</h3>
                                <div className="flex flex-gap-10 mb-10">
                                    <div className="tactical-panel sm-text" style={{ padding: '5px 15px', textAlign: 'center', minWidth: '90px', flex: 1 }}>
                                        <label htmlFor="mech-tonnage" className="restricted-text" style={{ fontSize: '0.55rem', opacity: 0.7, marginBottom: '2px', display: 'block' }}>TONNAGE</label>
                                        <input
                                            id="mech-tonnage"
                                            type="number"
                                            className="table-input text-center table-input-tonnage"
                                            value={formData.tonnage}
                                            onChange={(e) => handleInputChange('tonnage', e.target.value)}
                                            title="Unit tonnage"
                                        />
                                    </div>

                                    <div className="tactical-panel sm-text" style={{ padding: '5px 15px', textAlign: 'center', minWidth: '90px', flex: 1 }}>
                                        <label htmlFor="mech-assize" className="restricted-text" style={{ fontSize: '0.55rem', opacity: 0.7, marginBottom: '2px', display: 'block' }}>AS SIZE</label>
                                        <input
                                            id="mech-assize"
                                            type="number"
                                            className="table-input text-center table-input-size"
                                            value={formData.asSize}
                                            onChange={(e) => handleInputChange('asSize', e.target.value)}
                                            title="Alpha Strike size"
                                        />
                                    </div>

                                    <div className="tactical-panel sm-text" style={{ padding: '5px 15px', textAlign: 'center', minWidth: '90px', flex: 1 }}>
                                        <label htmlFor="mech-bv" className="restricted-text" style={{ fontSize: '0.55rem', opacity: 0.7, marginBottom: '2px', display: 'block' }}>BATTLE VALUE</label>
                                        <input
                                            id="mech-bv"
                                            type="number"
                                            className="table-input text-center table-input-bv"
                                            value={formData.bv}
                                            onChange={(e) => handleInputChange('bv', e.target.value)}
                                            title="Battle value"
                                        />
                                    </div>

                                    <div className="tactical-panel sm-text" style={{ padding: '5px 15px', textAlign: 'center', minWidth: '90px', flex: 1 }}>
                                        <label htmlFor="mech-pv" className="restricted-text" style={{ fontSize: '0.55rem', opacity: 0.7, marginBottom: '2px', display: 'block' }}>POINT VALUE</label>
                                        <input
                                            id="mech-pv"
                                            type="number"
                                            className="table-input text-center table-input-pv"
                                            value={formData.pv}
                                            onChange={(e) => handleInputChange('pv', e.target.value)}
                                            title="Point value"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <footer className="mech-card-footer overlay-body" style={{ marginTop: '5px', paddingTop: '5px', borderTop: '1px dashed var(--terminal-border)' }}>
                            <span className="restricted-text" style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                                {mode === 'create' ? 'NEW ASSET FILE' : 'EXISTING ASSET RECORD'}
                            </span>
                        </footer>
                    </div>
                </FloatingFocusManager>
            </FloatingOverlay>

            {
                overlay && (
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
                )
            }
        </FloatingPortal >
    );
};