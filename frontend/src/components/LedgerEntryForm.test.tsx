import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { MockLink } from '@apollo/client/testing';
import { LedgerEntryForm, ADD_LEDGER_ENTRY } from './LedgerEntryForm';

describe('LedgerEntryForm', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('submits a ledger entry successfully', async () => {
        const onEntryAdded = vi.fn();
        const mocks = [
            {
                request: {
                    query: ADD_LEDGER_ENTRY,
                    variables: { commandId: 'command-1', detachmentId: 'detachment-1', amount: 50, description: 'Repair parts', coverAmount: null, paidAmount: null, reputationChange: null },
                },
                result: {
                    data: { addLedgerEntry: { id: 'entry-123' } },
                },
            },
        ];

        const client = new ApolloClient({
            link: new MockLink(mocks),
            cache: new InMemoryCache(),
        });

        render(
            <ApolloProvider client={client}>
                <LedgerEntryForm commandId="command-1" detachmentId="detachment-1" onEntryAdded={onEntryAdded} />
            </ApolloProvider>
        );

        fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Repair parts' } });
        fireEvent.change(screen.getByLabelText(/support points/i), { target: { value: '50' } });
        fireEvent.change(screen.getByLabelText(/cover \(sp\)/i), { target: { value: '' } });
        fireEvent.change(screen.getByLabelText(/paid \(sp\)/i), { target: { value: '' } });
        fireEvent.change(screen.getByLabelText(/reputation change/i), { target: { value: '' } });
        fireEvent.click(screen.getByRole('button', { name: /commit transaction/i }));

        await waitFor(() => {
            expect(onEntryAdded).toHaveBeenCalled();
        });
    });

    it('shows an error message when ledger submission fails', async () => {
        const onEntryAdded = vi.fn();
        const mocks = [
            {
                request: {
                    query: ADD_LEDGER_ENTRY, // Assuming the mutation variables will be updated in the test
                    variables: { commandId: 'command-1', detachmentId: 'detachment-1', amount: 50, description: 'Repair parts', coverAmount: null, paidAmount: null, reputationChange: null },
                },
                error: new Error('GraphQL error'),
            },
        ];

        const client = new ApolloClient({
            link: new MockLink(mocks),
            cache: new InMemoryCache(),
        });

        render(
            <ApolloProvider client={client}>
                <LedgerEntryForm commandId="command-1" detachmentId="detachment-1" onEntryAdded={onEntryAdded} />
            </ApolloProvider>
        );

        fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Repair parts' } });
        fireEvent.change(screen.getByLabelText(/support points/i), { target: { value: '50' } });
        fireEvent.change(screen.getByLabelText(/cover \(sp\)/i), { target: { value: '' } });
        fireEvent.change(screen.getByLabelText(/paid \(sp\)/i), { target: { value: '' } });
        fireEvent.change(screen.getByLabelText(/reputation change/i), { target: { value: '' } });
        fireEvent.click(screen.getByRole('button', { name: /commit transaction/i }));

        await waitFor(() => {
            expect(screen.getByText(/failed to add ledger entry/i)).toBeInTheDocument();
            expect(onEntryAdded).not.toHaveBeenCalled();
        });
    });
});
