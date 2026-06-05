import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { TerminalOverlay } from './TerminalOverlay';
import { Detachment, CampaignDetailSummary } from '../types/global.d';
import { ADD_LEDGER_ENTRY } from '../types/operations';
import { parseMultiplier } from '../util/contractUtils'; // This was already correct

interface MonthlyExpensesEditorProps {
    campaignDetails: CampaignDetailSummary; // Use CampaignDetailSummary
    detachments: Detachment[];
    currentMonthIndex: number;
    onClose: () => void;
    onLedgerEntryAdded: () => void;
}

interface DetachmentFormState {
    detachmentId: string;
    detachmentName: string; // Renamed from name for clarity
    mercenaryCommandId: string;
    selectedContractId: string;
    selectedLevel: number; // For future use, currently fixed at 1
    chargeType: 'Monthly Pay & Expenses' | 'Transport' | 'Freeform Entry';
    amount: number;
    description: string;
    isSubmitting: boolean;
    error: string | null;
}

export const MonthlyExpensesEditor: React.FC<MonthlyExpensesEditorProps> = ({
    campaignDetails,
    detachments,
    currentMonthIndex, // Use currentMonthIndex
    onClose,
    onLedgerEntryAdded
}) => {
    const [detachmentForms, setDetachmentForms] = useState<DetachmentFormState[]>([]);
    const [addLedgerEntry] = useMutation(ADD_LEDGER_ENTRY);
    const [notices, setNotices] = useState<Record<string, string>>({});

    const addNotice = (key: string, msg: string) => {
        setNotices(prev => ({ ...prev, [key]: msg }));
        setTimeout(() => {
            setNotices(prev => {
                const next = { ...prev };
                delete next[key];
                return next;
            });
        }, 5000);
    };

    const calculateFormDefaults = (chargeType: DetachmentFormState['chargeType'], level: number, contractId: string) => {
        const contract = campaignDetails.contracts?.find(c => c.id === contractId);
        const levelMult = level;
        let amount = 0;
        let termsLabel = '';

        switch (chargeType) {
            case 'Monthly Pay & Expenses':
                const pRate = contract?.payRate || 1.0;
                const grossPay = (campaignDetails.monthlyPay || 0) * pRate;
                const baseExpenses = (campaignDetails.monthlyMaintenance || 0);
                amount = Math.round((grossPay - baseExpenses) * levelMult);
                termsLabel = `PAY: ${Math.round(pRate * 100)}%`;
                break;
            case 'Transport':
                const tBase = (campaignDetails.transportationCost || 0) * levelMult;
                const tMult = parseMultiplier(contract?.transportTerms);
                amount = -Math.round(tBase * (1 - tMult));
                termsLabel = contract?.transportTerms || 'NONE';
                break;
            case 'Freeform Entry':
                return { amount: 0, description: '' };
        }

        const description = `${chargeType.toUpperCase()}: ${campaignDetails.name} (MO ${currentMonthIndex}) [LVL ${level}] [TERMS: ${termsLabel}]`;
        return { amount, description };
    };

    useEffect(() => {
        setDetachmentForms(prevForms => {
            // Create a lookup map of existing form states to preserve user input during prop refreshes
            const existingFormsMap = new Map(prevForms.map(f => [f.detachmentId, f]));

            return detachments.map(det => {
                // If we already have state for this detachment, keep it
                if (existingFormsMap.has(det.id)) {
                    return existingFormsMap.get(det.id)!;
                }

                // Otherwise, initialize a new form row with defaults
                const defaultContractId = campaignDetails.contracts?.[0]?.id || '';
                const { amount, description } = calculateFormDefaults('Monthly Pay & Expenses', 1, defaultContractId);
                return {
                    detachmentId: det.id,
                    detachmentName: det.name,
                    mercenaryCommandId: det.mercenaryCommandId || '',
                    selectedContractId: defaultContractId,
                    selectedLevel: 1,
                    chargeType: 'Monthly Pay & Expenses',
                    amount,
                    description,
                    isSubmitting: false,
                    error: null,
                };
            });
        });
    }, [detachments, campaignDetails, currentMonthIndex]);

    const handleFormChange = (detachmentId: string, field: keyof DetachmentFormState, value: any) => {
        setDetachmentForms(prevForms => prevForms.map(form => {
            if (form.detachmentId === detachmentId) {
                const updatedForm = { ...form, [field]: value };

                if (['chargeType', 'selectedContractId', 'selectedLevel'].includes(field)) {
                    const { amount, description } = calculateFormDefaults(updatedForm.chargeType, updatedForm.selectedLevel, updatedForm.selectedContractId);
                    updatedForm.amount = amount;
                    updatedForm.description = description;
                }
                return updatedForm;
            }
            return form;
        }));
    };

    const handleCommit = async (detachmentId: string) => {
        const form = detachmentForms.find(f => f.detachmentId === detachmentId);
        if (!form || !form.mercenaryCommandId) return;

        setDetachmentForms(prevForms => prevForms.map(f =>
            f.detachmentId === detachmentId ? { ...f, isSubmitting: true, error: null } : f
        ));

        try {
            await addLedgerEntry({
                variables: {
                    commandId: form.mercenaryCommandId, // Use detachment's commandId
                    detachmentId: form.detachmentId,
                    input: {
                        amount: form.amount,
                        description: form.description,
                        campaignName: campaignDetails.name,
                        monthIndex: currentMonthIndex,
                    }
                }
            });
            onLedgerEntryAdded();
            addNotice(form.detachmentId, `✓ COMMITTED: ${form.amount} SP`);
            setDetachmentForms(prevForms => prevForms.map(f =>
                f.detachmentId === detachmentId ? { ...f, isSubmitting: false, error: null, amount: 0, description: '' } : f
            ));
        } catch (err: any) {
            console.error("Error committing ledger entry:", err);
            setDetachmentForms(prevForms => prevForms.map(f =>
                f.detachmentId === detachmentId ? { ...f, isSubmitting: false, error: err.message || 'Failed to commit entry.' } : f
            ));
        }
    };

    const CHARGE_TYPES = ['Monthly Pay & Expenses', 'Transport', 'Freeform Entry'];

    return (
        <TerminalOverlay
            title={`MONTHLY EXPENSES: ${campaignDetails.name}`}
            message="RECORD FINANCIAL TRANSACTIONS FOR DEPLOYED DETACHMENTS."
            confirmLabel="CLOSE"
            onConfirm={onClose}
            themeClass="theme-blue"
        >
            <div className="ledger-entry-table" style={{ marginTop: '20px', maxHeight: '60vh', overflowY: 'auto' }}>
                <table className="tactical-table">
                    <thead>
                        <tr>
                            <th style={{ width: '15%' }}>DETACHMENT</th>
                            <th style={{ width: '15%' }}>CONTRACT</th>
                            <th style={{ width: '8%' }}>LEVEL</th>
                            <th style={{ width: '18%' }}>CHARGE TYPE</th>
                            <th className="text-right" style={{ width: '10%' }}>AMOUNT (SP)</th>
                            <th style={{ width: '24%' }}>DESCRIPTION</th>
                            <th style={{ width: '10%' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {detachmentForms.map(form => (
                            <tr key={form.detachmentId}>
                                <td>{form.detachmentName}</td>
                                <td>
                                    <div className="status-bar theme-blue cursor-pointer" style={{ padding: '0 5px' }}>
                                        <select
                                            className="table-input"
                                            style={{ border: 'none' }}
                                            value={form.selectedContractId}
                                            onChange={(e) => handleFormChange(form.detachmentId, 'selectedContractId', e.target.value)}
                                            title="Select contract terms"
                                        >
                                            {campaignDetails.contracts?.length === 0 && <option value="">NO CONTRACTS</option>}
                                            {campaignDetails.contracts?.map(contract => (
                                                <option key={contract.id} value={contract.id}>
                                                    {contract.primaryContract ? 'PRIMARY' : 'OPPOSITION'} ({contract.employerCategory})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </td>
                                <td>
                                    <div className="status-bar theme-blue" style={{ padding: '0 5px' }}>
                                        <select
                                            className="table-input"
                                            style={{ border: 'none' }}
                                            value={form.selectedLevel}
                                            onChange={(e) => handleFormChange(form.detachmentId, 'selectedLevel', parseInt(e.target.value))}
                                            title="Select level"
                                        >
                                            {[1, 2, 3].map(level => (
                                                <option key={level} value={level}>{level}</option>
                                            ))}
                                        </select>
                                    </div>
                                </td>
                                <td>
                                    <div className="status-bar theme-blue" style={{ padding: '0 5px' }}>
                                        <select
                                            className="table-input"
                                            style={{ border: 'none' }}
                                            value={form.chargeType}
                                            onChange={(e) => handleFormChange(form.detachmentId, 'chargeType', e.target.value as DetachmentFormState['chargeType'])}
                                            title="Select charge type"
                                        >
                                            {CHARGE_TYPES.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                </td>
                                <td>
                                    <div className="status-bar theme-blue" style={{ padding: '0 5px' }}>
                                        <input
                                            type="number"
                                            className="table-input text-right"
                                            style={{ border: 'none' }}
                                            value={form.amount}
                                            onChange={(e) => handleFormChange(form.detachmentId, 'amount', parseInt(e.target.value) || 0)}
                                            title="Amount in Support Points"
                                        />
                                    </div>
                                </td>
                                <td>
                                    <div className="status-bar theme-blue" style={{ padding: '0 5px' }}>
                                        <input
                                            type="text"
                                            className="table-input"
                                            style={{ border: 'none' }}
                                            value={form.description}
                                            onChange={(e) => handleFormChange(form.detachmentId, 'description', e.target.value)}
                                            placeholder="Custom description"
                                            title="Transaction description"
                                            disabled={form.chargeType !== 'Freeform Entry'}
                                        />
                                    </div>
                                </td>
                                <td className="text-center">
                                    {notices[form.detachmentId] && (
                                        <div className="restricted-text theme-green xs-text blink-slow mb-5" style={{ whiteSpace: 'nowrap' }}>{notices[form.detachmentId]}</div>
                                    )}
                                    <button
                                        className="mode-btn"
                                        onClick={() => handleCommit(form.detachmentId)}
                                        disabled={form.isSubmitting || !form.amount || !form.description.trim()}
                                        title="Commit transaction"
                                    >
                                        {form.isSubmitting ? '...' : 'COMMIT'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {
                    detachmentForms.some(f => f.error) && (
                        <div className="error-message mt-10">
                            {detachmentForms.map(f => f.error && <p key={f.detachmentId}>{f.detachmentName}: {f.error}</p>)}
                        </div>
                    )
                }
            </div>
            <style>{`
                .xs-text { font-size: 0.65rem; }
                .theme-green { color: var(--terminal-green); }
            `}</style>
        </TerminalOverlay>
    );
};