import React from 'react';
import { NodeType } from './NavigationTree';
import { MercenaryCommand } from '../types/global.d';
import { MyDeploymentsBackground } from './MyDeploymentsBackground';

interface MyDeploymentsListProps {
    commands: MercenaryCommand[];
    onSelectDetachment: (item: { id: string, label: string, type: NodeType, metadata: any }) => void;
}

export const MyDeploymentsList: React.FC<MyDeploymentsListProps> = ({ commands, onSelectDetachment }) => {
    const deployedDetachments = commands.flatMap(cmd =>
        cmd.detachments?.filter(det => det.campaignId).map(det => ({
            ...det,
            commandName: cmd.name,
            campaignName: (det as any).campaignName,
            commandId: cmd.id
        })) || []
    );

    return (
        <div className="container my-deployments-container" style={{ position: 'relative', background: 'transparent', minHeight: '100%' }}>
            <MyDeploymentsBackground />
            <header className="dashboard-header">
                <h1 className="terminal-text">CURRENT DEPLOYMENTS</h1>
                <p className="restricted-text">ACTIVE DETACHMENTS ON CAMPAIGN</p>
            </header>
            <div className="command-panels-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
                {deployedDetachments.length === 0 ? (
                    <div className="placeholder-content" style={{ border: '1px dashed #444' }}>
                        <h3 className="terminal-text">NO ACTIVE DEPLOYMENTS</h3>
                        <p>Your mercenary commands currently have no detachments assigned to active campaigns.</p>
                    </div>
                ) : (
                    deployedDetachments.map(det => (
                        <div
                            key={det.id}
                            className="dashboard-section"
                            style={{ cursor: 'pointer', border: '1px solid var(--terminal-border)', transition: 'all 0.2s ease-in-out', backgroundColor: 'transparent', position: 'relative' }}
                            onClick={() => onSelectDetachment({ id: `deployment-${det.id}`, label: `${det.commandName} - ${det.name}`, type: 'DETACHMENT', metadata: { detachmentId: det.id, commandId: det.commandId, campaignId: det.campaignId } })}
                            title={`View ${det.name} deployment details`}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 className="section-title" style={{ margin: 0 }}>{det.name}</h3>
                                <span className="restricted-text" style={{ color: 'var(--terminal-green)' }}>[ DEPLOYED ]</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '15px' }}>
                                <div><span className="restricted-text" style={{ fontSize: '0.7rem', display: 'block' }}>COMMAND</span> {det.commandName}</div>
                                <div><span className="restricted-text" style={{ fontSize: '0.7rem', display: 'block' }}>CAMPAIGN</span> {det.campaignName || 'UNKNOWN THEATER'}</div>
                                <div><span className="restricted-text" style={{ fontSize: '0.7rem', display: 'block' }}>THEATER RATING</span> <span style={{ color: 'var(--terminal-amber)' }}>{det.campaignRating || 0}</span></div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <style>{`
                .my-deployments-container {
                    background: transparent !important;
                }
                .my-deployments-container .dashboard-section {
                    background-color: rgba(5, 7, 5, 0.3) !important;
                    backdrop-filter: blur(1px);
                }
            `}</style>
        </div>
    );
};