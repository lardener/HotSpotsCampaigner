import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createLedgerEntry } from './ledgerApi';

describe('ledgerApi', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('posts a ledger entry to the backend', async () => {
        const fetchMock = vi.fn().mockResolvedValue({ ok: true } as Response);
        global.fetch = fetchMock as unknown as typeof fetch;

        await createLedgerEntry('detachment-123', { description: 'Test', amount: 42 });

        expect(fetchMock).toHaveBeenCalledWith(
            'http://localhost:8080/api/ledger/detachment-123',
            expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: 'Test', amount: 42 }),
                credentials: 'include',
            })
        );
    });

    it('throws when detachmentId is missing', async () => {
        await expect(createLedgerEntry('', { description: 'Test', amount: 42 })).rejects.toThrow('Detachment ID is required.');
    });
});
