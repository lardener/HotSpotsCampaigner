import React, { useState, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import '../styles/theme.css';

const GET_FORCE_DATA = gql`
  query GetForceData($commandId: ID!) {
    getCommand(id: $commandId) {
      id
      name
      totalSupportPoints
      reputation
      units {
        id
        model
        tonnage
        status
        detachmentId
      }
      pilots {
        id
        name
        gunnery
        piloting
        status
        detachmentId
      }
      detachments {
        id
        name
      }
    }
    managedCampaigns(status: "ACTIVE") {
      id
      name
      systemName
      trackCount
    }
    participatingCampaigns(commandId: $commandId) {
      id
      name
      primaryEmployer
    }
  }
`;

const ASSIGN_ASSET = gql`
  mutation AssignAsset($assetType: String!, $assetId: ID!, $detachmentId: ID) {
    assignAsset(assetType: $assetType, assetId: $assetId, detachmentId: $detachmentId)
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

const HIRE_PILOT = gql`
  mutation HirePilot($commandId: ID!, $input: PilotInput!) {
    hirePilot(commandId: $commandId, input: $input) {
      id
      name
    }
  }
`;

interface ForceData {
    getCommand: {
        id: string;
        name: string;
        totalSupportPoints: number;
        reputation: number;
        units: any[];
        pilots: any[];
        detachments: any[];
    };
    managedCampaigns: any[];
    participatingCampaigns: any[];
}

interface AssetProps {
    id: string;
    type: 'UNIT' | 'PILOT';
    label: string;
    subLabel: string;
}

const DraggableAsset: React.FC<AssetProps> = ({ id, type, label, subLabel }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `${type}:${id}`,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="tactical-panel asset-card"
            data-id={id.substring(0, 8)}
        >
            <div className="asset-type">{type}</div>
            <div className="asset-label">{label}</div>
            <div className="asset-sub">{subLabel}</div>
        </div>
    );
};

const DroppableZone: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({ id, title, children }) => {
    const { isOver, setNodeRef } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className={`tactical-panel drop-zone ${isOver ? 'active' : ''}`}
            data-id={title}
        >
            <h3 className="zone-header">{title}</h3>
            <div className="zone-content">
                {children}
            </div>
        </div>
    );
};

type ViewMode = 'ORGANIZATION' | 'OPERATIONS';

export const ForceDashboard: React.FC<{ commandId: string; initialMode?: ViewMode }> = ({ commandId, initialMode = 'ORGANIZATION' }) => {
    const [units, setUnits] = useState<any[]>([]);
    const [pilots, setPilots] = useState<any[]>([]);
    const [detachments, setDetachments] = useState<any[]>([]);
    const [managedCampaigns, setManagedCampaigns] = useState<any[]>([]);
    const [participatingCampaigns, setParticipatingCampaigns] = useState<any[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>(initialMode);

    const { loading, error, data, refetch } = useQuery<ForceData>(GET_FORCE_DATA, {
        variables: { commandId },
        fetchPolicy: 'network-only'
    });

    useEffect(() => {
        if (data) {
            setUnits(data.getCommand.units);
            setPilots(data.getCommand.pilots);
            setDetachments(data.getCommand.detachments);
            setManagedCampaigns(data.managedCampaigns);
            setParticipatingCampaigns(data.participatingCampaigns);
        }
    }, [data]);

    const [assignAsset] = useMutation(ASSIGN_ASSET);
    const [addUnitMutation] = useMutation(ADD_UNIT);
    const [hirePilotMutation] = useMutation(HIRE_PILOT);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const [type, assetId] = (active.id as string).split(':');
        const targetDetachmentId = over.id === 'pool' ? null : over.id as string;

        try {
            await assignAsset({
                variables: {
                    assetType: type,
                    assetId,
                    detachmentId: targetDetachmentId
                }
            });

            // Optimistic UI Update
            if (type === 'UNIT') {
                setUnits(prev => prev.map(u => u.id === assetId ? { ...u, detachmentId: targetDetachmentId } : u));
            } else {
                setPilots(prev => prev.map(p => p.id === assetId ? { ...p, detachmentId: targetDetachmentId } : p));
            }
        } catch (err) {
            alert("Assignment failed: Asset may already be deployed.");
        }
    };

    const handleAddUnit = async () => {
        const model = prompt("Enter Unit Model (e.g., Shadow Hawk SHD-2H):");
        if (!model) return;
        try {
            await addUnitMutation({
                variables: {
                    commandId,
                    input: {
                        model,
                        tonnage: 55,
                        status: 'OPERATIONAL'
                    }
                }
            });
            refetch();
        } catch (err) { alert("Procurement failed."); }
    };

    const handleHirePilot = async () => {
        const name = prompt("Enter Pilot Name:");
        if (!name) return;
        try {
            await hirePilotMutation({
                variables: {
                    commandId,
                    input: {
                        name,
                        gunnery: 4,
                        piloting: 5,
                        status: 'ACTIVE'
                    }
                }
            });
            refetch();
        } catch (err) { alert("Contracting failed."); }
    };

    if (loading && !data) return <div className="loading">INITIALIZING TACTICAL LINK...</div>;
    if (error) return <div className="error-message">TACTICAL LINK FAILURE: {error.message}</div>;

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="force-dashboard-layout">
                <header className="dashboard-header">
                    <h1 className="terminal-text">FORCE COMMAND & CONTROL</h1>
                    <div className="status-bar theme-amber">
                        LINK: ACTIVE | REPUTATION: {data?.getCommand?.reputation} | WARCHEST: {data?.getCommand?.totalSupportPoints} SP
                    </div>

                    <nav className="mode-switcher" style={{ marginTop: '1rem' }}>
                        <button type="button"
                            className={`mode-btn ${viewMode === 'ORGANIZATION' ? 'active' : ''}`}
                            onClick={() => setViewMode('ORGANIZATION')}
                        >
                            [ 01 ] FORCE ORGANIZATION
                        </button>
                        <button type="button"
                            className={`mode-btn ${viewMode === 'OPERATIONS' ? 'active' : ''}`}
                            onClick={() => setViewMode('OPERATIONS')}
                        >
                            [ 02 ] ACTIVE OPERATIONS
                        </button>
                    </nav>
                </header>

                {viewMode === 'ORGANIZATION' ? (
                    <div className="dashboard-grid">
                        {/* ASSET POOL (Unassigned) */}
                        <DroppableZone id="pool" title="RESERVE POOL">
                            <div className="asset-group">
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <h4 title="Combat Units">COMBAT UNITS</h4> {/* Added type="button" */}
                                    <button className="mode-btn" onClick={handleAddUnit} style={{ fontSize: '0.6rem' }}>+</button>
                                </div>
                                {units.filter(u => !u.detachmentId).map(u => (
                                    <DraggableAsset
                                        key={u.id}
                                        id={u.id}
                                        type="UNIT"
                                        label={u.model}
                                        subLabel={`${u.tonnage}T | ${u.status}`}
                                    />
                                ))}
                            </div>
                            <div className="asset-group">
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <h4 title="Pilot Barracks">PILOT BARRACKS</h4> {/* Added type="button" */}
                                    <button className="mode-btn" onClick={handleHirePilot} style={{ fontSize: '0.6rem' }}>+</button>
                                </div>
                                {pilots.filter(p => !p.detachmentId).map(p => (
                                    <DraggableAsset
                                        key={p.id}
                                        id={p.id}
                                        type="PILOT"
                                        label={p.name}
                                        subLabel={`G:${p.gunnery} P:${p.piloting}`}
                                    />
                                ))}
                            </div>
                        </DroppableZone>

                        {/* ACTIVE DETACHMENTS */}
                        <div className="detachments-container">
                            {detachments.map(det => (
                                <DroppableZone key={det.id} id={det.id} title={`DETACHMENT: ${det.name}`}>
                                    <div className="assigned-assets">
                                        {units.filter(u => u.detachmentId === det.id).map(u => (
                                            <DraggableAsset
                                                key={u.id}
                                                id={u.id}
                                                type="UNIT"
                                                label={u.model}
                                                subLabel={`${u.tonnage}T`}
                                            />
                                        ))}
                                        {pilots.filter(p => p.detachmentId === det.id).map(p => (
                                            <DraggableAsset
                                                key={p.id}
                                                id={p.id}
                                                type="PILOT"
                                                label={p.name}
                                                subLabel={`G/P: ${p.gunnery}/${p.piloting}`}
                                            />
                                        ))}
                                        {units.filter(u => u.detachmentId === det.id).length === 0 &&
                                            pilots.filter(p => p.detachmentId === det.id).length === 0 && (
                                                <div className="empty-notice">AWAITING DEPLOYMENT</div>
                                            )}
                                    </div>
                                </DroppableZone>
                            ))}

                            {detachments.length === 0 && (
                                <div className="tactical-panel">NO ACTIVE DEPLOYMENTS</div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="operations-view dashboard-grid">
                        {/* CAMPAIGNS MANAGED */}
                        <div className="tactical-panel" data-id="MGMT-01">
                            <h3 className="zone-header">MANAGED CAMPAIGNS</h3>
                            <div className="ops-list">
                                {managedCampaigns.map(camp => (
                                    <div key={camp.id} className="ops-item tactical-panel" style={{ marginBottom: '0.5rem' }}>
                                        <div className="ops-title">{camp.name}</div>
                                        <div className="ops-status" title={`System: ${camp.systemName} | Tracks: ${camp.trackCount}`}>SYSTEM: {camp.systemName} | TRACKS: {camp.trackCount}</div>
                                        <button type="button" className="mode-btn" style={{ fontSize: '0.7rem', marginTop: '0.5rem' }}>MANAGE THEATER</button>
                                    </div>
                                ))}
                                {managedCampaigns.length === 0 && (
                                    <div className="empty-notice">AWAITING NEW CONTRACTS</div>
                                )}
                            </div>
                        </div>

                        {/* PARTICIPATING CAMPAIGNS */}
                        <div className="tactical-panel" data-id="PART-01">
                            <h3 className="zone-header">DEPLOYED DETACHMENTS</h3>
                            <div className="ops-list">
                                {participatingCampaigns.map(camp => (
                                    <div key={camp.id} className="ops-item tactical-panel" style={{ marginBottom: '0.5rem' }}>
                                        <div className="ops-title">{camp.name}</div>
                                        <div className="ops-meta" title={`Employer: ${camp.primaryEmployer}`}>EMPLOYER: {camp.primaryEmployer}</div>
                                        <div className="ops-meta">CURRENT WARCHEST: 4500 SP</div>
                                        <div className="ops-actions" style={{ display: 'flex', gap: '0.5rem' }}> {/* Added type="button" */}
                                            <button className="mode-btn" style={{ fontSize: '0.7rem', marginTop: '0.5rem' }}>OPEN LOGBOOK</button>
                                        </div>
                                    </div>
                                ))}
                                {participatingCampaigns.length === 0 && (
                                    <div className="empty-notice">RESERVES ONLY - NO ACTIVE DEPLOYMENTS</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DndContext>
    );
};