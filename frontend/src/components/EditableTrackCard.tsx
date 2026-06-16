import React, { useState, useEffect, useRef } from 'react';
import { CampaignDetail, TrackDetail } from '../types/global.d';
import { MetadataDataFull } from '../types/graphql.d';

interface EditableTrackCardProps {
    track: TrackDetail;
    campaign: CampaignDetail;
    metaData: MetadataDataFull | undefined;
    handleTrackUpdate: (trackId: string, field: string, value: string) => void;
    handleReroll: (trackId: string) => Promise<void>;
    setShowAarForTrack: (track: TrackDetail) => void;
    onDrop: (e: React.DragEvent, targetTrackId?: string) => void;
}

export const EditableTrackCard: React.FC<EditableTrackCardProps> = ({
    track,
    campaign,
    metaData,
    handleTrackUpdate,
    handleReroll,
    setShowAarForTrack,
    onDrop
}) => {
    const [trackName, setTrackName] = useState(track.trackName);
    const [complications, setComplications] = useState(track.complications ?? '');
    const [oppositionComplications, setOppositionComplications] = useState(track.oppositionComplications ?? '');
    const [location, setLocation] = useState(track.location ?? '');
    const [nextSession, setNextSession] = useState(track.nextSession ? track.nextSession.substring(0, 16) : '');
    const [attackerFactionId, setAttackerFactionId] = useState(track.attackerFactionId || '');

    // Update local state when track prop changes (e.g., after reroll)
    useEffect(() => {
        setTrackName(track.trackName);
        setComplications(track.complications ?? '');
        setOppositionComplications(track.oppositionComplications ?? '');
        setLocation(track.location ?? '');
        setNextSession(track.nextSession ? track.nextSession.substring(0, 16) : '');
        setAttackerFactionId(track.attackerFactionId || '');
    }, [track]);

    const textareaRef1 = useRef<HTMLTextAreaElement>(null);
    const textareaRef2 = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef1.current) {
            textareaRef1.current.style.height = 'auto';
            textareaRef1.current.style.height = textareaRef1.current.scrollHeight + 'px';
        }
        if (textareaRef2.current) {
            textareaRef2.current.style.height = 'auto';
            textareaRef2.current.style.height = textareaRef2.current.scrollHeight + 'px';
        }
    }, [complications, oppositionComplications]);

    const handleTextareaBlur = (e: React.FocusEvent<HTMLTextAreaElement>, field: string) => {
        handleTrackUpdate(track.id, field, e.target.value);
        e.currentTarget.style.height = 'auto';
        e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
    };

    const isManager = (campaign as any).isManager;

    return (
        <div
            draggable={isManager}
            onDragStart={(e) => e.dataTransfer.setData("trackId", track.id)}
            onDrop={(e) => {
                if (isManager) e.stopPropagation(); // prevent panel drop from firing
                onDrop(e, track.id);
            }}
            className="asset-card"
            style={{ padding: '12px', cursor: 'grab', position: 'relative', border: '1px solid var(--accent-dim)', width: '100%', boxSizing: 'border-box' }}
        >
            <div className="flex-between mb-5" style={{ alignItems: 'flex-start' }}>
                <div className="status-bar theme-amber" style={{ flex: 1, marginRight: '10px', padding: '0 5px', display: 'flex', alignItems: 'center' }}>
                    <input
                        className="table-input"
                        list={`track-types-${track.id}`}
                        style={{ fontWeight: 'bold', width: '100%', border: 'none', background: 'transparent', color: 'inherit' }}
                        value={trackName}
                        onChange={(e) => setTrackName(e.target.value)}
                        onBlur={(e) => handleTrackUpdate(track.id, 'trackName', e.target.value)}
                        readOnly={!isManager}
                        title="Track type"
                        placeholder="TRACK TYPE?"
                    />
                    <datalist id={`track-types-${track.id}`}>
                        {metaData?.publicCampaignMetadata?.trackTypes.map(t => (
                            <option key={t} value={t} />
                        ))}
                    </datalist>
                </div>
                {isManager && (
                    <button
                        className="mode-btn theme-amber sm-text mr-10"
                        style={{ padding: '0 5px', height: '18px', fontSize: '0.6rem' }}
                        onClick={() => handleReroll(track.id)}
                    >REROLL</button>
                )}
                <span className="restricted-text" style={{ fontSize: '0.6rem' }}>#{track.sequenceOrder + 1}</span>
            </div>
            <div className="mb-5">
                <div className="restricted-text mb-2" style={{ fontSize: '0.55rem', opacity: 0.8 }}>
                    {campaign.primaryEmployer?.toUpperCase() || 'UNKNOWN'} COMPLICATIONS
                </div>
                <div className="status-bar theme-green" style={{ width: '100%', padding: '5px', display: 'flex' }}>
                    <textarea
                        ref={textareaRef1}
                        className="table-input"
                        style={{ fontSize: '0.7rem', width: '100%', resize: 'none', border: 'none', overflow: 'hidden' }}
                        value={complications}
                        onChange={(e) => setComplications(e.target.value)}
                        onBlur={(e) => handleTextareaBlur(e, 'complications')}
                        readOnly={!isManager}
                        placeholder="COMPLICATIONS"
                        title="Mission complications or modifiers"
                    />
                </div>
            </div>
            <div className="flex flex-gap-5 mb-5">
                <div style={{ flex: 1 }}>
                    <div className="restricted-text mb-2" style={{ fontSize: '0.55rem', opacity: 0.8, color: 'var(--terminal-red)' }}>
                        {campaign.secondaryEmployer?.toUpperCase() || 'UNKNOWN'} COMPLICATIONS
                    </div>
                    <div className="status-bar theme-red" style={{ width: '100%', padding: '5px', display: 'flex', borderColor: 'var(--terminal-red-dim)' }}>
                        <textarea
                            ref={textareaRef2}
                            className="table-input"
                            style={{ fontSize: '0.7rem', width: '100%', resize: 'none', border: 'none', color: 'var(--terminal-red)', overflow: 'hidden' }}
                            value={oppositionComplications}
                            onChange={(e) => setOppositionComplications(e.target.value)}
                            onBlur={(e) => handleTextareaBlur(e, 'oppositionComplications')}
                            readOnly={!isManager}
                            placeholder="OPPOSITION COMPLICATIONS"
                            title="Opposition mission complications"
                        />
                    </div>
                </div>
            </div>
            <div className="flex flex-gap-5 mb-5">
                <div className="status-bar theme-amber" style={{ flex: 1, padding: '0 5px', display: 'flex', alignItems: 'center' }}>
                    <input
                        className="table-input"
                        style={{ fontSize: '0.7rem', width: '100%', border: 'none' }}
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        onBlur={(e) => handleTrackUpdate(track.id, 'location', e.target.value)}
                        readOnly={!isManager}
                        placeholder="GAME LOCATION"
                        title="Physical location"
                    />
                </div>
                {location && (
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`} target="_blank" rel="noopener noreferrer" className="mode-btn sm-text" style={{ padding: '0 4px', height: '16px' }}>MAP</a>
                )}
            </div >
            <div className="flex-between">
                <div className="status-bar theme-amber" style={{ width: '60%', padding: '0 5px', display: 'flex', alignItems: 'center' }}>
                    <input
                        type="datetime-local"
                        className="table-input"
                        style={{ fontSize: '0.7rem', width: '100%', border: 'none' }}
                        value={nextSession}
                        onChange={(e) => setNextSession(e.target.value)}
                        onBlur={(e) => handleTrackUpdate(track.id, 'nextSession', e.target.value)}
                        readOnly={!isManager}
                        title="Session date and time"
                    />
                </div>
                <div className="status-bar theme-amber" style={{ width: '35%', padding: '0 5px', display: 'flex', alignItems: 'center' }}>
                    <select
                        className="table-input"
                        style={{ fontSize: '0.7rem', width: '100%', border: 'none' }}
                        value={attackerFactionId}
                        onChange={(e) => setAttackerFactionId(e.target.value)}
                        onBlur={(e) => handleTrackUpdate(track.id, 'attackerFactionId', e.target.value)}
                        disabled={!isManager}
                        title="Attacker"
                    >
                        <option value="">[ ATK ]</option>
                        {campaign?.factions?.map((f: { id: string, factionName: string }) => {
                            const isPri = campaign?.contracts?.find(c => c.primaryContract)?.employerCategory.startsWith(f.factionName);
                            return (
                                <option key={f.id} value={f.id}>{isPri ? 'Pri: ' : 'Opp: '}{f.factionName.substring(0, 3).toUpperCase()}</option>
                            );
                        })}
                    </select>
                </div>
            </div>
            <div className="mt-10 pt-5" style={{ borderTop: '1px dashed var(--accent-dim)' }}>
                <button
                    className="mode-btn theme-amber w-100"
                    style={{ fontSize: '0.65rem', padding: '4px' }}
                    onClick={() => setShowAarForTrack(track)}
                >
                    [ AFTER ACTION REPORT ]
                </button>
            </div >
        </div >
    );
};