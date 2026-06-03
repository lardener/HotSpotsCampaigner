import { fetchVoid } from './apiClient';
import { LedgerEntryInput as LedgerEntryRequest } from '../types/global.d';

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
