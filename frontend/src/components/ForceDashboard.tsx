import React, { useState, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import * as forceApi from '../services/forceApi';
import '../styles/theme.css';

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

export const ForceDashboard: React.FC<{ commandId: string }> = ({ commandId }) => {
    const [units, setUnits] = useState<forceApi.CombatUnit[]>([]);
    const [pilots, setPilots] = useState<forceApi.Pilot[]>([]);
    const [detachments, setDetachments] = useState<forceApi.Detachment[]>([]);
    const [managedCampaigns, setManagedCampaigns] = useState<forceApi.CampaignSummary[]>([]);
    const [participatingCampaigns, setParticipatingCampaigns] = useState<forceApi.CampaignSummary[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>('ORGANIZATION');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Explicitly type the result of Promise.all to ensure proper destructuring
                const [assets, dets, managed, participating] = await Promise.all([
                    forceApi.getAssets(commandId),
                    forceApi.getDetachments(commandId),
                    forceApi.getManagedCampaigns(),
                    forceApi.getParticipatingCampaigns(commandId)
                ]) as [
                        forceApi.CommandAssetsResponse,
                        forceApi.Detachment[],
                        forceApi.CampaignSummary[],
                        forceApi.CampaignSummary[]
                    ];

                setUnits(assets.units);
                setPilots(assets.pilots);
                setDetachments(dets);
                setManagedCampaigns(managed);
                setParticipatingCampaigns(participating);
            } catch (err) {
                console.error("Failed to load force data", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [commandId]);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const [type, assetId] = (active.id as string).split(':');
        const targetDetachmentId = over.id === 'pool' ? null : over.id as string;

        try {
            await forceApi.assignAsset(type as 'UNIT' | 'PILOT', assetId, targetDetachmentId);

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

    if (loading) return <div className="loading">INITIALIZING TACTICAL LINK...</div>;

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="force-dashboard-layout">
                <header className="dashboard-header">
                    <h1 className="terminal-text">FORCE COMMAND & CONTROL</h1>
                    <div className="status-bar">LINK: ACTIVE | REPUTATION: 45 | WARCHEST: 4500 SP</div>

                    <nav className="mode-switcher" style={{ marginTop: '1rem' }}>
                        <button
                            className={`mode-btn ${viewMode === 'ORGANIZATION' ? 'active' : ''}`}
                            onClick={() => setViewMode('ORGANIZATION')}
                        >
                            [ 01 ] FORCE ORGANIZATION
                        </button>
                        <button
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
                                <h4>COMBAT UNITS</h4>
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
                                <h4>PILOT BARRACKS</h4>
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
                                        <div className="ops-status">SYSTEM: {camp.systemName} | TRACKS: {camp.trackCount}</div>
                                        <button className="mode-btn" style={{ fontSize: '0.7rem', marginTop: '0.5rem' }}>MANAGE THEATER</button>
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
                                        <div className="ops-meta">EMPLOYER: {camp.primaryEmployer}</div>
                                        <div className="ops-meta">CURRENT WARCHEST: 4500 SP</div>
                                        <div className="ops-actions" style={{ display: 'flex', gap: '0.5rem' }}>
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