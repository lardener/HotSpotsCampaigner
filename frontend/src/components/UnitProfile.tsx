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

const UPDATE_COMMAND = gql`
  mutation UpdateCommand($id: ID!, $co: String, $sp: Int, $rep: Int) {
    updateCommand(id: $id, commandingOfficer: $co, totalSupportPoints: $sp, reputation: $rep) {
      id
      commandingOfficer
      totalSupportPoints
      reputation
    }
  }
`;

const UPDATE_UNIT = gql`
  mutation UpdateUnit($id: ID!, $input: CombatUnitInput!) {
    updateCombatUnit(id: $id, input: $input) { id }
  }
`;

const UPDATE_PILOT = gql`
  mutation UpdatePilot($id: ID!, $input: PilotInput!) {
    updatePilot(id: $id, input: $input) { id }
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
    const [lastSaved, setLastSaved] = useState<string | null>(null);

    const { loading, data, refetch } = useQuery<UnitDossierData>(GET_UNIT_DOSSIER, {
        variables: { commandId }
    });

    const [updateCommand] = useMutation(UPDATE_COMMAND);
    const [updateUnit] = useMutation(UPDATE_UNIT);
    const [updatePilot] = useMutation(UPDATE_PILOT);
    const [addUnit] = useMutation(ADD_UNIT);
    const [hirePilot] = useMutation(HIRE_PILOT);
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
            updateCommand({ variables: vars }).then(() => { refetch(); markSaved(); });
        };

        if (immediate) execute();
        else saveTimeoutRef.current[key] = setTimeout(execute, 5000);
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
            updateUnit({ variables: { id, input } }).then(() => { refetch(); markSaved(); });
        };

        if (immediate) execute();
        else saveTimeoutRef.current[key] = setTimeout(execute, 5000);
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
            updatePilot({ variables: { id, input } }).then(() => { refetch(); markSaved(); });
        };

        if (immediate) execute();
        else saveTimeoutRef.current[key] = setTimeout(execute, 5000);
    };

    const handleAddUnit = async () => {
        const model = prompt("Enter Unit Model (e.g. Archer ARC-2R):");
        if (!model) return;
        try {
            await addUnit({
                variables: {
                    commandId,
                    input: {
                        model,
                        tonnage: 20,
                        type: 'BM'
                    }
                }
            });
            refetch();
        } catch (err) { alert("Failed to add unit."); }
    };

    const handleHirePilot = async () => {
        const name = prompt("Enter Pilot Name:");
        if (!name) return;
        try {
            await hirePilot({
                variables: {
                    commandId,
                    input: {
                        name,
                        gunnery: 4,
                        piloting: 5
                    }
                }
            });
            refetch();
        } catch (err) { alert("Failed to hire pilot."); }
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

    if (loading) return <div className="loading-intel">RETRIEVING UNIT DOSSIER...</div>;
    const command = data?.getCommand;
    if (!command) return <div className="error-message">COMMAND NOT FOUND.</div>;

    const detachments: Detachment[] = command.detachments || [];
    const campaigns: ManagedCampaign[] = data?.managedCampaigns || [];

    const UNIT_TYPES = ['BM', 'CV', 'PM', 'IM', 'BA', 'CI'];
    const TECH_BASES = ['Inner Sphere', 'Clan', 'Mixed'];

    return (
        <div className="container unit-profile theme-amber">
            <header className="dashboard-header" style={{ borderBottom: '2px solid var(--accent-primary)', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 className="terminal-text">{command.name} - UNIT PROFILE</h1>
                </div>
                <div className="sync-indicator" style={{ textAlign: 'right', paddingBottom: '5px' }}>
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
                        className={`mode-btn ${selectedDetachmentId === null ? 'active' : ''}`}
                        onClick={() => setSelectedDetachmentId(null)}
                        style={{ width: '100%', marginBottom: '10px', textAlign: 'left' }}
                    >
                        FORCE POOL
                    </div>
                    {detachments.map(det => (
                        <div key={det.id} style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                            <button
                                className={`mode-btn ${selectedDetachmentId === det.id ? 'active' : ''}`}
                                onClick={() => setSelectedDetachmentId(det.id)}
                                style={{ flex: 1, textAlign: 'left' }}
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
                            className="mode-btn"
                            placeholder="Callsign..."
                            value={newDetachmentName}
                            onChange={e => setNewDetachmentName(e.target.value)}
                            style={{ width: '100%', marginTop: '5px', textAlign: 'left' }}
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
                                    <th>TYPE</th>
                                    <th>MODEL</th>
                                    <th>VARIANT</th>
                                    <th>TECH</th>
                                    <th>TONS</th>
                                    <th>SZ</th>
                                    <th>BV</th>
                                    <th>PV</th>
                                    <th>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {command.units.map(u => (
                                    <tr key={u.id}>
                                        <td>
                                            <select
                                                className="table-input"
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
                                        <td><input
                                            className="table-input"
                                            defaultValue={u.variant}
                                            onChange={(e) => handleUnitUpdate(u.id, 'variant', e.target.value, false)}
                                            onBlur={(e) => handleUnitUpdate(u.id, 'variant', e.target.value, true)}
                                        /></td>
                                        <td>
                                            <select
                                                className="table-input"
                                                defaultValue={u.techBase}
                                                onChange={(e) => handleUnitUpdate(u.id, 'techBase', e.target.value)}
                                                onBlur={(e) => handleUnitUpdate(u.id, 'techBase', e.target.value, true)}
                                            >
                                                {TECH_BASES.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </td>
                                        <td><input className="table-input" type="number" defaultValue={u.tonnage}
                                            onChange={(e) => handleUnitUpdate(u.id, 'tonnage', e.target.value, false)}
                                            onBlur={(e) => handleUnitUpdate(u.id, 'tonnage', e.target.value, true)} /></td>
                                        <td><input className="table-input" type="number" defaultValue={u.asSize}
                                            onChange={(e) => handleUnitUpdate(u.id, 'asSize', e.target.value, false)}
                                            onBlur={(e) => handleUnitUpdate(u.id, 'asSize', e.target.value, true)} /></td>
                                        <td><input className="table-input" type="number" defaultValue={u.bv}
                                            onChange={(e) => handleUnitUpdate(u.id, 'bv', e.target.value, false)}
                                            onBlur={(e) => handleUnitUpdate(u.id, 'bv', e.target.value, true)} /></td>
                                        <td><input className="table-input" type="number" defaultValue={u.pv}
                                            onChange={(e) => handleUnitUpdate(u.id, 'pv', e.target.value, false)}
                                            onBlur={(e) => handleUnitUpdate(u.id, 'pv', e.target.value, true)} /></td>
                                        <td className="restricted-text" style={{ fontSize: '0.7rem' }}>{u.status}</td>
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
                                    <th>GUNNERY</th>
                                    <th>PILOTING</th>
                                    <th>AS SKILL</th>
                                    <th>UNIT SPECIALTY</th>
                                    <th>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {command.pilots.map(p => (
                                    <tr key={p.id}>
                                        <td><input className="table-input" defaultValue={p.name}
                                            onChange={(e) => handlePilotUpdate(p.id, 'name', e.target.value, false)}
                                            onBlur={(e) => handlePilotUpdate(p.id, 'name', e.target.value, true)} /></td>
                                        <td><input className="table-input" type="number" defaultValue={p.gunnery}
                                            onChange={(e) => handlePilotUpdate(p.id, 'gunnery', e.target.value, false)}
                                            onBlur={(e) => handlePilotUpdate(p.id, 'gunnery', e.target.value, true)} /></td>
                                        <td><input className="table-input" type="number" defaultValue={p.piloting}
                                            onChange={(e) => handlePilotUpdate(p.id, 'piloting', e.target.value, false)}
                                            onBlur={(e) => handlePilotUpdate(p.id, 'piloting', e.target.value, true)} /></td>
                                        <td><input className="table-input" type="number" defaultValue={p.asSkill}
                                            onChange={(e) => handlePilotUpdate(p.id, 'asSkill', e.target.value, false)}
                                            onBlur={(e) => handlePilotUpdate(p.id, 'asSkill', e.target.value, true)} /></td>
                                        <td>
                                            <select className="table-input" defaultValue={p.unitType}
                                                onChange={(e) => handlePilotUpdate(p.id, 'unitType', e.target.value)}
                                                onBlur={(e) => handlePilotUpdate(p.id, 'unitType', e.target.value, true)}>
                                                {UNIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </td>
                                        <td className="restricted-text" style={{ fontSize: '0.7rem' }}>{p.status}</td>
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