import React from 'react';
import { MercenaryCommand } from '../types/global.d';

interface MercenaryRegistryViewProps {
    commands: MercenaryCommand[];
    selectedCommandId: string | null;
    onSelectCommand: (id: string) => void;
    onDeleteCommand: (id: string) => void;
    onEstablishCommand: () => void;
    onViewUnitProfile: () => void;
}

export const MercenaryRegistryView: React.FC<MercenaryRegistryViewProps> = ({
    commands,
    selectedCommandId,
    onSelectCommand,
    onDeleteCommand,
    onEstablishCommand,
    onViewUnitProfile
}) => {
    return (
        <div className="container">
            <header className="dashboard-header">
                <h1 className="terminal-text">MERCENARY REGISTRY</h1>
            </header>
            <div className="command-panels-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
                {commands.map(cmd => (
                    <div
                        key={cmd.id}
                        className={`dashboard-section ${selectedCommandId === cmd.id ? 'active-command-panel' : ''}`}
                        onClick={() => onSelectCommand(cmd.id)} title={`Select ${cmd.name}`}
                        style={{
                            cursor: 'pointer',
                            border: selectedCommandId === cmd.id ? '2px solid var(--accent-primary)' : '1px solid var(--terminal-border)',
                            transition: 'all 0.2s ease-in-out',
                            backgroundColor: selectedCommandId === cmd.id ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                            position: 'relative'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 className="section-title" style={{ margin: 0 }}>{cmd.name || 'UNNAMED UNIT'}</h3>
                            {selectedCommandId === cmd.id && <span className="restricted-text" style={{ color: 'var(--accent-primary)' }}>[ ACTIVE COMMAND ]</span>}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '15px' }}>
                            <div><span className="restricted-text" style={{ fontSize: '0.7rem', display: 'block' }}>COMMANDING OFFICER</span> {cmd.commandingOfficer || 'UNKNOWN'}</div>
                            <div><span className="restricted-text" style={{ fontSize: '0.7rem', display: 'block' }}>SUPPORT POINTS</span> {cmd.totalSupportPoints || 0}</div>
                            <div><span className="restricted-text" style={{ fontSize: '0.7rem', display: 'block' }}>REPUTATION</span> {cmd.reputation || 0}</div>
                        </div>

                        {selectedCommandId === cmd.id && (
                            <div style={{ marginTop: '20px', borderTop: '1px solid #333', paddingTop: '15px', display: 'flex', gap: '10px' }}> {/* Added type="button" */}
                                <button type="button" className="mode-btn" onClick={(e) => { e.stopPropagation(); onViewUnitProfile(); }}>UNIT PROFILE</button>
                                <button type="button"
                                    className="mode-btn"
                                    style={{ marginLeft: 'auto', border: '1px solid var(--terminal-alert)', color: 'var(--terminal-alert)' }}
                                    onClick={(e) => { e.stopPropagation(); onDeleteCommand(cmd.id); }}
                                >
                                    SCRAP UNIT
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                <div
                    className="dashboard-section"
                    onClick={onEstablishCommand}
                    style={{ cursor: 'pointer', border: '1px dashed #666', textAlign: 'center', padding: '30px', opacity: 0.7, backgroundColor: 'rgba(255, 255, 255, 0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Establish a new mercenary command"
                >
                    <h3 className="terminal-text" style={{ margin: 0 }}>+ ESTABLISH NEW MERCENARY COMMAND</h3>
                </div>
            </div>
        </div>
    );
};