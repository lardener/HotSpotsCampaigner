import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ApolloCache } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { LedgerEntryForm } from './LedgerEntryForm';
import { TerminalOverlay } from './TerminalOverlay';
import { DetachmentReadinessSummary } from './DetachmentReadinessSummary';
import { PilotEditor } from './PilotEditor';
import { CombatUnitEditor } from './CombatUnitEditor';
import { CombatUnit, Pilot, Detachment, CommandUpdateInput, LedgerEntry } from '../types/global.d';
import { UNIT_STATUS_OPTIONS as FALLBACK_STATUSES, UNIT_TYPES as FALLBACK_TYPES, TECH_BASES as FALLBACK_TECH } from './Rules';
import { UnitDossierData } from '../types/graphql.d';
import { CommandDashboardBackground } from './CommandDashboardBackground';
import {
    GET_UNIT_DOSSIER,
    UPDATE_COMMAND,
    CREATE_DETACHMENT,
    ASSIGN_ASSET,
    DELETE_DETACHMENT,
    ASSIGN_DETACHMENT,
    JOIN_CAMPAIGN,
    DELETE_UNIT,
    DELETE_PILOT
} from '../types/operations';

interface CommandDashboardProps {
    commandId: string;
    detachmentId?: string;
    isManagerView?: boolean;
    onViewCampaign?: (campaignId: string) => void;
    onRefreshTree?: () => void;
    onSyncChange?: (syncing: boolean) => void;
}

export const CommandDashboard: React.FC<CommandDashboardProps> = ({ commandId, detachmentId, isManagerView, onViewCampaign, onRefreshTree, onSyncChange }) => {
    const [selectedDetachmentId, setSelectedDetachmentId] = useState<string | null>(null); // null means Pool
    const [ledgerPage, setLedgerPage] = useState(1);
    const entriesPerPage = 10;

    // Pilot Editor State
    const [showPilotEditor, setShowPilotEditor] = useState(false);
    const [pilotEditorMode, setPilotEditorMode] = useState<'create' | 'edit'>('create');
    const [editingPilot, setEditingPilot] = useState<Pilot | null>(null);

    // Combat Unit Editor State
    const [showCombatUnitEditor, setShowCombatUnitEditor] = useState(false);
    const [combatUnitEditorMode, setCombatUnitEditorMode] = useState<'create' | 'edit'>('create');
    const [editingUnit, setEditingUnit] = useState<CombatUnit | null>(null);

    // Form states
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingCO, setIsEditingCO] = useState(false);
    const [inviteToken, setInviteToken] = useState('');

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

    // Synchronize selection with prop changes (e.g. from Navigation Tree)
    useEffect(() => {
        setSelectedDetachmentId(detachmentId || null);
        setLedgerPage(1);
    }, [detachmentId]);

    useEffect(() => {
        setLedgerPage(1);
    }, [selectedDetachmentId]);

    const { loading, error, data, refetch } = useQuery<UnitDossierData>(GET_UNIT_DOSSIER, {
        variables: { commandId },
        fetchPolicy: 'cache-and-network',
        notifyOnNetworkStatusChange: true
    });

    useEffect(() => {
        onSyncChange?.(loading || isSyncing);
    }, [loading, isSyncing, onSyncChange]);


    const unitStatuses = data?.publicCampaignMetadata?.unitStatuses || FALLBACK_STATUSES;
    const unitTypes = data?.publicCampaignMetadata?.unitTypes || FALLBACK_TYPES;
    const techBases = data?.publicCampaignMetadata?.techBases || FALLBACK_TECH;

    const [joinCampaign] = useMutation(JOIN_CAMPAIGN);

    const [updateCommand] = useMutation(UPDATE_COMMAND);
    const [assignDetachment] = useMutation(ASSIGN_DETACHMENT);
    const [assignAsset] = useMutation(ASSIGN_ASSET, {
        update(cache: ApolloCache, { data: result }, { variables }) {
            if (result?.assignAsset && variables) {
                const queryVars = { commandId };
                const existing = cache.readQuery<UnitDossierData>({ query: GET_UNIT_DOSSIER, variables: queryVars });
                if (existing?.getCommand) {
                    const { assetType, assetId, detachmentId } = variables;
                    const getCommand = { ...existing.getCommand };
                    if (assetType === 'UNIT') {
                        getCommand.units = (getCommand.units || []).map((u: CombatUnit) => u.id === assetId ? { ...u, detachmentId } : u);
                    } else {
                        getCommand.pilots = (getCommand.pilots || []).map((p: Pilot) => p.id === assetId ? { ...p, detachmentId } : p);
                    }
                    cache.writeQuery({ query: GET_UNIT_DOSSIER, variables: queryVars, data: { ...existing, getCommand } });
                }
            }
        }
    });

    const [deleteDetachment] = useMutation(DELETE_DETACHMENT, {
        update(cache: ApolloCache, { data: result }, { variables }) {
            if (result?.deleteDetachment && variables?.detachmentId) {
                cache.evict({ id: cache.identify({ __typename: 'Detachment', id: variables.detachmentId }) });
                cache.gc();
            }
        }
    });

    const [deleteUnit] = useMutation(DELETE_UNIT, {
        update(cache: ApolloCache, { data: result }, { variables }) {
            if (result?.deleteUnit && variables?.unitId) {
                cache.evict({ id: cache.identify({ __typename: 'CombatUnit', id: variables.unitId }) });
                cache.gc();
            }
        }
    });

    const [deletePilot] = useMutation(DELETE_PILOT, {
        update(cache: ApolloCache, { data: result }, { variables }) {
            if (result?.deletePilot && variables?.pilotId) {
                cache.evict({ id: cache.identify({ __typename: 'Pilot', id: variables.pilotId }) });
                cache.gc();
            }
        }
    });

    const [createDetachment] = useMutation(CREATE_DETACHMENT, {
        update(cache: ApolloCache, { data: createData }) {
            if (!createData?.createDetachment) return;
            const existing = cache.readQuery<UnitDossierData>({ query: GET_UNIT_DOSSIER, variables: { commandId } });
            if (existing?.getCommand) {
                cache.writeQuery({
                    query: GET_UNIT_DOSSIER,
                    variables: { commandId },
                    data: {
                        ...existing,
                        getCommand: {
                            ...existing.getCommand,
                            detachments: [...(existing.getCommand.detachments || []), createData.createDetachment]
                        }
                    }
                });
            }
        }
    });

    const saveTimeoutRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    const markSaved = () => {
        setIsSyncing(false);
        setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };

    // Clear all timeouts on unmount
    useEffect(() => {
        const timeouts = saveTimeoutRef.current;
        return () => {
            Object.values(timeouts).forEach(clearTimeout);
        };
    }, []);

    const handleHeaderUpdate = (field: string, value: any, immediate = true) => {
        const key = `header-${field}`;
        if (saveTimeoutRef.current[key]) {
            clearTimeout(saveTimeoutRef.current[key]);
            delete saveTimeoutRef.current[key];
        }

        const execute = () => {
            setIsSyncing(true);
            const input: CommandUpdateInput = {};
            if (field === 'NAME') input.name = value;
            if (field === 'CO') input.commandingOfficer = value;

            const current = data?.getCommand;

            updateCommand({
                variables: { id: commandId, input },
                optimisticResponse: current ? {
                    updateCommand: {
                        ...current,
                        ...input,
                        commandingOfficer: input.commandingOfficer ?? current.commandingOfficer,
                        __typename: 'MercenaryCommand'
                    }
                } : undefined
            })
                .then(() => {
                    markSaved();
                    if (field === 'NAME') onRefreshTree?.();
                })
                .catch((err: Error) => { console.error(err); setIsSyncing(false); });
        };

        if (immediate) execute();
        else saveTimeoutRef.current[key] = setTimeout(execute, 1000);
    };

    const handleHirePilot = async () => {
        setPilotEditorMode('create');
        setEditingPilot(null);
        setShowPilotEditor(true);
    };

    const handleEditPilot = (pilot: Pilot) => {
        setPilotEditorMode('edit');
        setEditingPilot(pilot);
        setShowPilotEditor(true);
    };

    const handlePilotEditorSave = (pilot?: Pilot) => {
        setShowPilotEditor(false);
        if (pilot?.id) refetch();
        else refetch();
    };

    const handlePilotEditorCancel = () => {
        setShowPilotEditor(false);
        setEditingPilot(null);
    };

    const handleAddUnit = () => {
        setCombatUnitEditorMode('create');
        setEditingUnit(null);
        setShowCombatUnitEditor(true);
    };

    const handleEditUnit = (unit: CombatUnit) => {
        setCombatUnitEditorMode('edit');
        setEditingUnit(unit);
        setShowCombatUnitEditor(true);
    };

    const handleCombatUnitEditorSave = () => {
        setShowCombatUnitEditor(false);
        setEditingUnit(null);
        refetch();
    };

    const handleCombatUnitEditorCancel = () => {
        setShowCombatUnitEditor(false);
        setEditingUnit(null);
        refetch();
    };

    const handleDeleteUnit = async (id: string) => {
        setOverlay({
            title: "CONFIRM ASSET DESTRUCTION",
            message: "SCRAP THIS ASSET? THIS ACTION IS PERMANENT.",
            variant: 'alert',
            onConfirm: () => {
                deleteUnit({ variables: { unitId: id } });
                setOverlay(null);
            }
        });
    };

    const handleDeletePilot = async (id: string) => {
        setOverlay({
            title: "PERSONNEL DISCHARGE",
            message: "DISCHARGE THIS PERSONNEL? THIS ACTION IS PERMANENT.",
            variant: 'alert',
            onConfirm: () => {
                deletePilot({ variables: { pilotId: id } });
                setOverlay(null);
            }
        });
    };

    const handleAssignAsset = async (assetType: 'UNIT' | 'PILOT', assetId: string, detId: string) => {
        try {
            await assignAsset({
                variables: {
                    assetType,
                    assetId,
                    detachmentId: detId === "" ? null : detId
                }
            });
        } catch (err) {
            setOverlay({
                title: "ASSIGNMENT FAILURE",
                message: "COMMUNICATIONS ERROR: UNABLE TO REASSIGN ASSET.",
                variant: 'alert',
                onConfirm: () => setOverlay(null)
            });
        }
    };

    const handleJoinCampaign = async () => {
        if (!selectedDetachmentId || !inviteToken) return;
        try {
            await joinCampaign({ variables: { token: inviteToken, detachmentId: selectedDetachmentId } });
            setOverlay({
                title: "RECRUITMENT SUCCESSFUL",
                message: "DETACHMENT DEPLOYED TO THEATER.",
                onConfirm: () => {
                    setOverlay(null);
                    setInviteToken('');
                    onRefreshTree?.();
                    refetch(); // Refetch command dossier to update ledger and detachments
                }
            });
        } catch (err) {
            setOverlay({
                title: "RECRUITMENT FAILURE",
                message: "INVALID OR EXPIRED TOKEN. ACCESS DENIED.",
                variant: 'alert',
                onConfirm: () => setOverlay(null)
            });
        }
    };

    const handleLeaveCampaign = async () => {
        if (!selectedDetachmentId) return;
        setOverlay({
            title: "THEATER WITHDRAWAL",
            message: "ARE YOU SURE YOU WANT TO WITHDRAW? ALL PROGRESS IN THIS THEATER WILL BE SUSPENDED.",
            variant: 'alert',
            onConfirm: async () => {
                setOverlay(null);
                setIsSyncing(true);
                try {
                    await assignDetachment({ variables: { detachmentId: selectedDetachmentId, campaignId: null } });
                    refetch();
                    onRefreshTree?.();
                } catch (err) {
                    console.error(err);
                }
                setIsSyncing(false);
            }
        });
    };

    const handleCreateDetachment = () => {
        const confirmAction = async (detachmentName?: string) => {
            if (!detachmentName?.trim()) return;
            try {
                await createDetachment({
                    variables: { commandId, campaignId: null, name: detachmentName.toUpperCase() }
                });
                setOverlay(null);
                onRefreshTree?.();
            } catch (err) { console.error(err); }
        };
        setOverlay({
            title: "NEW DETACHMENT AUTHORIZATION",
            message: "ENTER CALLSIGN FOR NEW OPERATIONAL ELEMENT",
            onConfirm: confirmAction, showInputField: true, inputPlaceholder: "DESIGNATION...", inputLabel: "CALLSIGN"
        });
    };

    const handleDeleteDetachment = async (id: string) => {
        setOverlay({
            title: "DECOMMISSION DETACHMENT",
            message: "DELETE DETACHMENT? ASSETS WILL RETURN TO HANGAR POOL.",
            variant: 'alert',
            onConfirm: async () => {
                try {
                    await deleteDetachment({ variables: { detachmentId: id } });
                    if (selectedDetachmentId === id) setSelectedDetachmentId(null);
                    setOverlay(null);
                    onRefreshTree?.();
                } catch (err) { console.error(err); }
            }
        });
    };

    const command = data?.getCommand;

    // Filter rosters for the focused detachment
    const filteredUnits = useMemo(() => {
        if (!command) return [];
        const list = selectedDetachmentId
            ? (command.units || []).filter((u: CombatUnit) => u.detachmentId === selectedDetachmentId)
            : (command.units || []);
        return [...list].sort((a, b) =>
            a.model.localeCompare(b.model) || (a.variant || '').localeCompare(b.variant || '')
        );
    }, [command, selectedDetachmentId]);

    const filteredPilots = useMemo(() => {
        if (!command) return [];
        const list = selectedDetachmentId
            ? (command.pilots || []).filter((p: Pilot) => p.detachmentId === selectedDetachmentId)
            : (command.pilots || []);
        return [...list].sort((a, b) => a.name.localeCompare(b.name));
    }, [command, selectedDetachmentId]);

    const filteredLedger = useMemo(() => {
        if (!command) return [];
        return selectedDetachmentId
            ? (command.allLedgerEntries || []).filter((e: LedgerEntry) => e.detachmentId === selectedDetachmentId)
            : (command.allLedgerEntries || []);
    }, [command, selectedDetachmentId]);

    const sortedLedger = useMemo(() => {
        return [...filteredLedger].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [filteredLedger]);

    const totalPages = Math.max(1, Math.ceil(sortedLedger.length / entriesPerPage));
    const paginatedLedger = sortedLedger.slice((ledgerPage - 1) * entriesPerPage, ledgerPage * entriesPerPage);

    if (loading && !data) return <div className="loading-intel pulse"> RETRIEVING UNIT DOSSIER...</div>;

    if (error) return (
        <div className="error-message alert-border">
            <h2 className="terminal-text">COMMUNICATIONS FAILURE</h2>
            <p className="restricted-text">{error.message.toUpperCase()}</p>
        </div>
    );

    if (!command) return <div className="error-message">COMMAND NOT FOUND.</div>;

    const detachments: Detachment[] = command.detachments || [];

    return (
        <div key={commandId} className="container unit-profile theme-amber" style={{ position: 'relative', overflow: 'hidden', background: 'transparent', minHeight: '100%' }}>
            <CommandDashboardBackground detachmentId={selectedDetachmentId} />
            <header className="dashboard-header dossier-header" style={{ borderBottom: '2px solid var(--accent-primary)', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    {isEditingName ? (
                        <div className="flex flex-gap-10 items-center">
                            <div className="status-bar theme-amber" style={{ padding: '0 10px', display: 'flex', alignItems: 'center' }}>
                                <input
                                    className="table-input terminal-text"
                                    style={{ fontSize: '2rem', height: 'auto', width: 'auto' }}
                                    defaultValue={command.name}
                                    autoFocus
                                    onBlur={(e) => { handleHeaderUpdate('NAME', e.target.value); setIsEditingName(false); }}
                                    onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                                    placeholder="COMMAND NAME..."
                                    title="Enter command name"
                                    aria-label="Command name"
                                />
                            </div>
                            <h1 className="terminal-text" style={{ margin: 0 }}> - COMMAND DASHBOARD</h1>
                        </div>
                    ) : (
                        <h1 className="terminal-text"
                            style={{ cursor: 'pointer' }}
                            onClick={() => !isManagerView && setIsEditingName(true)}
                            title={!isManagerView ? "Click to rename command" : ""}
                        >{command.name} - COMMAND DASHBOARD</h1>
                    )}
                </div>
                <div className="sync-indicator text-right pb-5">
                    <span className={`restricted-text ${isSyncing ? 'pulse' : ''}`} style={{ color: isSyncing ? 'var(--terminal-amber)' : 'var(--terminal-green)', fontSize: '0.7rem' }}>
                        {isSyncing ? '>> UPLOADING DATA...' : '● NEURAL LINK: STABLE'}
                    </span>
                    {lastSaved && !isSyncing && <div className="last-sync-time">LAST SYNC: {lastSaved}</div>}
                </div>
            </header>
            <div className="header-metadata-row mb-20">
                <div className="tactical-header-grid flex flex-gap-40 mt-10">
                    <div className="input-group flex-col items-center">
                        <span className="restricted-text">CO:</span>
                        {isEditingCO ? (
                            <div className="status-bar theme-amber" style={{ padding: '0 5px', display: 'flex', alignItems: 'center' }}>
                                <input
                                    id="header-co"
                                    className="table-input"
                                    style={{ border: 'none' }}
                                    value={command.commandingOfficer} // Use value for controlled input
                                    autoFocus
                                    onChange={(e) => handleHeaderUpdate('CO', e.target.value, false)} // Debounce update
                                    onBlur={() => setIsEditingCO(false)} // Save on blur
                                    onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} // Blur on Enter
                                    placeholder="COMMANDING OFFICER..."
                                    title="Enter commanding officer name"
                                    aria-label="Commanding officer"
                                />
                            </div>
                        ) : (
                            <div className="inline-edit"
                                style={{ cursor: isManagerView ? 'default' : 'pointer' }} // Cursor changes if editable
                                onClick={() => !isManagerView && setIsEditingCO(true)} // Click to edit if not manager view
                                onFocus={() => !isManagerView && setIsEditingCO(true)} // Focus to edit if not manager view
                                tabIndex={isManagerView ? -1 : 0} // Only focusable if not manager view
                                title={!isManagerView ? "Click to edit commanding officer" : ""} // Tooltip
                            >
                                {command.commandingOfficer || '---'} {/* Display CO name or placeholder */}
                            </div>
                        )}
                    </div>
                    <div className="input-group flex-col items-center">
                        <span className="restricted-text">WARCHEST (SP):</span>
                        <div className="inline-edit">{command.totalSupportPoints}</div>
                    </div>
                    <div className="input-group flex-col items-center">
                        <span className="restricted-text">REPUTATION:</span>
                        <div className="inline-edit">{command.reputation}</div>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
                <main className="registry-main" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <section className="dashboard-section tactical-panel" data-id="FORCE-SUMMARY">
                        <div style={{ display: 'flex', gap: '25px' }}>
                            <div style={{ width: '220px', borderRight: '1px dashed var(--accent-dim)', paddingRight: '25px' }} data-id="ORG-STRUCTURE">
                                <h3 className="zone-header">ORGANIZATION</h3>
                                {!isManagerView && (
                                    <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                                        <button
                                            className={`mode-btn text-left ${selectedDetachmentId === null ? 'active' : ''}`}
                                            onClick={() => setSelectedDetachmentId(null)}
                                            style={{ flex: 1 }}
                                        >
                                            COMMAND
                                        </button>
                                        <button className="mode-btn" onClick={handleCreateDetachment}>+</button>
                                    </div>
                                )}
                                {detachments
                                    .filter(det => !isManagerView || det.id === selectedDetachmentId)
                                    .map(det => (
                                        <div key={det.id} style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                                            <button
                                                className={`mode-btn text-left ${selectedDetachmentId === det.id ? 'active' : ''}`}
                                                onClick={() => setSelectedDetachmentId(det.id)}
                                                style={{ flex: 1 }}
                                            >
                                                {det.name}
                                            </button>
                                            {!isManagerView && <button className="mode-btn" style={{ color: 'var(--terminal-alert)' }} onClick={() => handleDeleteDetachment(det.id)}>X</button>}
                                        </div>
                                    ))}

                                {selectedDetachmentId && (() => {
                                    const currentDet = command.detachments?.find((d: any) => d.id === selectedDetachmentId);

                                    if (currentDet?.campaignId) {
                                        return (
                                            <div className="tactical-panel" style={{ marginTop: '20px', padding: '10px' }}>
                                                <h4 className="restricted-text" style={{ fontSize: '0.6rem', marginBottom: '10px' }}>ACTIVE DEPLOYMENT</h4>
                                                <div className="flex flex-gap-5">
                                                    <button
                                                        className="mode-btn"
                                                        style={{ flex: 2, fontSize: '0.7rem' }}
                                                        onClick={() => onViewCampaign?.(currentDet.campaignId!)}
                                                    >
                                                        VIEW THEATER
                                                    </button>
                                                    {!isManagerView && <button
                                                        className="mode-btn"
                                                        style={{ flex: 1, fontSize: '0.7rem', color: 'var(--terminal-alert)' }}
                                                        onClick={handleLeaveCampaign}
                                                    >
                                                        LEAVE
                                                    </button>}
                                                </div>
                                            </div>
                                        );
                                    }

                                    if (isManagerView) return null;

                                    return (
                                        <div className="tactical-panel" style={{ marginTop: '20px', padding: '10px' }}>
                                            <label htmlFor="invite-token" className="restricted-text" style={{ fontSize: '0.6rem' }}>CAMPAIGN RECRUITMENT</label>
                                            <div className="status-bar theme-amber" style={{ padding: '0 5px', display: 'flex', alignItems: 'center' }}>
                                                <input
                                                    id="invite-token"
                                                    className="table-input w-100"
                                                    style={{ border: 'none' }}
                                                    placeholder="INVITE TOKEN..."
                                                    value={inviteToken}
                                                    onChange={(e) => setInviteToken(e.target.value)}
                                                    title="Enter campaign invitation key"
                                                />
                                            </div>
                                            <button className="mode-btn" style={{ width: '100%', marginTop: '5px', fontSize: '0.7rem' }} onClick={handleJoinCampaign}>JOIN THEATER</button>
                                        </div>
                                    );
                                })()}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 className="zone-header">{selectedDetachmentId ? 'DETACHMENT READINESS' : 'COMMAND READINESS'}</h3>
                                <DetachmentReadinessSummary
                                    units={filteredUnits}
                                    pilots={filteredPilots}
                                    compact
                                    campaignRating={selectedDetachmentId ? (command.detachments?.find((d: any) => d.id === selectedDetachmentId)?.campaignRating ?? undefined) : undefined}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="dashboard-section tactical-panel" data-id="ASSET-REG">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3 className="zone-header" style={{ margin: 0 }}>COMBAT UNIT ROSTER</h3>
                            {!isManagerView && (
                                <div className="flex flex-gap-10">
                                    <button className="mode-btn" onClick={handleAddUnit} style={{ fontSize: '0.7rem' }}>+ PROCURE UNIT</button>
                                </div>
                            )}
                        </div>
                        <table className="tactical-table">
                            <thead>
                                <tr>
                                    <th title="Chassis of the unit (ex. Shadow Hawk)">MODEL</th>
                                    <th className="text-center" title="Variant of the unit (ex. SHD-2K)">VARIANT</th>
                                    <th className="text-center">VALUE (BV [PV])</th>
                                    <th className="text-center">STATUS</th>
                                    {!selectedDetachmentId && <th className="text-center">DETACHMENT</th>}
                                    <th className="text-center"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUnits.map((u: CombatUnit) => (
                                    <tr key={u.id}>
                                        <td>{u.model}</td>
                                        <td className="text-center">{u.variant || '---'}</td>
                                        <td className="text-center">{u.bv} [{u.pv}]</td>
                                        <td className="text-center">{u.status}</td>
                                        {!selectedDetachmentId && (
                                            <td className="text-center">
                                                <div className="status-bar theme-amber" style={{ padding: '0 5px', display: 'flex', alignItems: 'center' }}>
                                                    <select
                                                        className="table-input"
                                                        style={{ border: 'none' }}
                                                        title="Assign to Detachment"
                                                        value={u.detachmentId || ""}
                                                        onChange={(e) => handleAssignAsset('UNIT', u.id, e.target.value)}
                                                    >
                                                        <option value="">[ HANGAR ]</option>
                                                        {detachments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                                    </select>
                                                </div>
                                            </td>
                                        )}
                                        {!isManagerView && (
                                            <td className="text-center">
                                                <div style={{ display: 'flex', gap: '3px', justifyContent: 'center' }}>
                                                    <button
                                                        className="mode-btn"
                                                        style={{ padding: '2px 8px', color: 'var(--terminal-green)', borderColor: 'var(--terminal-green)', fontSize: '0.65rem' }}
                                                        onClick={() => handleEditUnit(u)}
                                                        title="Edit unit record"
                                                    >EDIT</button>
                                                    <button
                                                        className="mode-btn"
                                                        style={{ padding: '2px 8px', color: 'var(--terminal-alert)', borderColor: 'var(--terminal-alert)' }}
                                                        onClick={() => handleDeleteUnit(u.id)}
                                                    >X</button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    <section className="dashboard-section tactical-panel" data-id="PERS-BARR">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3 className="zone-header" style={{ margin: 0 }}>PILOT ROSTER</h3>
                            {!isManagerView && <button className="mode-btn" onClick={handleHirePilot} style={{ fontSize: '0.7rem' }}>+ HIRE PILOT</button>}
                        </div>
                        <table className="tactical-table">
                            <thead>
                                <tr>
                                    <th>NAME</th>
                                    <th className="text-center">SKILL (G/P [AS])</th>
                                    <th className="text-center">UNIT SPECIALTY</th>
                                    <th className="text-center">WOUNDS</th>
                                    <th className="text-center">HANDICAP</th>
                                    {!selectedDetachmentId && <th className="text-center">DETACHMENT</th>}
                                    <th className="text-center"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPilots.map((p: Pilot) => (
                                    <tr key={p.id}>
                                        <td>{p.name}</td>
                                        <td className="text-center">{p.gunnery}/{p.piloting} [{p.asSkill}]</td>
                                        <td className="text-center">{p.unitType}</td>
                                        <td className="text-center">{p.wounds}</td>
                                        <td className="text-center">{p.handicap}</td>
                                        {!selectedDetachmentId && (
                                            <td className="text-center">
                                                <div className="status-bar theme-amber" style={{ padding: '0 5px', display: 'flex', alignItems: 'center' }}>
                                                    <select
                                                        className="table-input"
                                                        style={{ border: 'none' }}
                                                        title="Assign to Barracks/Detachment"
                                                        value={p.detachmentId || ""}
                                                        onChange={(e) => handleAssignAsset('PILOT', p.id, e.target.value)}
                                                    >
                                                        <option value="">[ BARRACKS ]</option>
                                                        {detachments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                                    </select>
                                                </div>
                                            </td>
                                        )}
                                        {!isManagerView && (
                                            <td className="text-center">
                                                <div style={{ display: 'flex', gap: '3px', justifyContent: 'center' }}>
                                                    <button
                                                        className="mode-btn"
                                                        style={{ padding: '2px 8px', color: 'var(--terminal-green)', borderColor: 'var(--terminal-green)', fontSize: '0.65rem' }}
                                                        onClick={() => handleEditPilot(p)}
                                                        title="Edit pilot record"
                                                    >EDIT</button>
                                                    <button
                                                        className="mode-btn"
                                                        style={{ padding: '2px 8px', color: 'var(--terminal-alert)', borderColor: 'var(--terminal-alert)' }}
                                                        onClick={() => handleDeletePilot(p.id)}
                                                    >X</button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </main>

                {!isManagerView && (
                    <section className="dashboard-section tactical-panel" data-id={selectedDetachmentId ? "DETACHMENT-LEDGER" : "COMMAND-LEDGER"} style={{ gridColumn: '1 / -1', marginTop: '30px' }}>
                        <h3 className="zone-header">{selectedDetachmentId ? 'DETACHMENT LEDGER' : 'COMMAND LEDGER'}</h3>

                        <div style={{ marginBottom: '30px', borderBottom: '1px dashed var(--accent-dim)', paddingBottom: '20px' }}>
                            <LedgerEntryForm
                                commandId={commandId}
                                detachmentId={selectedDetachmentId}
                                campaignId={command.detachments?.find((d: any) => d.id === selectedDetachmentId)?.campaignId}
                                initialCampaignName={command.detachments?.find((d: any) => d.id === selectedDetachmentId)?.campaignName || ''}
                                onEntryAdded={() => refetch()}
                            />
                        </div>

                        <table className="tactical-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '10%' }}>DATE</th>
                                    <th style={{ width: '35%' }}>DESCRIPTION</th>
                                    <th className="text-right" style={{ width: '10%' }}>SP (+/-)</th>
                                    <th className="text-right" style={{ width: '10%' }}>REP (+/-)</th>
                                    <th className="text-center" style={{ width: '25%' }}>CONTRACT</th>
                                    <th className="text-center" style={{ width: '10%' }}>MO</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedLedger.length > 0 ? (
                                    paginatedLedger.map(entry => (
                                        <tr key={entry.id}>
                                            <td>{new Date(entry.timestamp).toLocaleDateString()}</td>
                                            <td>{entry.description}</td>
                                            <td className="text-right" style={{ color: (entry.amount || 0) >= 0 ? 'var(--terminal-green)' : 'var(--terminal-alert)' }}>
                                                {(entry.amount || 0) > 0 ? `+${entry.amount}` : entry.amount}
                                            </td>
                                            <td className="text-right" style={{ color: (entry.reputationChange || 0) > 0 ? 'var(--terminal-green)' : (entry.reputationChange || 0) < 0 ? 'var(--terminal-alert)' : 'inherit' }}>
                                                {entry.reputationChange != null && entry.reputationChange !== 0
                                                    ? (entry.reputationChange > 0 ? `+${entry.reputationChange}` : entry.reputationChange)
                                                    : '-'}
                                            </td>
                                            <td className="text-center">{entry.campaignName || '-'}</td>
                                            <td className="text-center">{entry.monthIndex || '-'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-center restricted-text">NO TRANSACTIONS RECORDED</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {sortedLedger.length > entriesPerPage && (
                            <div className="flex-between items-center mt-15 pt-10" style={{ borderTop: '1px dashed var(--accent-dim)' }}>
                                <div className="restricted-text sm-text subdued">
                                    ENTRIES: {sortedLedger.length} | PAGE {ledgerPage} OF {totalPages}
                                </div>
                                <div className="flex flex-gap-10">
                                    <button
                                        className="mode-btn sm-text"
                                        disabled={ledgerPage <= 1}
                                        onClick={() => setLedgerPage(prev => Math.max(1, prev - 1))}
                                    >PREV</button>
                                    <button
                                        className="mode-btn sm-text"
                                        disabled={ledgerPage >= totalPages}
                                        onClick={() => setLedgerPage(prev => Math.min(totalPages, prev + 1))}
                                    >NEXT</button>
                                </div>
                            </div>
                        )}
                    </section>
                )}
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

            {showPilotEditor && (
                <PilotEditor
                    pilot={editingPilot}
                    commandId={commandId}
                    detachmentId={selectedDetachmentId}
                    mode={pilotEditorMode}
                    onSave={handlePilotEditorSave}
                    onCancel={handlePilotEditorCancel}
                    availableSP={command.totalSupportPoints}
                />
            )}

            {showCombatUnitEditor && (
                <CombatUnitEditor
                    unit={editingUnit}
                    commandId={commandId}
                    detachmentId={selectedDetachmentId}
                    mode={combatUnitEditorMode}
                    onSave={handleCombatUnitEditorSave}
                    onCancel={handleCombatUnitEditorCancel}
                    unitTypes={unitTypes}
                    unitStatuses={unitStatuses}
                    techBases={techBases}
                    availableSP={command.totalSupportPoints}
                />
            )}

            <style>{`
                .theme-amber .cursor-pointer:hover { background-color: rgba(255, 176, 0, 0.15); box-shadow: 0 0 5px rgba(255, 176, 0, 0.1); }
                .theme-blue .cursor-pointer:hover { background-color: rgba(0, 191, 255, 0.15); box-shadow: 0 0 5px rgba(0, 191, 255, 0.1); }
                .theme-green .cursor-pointer:hover { background-color: rgba(51, 255, 51, 0.15); box-shadow: 0 0 5px rgba(51, 255, 51, 0.1); }
                .theme-red .cursor-pointer:hover { background-color: rgba(255, 51, 51, 0.15); box-shadow: 0 0 5px rgba(255, 51, 51, 0.1); }
                .status-bar select.table-input { background: transparent; color: inherit; }
                .status-bar input.table-input { background: transparent; color: inherit; }
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
                .tactical-panel, .dashboard-section {
                    background-color: rgba(5, 7, 5, 0.3) !important;
                    backdrop-filter: blur(1px);
                }
            `}</style>
        </div>
    );
};