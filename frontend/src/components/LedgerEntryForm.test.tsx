import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LedgerEntryForm } from './LedgerEntryForm';
import * as ledgerApi from '../services/ledgerApi';

describe('LedgerEntryForm', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('submits a ledger entry successfully', async () => {
        const createLedgerEntry = vi.spyOn(ledgerApi, 'createLedgerEntry').mockResolvedValue();
        const onEntryAdded = vi.fn();

        render(<LedgerEntryForm detachmentId="detachment-1" onEntryAdded={onEntryAdded} />);

        fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Repair parts' } });
        fireEvent.change(screen.getByLabelText(/support points/i), { target: { value: '50' } });
        fireEvent.click(screen.getByRole('button', { name: /commit transaction/i }));

        await waitFor(() => {
            expect(createLedgerEntry).toHaveBeenCalledWith('detachment-1', { description: 'Repair parts', amount: 50 });
            expect(onEntryAdded).toHaveBeenCalled();
        });
    });

    it('shows an error message when ledger submission fails', async () => {
        vi.spyOn(ledgerApi, 'createLedgerEntry').mockRejectedValue(new Error('Backend error'));
        const onEntryAdded = vi.fn();

        render(<LedgerEntryForm detachmentId="detachment-1" onEntryAdded={onEntryAdded} />);

        fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Repair parts' } });
        fireEvent.change(screen.getByLabelText(/support points/i), { target: { value: '50' } });
        fireEvent.click(screen.getByRole('button', { name: /commit transaction/i }));

        await waitFor(() => {
            expect(screen.getByText(/failed to add ledger entry/i)).toBeInTheDocument();
            expect(onEntryAdded).not.toHaveBeenCalled();
        });
    });
});
