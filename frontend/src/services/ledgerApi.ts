import { fetchVoid } from './apiClient';

export interface LedgerEntryRequest {
    description: string;
    amount: number;
}

export const createLedgerEntry = async (detachmentId: string, entry: LedgerEntryRequest): Promise<void> => {
    if (!detachmentId || detachmentId.length === 0) {
        throw new Error('Detachment ID is required.');
    }

    await fetchVoid(`/api/ledger/${encodeURIComponent(detachmentId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
    });
};
