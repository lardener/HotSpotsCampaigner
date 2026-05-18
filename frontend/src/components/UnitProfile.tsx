import React, { useState, useRef, useEffect } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';

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
      }
      pilots {
        id
        name
        gunnery
        piloting
        asSkill
        unitType
        status
      }
      detachments {
        id
        name
      }
    }
    managedCampaigns(status: "ACTIVE") {
      id
      name
    }
  }
`;

const CREATE_DETACHMENT = gql`
  mutation CreateDetachment($commandId: ID!, $campaignId: ID!, $name: String!) {
    createDetachment(commandId: $commandId, campaignId: $campaignId, name: $name) {
      id
      name
    }
  }
`;

const HIRE_PILOT = gql`
  mutation HirePilot($commandId: ID!, $input: PilotInput!) {
    hirePilot(commandId: $commandId, input: $input) {
      id
      name
    }
  }
`;

const ADD_UNIT = gql`
  mutation AddCombatUnit($commandId: ID!, $input: CombatUnitInput!) {
    addCombatUnit(commandId: $commandId, input: $input) {
      id
      model
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

interface ManagedCampaign {
    id: string;
    name: string;
}

interface AddUnitData {
    addCombatUnit: {
        id: string;
        model: string;
    };
}

interface HirePilotData {
    hirePilot: {
        id: string;
        name: string;
    };
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
    };
    managedCampaigns: ManagedCampaign[];
}

interface UnitProfileProps {
    commandId: string;
}

export const UnitProfile: React.FC<UnitProfileProps> = ({ commandId }) => {
    const [selectedDetachmentId, setSelectedDetachmentId] = useState<string | null>(null); // null means Pool

    // Form states
    const [newDetachmentName, setNewDetachmentName] = useState('');
    const [selectedCampaignId, setSelectedCampaignId] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const [justAddedId, setJustAddedId] = useState<string | null>(null);
    const [lastSaved, setLastSaved] = useState<string | null>(null);

    const { loading, data, refetch } = useQuery<UnitDossierData>(GET_UNIT_DOSSIER, {
        variables: { commandId }
    });

    const [updateCommand] = useMutation(UPDATE_COMMAND);
    const [updateUnit] = useMutation(UPDATE_UNIT);
    const [updatePilot] = useMutation(UPDATE_PILOT);
    const [addUnit] = useMutation<AddUnitData>(ADD_UNIT);
    const [hirePilot] = useMutation<HirePilotData>(HIRE_PILOT);
    const [deleteUnit] = useMutation(DELETE_UNIT);
    const [deletePilot] = useMutation(DELETE_PILOT);
    const [createDetachment] = useMutation(CREATE_DETACHMENT);

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
            updateCommand({
                variables: vars,
                optimisticResponse: current ? {
                    updateCommand: {
                        ...current,
                        commandingOfficer: vars.co ?? current.commandingOfficer,
                        totalSupportPoints: vars.sp ?? current.totalSupportPoints,
                        reputation: vars.rep ?? current.reputation,
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
                        status: 'Nominal'
                    }
                }
            });
            if (addData?.addCombatUnit?.id) setJustAddedId(addData.addCombatUnit.id);
            refetch();
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
                        status: 'Healthy'
                    }
                }
            });
            if (hireData?.hirePilot?.id) setJustAddedId(hireData.hirePilot.id);
            refetch();
        } catch (err) { alert("Failed to hire pilot."); }
    };

    const handleDeleteUnit = async (id: string) => {
        if (!window.confirm("SCRAP THIS ASSET? THIS ACTION IS PERMANENT.")) return;
        try {
            await deleteUnit({ variables: { unitId: id } });
            refetch();
        } catch (err) { alert("Failed to scrap unit."); }
    };

    const handleDeletePilot = async (id: string) => {
        if (!window.confirm("DISCHARGE THIS PERSONNEL? THIS ACTION IS PERMANENT.")) return;
        try {
            await deletePilot({ variables: { pilotId: id } });
            refetch();
        } catch (err) { alert("Failed to discharge pilot."); }
    };

    const handleCreateDetachment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDetachmentName || !selectedCampaignId) return;
        try {
            await createDetachment({
                variables: {
                    commandId,
                    campaignId: selectedCampaignId,
                    name: newDetachmentName
                }
            });
            setNewDetachmentName('');
            setSelectedCampaignId('');
            refetch();
        } catch (err) { alert("Failed to create detachment."); }
    };

    const handleDeleteDetachment = async (id: string) => {
        if (!window.confirm("Delete detachment? Assets will return to pool.")) return;
        // Requires deleteDetachment mutation call
        alert(`Detachment deletion for ${id} logic is pending.`);
    };

    if (loading && !data) return <div className="loading-intel">RETRIEVING UNIT DOSSIER...</div>;
    const command = data?.getCommand;
    if (!command) return <div className="error-message">COMMAND NOT FOUND.</div>;

    const detachments: Detachment[] = command.detachments || [];
    const campaigns: ManagedCampaign[] = data?.managedCampaigns || [];

    const UNIT_TYPES = ['BM', 'CV', 'PM', 'IM', 'BA', 'CI'];
    const TECH_BASES = ['Inner Sphere', 'Clan', 'Mixed'];
    const UNIT_STATUS_OPTIONS = ["Nominal", "Armor Damage", "Internal Damage", "Crippled", "Destroyed", "Truly Destroyed"];
    const PILOT_STATUS_OPTIONS = ["Healthy", "Injured", "Injured x 2", "Injured x 3", "Injured x 4", "Injured x 5", "Dead"];

    return (
        <div className="container unit-profile theme-amber">
            <header className="dashboard-header" style={{ borderBottom: '2px solid var(--accent-primary)', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 className="terminal-text">{command.name} - UNIT PROFILE</h1>
                </div>
                <div className="sync-indicator text-right" style={{ paddingBottom: '5px' }}>
                    <span className={`restricted-text ${isSyncing ? 'pulse' : ''}`} style={{ color: isSyncing ? 'var(--terminal-amber)' : 'var(--terminal-green)', fontSize: '0.7rem' }}>
                        {isSyncing ? '>> UPLOADING DATA...' : '● NEURAL LINK: STABLE'}
                    </span>
                    {lastSaved && !isSyncing && <div style={{ fontSize: '0.6rem', opacity: 0.5 }}>LAST SYNC: {lastSaved}</div>}
                </div>
            </header>
            <div className="header-metadata-row" style={{ marginBottom: '20px' }}>
                <div className="tactical-header-grid" style={{ display: 'flex', gap: '40px', marginTop: '10px' }}>
                    <div className="input-group">
                        <label className="restricted-text">CO:</label>
                        <input
                            className="inline-edit"
                            defaultValue={command.commandingOfficer}
                            onChange={(e) => handleHeaderUpdate('CO', e.target.value, false)}
                            onBlur={(e) => handleHeaderUpdate('CO', e.target.value, true)}
                        />
                    </div>
                    <div className="input-group">
                        <label className="restricted-text">WARCHEST (SP):</label>
                        <input
                            type="number"
                            className="inline-edit"
                            style={{ width: '6em' }}
                            defaultValue={command.totalSupportPoints}
                            onChange={(e) => handleHeaderUpdate('SP', e.target.value, false)}
                            onBlur={(e) => handleHeaderUpdate('SP', e.target.value, true)}
                        />
                    </div>
                    <div className="input-group">
                        <label className="restricted-text">REPUTATION:</label>
                        <input
                            type="number"
                            className="inline-edit"
                            style={{ width: '4em' }}
                            defaultValue={command.reputation}
                            onChange={(e) => handleHeaderUpdate('REP', e.target.value, false)}
                            onBlur={(e) => handleHeaderUpdate('REP', e.target.value, true)}
                        />
                        <span className="restricted-text" style={{ marginLeft: '10px' }}>[ LVL: {command.experienceLevel.toUpperCase()} ]</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: '250px 1fr' }}>
                <aside className="tactical-panel" data-id="ORG-STRUCTURE">
                    <h3 className="zone-header">ORGANIZATION</h3>
                    <div
                        className={`mode-btn text-left ${selectedDetachmentId === null ? 'active' : ''}`}
                        onClick={() => setSelectedDetachmentId(null)}
                        style={{ width: '100%', marginBottom: '10px' }}
                    >
                        FORCE POOL
                    </div>
                    {detachments.map(det => (
                        <div key={det.id} style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                            <button
                                className={`mode-btn text-left ${selectedDetachmentId === det.id ? 'active' : ''}`}
                                onClick={() => setSelectedDetachmentId(det.id)}
                                style={{ flex: 1 }}
                            >
                                {det.name}
                            </button>
                            <button className="mode-btn" style={{ color: 'var(--terminal-alert)' }} onClick={() => handleDeleteDetachment(det.id)}>X</button>
                        </div>
                    ))}

                    <form onSubmit={handleCreateDetachment} style={{ marginTop: '30px', borderTop: '1px solid var(--terminal-border)', paddingTop: '15px' }}>
                        <span className="restricted-text" style={{ fontSize: '0.8rem' }}>NEW DETACHMENT</span>
                        <input
                            type="text"
                            className="mode-btn text-left"
                            placeholder="Callsign..."
                            value={newDetachmentName}
                            onChange={e => setNewDetachmentName(e.target.value)}
                            style={{ width: '100%', marginTop: '5px' }}
                        />
                        <select
                            className="mode-btn"
                            value={selectedCampaignId}
                            onChange={e => setSelectedCampaignId(e.target.value)}
                            style={{ width: '100%', marginTop: '5px' }}
                        >
                            <option value="">SELECT CAMPAIGN</option>
                            {campaigns.map(cap => (
                                <option key={cap.id} value={cap.id}>{cap.name}</option>
                            ))}
                        </select>
                        <button type="submit" className="login-button" style={{ width: '100%', marginTop: '10px', fontSize: '0.8rem' }}>FORM UNIT</button>
                    </form>
                </aside>

                <main className="registry-main" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <section className="dashboard-section tactical-panel" data-id="ASSET-REG">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3 className="zone-header" style={{ margin: 0 }}>COMBAT ASSET REGISTRY</h3>
                            <button className="mode-btn" onClick={handleAddUnit} style={{ fontSize: '0.7rem' }}>+ PROCURE UNIT</button>
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
                                    <th className="text-center"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {command.units.map(u => (
                                    <tr key={u.id}>
                                        <td className="text-center">
                                            <select
                                                className="table-input"
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
                                            defaultValue={u.model}
                                            onChange={(e) => handleUnitUpdate(u.id, 'model', e.target.value, false)}
                                            onBlur={(e) => handleUnitUpdate(u.id, 'model', e.target.value, true)}
                                        /></td>
                                        <td className="text-center"><input
                                            className="table-input"
                                            style={{ width: '10em' }}
                                            defaultValue={u.variant}
                                            onChange={(e) => handleUnitUpdate(u.id, 'variant', e.target.value, false)}
                                            onBlur={(e) => handleUnitUpdate(u.id, 'variant', e.target.value, true)}
                                        /></td>
                                        <td className="text-center">
                                            <select
                                                className="table-input"
                                                defaultValue={u.techBase}
                                                onChange={(e) => handleUnitUpdate(u.id, 'techBase', e.target.value)}
                                                onBlur={(e) => handleUnitUpdate(u.id, 'techBase', e.target.value, true)}
                                            >
                                                {TECH_BASES.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </td>
                                        <td className="text-center"><input className="table-input text-right" style={{ width: '4em' }} type="number" defaultValue={u.tonnage}
                                            onChange={(e) => handleUnitUpdate(u.id, 'tonnage', e.target.value, false)}
                                            onBlur={(e) => handleUnitUpdate(u.id, 'tonnage', e.target.value, true)} /></td>
                                        <td className="text-center"><input className="table-input text-right" style={{ width: '3em' }} type="number" defaultValue={u.asSize}
                                            onChange={(e) => handleUnitUpdate(u.id, 'asSize', e.target.value, false)}
                                            onBlur={(e) => handleUnitUpdate(u.id, 'asSize', e.target.value, true)} /></td>
                                        <td className="text-center"><input className="table-input text-right" style={{ width: '5em' }} type="number" defaultValue={u.bv}
                                            onChange={(e) => handleUnitUpdate(u.id, 'bv', e.target.value, false)}
                                            onBlur={(e) => handleUnitUpdate(u.id, 'bv', e.target.value, true)} /></td>
                                        <td className="text-center"><input className="table-input text-right" style={{ width: '4em' }} type="number" defaultValue={u.pv}
                                            onChange={(e) => handleUnitUpdate(u.id, 'pv', e.target.value, false)}
                                            onBlur={(e) => handleUnitUpdate(u.id, 'pv', e.target.value, true)} /></td>
                                        <td className="text-center">
                                            <select
                                                className="table-input"
                                                defaultValue={u.status}
                                                onChange={(e) => handleUnitUpdate(u.id, 'status', e.target.value)}
                                                onBlur={(e) => handleUnitUpdate(u.id, 'status', e.target.value, true)}
                                            >
                                                {UNIT_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        </td>
                                        <td className="text-center">
                                            <button
                                                className="mode-btn"
                                                style={{ padding: '2px 8px', color: 'var(--terminal-alert)', borderColor: 'var(--terminal-alert)' }}
                                                onClick={() => handleDeleteUnit(u.id)}
                                            >X</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    <section className="dashboard-section tactical-panel" data-id="PERS-BARR">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3 className="zone-header" style={{ margin: 0 }}>PERSONNEL BARRACKS</h3>
                            <button className="mode-btn" onClick={handleHirePilot} style={{ fontSize: '0.7rem' }}>+ HIRE PILOT</button>
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
                                    <th className="text-center"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {command.pilots.map(p => (
                                    <tr key={p.id}>
                                        <td><input
                                            className="table-input"
                                            autoFocus={p.id === justAddedId}
                                            onFocus={() => setJustAddedId(null)}
                                            defaultValue={p.name}
                                            onChange={(e) => handlePilotUpdate(p.id, 'name', e.target.value, false)}
                                            onBlur={(e) => handlePilotUpdate(p.id, 'name', e.target.value, true)} /></td>
                                        <td className="text-center"><input className="table-input text-right" style={{ width: '3em' }} type="number" defaultValue={p.gunnery}
                                            onChange={(e) => handlePilotUpdate(p.id, 'gunnery', e.target.value, false)}
                                            onBlur={(e) => handlePilotUpdate(p.id, 'gunnery', e.target.value, true)} /></td>
                                        <td className="text-center"><input className="table-input text-right" style={{ width: '3em' }} type="number" defaultValue={p.piloting}
                                            onChange={(e) => handlePilotUpdate(p.id, 'piloting', e.target.value, false)}
                                            onBlur={(e) => handlePilotUpdate(p.id, 'piloting', e.target.value, true)} /></td>
                                        <td className="text-center"><input className="table-input text-right" style={{ width: '3em' }} type="number" defaultValue={p.asSkill}
                                            onChange={(e) => handlePilotUpdate(p.id, 'asSkill', e.target.value, false)}
                                            onBlur={(e) => handlePilotUpdate(p.id, 'asSkill', e.target.value, true)} /></td>
                                        <td className="text-center">
                                            <select className="table-input" defaultValue={p.unitType}
                                                onChange={(e) => handlePilotUpdate(p.id, 'unitType', e.target.value)}
                                                onBlur={(e) => handlePilotUpdate(p.id, 'unitType', e.target.value, true)}>
                                                {UNIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </td>
                                        <td className="text-center">
                                            <select
                                                className="table-input"
                                                defaultValue={p.status}
                                                onChange={(e) => handlePilotUpdate(p.id, 'status', e.target.value)}
                                                onBlur={(e) => handlePilotUpdate(p.id, 'status', e.target.value, true)}
                                            >
                                                {PILOT_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        </td>
                                        <td className="text-center">
                                            <button
                                                className="mode-btn"
                                                style={{ padding: '2px 8px', color: 'var(--terminal-alert)', borderColor: 'var(--terminal-alert)' }}
                                                onClick={() => handleDeletePilot(p.id)}
                                            >X</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </main>
            </div>
        </div>
    );
};