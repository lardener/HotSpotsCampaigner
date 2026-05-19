import React, { useState, useEffect } from 'react';
import { LedgerEntryForm } from './LedgerEntryForm';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

const GET_LEDGER_DATA = gql`
  query GetLedgerData($commandId: ID!) {
    getCommand(id: $commandId) {
      id
      name
      totalSupportPoints
      detachments {
        id
        name
      }
    }
  }
`;

interface LedgerData {
    getCommand: {
        id: string;
        name: string;
        totalSupportPoints: number;
        detachments: {
            id: string;
            name: string;
        }[];
    };
}

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
                    onEntryAdded={() => alert("Transaction synchronized with Warchest.")}
                />
            ) : (
                <div className="empty-notice">No active detachments found for this command.</div>
            )}
        </div>
    );
};