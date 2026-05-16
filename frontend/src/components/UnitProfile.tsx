import React, { useState } from 'react';
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
        model
        type
        tonnage
        status
      }
      pilots {
        id
        name
        gunnery
        piloting
        status
      }
    }
    managedCampaigns(status: "ACTIVE") {
      id
      name
    }
  }
`;

const CREATE_DETACHMENT = gql`
  mutation CreateDetachment($commandId: ID!, $contractId: ID!, $name: String!) {
    createDetachment(commandId: $commandId, contractId: $contractId, name: $name) {
      id
      name
    }
  }
`;

const ADD_LEDGER_ENTRY = gql`
  mutation AddLedgerEntry($detachmentId: ID!, $amount: Int!, $description: String!) {
    addLedgerEntry(detachmentId: $detachmentId, amount: $amount, description: $description) {
      id
    }
  }
`;

const HIRE_PILOT = gql`
  mutation HirePilot($commandId: ID!, $name: String!, $gunnery: Int!, $piloting: Int!) {
    hirePilot(commandId: $commandId, name: $name, gunnery: $gunnery, piloting: $piloting) {
      id
    }
  }
`;

const ADD_UNIT = gql`
  mutation AddUnit($commandId: ID!, $model: String!, $tonnage: Int!, $type: String) {
    addUnitToForce(commandId: $commandId, model: $model, tonnage: $tonnage, type: $type) {
      id
    }
  }
`;

interface CombatUnit {
    id: string;
    model: string;
    type: string;
    tonnage: number;
    status: string;
    detachmentId?: string | null;
}

interface Pilot {
    id: string;
    name: string;
    gunnery: number;
    piloting: number;
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
    const [selectedContractId, setSelectedContractId] = useState('');
    const [ledgerAmount, setLedgerAmount] = useState<number>(0);
    const [ledgerDesc, setLedgerDesc] = useState('');

    const { loading, data, refetch } = useQuery<UnitDossierData>(GET_UNIT_DOSSIER, {
        variables: { commandId }
    });

    const [createDetachment] = useMutation(CREATE_DETACHMENT);
    const [addLedger] = useMutation(ADD_LEDGER_ENTRY);
    const [addUnit] = useMutation(ADD_UNIT);
    const [hirePilot] = useMutation(HIRE_PILOT);

    const handleMoveAsset = async (type: 'UNIT' | 'PILOT', id: string, targetDetachmentId: string | null) => {
        // Note: Mutation for moving assets still needs to be implemented in schema/controller
        alert(`Asset movement for ${type}:${id} to ${targetDetachmentId || 'pool'} requires 'assignAsset' mutation implementation.`);
    };

    const handleAddUnit = async () => {
        const model = prompt("Enter Unit Model (e.g. Archer ARC-2R):");
        if (!model) return;
        try {
            await addUnit({
                variables: {
                    commandId,
                    model,
                    tonnage: 70,
                    type: 'MECH'
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
                    name,
                    gunnery: 4,
                    piloting: 5
                }
            });
            refetch();
        } catch (err) { alert("Failed to hire pilot."); }
    };

    const handleDeleteAsset = async (type: 'UNIT' | 'PILOT', id: string) => {
        if (!window.confirm(`Are you sure you want to remove this ${type.toLowerCase()}?`)) return;
        // Requires deleteUnit/deletePilot mutation calls.
        alert(`Deletion of ${type}:${id} logic is pending.`);
    };

    const handleCreateDetachment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDetachmentName || !selectedContractId) return;
        try {
            await createDetachment({
                variables: {
                    commandId,
                    contractId: selectedContractId,
                    name: newDetachmentName
                }
            });
            setNewDetachmentName('');
            refetch();
        } catch (err) { alert("Failed to create detachment."); }
    };

    const handleDeleteDetachment = async (id: string) => {
        if (!window.confirm("Delete detachment? Assets will return to pool.")) return;
        // Requires deleteDetachment mutation call
        alert(`Detachment deletion for ${id} logic is pending.`);
    };

    const handleAddLedger = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDetachmentId || ledgerAmount === 0) return;
        try {
            await addLedger({
                variables: {
                    detachmentId: selectedDetachmentId,
                    amount: ledgerAmount,
                    description: ledgerDesc
                }
            });
            setLedgerAmount(0);
            setLedgerDesc('');
            refetch();
        } catch (err) { alert("Failed to add ledger entry."); }
    };

    if (loading) return <div className="loading-intel">RETRIEVING UNIT DOSSIER...</div>;
    const command = data?.getCommand;
    if (!command) return <div className="error-message">COMMAND NOT FOUND.</div>;

    // Placeholder for detachments logic - needs to be added to GraphQL query
    const detachments: Detachment[] = []; // This will need to be populated from GraphQL later
    const campaigns: ManagedCampaign[] = data?.managedCampaigns || [];

    const filteredUnits: CombatUnit[] = command.units.filter((u: CombatUnit) => u.detachmentId === selectedDetachmentId);
    const filteredPilots: Pilot[] = command.pilots.filter((p: Pilot) => p.status === 'ACTIVE'); // Simplified for now

    return (
        <div className="container unit-profile">
            <header className="dashboard-header" style={{ borderBottom: '2px solid #c00', marginBottom: '20px' }}>
                <h1 className="terminal-text">{command.name} - UNIT PROFILE</h1>
                <div className="restricted-text" style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                    <span>CO: {command.commandingOfficer}</span>
                    <span>SP: {command.totalSupportPoints}</span>
                    <span>REP: {command.reputation} ({command.experienceLevel})</span>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '30px' }}>
                {/* Sidebar: Detachments */}
                <aside>
                    <h3 className="section-title">ORGANIZATION</h3>
                    <div
                        className={`mode-btn ${selectedDetachmentId === null ? 'active' : ''}`}
                        onClick={() => setSelectedDetachmentId(null)}
                        style={{ width: '100%', marginBottom: '10px', textAlign: 'left' }}
                    >
                        COMMAND POOL
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
                            <button className="mode-btn" style={{ color: '#c00' }} onClick={() => handleDeleteDetachment(det.id)}>X</button>
                        </div>
                    ))}

                    <form onSubmit={handleCreateDetachment} style={{ marginTop: '30px', borderTop: '1px solid #333', paddingTop: '15px' }}>
                        <span className="restricted-text" style={{ fontSize: '0.8rem' }}>NEW DETACHMENT</span>
                        <input
                            type="text"
                            placeholder="Detachment Name"
                            value={newDetachmentName}
                            onChange={e => setNewDetachmentName(e.target.value)}
                            style={{ width: '100%', marginTop: '5px' }}
                        />
                        <select
                            value={selectedContractId}
                            onChange={e => setSelectedContractId(e.target.value)}
                            style={{ width: '100%', marginTop: '5px' }}
                        >
                            <option value="">SELECT CAMPAIGN</option>
                            {campaigns.map(cap => (
                                <optgroup key={cap.id} label={cap.name}>
                                    <option value={cap.id}>Primary Contract</option>
                                </optgroup>
                            ))}
                        </select>
                        <button type="submit" className="login-button" style={{ width: '100%', marginTop: '10px', fontSize: '0.8rem' }}>FORM UNIT</button>
                    </form>
                </aside>

                {/* Main Content */}
                <main>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 className="section-title">
                            {selectedDetachmentId ? detachments.find(d => d.id === selectedDetachmentId)?.name : 'COMMAND POOL'}
                        </h2>
                        {selectedDetachmentId === null && (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="mode-btn" onClick={handleAddUnit}>+ ADD UNIT</button>
                                <button className="mode-btn" onClick={handleHirePilot}>+ HIRE PILOT</button>
                            </div>
                        )}
                    </div>

                    {/* Ledger Form for Detachments */}
                    {selectedDetachmentId && (
                        <div className="dashboard-section" style={{ padding: '15px', marginBottom: '20px' }}>
                            <form onSubmit={handleAddLedger} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                                <div style={{ flex: 1 }}>
                                    <label className="restricted-text" style={{ fontSize: '0.7rem' }}>DESCRIPTION</label>
                                    <input type="text" value={ledgerDesc} onChange={e => setLedgerDesc(e.target.value)} style={{ width: '100%' }} />
                                </div>
                                <div style={{ width: '120px' }}>
                                    <label className="restricted-text" style={{ fontSize: '0.7rem' }}>SP AMOUNT</label>
                                    <input type="number" value={ledgerAmount} onChange={e => setLedgerAmount(parseInt(e.target.value))} style={{ width: '100%' }} />
                                </div>
                                <button type="submit" className="login-button">LOG ENTRY</button>
                            </form>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        {/* Combat Units */}
                        <section className="dashboard-section" style={{ minHeight: '300px' }}>
                            <h3 className="restricted-text">COMBAT UNITS</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                                <thead>
                                    <tr className="restricted-text" style={{ fontSize: '0.7rem', textAlign: 'left', borderBottom: '1px solid #333' }}>
                                        <th>MODEL</th>
                                        <th>TONS</th>
                                        <th>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUnits.map(u => (
                                        <tr key={u.id} style={{ fontSize: '0.9rem', borderBottom: '1px solid #222', verticalAlign: 'top' }}>
                                            <td style={{ padding: '8px 0' }}>{u.model}</td>
                                            <td>{u.tonnage}</td>
                                            <td>
                                                <select
                                                    value={u.detachmentId || ''}
                                                    onChange={(e) => handleMoveAsset('UNIT', u.id, e.target.value || null)}
                                                    style={{ fontSize: '0.7rem' }}
                                                >
                                                    <option value="">Pool</option>
                                                    {detachments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                                </select>
                                                <button
                                                    onClick={() => handleDeleteAsset('UNIT', u.id)}
                                                    style={{ background: 'none', border: 'none', color: '#c00', cursor: 'pointer', marginLeft: '5px' }}
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredUnits.length === 0 && <p style={{ opacity: 0.5, marginTop: '20px', textAlign: 'center' }}>No units assigned.</p>}
                        </section>

                        {/* Pilots */}
                        <section className="dashboard-section" style={{ minHeight: '300px' }}>
                            <h3 className="restricted-text">PILOT BARRACKS</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                                <thead>
                                    <tr className="restricted-text" style={{ fontSize: '0.7rem', textAlign: 'left', borderBottom: '1px solid #333' }}>
                                        <th>NAME</th>
                                        <th>G/P</th>
                                        <th>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPilots.map(p => (
                                        <tr key={p.id} style={{ fontSize: '0.9rem', borderBottom: '1px solid #222', verticalAlign: 'top' }}>
                                            <td style={{ padding: '8px 0' }}>{p.name}</td>
                                            <td>{p.gunnery}/{p.piloting}</td>
                                            <td>
                                                <select
                                                    value={p.detachmentId || ''}
                                                    onChange={(e) => handleMoveAsset('PILOT', p.id, e.target.value || null)}
                                                    style={{ fontSize: '0.7rem' }}
                                                >
                                                    <option value="">Pool</option>
                                                    {detachments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                                </select>
                                                <button
                                                    onClick={() => handleDeleteAsset('PILOT', p.id)}
                                                    style={{ background: 'none', border: 'none', color: '#c00', cursor: 'pointer', marginLeft: '5px' }}
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredPilots.length === 0 && <p style={{ opacity: 0.5, marginTop: '20px', textAlign: 'center' }}>No personnel assigned.</p>}
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
};