import React, { useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';

export const ADD_LEDGER_ENTRY = gql`
  mutation AddLedgerEntry($commandId: ID!, $detachmentId: ID, $amount: Int!, $description: String!, $reputationChange: Int) {
    addLedgerEntry(commandId: $commandId, detachmentId: $detachmentId, amount: $amount, description: $description, reputationChange: $reputationChange) {
      id
    }
  }
`;

interface LedgerEntryFormProps {
    commandId: string;
    detachmentId: string | null;
    onEntryAdded: () => void;
}

export const LedgerEntryForm: React.FC<LedgerEntryFormProps> = ({ commandId, detachmentId, onEntryAdded }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState<number>(0);
    const [reputationChange, setReputationChange] = useState<number | undefined>(undefined);
    const [addLedgerEntry, { loading }] = useMutation(ADD_LEDGER_ENTRY);
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmissionError(null);
        const finalReputationChange = reputationChange === undefined ? null : reputationChange;

        try {
            await addLedgerEntry({
                variables: {
                    commandId,
                    detachmentId,
                    amount,
                    description,
                    reputationChange: finalReputationChange
                }
            });
            setDescription('');
            setAmount(0);
            setReputationChange(undefined);
            onEntryAdded();
        } catch (error) {
            console.error('Error adding ledger entry:', error);
            setSubmissionError('Failed to add ledger entry. Please try again.');
        }
    };

    return (
        <div className="ledger-form-container">
            <h3 className="section-title" title="Record Support Point Transaction">RECORD SP TRANSACTION</h3>
            <form onSubmit={handleSubmit} className="ledger-form">
                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <input
                        id="description"
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        title="Transaction Description"
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
                        title="Support Points Amount (negative for costs)"
                        required
                    />
                    <small>Use negative values for costs</small>
                </div>
                <div className="form-group">
                    <label htmlFor="reputationChange">Reputation Change</label>
                    <input
                        id="reputationChange"
                        type="number"
                        value={reputationChange === undefined ? '' : reputationChange}
                        onChange={(e) => setReputationChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
                        title="Reputation change from transaction"
                        placeholder="Optional"
                    />
                    <small>Positive or negative change</small>
                </div>
                {submissionError && <div className="error-message" style={{ marginBottom: '16px' }}>{submissionError}</div>}
                <button type="submit" disabled={loading} className="login-button">
                    {loading ? 'PROCESSING...' : 'COMMIT TRANSACTION'}
                </button>
            </form>
        </div>
    );
};