import React, { useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';

export const ADD_LEDGER_ENTRY = gql`
  mutation AddLedgerEntry($commandId: ID!, $detachmentId: ID, $amount: Int!, $description: String!, $coverAmount: Int, $paidAmount: Int, $reputationChange: Int) {
    addLedgerEntry(commandId: $commandId, detachmentId: $detachmentId, amount: $amount, description: $description, coverAmount: $coverAmount, paidAmount: $paidAmount, reputationChange: $reputationChange) {
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
    const [coverAmount, setCoverAmount] = useState<number | undefined>(undefined);
    const [paidAmount, setPaidAmount] = useState<number | undefined>(undefined);
    const [reputationChange, setReputationChange] = useState<number | undefined>(undefined);
    const [addLedgerEntry, { loading }] = useMutation(ADD_LEDGER_ENTRY);
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmissionError(null);
        // Ensure undefined values are sent as null for GraphQL
        const finalCoverAmount = coverAmount === undefined ? null : coverAmount;
        const finalPaidAmount = paidAmount === undefined ? null : paidAmount;
        const finalReputationChange = reputationChange === undefined ? null : reputationChange;

        try {
            await addLedgerEntry({
                variables: {
                    commandId,
                    detachmentId,
                    amount,
                    description,
                    coverAmount: finalCoverAmount,
                    paidAmount: finalPaidAmount,
                    reputationChange: finalReputationChange
                }
            });
            setDescription('');
            setAmount(0);
            setCoverAmount(undefined);
            setPaidAmount(undefined);
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
                    <label htmlFor="coverAmount">Cover (SP)</label>
                    <input
                        id="coverAmount"
                        type="number"
                        value={coverAmount === undefined ? '' : coverAmount}
                        onChange={(e) => setCoverAmount(e.target.value === '' ? undefined : parseInt(e.target.value))}
                        title="Amount covered by contract"
                        placeholder="Optional"
                    />
                    <small>Amount covered by contract terms</small>
                </div>
                <div className="form-group">
                    <label htmlFor="paidAmount">Paid (SP)</label>
                    <input
                        id="paidAmount"
                        type="number"
                        value={paidAmount === undefined ? '' : paidAmount}
                        onChange={(e) => setPaidAmount(e.target.value === '' ? undefined : parseInt(e.target.value))}
                        title="Actual amount paid"
                        placeholder="Optional"
                    />
                    <small>Actual amount paid</small>
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