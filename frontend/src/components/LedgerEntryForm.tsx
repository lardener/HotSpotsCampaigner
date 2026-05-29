import React, { useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react'; // Keep this import style
import { LedgerEntryInput } from '../types/global.d';

export const ADD_LEDGER_ENTRY = gql`
  mutation AddLedgerEntry($commandId: ID!, $detachmentId: ID, $input: LedgerEntryInput!) {
    addLedgerEntry(commandId: $commandId, detachmentId: $detachmentId, input: $input) {
      id
    }
  }
`;

interface LedgerEntryFormProps {
    commandId: string;
    detachmentId: string | null;
    initialCampaignName?: string;
    initialMonthIndex?: number;
    onEntryAdded: () => void;
}

export const LedgerEntryForm: React.FC<LedgerEntryFormProps> = ({ commandId, detachmentId, initialCampaignName = '', initialMonthIndex, onEntryAdded }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState<number>(0);
    const [reputationChange, setReputationChange] = useState<number | undefined>(undefined);
    const [campaignName, setCampaignName] = useState(initialCampaignName);
    const [monthIndex, setMonthIndex] = useState<number | undefined>(initialMonthIndex);
    const [addLedgerEntry, { loading }] = useMutation<any, { commandId: string; detachmentId: string | null; input: LedgerEntryInput }>(ADD_LEDGER_ENTRY);
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    useEffect(() => {
        setCampaignName(initialCampaignName);
        setMonthIndex(initialMonthIndex);
    }, [initialCampaignName, initialMonthIndex]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmissionError(null);
        const finalReputationChange = reputationChange === undefined ? null : reputationChange;

        try {
            await addLedgerEntry({
                variables: {
                    commandId,
                    detachmentId,
                    input: {
                        amount,
                        description,
                        reputationChange: finalReputationChange ?? undefined,
                        campaignName: campaignName || undefined,
                        monthIndex: monthIndex === undefined ? undefined : monthIndex
                    }
                }
            });
            setDescription('');
            setAmount(0);
            setReputationChange(undefined);
            setCampaignName(initialCampaignName);
            setMonthIndex(initialMonthIndex);
            onEntryAdded();
        } catch (error) {
            console.error('Error adding ledger entry:', error);
            setSubmissionError('Failed to add ledger entry. Please try again.');
        }
    };

    const labelWidth = '160px';

    return (
        <div className="ledger-form-container">
            <h3 className="zone-header" style={{ margin: '0 0 10px 0' }}>RECORD SP TRANSACTION</h3>
            <form onSubmit={handleSubmit} className="flex-col flex-gap-10">
                <div className="flex-col flex-gap-5">
                    <div className="input-group flex items-center">
                        <label htmlFor="description" className="restricted-text sm-text" style={{ minWidth: labelWidth }}>DESCRIPTION</label>
                        <input
                            id="description"
                            type="text"
                            className="table-input flex-grow"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            title="Transaction Description"
                            placeholder="REPAIRING ATLAS AS7-D..."
                            required
                        />
                    </div>

                    <div className="grid-2-col flex-gap-20">
                        <div className="input-group flex items-center">
                            <label htmlFor="amount" className="restricted-text sm-text" style={{ minWidth: labelWidth }}>SUPPORT POINTS</label>
                            <input
                                id="amount"
                                type="number"
                                className="table-input text-right"
                                style={{ width: '8em' }}
                                value={amount}
                                onChange={(e) => setAmount(parseInt(e.target.value))}
                                title="Support Points Amount (negative for costs)"
                                required
                            />
                        </div>
                        <div className="input-group flex items-center">
                            <label htmlFor="reputationChange" className="restricted-text sm-text" style={{ minWidth: '120px' }}>REPUTATION Δ</label>
                            <input
                                id="reputationChange"
                                type="number"
                                className="table-input text-right"
                                style={{ width: '6em' }}
                                value={reputationChange === undefined ? '' : reputationChange}
                                onChange={(e) => setReputationChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
                                title="Reputation change (optional)"
                                placeholder="±0"
                            />
                        </div>
                    </div>

                    <div className="grid-2-col flex-gap-20">
                        <div className="input-group flex items-center">
                            <label htmlFor="campaignName" className="restricted-text sm-text" style={{ minWidth: labelWidth }}>THEATER</label>
                            <input
                                id="campaignName"
                                type="text"
                                className="table-input flex-grow"
                                value={campaignName}
                                onChange={(e) => setCampaignName(e.target.value)}
                                title="Associated Campaign (optional)"
                                placeholder="HINTERLANDS RAID"
                            />
                        </div>
                        <div className="input-group flex items-center">
                            <label htmlFor="monthIndex" className="restricted-text sm-text" style={{ minWidth: '120px' }}>MONTH INDEX</label>
                            <input
                                id="monthIndex"
                                type="number"
                                className="table-input text-right"
                                style={{ width: '6em' }}
                                value={monthIndex === undefined ? '' : monthIndex}
                                onChange={(e) => setMonthIndex(e.target.value === '' ? undefined : parseInt(e.target.value))}
                                title="Campaign Month (optional)"
                                placeholder="1"
                                min="1"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-between items-center mt-5">
                    <div className="restricted-text xs-text subdued">
                        * USE NEGATIVE VALUES FOR COSTS / OUTGOING SP
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="mode-btn theme-green"
                        style={{ padding: '4px 20px', fontSize: '0.8rem' }}
                    >
                        {loading ? '>> COMMITTING...' : '✓ COMMIT TRANSACTION'}
                    </button>
                </div>

                {submissionError && (
                    <div className="error-message sm-text alert-border mt-10">
                        {submissionError.toUpperCase()}
                    </div>
                )}
            </form>
        </div>
    );
};