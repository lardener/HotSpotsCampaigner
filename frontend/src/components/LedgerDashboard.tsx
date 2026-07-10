import React, { useState, useEffect, useMemo } from 'react';
import { LedgerEntryForm } from './LedgerEntryForm';
import { useQuery } from '@apollo/client/react';
import { GetLedgerDataDocument } from '../types/operations';
import { GetLedgerDataQuery } from '../types/operations';
import { LedgerBackground } from './LedgerBackground';

interface LedgerDashboardProps {
    commandId: string;
    detachmentId?: string;
}

export const LedgerDashboard: React.FC<LedgerDashboardProps> = ({ commandId, detachmentId }) => {
    const [selectedDetachmentId, setSelectedDetachmentId] = useState<string>('');
    const { loading, data, refetch } = useQuery<GetLedgerDataQuery>(GetLedgerDataDocument, {
        variables: { commandId },
        fetchPolicy: 'cache-and-network',
        notifyOnNetworkStatusChange: true
    });

    const detachments = useMemo(() => {
        return (data?.getCommand?.detachments || [])
            .filter((d): d is NonNullable<typeof d> => d != null);
    }, [data]);

    useEffect(() => {
        // Prioritize the detachmentId passed from the Navigation Tree
        if (detachmentId) {
            setSelectedDetachmentId(detachmentId);
        } else if (detachments.length > 0 && !selectedDetachmentId) {
            // Fallback to the first detachment if none is selected
            setSelectedDetachmentId(detachments[0].id);
        }
    }, [detachments, selectedDetachmentId, detachmentId]);

    const selectedDet = useMemo(() => detachments.find((d) => d.id === selectedDetachmentId), [detachments, selectedDetachmentId]);


    if (loading && !data) return <div>ACCESSING SECURE LEDGER...</div>;

    return (
        <div className="ledger-dashboard" style={{ position: 'relative', overflow: 'hidden' }}>
            <LedgerBackground />
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
                    campaignId={selectedDet?.campaignId}
                    initialCampaignName={selectedDet?.campaignName || ''}
                    onEntryAdded={() => refetch()} // Refetch ledger data after new entry
                />
            ) : (
                <div className="empty-notice">No active detachments found for this command.</div>
            )}
        </div>
    );
};