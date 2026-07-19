/*
 * HotSpots Campaigner - Battletech Mercenaries campaign management SaaS.
 * Copyright (C) 2026 Jose Ferrer
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import React, { useState, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { useQuery, useMutation } from '@apollo/client/react';
import { CombatUnit, Pilot } from '../types/generated';
import { GetForceDataQuery } from '../types/operations';
import { GetForceDataDocument, AssignAssetDocument } from '../types/operations';
import { UnitStatus, UnitType, TechBase } from '../types/helpers';
import { PilotEditor } from './PilotEditor';
import { CombatUnitEditor } from './CombatUnitEditor';
import { UNIT_STATUS_OPTIONS as FALLBACK_STATUSES, UNIT_TYPES as FALLBACK_TYPES, TECH_BASES as FALLBACK_TECH } from './Rules';
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

export const ForceDashboard: React.FC<{ commandId: string; initialMode?: ViewMode }> = ({ commandId, initialMode = 'ORGANIZATION' }) => {
    const [units, setUnits] = useState<CombatUnit[]>([]);
    const [pilots, setPilots] = useState<Pilot[]>([]);
    const [detachments, setDetachments] = useState<any[]>([]);
    const [managedCampaigns, setManagedCampaigns] = useState<any[]>([]);
    const [participatingCampaigns, setParticipatingCampaigns] = useState<any[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>(initialMode);
    const [showPilotEditor, setShowPilotEditor] = useState(false);
    const [showCombatUnitEditor, setShowCombatUnitEditor] = useState(false);
    const [selectedDetachmentId, setSelectedDetachmentId] = useState<string | null>(null);

    const { loading, error, data, refetch } = useQuery<GetForceDataQuery>(GetForceDataDocument, {
        variables: { commandId },
        fetchPolicy: 'cache-and-network',
        notifyOnNetworkStatusChange: true
    });

    const sortUnits = (list: CombatUnit[]) => [...list].sort((a, b) =>
        (a.model || '').localeCompare(b.model || '') || (a.variant || '').localeCompare(b.variant || '')
    );

    const sortPilots = (list: Pilot[]) => [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    useEffect(() => {
        if (data?.getCommand) {
            const rawUnits = (data.getCommand.units?.filter((u): u is NonNullable<typeof u> => u != null) || []) as CombatUnit[];
            const rawPilots = data.getCommand.pilots?.filter((p): p is NonNullable<typeof p> => p != null) || [];
            const rawDetachments = data.getCommand.detachments?.filter((d): d is NonNullable<typeof d> => d != null) || [];
            setUnits(sortUnits(rawUnits));
            setPilots(sortPilots(rawPilots));
            setDetachments(rawDetachments);
            setManagedCampaigns(data.managedCampaigns || []);
            setParticipatingCampaigns(data.participatingCampaigns || []);
        }
    }, [data]);

    const unitStatuses = (data?.publicCampaignMetadata?.unitStatuses?.filter((s): s is string => s != null) || FALLBACK_STATUSES) as UnitStatus[];
    const unitTypes = (data?.publicCampaignMetadata?.unitTypes?.filter((t): t is string => t != null) || FALLBACK_TYPES) as UnitType[];
    const techBases = (data?.publicCampaignMetadata?.techBases?.filter((t): t is string => t != null) || FALLBACK_TECH) as TechBase[];

    const [assignAsset] = useMutation(AssignAssetDocument);

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
                setUnits(prev => sortUnits(prev.map(u => u.id === assetId ? { ...u, detachmentId: targetDetachmentId } : u)));
            } else {
                setPilots(prev => sortPilots(prev.map(p => p.id === assetId ? { ...p, detachmentId: targetDetachmentId } : p)));
            }
        } catch (err) {
            alert("Assignment failed: Asset may already be deployed.");
        }
    };

    const handleAddUnit = (detId: string | null = null) => {
        setSelectedDetachmentId(detId);
        setShowCombatUnitEditor(true);
    };

    const handleHirePilot = (detId: string | null = null) => {
        setSelectedDetachmentId(detId);
        setShowPilotEditor(true);
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

                    <nav className="mode-switcher mt-1rem">
                        <button type="button"
                            className={`mode-btn theme-amber ${viewMode === 'ORGANIZATION' ? 'active' : ''}`}
                            onClick={() => setViewMode('ORGANIZATION')}
                        >
                            [ 01 ] FORCE ORGANIZATION
                        </button>
                        <button type="button"
                            className={`mode-btn theme-amber ${viewMode === 'OPERATIONS' ? 'active' : ''}`}
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
                                <div className="flex-between">
                                    <h4 title="Combat Units">COMBAT UNITS</h4>
                                    <button type="button" className="mode-btn theme-green sm-text" onClick={() => handleAddUnit(null)} title="Procure unit for hangar pool">+</button>
                                </div>
                                {units.filter(u => !u.detachmentId).map(u => (
                                    <DraggableAsset
                                        key={u.id}
                                        id={u.id}
                                        type="UNIT"
                                        label={u.model || ''}
                                        subLabel={`${u.tonnage}T | ${u.status}`}
                                    />
                                ))}
                            </div>
                            <div className="asset-group">
                                <div className="flex-between">
                                    <h4 title="Pilot Barracks">PILOT BARRACKS</h4>
                                    <button type="button" className="mode-btn theme-green sm-text" onClick={() => handleHirePilot(null)} title="Hire pilot for barracks">+</button>
                                </div>
                                {pilots.filter(p => !p.detachmentId).map(p => (
                                    <DraggableAsset
                                        key={p.id}
                                        id={p.id}
                                        type="PILOT"
                                        label={p.name || ''}
                                        subLabel={`G/P: ${p.gunnery}/${p.piloting} | W:${p.wounds} | H:${p.handicap}`}
                                    />
                                ))}
                            </div>
                        </DroppableZone>

                        {/* ACTIVE DETACHMENTS */}
                        <div className="detachments-container">
                            {detachments.map(det => (
                                <DroppableZone key={det.id} id={det.id} title={`DETACHMENT: ${det.name}${det.campaignRating != null ? ` (RATING: ${det.campaignRating})` : ''}`}>
                                    <div className="flex flex-gap-5 justify-end" style={{ marginBottom: '8px' }}>
                                        <button type="button" className="mode-btn theme-green xs-text" onClick={() => handleAddUnit(det.id)} title="Add unit directly to this detachment">+</button>
                                        <button type="button" className="mode-btn theme-green xs-text" onClick={() => handleHirePilot(det.id)} title="Add pilot directly to this detachment">👤+</button>
                                    </div>
                                    <div className="assigned-assets">
                                        {units.filter(u => u.detachmentId === det.id).map(u => (
                                            <DraggableAsset
                                                key={u.id}
                                                id={u.id}
                                                type="UNIT"
                                                label={u.model || ''}
                                                subLabel={`${u.tonnage}T`}
                                            />
                                        ))}
                                        {pilots.filter(p => p.detachmentId === det.id).map(p => (
                                            <DraggableAsset
                                                key={p.id}
                                                id={p.id}
                                                type="PILOT"
                                                label={p.name || ''}
                                                subLabel={`G/P: ${p.gunnery}/${p.piloting} | H:${p.handicap}`}
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
                                    <div key={camp.id} className="ops-item tactical-panel mb-05rem">
                                        <div className="ops-title">{camp.name}</div>
                                        <div className="ops-status" title={`System: ${camp.systemName} | Tracks: ${camp.trackCount}`}>SYSTEM: {camp.systemName} | TRACKS: {camp.trackCount}</div>
                                        {camp.participatingDetachments && camp.participatingDetachments.length > 0 && (
                                            <div className="mt-10" style={{ borderTop: '1px dashed var(--accent-dim)', paddingTop: '5px' }}>
                                                <div className="restricted-text xs-text mb-2">DEPLOYED FORCES</div>
                                                {camp.participatingDetachments.map((d: any) => (
                                                    <div key={d.id} className="xs-text subdued">
                                                        • {d.name} <span style={{ color: 'var(--terminal-amber)' }}>({d.campaignRating || 0})</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <button type="button" className="mode-btn theme-blue sm-text mt-10">VIEW THEATER</button>
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
                                    <div key={camp.id} className="ops-item tactical-panel mb-05rem">
                                        <div className="ops-title">{camp.name}</div>
                                        <div className="ops-meta" title={`Employer: ${camp.primaryEmployer}`}>EMPLOYER: {camp.primaryEmployer}</div>
                                        {detachments.find(d => d.campaignId === camp.id)?.campaignRating != null && (
                                            <div className="ops-meta">THEATER RATING: {detachments.find(d => d.campaignId === camp.id)?.campaignRating}</div>
                                        )}
                                        {camp.participatingDetachments && camp.participatingDetachments.length > 0 && (
                                            <div className="mt-10" style={{ borderTop: '1px dashed var(--accent-dim)', paddingTop: '5px' }}>
                                                <div className="restricted-text xs-text mb-2">THEATER FORCES</div>
                                                {camp.participatingDetachments.map((d: any) => (
                                                    <div key={d.id} className="xs-text subdued">
                                                        • {d.name} {d.campaignRating != null && <span style={{ color: 'var(--terminal-amber)' }}>({d.campaignRating})</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="ops-actions flex flex-gap-10">
                                            <button type="button" className="mode-btn theme-green sm-text mt-05rem">OPEN LOGBOOK</button>
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
            {showPilotEditor && (
                <PilotEditor
                    commandId={commandId}
                    detachmentId={selectedDetachmentId || undefined}
                    mode="create"
                    onSave={() => { setShowPilotEditor(false); refetch(); }}
                    onCancel={() => setShowPilotEditor(false)}
                />
            )}
            {showCombatUnitEditor && (
                <CombatUnitEditor
                    commandId={commandId}
                    detachmentId={selectedDetachmentId || undefined}
                    mode="create"
                    unitTypes={unitTypes}
                    unitStatuses={unitStatuses}
                    techBases={techBases}
                    availableSP={data?.getCommand?.totalSupportPoints ?? undefined}
                    onSave={() => { setShowCombatUnitEditor(false); refetch(); }}
                    onCancel={() => setShowCombatUnitEditor(false)}
                />
            )}
        </DndContext>
    );
};