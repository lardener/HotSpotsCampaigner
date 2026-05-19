import React, { useState, useRef, useEffect } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { LedgerEntryForm } from './LedgerEntryForm';

const GET_UNIT_DOSSIER = gql`
  query GetUnitDossier($commandId: ID!) {
    getCommand(id: $commandId) {
      id
      name
      totalSupportPoints
      reputation
      experienceLevel
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
        unitType
        status
        detachmentId
      }
      detachments {
        id
        name
      }
      allLedgerEntries {
        id
        timestamp
        description
        amount
        coverAmount
        paidAmount
        reputationChange
      }
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

const HIRE_PILOT = gql`
  mutation HirePilot($commandId: ID!, $input: PilotInput!) {
    hirePilot(commandId: $commandId, input: $input) {
      id
      name
      gunnery
      piloting
      asSkill
      unitType
      status
      detachmentId
    }
  }
`;

const ADD_UNIT = gql`
  mutation AddCombatUnit($commandId: ID!, $input: CombatUnitInput!) {
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
  mutation UpdateCommand($id: ID!, $co: String, $sp: Int, $rep: Int) {
    updateCommand(id: $id, commandingOfficer: $co, totalSupportPoints: $sp, reputation: $rep) {
      id
      commandingOfficer
      totalSupportPoints
      reputation
      experienceLevel
    }
  }
`;

const UPDATE_UNIT = gql`
  mutation UpdateUnit($id: ID!, $input: CombatUnitInput!) {
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

const UPDATE_PILOT = gql`
  mutation UpdatePilot($id: ID!, $input: PilotInput!) {
    updatePilot(id: $id, input: $input) { 
      id
      name
      gunnery
      piloting
      asSkill
      unitType
      status
    }
  }
`;

const JOIN_CAMPAIGN = gql`
  mutation JoinCampaign($token: String!, $detachmentId: ID!) {
    joinCampaign(token: $token, detachmentId: $detachmentId)
  }
`;

interface CombatUnit {
    id: string;
    type: string;
    model: string;
    variant: string;
    techBase: string;
    tonnage: number;
    asSize: number;
    bv: number;
    pv: number;
    status: string;
    detachmentId?: string | null;
}

interface Pilot {
    id: string;
    name: string;
    gunnery: number;
    piloting: number;
    asSkill: number;
    unitType: string;
    status: string;
    detachmentId?: string | null;
}

interface LedgerEntry {
    id: string;
    detachmentId?: string;
    amount: number;
    description: string;
    timestamp: string;
    coverAmount?: number;
    paidAmount?: number;
    reputationChange?: number;
}

interface UpdateCommandVars {
    id: string;
    co?: string;
    sp?: number;
    rep?: number;
}

interface CombatUnitInput {
    type?: string;
    model?: string;
    variant?: string;
    techBase?: string;
    tonnage?: number;
    asSize?: number;
    bv?: number;
    pv?: number;
    status?: string;
    detachmentId?: string | null;
}

interface UpdateUnitVars {
    id: string;
    input: CombatUnitInput;
}

interface PilotInput {
    name?: string;
    gunnery?: number;
    piloting?: number;
    asSkill?: number;
    unitType?: string;
    status?: string;
    detachmentId?: string | null;
}

interface UpdatePilotVars {
    id: string;
    input: PilotInput;
}

interface AddUnitVars {
    commandId: string;
    input: CombatUnitInput;
}

interface HirePilotVars {
    commandId: string;
    input: PilotInput;
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

interface AddUnitData {
    addCombatUnit: CombatUnit;
}

interface HirePilotData {
    hirePilot: Pilot;
}

interface ManagedCampaign {
    id: string;
    name: string;
}

type Detachment = any; // Placeholder, as detachments are not yet fully typed from GraphQL

interface UnitDossierData {
    getCommand: {
        id: string;
        name: string;
        totalSupportPoints: number;
        reputation: number;
        experienceLevel: string;
        commandingOfficer: string;
        units: CombatUnit[];
        detachments: Detachment[];
        pilots: Pilot[];
        allLedgerEntries: LedgerEntry[];
    };
    managedCampaigns: ManagedCampaign[];
}

interface CommandDashboardProps {
    commandId: string;
    detachmentId?: string;
    isManagerView?: boolean;
}

export const CommandDashboard: React.FC<CommandDashboardProps> = ({ commandId, detachmentId, isManagerView }) => {
    const [selectedDetachmentId, setSelectedDetachmentId] = useState<string | null>(null); // null means Pool

    // Form states
    const [isSyncing, setIsSyncing] = useState(false);
    const [justAddedId, setJustAddedId] = useState<string | null>(null);
    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const [inviteToken, setInviteToken] = useState('');

    // Synchronize selection with prop changes (e.g. from Navigation Tree)
    useEffect(() => {
        setSelectedDetachmentId(detachmentId || null);
    }, [detachmentId]);

    const { loading, data, refetch } = useQuery<UnitDossierData>(GET_UNIT_DOSSIER, {
        variables: { commandId }
    });

    const [joinCampaign] = useMutation(JOIN_CAMPAIGN);

    const [updateCommand] = useMutation<any, UpdateCommandVars>(UPDATE_COMMAND);
    const [updateUnit] = useMutation<any, UpdateUnitVars>(UPDATE_UNIT);
    const [updatePilot] = useMutation<any, UpdatePilotVars>(UPDATE_PILOT);
    const [assignAsset] = useMutation<any, { assetType: string, assetId: string, detachmentId: string | null }>(ASSIGN_ASSET, {
        update(cache, { data: result }, { variables }) {
            if (result?.assignAsset && variables) {
                const queryVars = { commandId };
                const existing = cache.readQuery<UnitDossierData>({ query: GET_UNIT_DOSSIER, variables: queryVars });
                if (existing?.getCommand) {
                    const { assetType, assetId, detachmentId } = variables;
                    const getCommand = { ...existing.getCommand };
                    if (assetType === 'UNIT') {
                        getCommand.units = getCommand.units.map(u => u.id === assetId ? { ...u, detachmentId } : u);
                    } else {
                        getCommand.pilots = getCommand.pilots.map(p => p.id === assetId ? { ...p, detachmentId } : p);
                    }
                    cache.writeQuery({ query: GET_UNIT_DOSSIER, variables: queryVars, data: { ...existing, getCommand } });
                }
            }
        }
    });

    const [addUnit] = useMutation<AddUnitData, AddUnitVars>(ADD_UNIT, {
        update(cache, { data: addData }) {
            if (!addData?.addCombatUnit) return;
            const existing = cache.readQuery<UnitDossierData>({ query: GET_UNIT_DOSSIER, variables: { commandId } });
            if (existing?.getCommand) {
                cache.writeQuery({
                    query: GET_UNIT_DOSSIER,
                    variables: { commandId },
                    data: {
                        ...existing,
                        getCommand: {
                            ...existing.getCommand,
                            units: [...existing.getCommand.units, addData.addCombatUnit]
                        }
                    }
                });
            }
        }
    });

    const [hirePilot] = useMutation<HirePilotData, HirePilotVars>(HIRE_PILOT, {
        update(cache, { data: hireData }) {
            if (!hireData?.hirePilot) return;
            const existing = cache.readQuery<UnitDossierData>({ query: GET_UNIT_DOSSIER, variables: { commandId } });
            if (existing?.getCommand) {
                cache.writeQuery({
                    query: GET_UNIT_DOSSIER,
                    variables: { commandId },
                    data: {
                        ...existing,
                        getCommand: {
                            ...existing.getCommand,
                            pilots: [...existing.getCommand.pilots, hireData.hirePilot]
                        }
                    }
                });
            }
        }
    });

    const [deleteDetachment] = useMutation<any, DeleteDetachmentVars>(DELETE_DETACHMENT, {
        update(cache, { data: result }, { variables }) {
            if (result?.deleteDetachment && variables?.detachmentId) {
                cache.evict({ id: cache.identify({ __typename: 'Detachment', id: variables.detachmentId }) });
                cache.gc();
            }
        }
    });

    const [deleteUnit] = useMutation<any, DeleteUnitVars>(DELETE_UNIT, {
        update(cache, { data: result }, { variables }) {
            if (result?.deleteUnit && variables?.unitId) {
                cache.evict({ id: cache.identify({ __typename: 'CombatUnit', id: variables.unitId }) });
                cache.gc();
            }
        }
    });

    const [deletePilot] = useMutation<any, DeletePilotVars>(DELETE_PILOT, {
        update(cache, { data: result }, { variables }) {
            if (result?.deletePilot && variables?.pilotId) {
                cache.evict({ id: cache.identify({ __typename: 'Pilot', id: variables.pilotId }) });
                cache.gc();
            }
        }
    });

    const [createDetachment] = useMutation<any, CreateDetachmentVars>(CREATE_DETACHMENT, {
        update(cache, { data: createData }) {
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

    const saveTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

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
            const vars: any = { id: commandId };
            if (field === 'CO') vars.co = value;
            if (field === 'SP') vars.sp = parseInt(value) || 0;
            if (field === 'REP') vars.rep = parseInt(value) || 0;

            const current = data?.getCommand;

            // Calculate optimistic experience level
            const optRep = vars.rep ?? current?.reputation ?? 1;
            let optLevel = current?.experienceLevel || "Green";
            if (optRep >= 9) optLevel = "Elite";
            else if (optRep >= 6) optLevel = "Veteran";
            else if (optRep >= 3) optLevel = "Regular";
            else optLevel = "Green";

            updateCommand({
                variables: vars,
                optimisticResponse: current ? {
                    updateCommand: {
                        ...current,
                        commandingOfficer: vars.co ?? current.commandingOfficer,
                        totalSupportPoints: vars.sp ?? current.totalSupportPoints,
                        reputation: vars.rep ?? current.reputation,
                        experienceLevel: optLevel,
                        __typename: 'MercenaryCommand'
                    }
                } : undefined
            })
                .then(() => { markSaved(); })
                .catch((err) => { console.error(err); setIsSyncing(false); });
        };

        if (immediate) execute();
        else saveTimeoutRef.current[key] = setTimeout(execute, 1000);
    };

    const handleUnitUpdate = (id: string, field: string, value: any, immediate = true) => {
        const key = `unit-${id}-${field}`;
        if (saveTimeoutRef.current[key]) {
            clearTimeout(saveTimeoutRef.current[key]);
            delete saveTimeoutRef.current[key];
        }

        const execute = () => {
            setIsSyncing(true);
            // Only send the field that was actually modified to prevent race conditions 
            // overwriting other fields with stale cache data.
            const isNumeric = ['tonnage', 'asSize', 'bv', 'pv'].includes(field);
            const input = {
                [field]: isNumeric ? (parseInt(value) || 0) : value
            };
            const currentUnit = data?.getCommand.units.find(u => u.id === id);
            updateUnit({
                variables: { id, input },
                optimisticResponse: currentUnit ? {
                    updateCombatUnit: {
                        ...currentUnit,
                        ...input,
                        __typename: 'CombatUnit'
                    }
                } : undefined
            })
                .then(() => { markSaved(); })
                .catch((err) => { console.error(err); setIsSyncing(false); });
        };

        if (immediate) execute();
        else saveTimeoutRef.current[key] = setTimeout(execute, 1000);
    };

    const handlePilotUpdate = (id: string, field: string, value: any, immediate = true) => {
        const key = `pilot-${id}-${field}`;
        if (saveTimeoutRef.current[key]) {
            clearTimeout(saveTimeoutRef.current[key]);
            delete saveTimeoutRef.current[key];
        }

        const execute = () => {
            setIsSyncing(true);
            // Only send the changed field for pilots as well
            const isNumeric = ['gunnery', 'piloting', 'asSkill'].includes(field);
            const input = {
                [field]: isNumeric ? (parseInt(value) || 0) : value
            };
            const currentPilot = data?.getCommand.pilots.find(p => p.id === id);
            updatePilot({
                variables: { id, input },
                optimisticResponse: currentPilot ? {
                    updatePilot: {
                        ...currentPilot,
                        ...input,
                        __typename: 'Pilot'
                    }
                } : undefined
            })
                .then(() => { markSaved(); })
                .catch((err) => { console.error(err); setIsSyncing(false); });
        };

        if (immediate) execute();
        else saveTimeoutRef.current[key] = setTimeout(execute, 1000);
    };

    const handleAddUnit = async () => {
        try {
            const { data: addData } = await addUnit({
                variables: {
                    commandId,
                    input: {
                        model: "NEW UNIT",
                        tonnage: 0,
                        type: 'BM',
                        status: 'Nominal',
                        detachmentId: selectedDetachmentId
                    }
                }
            });
            if (addData?.addCombatUnit?.id) setJustAddedId(addData.addCombatUnit.id);
        } catch (err) { alert("Failed to add unit."); }
    };

    const handleHirePilot = async () => {
        try {
            const { data: hireData } = await hirePilot({
                variables: {
                    commandId,
                    input: {
                        name: "NEW PILOT",
                        gunnery: 4,
                        piloting: 5,
                        status: 'Healthy',
                        detachmentId: selectedDetachmentId
                    }
                }
            });
            if (hireData?.hirePilot?.id) setJustAddedId(hireData.hirePilot.id);
        } catch (err) { alert("Failed to hire pilot."); }
    };

    const handleDeleteUnit = async (id: string) => {
        if (!window.confirm("SCRAP THIS ASSET? THIS ACTION IS PERMANENT.")) return;
        try {
            await deleteUnit({ variables: { unitId: id } });
        } catch (err) { alert("Failed to scrap unit."); }
    };

    const handleDeletePilot = async (id: string) => {
        if (!window.confirm("DISCHARGE THIS PERSONNEL? THIS ACTION IS PERMANENT.")) return;
        try {
            await deletePilot({ variables: { pilotId: id } });
        } catch (err) { alert("Failed to discharge pilot."); }
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
        } catch (err) { alert("Assignment failed."); }
    };

    const handleJoinCampaign = async () => {
        if (!selectedDetachmentId || !inviteToken) return;
        try {
            await joinCampaign({ variables: { token: inviteToken, detachmentId: selectedDetachmentId } });
            alert("RECRUITMENT SUCCESSFUL: DETACHMENT DEPLOYED.");
            setInviteToken('');
            window.location.reload();
        } catch (err) { alert("RECRUITMENT FAILURE: INVALID OR EXPIRED TOKEN."); }
    };

    const handleCreateDetachment = async () => {
        const name = prompt("Enter Detachment Callsign:");
        if (!name) return;

        try {
            await createDetachment({
                variables: {
                    commandId,
                    campaignId: null,
                    name
                }
            });
        } catch (err) { alert("Failed to create detachment."); }
    };

    const handleDeleteDetachment = async (id: string) => {
        if (!window.confirm("Delete detachment? Assets will return to pool.")) return;
        try {
            await deleteDetachment({ variables: { detachmentId: id } });
            if (selectedDetachmentId === id) {
                setSelectedDetachmentId(null);
            }
        } catch (err) {
            alert("Failed to delete detachment.");
        }
    };

    if (loading && !data) return <div className="loading-intel">RETRIEVING UNIT DOSSIER...</div>;
    const command = data?.getCommand;
    if (!command) return <div className="error-message">COMMAND NOT FOUND.</div>;

    // Filter rosters for the focused detachment
    const filteredUnits = selectedDetachmentId
        ? command.units.filter(u => u.detachmentId === selectedDetachmentId)
        : command.units;

    const filteredPilots = selectedDetachmentId
        ? command.pilots.filter(p => p.detachmentId === selectedDetachmentId)
        : command.pilots;

    const filteredLedger = selectedDetachmentId
        ? command.allLedgerEntries.filter(e => e.detachmentId === selectedDetachmentId)
        : command.allLedgerEntries;

    // Calculate Summaries based on filtered assets
    const unitSummaries = Object.values(filteredUnits.reduce((acc, u) => {
        const type = u.type || 'UNKNOWN';
        if (!acc[type]) acc[type] = { type, count: 0, tons: 0, bv: 0, pv: 0, sz: 0 };
        acc[type].count++;
        acc[type].tons += u.tonnage || 0;
        acc[type].bv += u.bv || 0;
        acc[type].pv += u.pv || 0;
        acc[type].sz += u.asSize || 0;
        return acc;
    }, {} as Record<string, any>));

    const pilotSummaries = Object.values(filteredPilots.reduce((acc, p) => {
        const spec = p.unitType || 'UNKNOWN';
        if (!acc[spec]) acc[spec] = { spec, count: 0, gun: 0, pil: 0, as: 0 };
        acc[spec].count++;
        acc[spec].gun += p.gunnery || 0;
        acc[spec].pil += p.piloting || 0;
        acc[spec].as += p.asSkill || 0;
        return acc;
    }, {} as Record<string, any>));

    const detachments: Detachment[] = command.detachments || [];

    const UNIT_TYPES = ['BM', 'CV', 'PM', 'IM', 'BA', 'CI'];
    const TECH_BASES = ['Inner Sphere', 'Clan', 'Mixed'];
    const UNIT_STATUS_OPTIONS = ["Nominal", "Armor Damage", "Internal Damage", "Crippled", "Destroyed", "Truly Destroyed"];
    const PILOT_STATUS_OPTIONS = ["Healthy", "Injured", "Injured x 2", "Injured x 3", "Injured x 4", "Injured x 5", "Dead"];

    return (
        <div key={commandId} className="container unit-profile theme-amber">
            <header className="dashboard-header dossier-header" style={{ borderBottom: '2px solid var(--accent-primary)', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 className="terminal-text">{command.name} - COMMAND DASHBOARD</h1>
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
                        <input
                            id="header-co"
                            disabled={isManagerView}
                            className="inline-edit"
                            defaultValue={command.commandingOfficer}
                            onChange={(e) => handleHeaderUpdate('CO', e.target.value, false)}
                            onBlur={(e) => handleHeaderUpdate('CO', e.target.value, true)}
                            title="Commanding Officer Name"
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="header-sp" className="restricted-text">WARCHEST (SP):</label>
                        <input
                            id="header-sp"
                            disabled={isManagerView}
                            type="number"
                            className="inline-edit inline-edit-input"
                            defaultValue={command.totalSupportPoints}
                            onChange={(e) => handleHeaderUpdate('SP', e.target.value, false)}
                            onBlur={(e) => handleHeaderUpdate('SP', e.target.value, true)}
                            title="Total Support Points"
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="header-rep" className="restricted-text">REPUTATION:</label>
                        <input
                            id="header-rep"
                            disabled={isManagerView}
                            type="number"
                            className="inline-edit inline-edit-input-small"
                            defaultValue={command.reputation}
                            onChange={(e) => handleHeaderUpdate('REP', e.target.value, false)}
                            onBlur={(e) => handleHeaderUpdate('REP', e.target.value, true)}
                            title="Force Reputation Score"
                        />
                        <span className="restricted-text input-group-gap">[ LVL: {command.experienceLevel.toUpperCase()} ]</span>
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

                    {selectedDetachmentId && !isManagerView && (
                        <div className="tactical-panel" style={{ marginTop: '20px', padding: '10px' }}>
                            <label htmlFor="invite-token" className="restricted-text" style={{ fontSize: '0.6rem' }}>CAMPAIGN RECRUITMENT</label>
                            <input
                                id="invite-token"
                                className="table-input"
                                placeholder="INVITE TOKEN..."
                                value={inviteToken}
                                onChange={(e) => setInviteToken(e.target.value)}
                                title="Enter campaign invitation key"
                            />
                            <button className="mode-btn" style={{ width: '100%', marginTop: '5px', fontSize: '0.7rem' }} onClick={handleJoinCampaign}>JOIN THEATER</button>
                        </div>
                    )}
                </aside>

                <main className="registry-main" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <section className="dashboard-section tactical-panel" data-id="FORCE-SUMMARY">
                        <h3 className="zone-header">{selectedDetachmentId ? 'DETACHMENT READINESS' : 'COMMAND READINESS'}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <span className="restricted-text" style={{ fontSize: '0.7rem' }}>UNIT READINESS</span>
                                <table className="tactical-table" style={{ marginTop: '5px' }}>
                                    <thead>
                                        <tr>
                                            <th className="text-center">TYPE</th>
                                            <th className="text-center">QTY</th>
                                            <th className="text-center">TONS</th>
                                            <th className="text-center">BV</th>
                                            <th className="text-center">PV</th>
                                            <th className="text-center">SZ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {unitSummaries.map((s: any) => (
                                            <tr key={s.type}>
                                                <td className="text-center">{s.type}</td>
                                                <td className="text-center">{s.count}</td>
                                                <td className="text-right">{s.tons}</td>
                                                <td className="text-right">{s.bv}</td>
                                                <td className="text-right">{s.pv}</td>
                                                <td className="text-center">{s.sz}</td>
                                            </tr>
                                        ))}
                                        <tr style={{ borderTop: '2px solid var(--accent-dim)', fontWeight: 'bold' }}>
                                            <td className="text-center">TOTAL</td>
                                            <td className="text-center">{unitSummaries.reduce((sum: number, s: any) => sum + s.count, 0)}</td>
                                            <td className="text-right">{unitSummaries.reduce((sum: number, s: any) => sum + s.tons, 0)}</td>
                                            <td className="text-right">{unitSummaries.reduce((sum: number, s: any) => sum + s.bv, 0)}</td>
                                            <td className="text-right">{unitSummaries.reduce((sum: number, s: any) => sum + s.pv, 0)}</td>
                                            <td className="text-center">{unitSummaries.reduce((sum: number, s: any) => sum + s.sz, 0)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div>
                                <span className="restricted-text" style={{ fontSize: '0.7rem' }}>PILOT READINESS</span>
                                <table className="tactical-table" style={{ marginTop: '5px' }}>
                                    <thead>
                                        <tr>
                                            <th className="text-center">SPECIALTY</th>
                                            <th className="text-center">QTY</th>
                                            <th className="text-center">AVG GUN</th>
                                            <th className="text-center">AVG PIL</th>
                                            <th className="text-center">AVG AS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pilotSummaries.map((s: any) => (
                                            <tr key={s.spec}>
                                                <td className="text-center">{s.spec}</td>
                                                <td className="text-center">{s.count}</td>
                                                <td className="text-center">{(s.gun / s.count).toFixed(1)}</td>
                                                <td className="text-center">{(s.pil / s.count).toFixed(1)}</td>
                                                <td className="text-center">{(s.as / s.count).toFixed(1)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    <section className="dashboard-section tactical-panel" data-id="ASSET-REG">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3 className="zone-header" style={{ margin: 0 }}>COMBAT UNIT ROSTER</h3>
                            {!isManagerView && <button className="mode-btn" onClick={handleAddUnit} style={{ fontSize: '0.7rem' }}>+ PROCURE UNIT</button>}
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
                                {filteredUnits.map(u => (
                                    <tr key={u.id}>
                                        <td className="text-center">
                                            <select
                                                className="table-input"
                                                title="Unit Classification"
                                                autoFocus={u.id === justAddedId}
                                                onFocus={() => setJustAddedId(null)}
                                                defaultValue={u.type}
                                                onChange={(e) => handleUnitUpdate(u.id, 'type', e.target.value)}
                                                onBlur={(e) => handleUnitUpdate(u.id, 'type', e.target.value, true)}
                                            >
                                                {UNIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </td>
                                        <td><input
                                            className="table-input"
                                            title="Unit Model"
                                            defaultValue={u.model}
                                            onChange={(e) => handleUnitUpdate(u.id, 'model', e.target.value, false)}
                                            onBlur={(e) => handleUnitUpdate(u.id, 'model', e.target.value, true)}
                                        /></td>
                                        <td className="text-center"><input
                                            className="table-input"
                                            title="Unit Variant"
                                            style={{ width: '10em' }}
                                            defaultValue={u.variant}
                                            onChange={(e) => handleUnitUpdate(u.id, 'variant', e.target.value, false)}
                                            onBlur={(e) => handleUnitUpdate(u.id, 'variant', e.target.value, true)}
                                        /></td>
                                        <td className="text-center">
                                            <select
                                                className="table-input"
                                                title="Technology Base"
                                                defaultValue={u.techBase}
                                                onChange={(e) => handleUnitUpdate(u.id, 'techBase', e.target.value)}
                                                onBlur={(e) => handleUnitUpdate(u.id, 'techBase', e.target.value, true)}
                                            >
                                                {TECH_BASES.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </td>
                                        <td className="text-center"><input className="table-input text-right" style={{ width: '4em' }} type="number" defaultValue={u.tonnage} title="Tonnage"
                                            onChange={(e) => handleUnitUpdate(u.id, 'tonnage', e.target.value, false)}
                                            onBlur={(e) => handleUnitUpdate(u.id, 'tonnage', e.target.value, true)} /></td>
                                        <td className="text-center"><input className="table-input text-right" style={{ width: '3em' }} type="number" defaultValue={u.asSize} title="AS Size"
                                            onChange={(e) => handleUnitUpdate(u.id, 'asSize', e.target.value, false)}
                                            onBlur={(e) => handleUnitUpdate(u.id, 'asSize', e.target.value, true)} /></td>
                                        <td className="text-center"><input className="table-input text-right" style={{ width: '5em' }} type="number" defaultValue={u.bv} title="Battle Value"
                                            onChange={(e) => handleUnitUpdate(u.id, 'bv', e.target.value, false)}
                                            onBlur={(e) => handleUnitUpdate(u.id, 'bv', e.target.value, true)} /></td>
                                        <td className="text-center"><input className="table-input text-right" style={{ width: '4em' }} type="number" defaultValue={u.pv} title="Point Value"
                                            onChange={(e) => handleUnitUpdate(u.id, 'pv', e.target.value, false)}
                                            onBlur={(e) => handleUnitUpdate(u.id, 'pv', e.target.value, true)} /></td>
                                        <td className="text-center">
                                            <select
                                                className="table-input"
                                                title="Unit Operational Status"
                                                defaultValue={u.status}
                                                onChange={(e) => handleUnitUpdate(u.id, 'status', e.target.value)}
                                                onBlur={(e) => handleUnitUpdate(u.id, 'status', e.target.value, true)}
                                            >
                                                {UNIT_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        </td>
                                        {!selectedDetachmentId && (
                                            <td className="text-center">
                                                <select
                                                    className="table-input"
                                                    title="Assign to Detachment"
                                                    value={u.detachmentId || ""}
                                                    onChange={(e) => handleAssignAsset('UNIT', u.id, e.target.value)}
                                                >
                                                    <option value="">[ HANGAR ]</option>
                                                    {detachments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                                </select>
                                            </td>
                                        )}
                                        {!isManagerView && (
                                            <td className="text-center">
                                                <button
                                                    className="mode-btn"
                                                    style={{ padding: '2px 8px', color: 'var(--terminal-alert)', borderColor: 'var(--terminal-alert)' }}
                                                    onClick={() => handleDeleteUnit(u.id)}
                                                >X</button>
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
                                    <th className="text-center">STATUS</th>
                                    {!selectedDetachmentId && <th className="text-center">DETACHMENT</th>}
                                    <th className="text-center"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPilots.map(p => (
                                    <tr key={p.id}>
                                        <td><input
                                            className="table-input"
                                            title="Pilot Name"
                                            autoFocus={p.id === justAddedId}
                                            onFocus={() => setJustAddedId(null)}
                                            defaultValue={p.name}
                                            onChange={(e) => handlePilotUpdate(p.id, 'name', e.target.value, false)}
                                            onBlur={(e) => handlePilotUpdate(p.id, 'name', e.target.value, true)} /></td>
                                        <td className="text-center"><input className="table-input text-right" style={{ width: '3em' }} type="number" defaultValue={p.gunnery} title="Gunnery Skill"
                                            onChange={(e) => handlePilotUpdate(p.id, 'gunnery', e.target.value, false)}
                                            onBlur={(e) => handlePilotUpdate(p.id, 'gunnery', e.target.value, true)} /></td>
                                        <td className="text-center"><input className="table-input text-right" style={{ width: '3em' }} type="number" defaultValue={p.piloting} title="Piloting Skill"
                                            onChange={(e) => handlePilotUpdate(p.id, 'piloting', e.target.value, false)}
                                            onBlur={(e) => handlePilotUpdate(p.id, 'piloting', e.target.value, true)} /></td>
                                        <td className="text-center"><input className="table-input text-right" style={{ width: '3em' }} type="number" defaultValue={p.asSkill} title="Alpha Strike Skill"
                                            onChange={(e) => handlePilotUpdate(p.id, 'asSkill', e.target.value, false)}
                                            onBlur={(e) => handlePilotUpdate(p.id, 'asSkill', e.target.value, true)} /></td>
                                        <td className="text-center">
                                            <select
                                                className="table-input"
                                                defaultValue={p.unitType}
                                                title="Pilot Specialty"
                                                onChange={(e) => handlePilotUpdate(p.id, 'unitType', e.target.value)}
                                                onBlur={(e) => handlePilotUpdate(p.id, 'unitType', e.target.value, true)}>
                                                {UNIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </td>
                                        <td className="text-center">
                                            <select
                                                className="table-input"
                                                title="Pilot Health Status"
                                                defaultValue={p.status}
                                                onChange={(e) => handlePilotUpdate(p.id, 'status', e.target.value)}
                                                onBlur={(e) => handlePilotUpdate(p.id, 'status', e.target.value, true)}
                                            >
                                                {PILOT_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        </td>
                                        {!selectedDetachmentId && (
                                            <td className="text-center">
                                                <select
                                                    className="table-input"
                                                    title="Assign to Barracks/Detachment"
                                                    value={p.detachmentId || ""}
                                                    onChange={(e) => handleAssignAsset('PILOT', p.id, e.target.value)}
                                                >
                                                    <option value="">[ BARRACKS ]</option>
                                                    {detachments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                                </select>
                                            </td>
                                        )}
                                        {!isManagerView && (
                                            <td className="text-center">
                                                <button
                                                    className="mode-btn"
                                                    style={{ padding: '2px 8px', color: 'var(--terminal-alert)', borderColor: 'var(--terminal-alert)' }}
                                                    onClick={() => handleDeletePilot(p.id)}
                                                >X</button>
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
                            onEntryAdded={() => refetch()}
                        />
                    </div>

                    <table className="tactical-table">
                        <thead>
                            <tr>
                                <th style={{ width: '10%' }}>DATE</th>
                                <th style={{ width: '40%' }}>EVENT</th>
                                <th className="text-right" style={{ width: '10%' }}>SPENT (SP)</th>
                                <th className="text-right" style={{ width: '10%' }}>PAID (SP)</th>
                                <th className="text-right" style={{ width: '10%' }}>REP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLedger.length > 0 ? (
                                filteredLedger.map(entry => (
                                    <tr key={entry.id}>
                                        <td>{new Date(entry.timestamp).toLocaleDateString()}</td>
                                        <td>{entry.description}</td>
                                        <td className="text-right">{(entry.amount || 0) - (entry.coverAmount || 0)}</td>
                                        <td className="text-right">{entry.paidAmount !== undefined ? entry.paidAmount : '-'}</td>
                                        <td className="text-right">{entry.reputationChange !== undefined ? entry.reputationChange : '-'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center restricted-text">NO TRANSACTIONS RECORDED</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </section>
            </div>
        </div>
    );
};