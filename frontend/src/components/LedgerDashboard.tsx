import React, { useState, useEffect } from 'react';
import { LedgerEntryForm } from './LedgerEntryForm';
import * as forceApi from '../services/forceApi';

interface LedgerDashboardProps {
    commandId: string;
}

export const LedgerDashboard: React.FC<LedgerDashboardProps> = ({ commandId }) => {
    const [detachments, setDetachments] = useState<forceApi.Detachment[]>([]);
    const [selectedDetachmentId, setSelectedDetachmentId] = useState<string>('');
    const [loading, setLoading] = useState(true);

    const loadDetachments = async () => {
        try {
            const data = await forceApi.getDetachments(commandId);
            setDetachments(data);
            if (data.length > 0 && !selectedDetachmentId) {
                setSelectedDetachmentId(data[0].id);
            }
        } catch (err) {
            console.error("Failed to load detachments for ledger", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDetachments();
    }, [commandId]);

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
                    {detachments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>
            </div>

            {selectedDetachmentId ? (
                <LedgerEntryForm
                    detachmentId={selectedDetachmentId}
                    onEntryAdded={() => alert("Transaction synchronized with Warchest.")}
                />
            ) : (
                <div className="empty-notice">No active detachments found for this command.</div>
            )}
        </div>
    );
};