import React, { useState, useEffect, useMemo } from 'react';
import { LedgerEntryForm } from './LedgerEntryForm';
import { useQuery } from '@apollo/client/react';
import { GET_LEDGER_DATA } from '../types/operations';
import { LedgerData } from '../types/graphql.d';

interface LedgerDashboardProps {
    commandId: string;
    detachmentId?: string;
}

export const LedgerDashboard: React.FC<LedgerDashboardProps> = ({ commandId, detachmentId }) => {
    const [selectedDetachmentId, setSelectedDetachmentId] = useState<string>('');
    const { loading, data } = useQuery<LedgerData>(GET_LEDGER_DATA, {
        variables: { commandId }
    });

    useEffect(() => {
        // Prioritize the detachmentId passed from the Navigation Tree
        if (detachmentId) {
            setSelectedDetachmentId(detachmentId);
        } else if (data?.getCommand?.detachments && data.getCommand.detachments.length > 0 && !selectedDetachmentId) {
            // Fallback to the first detachment if none is selected
            setSelectedDetachmentId(data.getCommand.detachments[0].id);
        }
    }, [data, selectedDetachmentId, detachmentId]);

    const detachments = data?.getCommand?.detachments || [];
    const selectedDet = useMemo(() => detachments.find((d: any) => d.id === selectedDetachmentId), [detachments, selectedDetachmentId]);


    if (loading) return <div>ACCESSING SECURE LEDGER...</div>;

    return (
        <div className="ledger-dashboard">
            <header className="dashboard-header">
                <h1 className="terminal-text">WARCHEST LEDGER</h1>
                <p className="restricted-text">MERCENARY CONTRACT RECORD SHEET</p>
            </header>

            <div className="tactical-panel" style={{ marginBottom: '20px' }}>
                <label htmlFor="det-select">SELECT ACTIVE DETACHMENT: </label>
                <select
                    id="det-select"
                    value={selectedDetachmentId}
                    onChange={(e) => setSelectedDetachmentId(e.target.value)}
                    style={{ marginLeft: '10px', padding: '5px' }}
                    title="Select active detachment for ledger entries"
                >
                    {detachments.map((d: any) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>
            </div>

            {selectedDetachmentId ? (
                <LedgerEntryForm
                    commandId={commandId}
                    detachmentId={selectedDetachmentId}
                    initialCampaignName={selectedDet?.campaignName || ''}
                    onEntryAdded={() => alert("Transaction synchronized with Warchest.")}
                />
            ) : (
                <div className="empty-notice">No active detachments found for this command.</div>
            )}
        </div>
    );
};