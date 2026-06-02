import React, { useState, useRef, useEffect } from 'react';
import { gql, ApolloCache } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { LedgerEntryForm } from './LedgerEntryForm';
import { TerminalOverlay } from './TerminalOverlay';
import { DetachmentReadinessSummary } from './DetachmentReadinessSummary';
import { PilotEditor } from './PilotEditor';
import { CombatUnitEditor } from './CombatUnitEditor';
import { CombatUnit, Pilot, Detachment, CommandUpdateInput } from '../types/global.d';
import { UNIT_STATUS_OPTIONS as FALLBACK_STATUSES, UNIT_TYPES as FALLBACK_TYPES, TECH_BASES as FALLBACK_TECH } from './Rules';

const GET_UNIT_DOSSIER = gql`
  query GetUnitDossier($commandId: ID!) {
    getCommand(id: $commandId) {
      id
      name
      totalSupportPoints
      reputation
      commandingOfficer
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
        status
        detachmentId
      }
      pilots {
        id
        name
        gunnery
        piloting
        asSkill
        edgeTokensSkill
        edgeAbilitySkill
        edgeAbilities
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
      detachments {
        id
        name
        campaignId
        campaignName
      }
      allLedgerEntries {
        id
        timestamp
        detachmentId
        description
        amount
        reputationChange
        campaignName
        monthIndex
      }
    }
    managedCampaigns(status: "ACTIVE") {
      id
      name
    }
    publicCampaignMetadata {
      unitStatuses
      unitTypes
      techBases
    }
  }
`;

const CREATE_DETACHMENT = gql`
  mutation CreateDetachment($commandId: ID!, $campaignId: ID, $name: String!) {
    createDetachment(commandId: $commandId, campaignId: $campaignId, name: $name) {
      id
      name
    }
  }
`;

const ASSIGN_ASSET = gql`
  mutation AssignAsset($assetType: String!, $assetId: ID!, $detachmentId: ID) {
    assignAsset(assetType: $assetType, assetId: $assetId, detachmentId: $detachmentId)
  }
`;

const DELETE_DETACHMENT = gql`
  mutation DeleteDetachment($detachmentId: ID!) {
    deleteDetachment(detachmentId: $detachmentId)
  }
`;

const ASSIGN_DETACHMENT = gql`
  mutation AssignDetachmentToCampaign($detachmentId: ID!, $campaignId: ID) {
    assignDetachmentToCampaign(detachmentId: $detachmentId, campaignId: $campaignId)
  }
`;

const DELETE_UNIT = gql`
  mutation DeleteUnit($unitId: ID!) {
    deleteUnit(unitId: $unitId)
  }
`;

const DELETE_PILOT = gql`
  mutation DeletePilot($pilotId: ID!) {
    deletePilot(pilotId: $pilotId)
  }
`;

const UPDATE_COMMAND = gql`
  mutation UpdateCommand($id: ID!, $input: CommandUpdateInput!) {
    updateCommand(id: $id, input: $input) {
      id
      name
      commandingOfficer
      totalSupportPoints
      reputation
    }
  }
`;

const JOIN_CAMPAIGN = gql`
  mutation JoinCampaign($token: String!, $detachmentId: ID!) {
    joinCampaign(token: $token, detachmentId: $detachmentId)
  }
`;

interface LedgerEntry {
    id: string;
    detachmentId?: string;
    amount: number;
    description: string;
    timestamp: string;
    reputationChange?: number;
    campaignName?: string;
    monthIndex?: number;
}

interface UpdateCommandVars {
    id: string;
    input: CommandUpdateInput;
}

interface DeleteUnitVars {
    unitId: string;
}

interface DeletePilotVars {
    pilotId: string;
}

interface DeleteDetachmentVars {
    detachmentId: string;
}

interface CreateDetachmentVars {
    commandId: string;
    campaignId: string | null;
    name: string;
}

interface UnitDossierData {
    getCommand: {
        id: string;
        name: string;
        totalSupportPoints: number;
        reputation: number;
        commandingOfficer: string;
        units: CombatUnit[];
        detachments: Detachment[];
        pilots: Pilot[];
        allLedgerEntries: LedgerEntry[];
    };
    managedCampaigns: { id: string; name: string; }[]; // Keep this local for now as it's a simplified version
    publicCampaignMetadata: {
        unitStatuses: string[];
        unitTypes: string[];
        techBases: string[];
    };
}

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
        onConfirm: () => void;
        variant?: 'alert' | 'info';
        children?: React.ReactNode;
    } | null>(null);

    // Synchronize selection with prop changes (e.g. from Navigation Tree)
    useEffect(() => {
        setSelectedDetachmentId(detachmentId || null);
    }, [detachmentId]);

    const { loading, error, data, refetch } = useQuery<UnitDossierData>(GET_UNIT_DOSSIER, {
        variables: { commandId },
        notifyOnNetworkStatusChange: true
    });

    useEffect(() => {
        onSyncChange?.(loading || isSyncing);
    }, [loading, isSyncing, onSyncChange]);


    const unitStatuses = data?.publicCampaignMetadata?.unitStatuses || FALLBACK_STATUSES;
    const unitTypes = data?.publicCampaignMetadata?.unitTypes || FALLBACK_TYPES;
    const techBases = data?.publicCampaignMetadata?.techBases || FALLBACK_TECH;

    const [joinCampaign] = useMutation(JOIN_CAMPAIGN);

    const [updateCommand] = useMutation<any, UpdateCommandVars>(UPDATE_COMMAND);
    const [assignDetachment] = useMutation(ASSIGN_DETACHMENT);
    const [assignAsset] = useMutation<any, { assetType: string, assetId: string, detachmentId: string | null }>(ASSIGN_ASSET, {
        update(cache: ApolloCache, { data: result }: any, { variables }: any) {
            if (result?.assignAsset && variables) {
                const queryVars = { commandId };
                const existing = cache.readQuery<UnitDossierData>({ query: GET_UNIT_DOSSIER, variables: queryVars });
                if (existing?.getCommand) {
                    const { assetType, assetId, detachmentId } = variables;
                    const getCommand = { ...existing.getCommand };
                    if (assetType === 'UNIT') {
                        getCommand.units = getCommand.units.map((u: CombatUnit) => u.id === assetId ? { ...u, detachmentId } : u);
                    } else {
                        getCommand.pilots = getCommand.pilots.map((p: Pilot) => p.id === assetId ? { ...p, detachmentId } : p);
                    }
                    cache.writeQuery({ query: GET_UNIT_DOSSIER, variables: queryVars, data: { ...existing, getCommand } });
                }
            }
        }
    });

    const [deleteDetachment] = useMutation<any, DeleteDetachmentVars>(DELETE_DETACHMENT, {
        update(cache: ApolloCache, { data: result }: any, { variables }: any) {
            if (result?.deleteDetachment && variables?.detachmentId) {
                cache.evict({ id: cache.identify({ __typename: 'Detachment', id: variables.detachmentId }) });
                cache.gc();
            }
        }
    });

    const [deleteUnit] = useMutation<any, DeleteUnitVars>(DELETE_UNIT, {
        update(cache: ApolloCache, { data: result }: any, { variables }: any) {
            if (result?.deleteUnit && variables?.unitId) {
                cache.evict({ id: cache.identify({ __typename: 'CombatUnit', id: variables.unitId }) });
                cache.gc();
            }
        }
    });

    const [deletePilot] = useMutation<any, DeletePilotVars>(DELETE_PILOT, {
        update(cache: ApolloCache, { data: result }: any, { variables }: any) {
            if (result?.deletePilot && variables?.pilotId) {
                cache.evict({ id: cache.identify({ __typename: 'Pilot', id: variables.pilotId }) });
                cache.gc();
            }
        }
    });

    const [createDetachment] = useMutation<any, CreateDetachmentVars>(CREATE_DETACHMENT, {
        update(cache: ApolloCache, { data: createData }: any) {
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
        let newName = '';
        const confirmAction = async () => {
            if (!newName.trim()) return;
            try {
                await createDetachment({
                    variables: { commandId, campaignId: null, name: newName }
                });
                setOverlay(null);
                onRefreshTree?.();
            } catch (err) { console.error(err); }
        };

        setOverlay({
            title: "NEW DETACHMENT AUTHORIZATION",
            message: "ENTER CALLSIGN FOR NEW OPERATIONAL ELEMENT:",
            onConfirm: confirmAction,
            children: (
                <input
                    className="table-input mt-15"
                    autoFocus
                    onChange={(e) => { newName = e.target.value.toUpperCase(); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') confirmAction(); }}
                    placeholder="DESIGNATION..."
                    title="Enter detachment designation"
                    aria-label="New detachment callsign"
                />
            )
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

    if (loading && !data) return <div className="loading-intel pulse"> RETRIEVING UNIT DOSSIER...</div>;

    if (error) return (
        <div className="error-message alert-border">
            <h2 className="terminal-text">COMMUNICATIONS FAILURE</h2>
            <p className="restricted-text">{error.message.toUpperCase()}</p>
        </div>
    );

    const command = data?.getCommand;
    if (!command) return <div className="error-message">COMMAND NOT FOUND.</div>;

    // Filter rosters for the focused detachment
    const filteredUnits = selectedDetachmentId
        ? command.units.filter((u: CombatUnit) => u.detachmentId === selectedDetachmentId)
        : command.units;

    const filteredPilots = selectedDetachmentId
        ? command.pilots.filter((p: Pilot) => p.detachmentId === selectedDetachmentId)
        : command.pilots;

    const filteredLedger = selectedDetachmentId
        ? command.allLedgerEntries.filter((e: LedgerEntry) => e.detachmentId === selectedDetachmentId)
        : command.allLedgerEntries;

    const detachments: Detachment[] = command.detachments || [];

    return (
        <div key={commandId} className="container unit-profile theme-amber">
            <header className="dashboard-header dossier-header" style={{ borderBottom: '2px solid var(--accent-primary)', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    {isEditingName ? (
                        <div className="flex flex-gap-10 items-center">
                            <input
                                className="inline-edit terminal-text"
                                style={{ fontSize: '2rem', height: 'auto', padding: '0 5px', width: 'auto' }}
                                defaultValue={command.name}
                                autoFocus
                                onBlur={(e) => { handleHeaderUpdate('NAME', e.target.value); setIsEditingName(false); }}
                                onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                                placeholder="COMMAND NAME..."
                                title="Enter command name"
                                aria-label="Command name"
                            />
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
                    <div className="input-group">
                        <label htmlFor="header-co" className="restricted-text">CO:</label>
                        {isEditingCO ? (
                            <input
                                id="header-co"
                                className="inline-edit"
                                defaultValue={command.commandingOfficer}
                                autoFocus
                                onBlur={(e) => { handleHeaderUpdate('CO', e.target.value); setIsEditingCO(false); }}
                                onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                                placeholder="COMMANDING OFFICER..."
                                title="Enter commanding officer name"
                                aria-label="Commanding officer"
                            />
                        ) : (
                            <div
                                className="inline-edit"
                                style={{ cursor: isManagerView ? 'default' : 'pointer', minWidth: '100px' }}
                                onClick={() => !isManagerView && setIsEditingCO(true)}
                                onFocus={() => !isManagerView && setIsEditingCO(true)}
                                tabIndex={isManagerView ? -1 : 0}
                                title={!isManagerView ? "Click or Tab to edit CO name" : ""}
                            >
                                {command.commandingOfficer || '---'}
                            </div>
                        )}
                    </div>
                    <div className="input-group">
                        <span className="restricted-text">WARCHEST (SP):</span>
                        <div className="inline-edit" style={{ cursor: 'default' }}>{command.totalSupportPoints}</div>
                    </div>
                    <div className="input-group">
                        <span className="restricted-text">REPUTATION:</span>
                        <div className="inline-edit" style={{ cursor: 'default' }}>{command.reputation}</div>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: '250px 1fr' }}>
                <aside className="tactical-panel" data-id="ORG-STRUCTURE">
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

                    {selectedDetachmentId && !isManagerView && (() => {
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
                                        <button
                                            className="mode-btn"
                                            style={{ flex: 1, fontSize: '0.7rem', color: 'var(--terminal-alert)' }}
                                            onClick={handleLeaveCampaign}
                                        >
                                            LEAVE
                                        </button>
                                    </div>
                                </div>
                            );
                        }

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
                </aside>

                <main className="registry-main" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <section className="dashboard-section tactical-panel" data-id="FORCE-SUMMARY">
                        <h3 className="zone-header">{selectedDetachmentId ? 'DETACHMENT READINESS' : 'COMMAND READINESS'}</h3>
                        <DetachmentReadinessSummary units={filteredUnits} pilots={filteredPilots} />
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
                                    <th className="text-center">TYPE</th>
                                    <th title="Chassis of the unit (ex. Shadow Hawk)">MODEL</th>
                                    <th className="text-center" title="Variant of the unit (ex. SHD-2K)">VARIANT</th>
                                    <th className="text-center" title="Tech Base">TECH</th>
                                    <th className="text-center" title="Tonnage">TONS</th>
                                    <th className="text-center" title="Alpha Strike Size">SZ</th>
                                    <th className="text-center" title="Battle Value">BV</th>
                                    <th className="text-center" title="Point Value">PV</th>
                                    <th className="text-center">STATUS</th>
                                    {!selectedDetachmentId && <th className="text-center">DETACHMENT</th>}
                                    <th className="text-center"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUnits.map((u: CombatUnit) => (
                                    <tr key={u.id}>
                                        <td className="text-center">{u.type}</td>
                                        <td>{u.model}</td>
                                        <td className="text-center">{u.variant || '---'}</td>
                                        <td className="text-center">{u.techBase}</td>
                                        <td className="text-center">{u.tonnage}</td>
                                        <td className="text-center">{u.asSize}</td>
                                        <td className="text-center">{u.bv}</td>
                                        <td className="text-center">{u.pv}</td>
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
                                    <th className="text-center">GUNNERY</th>
                                    <th className="text-center">PILOTING</th>
                                    <th className="text-center">AS SKILL</th>
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
                                        <td className="text-center">{p.gunnery}</td>
                                        <td className="text-center">{p.piloting}</td>
                                        <td className="text-center">{p.asSkill}</td>
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

                <section className="dashboard-section tactical-panel" data-id={selectedDetachmentId ? "DETACHMENT-LEDGER" : "COMMAND-LEDGER"} style={{ gridColumn: '1 / -1', marginTop: '30px' }}>
                    <h3 className="zone-header">{selectedDetachmentId ? 'DETACHMENT LEDGER' : 'COMMAND LEDGER'}</h3>

                    <div style={{ marginBottom: '30px', borderBottom: '1px dashed var(--accent-dim)', paddingBottom: '20px' }}>
                        <LedgerEntryForm
                            commandId={commandId}
                            detachmentId={selectedDetachmentId}
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
                            {filteredLedger.length > 0 ? (
                                [...filteredLedger].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(entry => (
                                    <tr key={entry.id}>
                                        <td>{new Date(entry.timestamp).toLocaleDateString()}</td>
                                        <td>{entry.description}</td>
                                        <td className="text-right" style={{ color: (entry.amount || 0) >= 0 ? 'var(--terminal-green)' : 'var(--terminal-alert)' }}>
                                            {(entry.amount || 0) > 0 ? `+${entry.amount}` : entry.amount}
                                        </td>
                                        <td className="text-right" style={{ color: (entry.reputationChange || 0) > 0 ? 'var(--terminal-green)' : (entry.reputationChange || 0) < 0 ? 'var(--terminal-alert)' : 'inherit' }}>
                                            {entry.reputationChange !== undefined && entry.reputationChange !== 0
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
                </section>
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

            {showPilotEditor && (
                <PilotEditor
                    pilot={editingPilot}
                    commandId={commandId}
                    detachmentId={selectedDetachmentId}
                    mode={pilotEditorMode}
                    onSave={handlePilotEditorSave}
                    onCancel={handlePilotEditorCancel}
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
                />
            )}

            <style>{`
                .theme-amber .cursor-pointer:hover { background-color: rgba(255, 176, 0, 0.15); box-shadow: 0 0 5px rgba(255, 176, 0, 0.1); }
                .theme-blue .cursor-pointer:hover { background-color: rgba(0, 191, 255, 0.15); box-shadow: 0 0 5px rgba(0, 191, 255, 0.1); }
                .theme-green .cursor-pointer:hover { background-color: rgba(51, 255, 51, 0.15); box-shadow: 0 0 5px rgba(51, 255, 51, 0.1); }
                .theme-red .cursor-pointer:hover { background-color: rgba(255, 51, 51, 0.15); box-shadow: 0 0 5px rgba(255, 51, 51, 0.1); }
                .status-bar select.table-input { background: transparent; color: inherit; }
                .status-bar input.table-input { background: transparent; color: inherit; }
            `}</style>
        </div>
    );
};