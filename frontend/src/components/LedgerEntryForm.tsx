import React, { useState } from 'react';
import { createLedgerEntry } from '../services/ledgerApi';

interface LedgerEntryFormProps {
    detachmentId: string;
    onEntryAdded: () => void;
}

export const LedgerEntryForm: React.FC<LedgerEntryFormProps> = ({ detachmentId, onEntryAdded }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSubmissionError(null);

        try {
            await createLedgerEntry(detachmentId, { description, amount });
            setDescription('');
            setAmount(0);
            onEntryAdded();
        } catch (error) {
            console.error('Error adding ledger entry:', error);
            setSubmissionError('Failed to add ledger entry. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ledger-form-container">
            <h3 className="section-title">RECORD SP TRANSACTION</h3>
            <form onSubmit={handleSubmit} className="ledger-form">
                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <input
                        id="description"
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g., Repairing Atlas AS7-D"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="amount">Support Points (SP)</label>
                    <input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(parseInt(e.target.value))}
                        required
                    />
                    <small>Use negative values for costs</small>
                </div>
                {submissionError && <div className="error-message" style={{ marginBottom: '16px' }}>{submissionError}</div>}
                <button type="submit" disabled={loading} className="login-button">
                    {loading ? 'PROCESSING...' : 'COMMIT TRANSACTION'}
                </button>
            </form>
        </div>
    );
};