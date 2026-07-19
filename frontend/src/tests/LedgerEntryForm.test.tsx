/*
 * HotSpots Campaigner - Battletech Mercenaries campaign management SaaS.
 * Copyright (C) 2026 Jose Ferrer
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ApolloClient, InMemoryCache } from '@apollo/client'
import { ApolloProvider } from '@apollo/client/react'
import { MockLink } from '@apollo/client/testing' // This was already correct
import { LedgerEntryForm } from '../components/LedgerEntryForm'
import { AddLedgerEntryDocument as ADD_LEDGER_ENTRY } from '../types/operations'

describe('LedgerEntryForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('submits a ledger entry successfully', async () => {
    const onEntryAdded = vi.fn()
    const mocks = [
      {
        request: {
          query: ADD_LEDGER_ENTRY,
          variables: {
            commandId: 'command-1',
            detachmentId: 'detachment-1',
            input: {
              amount: 50,
              description: 'Repair parts',
            },
          },
        },
        result: {
          data: { addLedgerEntry: { id: 'entry-123' } },
        },
      },
    ]

    const client = new ApolloClient({
      link: new MockLink(mocks),
      cache: new InMemoryCache(),
    })

    render(
      <ApolloProvider client={client}>
        <LedgerEntryForm
          commandId="command-1"
          detachmentId="detachment-1"
          onEntryAdded={onEntryAdded}
        />
      </ApolloProvider>,
    )

    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Repair parts' } }) // Added title to input
    fireEvent.change(screen.getByLabelText(/support points/i), { target: { value: '50' } }) // Updated to match UI label
    fireEvent.change(screen.getByLabelText(/reputation/i), { target: { value: '' } }) // Updated to match UI label
    fireEvent.click(screen.getByRole('button', { name: /commit transaction/i }))

    await waitFor(() => {
      expect(onEntryAdded).toHaveBeenCalled()
    })
  })

  it('shows an error message when ledger submission fails', async () => {
    const onEntryAdded = vi.fn()
    const mocks = [
      {
        request: {
          query: ADD_LEDGER_ENTRY, // Assuming the mutation variables will be updated in the test
          variables: {
            commandId: 'command-1',
            detachmentId: 'detachment-1',
            input: {
              amount: 50,
              description: 'Repair parts',
            },
          },
        },
        error: new Error('GraphQL error'),
      },
    ]

    const client = new ApolloClient({
      link: new MockLink(mocks),
      cache: new InMemoryCache(),
    })

    render(
      <ApolloProvider client={client}>
        <LedgerEntryForm
          commandId="command-1"
          detachmentId="detachment-1"
          onEntryAdded={onEntryAdded}
        />
      </ApolloProvider>,
    )

    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Repair parts' } }) // Added title to input
    fireEvent.change(screen.getByLabelText(/support points/i), { target: { value: '50' } }) // Updated to match UI label
    fireEvent.change(screen.getByLabelText(/reputation/i), { target: { value: '' } }) // Updated to match UI label
    fireEvent.click(screen.getByRole('button', { name: /commit transaction/i }))

    await waitFor(() => {
      expect(screen.getByText(/failed to add ledger entry/i)).toBeInTheDocument()
      expect(onEntryAdded).not.toHaveBeenCalled()
    })
  })
})
