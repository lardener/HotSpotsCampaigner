import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client/react'; // Keep this import style
import { NumericInput } from '../types/helpers';
import { parseNumericInput, isInputInvalid } from '../util/contractUtils';
import { ADD_LEDGER_ENTRY, GET_UNIT_DOSSIER, GET_LEDGER_DATA } from '../types/operations';
import { LedgerBackground } from './LedgerBackground';

interface LedgerEntryFormProps {
    commandId: string;
    detachmentId: string | null;
    campaignId?: string | null;
    initialCampaignName?: string;
    initialMonthIndex?: number;
    onEntryAdded: () => void;
}

export const LedgerEntryForm: React.FC<LedgerEntryFormProps> = ({ commandId, detachmentId, campaignId, initialCampaignName = '', initialMonthIndex, onEntryAdded }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState<NumericInput>(0);
    const [reputationChange, setReputationChange] = useState<NumericInput>('');
    const [campaignName, setCampaignName] = useState(initialCampaignName);
    const [monthIndex, setMonthIndex] = useState<number | undefined>(initialMonthIndex);
    const [addLedgerEntry, { loading }] = useMutation(ADD_LEDGER_ENTRY);
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    useEffect(() => {
        setCampaignName(initialCampaignName);
        setMonthIndex(initialMonthIndex);
    }, [initialCampaignName, initialMonthIndex]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmissionError(null);

        try {
            await addLedgerEntry({
                variables: {
                    commandId,
                    detachmentId,
                    input: {
                        amount: parseNumericInput(amount),
                        description,
                        reputationChange: reputationChange === '' ? undefined : parseNumericInput(reputationChange),
                        campaignId: campaignId ?? undefined,
                        campaignName: campaignName || undefined,
                        monthIndex: monthIndex ?? undefined
                    }
                },
                refetchQueries: [
                    { query: GET_UNIT_DOSSIER, variables: { commandId } },
                    { query: GET_LEDGER_DATA, variables: { commandId } }
                ]
            });
            setDescription('');
            setAmount('0');
            setReputationChange('');
            setCampaignName(initialCampaignName);
            setMonthIndex(initialMonthIndex);
            onEntryAdded();
        } catch (error) {
            console.error('Error adding ledger entry:', error);
            setSubmissionError('Failed to add ledger entry. Please try again.');
        }
    };

    return (
        <div className="ledger-form-container">
            <LedgerBackground />
            <h3 className="zone-header" style={{ margin: '0 0 10px 0' }}>RECORD SP TRANSACTION</h3>
            <form onSubmit={handleSubmit} className="flex-col flex-gap-10">
                <div className="flex-col flex-gap-5">
                    <div className="input-group flex-col">
                        <label htmlFor="description" className="restricted-text sm-text mb-5">DESCRIPTION</label>
                        <div className="status-bar theme-green" style={{ padding: '0 5px', display: 'flex', alignItems: 'center' }}>
                            <input
                                id="description"
                                type="text"
                                className="table-input w-100"
                                style={{ border: 'none' }}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                title="Transaction Description"
                                placeholder="REPAIRING ATLAS AS7-D..."
                                required
                            />
                        </div>
                    </div>

                    <div className="grid-2-col flex-gap-20">
                        <div className="input-group flex-col">
                            <label htmlFor="amount" className="restricted-text sm-text mb-5">SUPPORT POINTS</label>
                            <div className={`status-bar theme-green ${isInputInvalid(amount) ? 'invalid' : ''}`} style={{ padding: '0 5px', display: 'flex', alignItems: 'center', width: 'calc(8em + 10px)' }}>
                                <input
                                    id="amount"
                                    type="number"
                                    className="table-input text-right"
                                    style={{ border: 'none', width: '8em' }}
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    title="Support Points Amount (negative for costs)"
                                    placeholder="±0"
                                    required
                                />
                            </div>
                        </div>
                        <div className="input-group flex-col">
                            <label htmlFor="reputationChange" className="restricted-text sm-text mb-5">REPUTATION Δ</label>
                            <div className={`status-bar theme-green ${isInputInvalid(reputationChange) ? 'invalid' : ''}`} style={{ padding: '0 5px', display: 'flex', alignItems: 'center', width: 'calc(6em + 10px)' }}>
                                <input
                                    id="reputationChange"
                                    type="number"
                                    className="table-input text-right"
                                    style={{ border: 'none', width: '6em' }}
                                    value={reputationChange}
                                    onChange={(e) => setReputationChange(e.target.value)}
                                    title="Reputation change (optional)"
                                    placeholder="±0"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid-2-col flex-gap-20">
                        <div className="input-group flex-col">
                            <label htmlFor="campaignName" className="restricted-text sm-text mb-5">THEATER</label>
                            <div className="status-bar theme-green" style={{ padding: '0 5px', display: 'flex', alignItems: 'center' }}>
                                <input
                                    id="campaignName"
                                    type="text"
                                    className="table-input w-100"
                                    style={{ border: 'none' }}
                                    value={campaignName}
                                    onChange={(e) => setCampaignName(e.target.value)}
                                    title="Associated Campaign (optional)"
                                    placeholder="HINTERLANDS RAID"
                                />
                            </div>
                        </div>
                        <div className="input-group flex-col">
                            <label htmlFor="monthIndex" className="restricted-text sm-text mb-5">MONTH INDEX</label>
                            <div className="status-bar theme-green" style={{ padding: '0 5px', display: 'flex', alignItems: 'center', width: 'calc(6em + 10px)' }}>
                                <input
                                    id="monthIndex"
                                    type="number"
                                    className="table-input text-right"
                                    style={{ border: 'none', width: '6em' }}
                                    value={monthIndex === undefined ? '' : monthIndex}
                                    onChange={(e) => setMonthIndex(e.target.value === '' ? undefined : parseInt(e.target.value))}
                                    title="Campaign Month (optional)"
                                    placeholder="1"
                                    min="1"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-between items-center mt-5">
                    <button
                        type="submit"
                        disabled={
                            loading ||
                            isInputInvalid(amount) || amount === '' || amount === '-' ||
                            isInputInvalid(reputationChange) || reputationChange === '-'
                        }
                        className="mode-btn theme-green"
                        style={{ padding: '4px 20px', fontSize: '0.8rem' }}
                    >
                        {loading ? '>> COMMITTING...' : '✓ COMMIT TRANSACTION'}
                    </button>
                    <div className="restricted-text xs-text subdued">
                        * USE NEGATIVE VALUES FOR COSTS / OUTGOING SP
                    </div>
                </div>

                {submissionError && (
                    <div className="error-message sm-text alert-border mt-10">
                        {submissionError.toUpperCase()}
                    </div>
                )}
            </form>

            <style>{`
                .ledger-form-container {
                    backdrop-filter: blur(1px);
                }
            `}</style>
        </div>
    );
};