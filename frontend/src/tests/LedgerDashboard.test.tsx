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
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ApolloClient, InMemoryCache } from '@apollo/client'
import { ApolloProvider } from '@apollo/client/react'
import { MockLink } from '@apollo/client/testing'
import { LedgerDashboard } from '../components/LedgerDashboard'
import { GetLedgerDataDocument as GET_LEDGER_DATA } from '../types/operations'

const command = {
  id: 'cmd-1',
  name: "Wolf's Dragoons",
  totalSupportPoints: 3000,
  detachments: [
    { id: 'det-1', name: 'Alpha Lance', campaignId: 'camp-1', campaignName: 'Draconis Reach' },
    { id: 'det-2', name: 'Beta Lance', campaignId: 'camp-2', campaignName: 'Federated Suns' },
  ],
}

function renderDashboard(detachmentId?: string) {
  const mocks = [
    {
      request: { query: GET_LEDGER_DATA, variables: { commandId: 'cmd-1' } },
      result: { data: { getCommand: command } },
    },
  ]
  const client = new ApolloClient({
    link: new MockLink(mocks),
    cache: new InMemoryCache(),
  })
  render(
    <ApolloProvider client={client}>
      <LedgerDashboard commandId="cmd-1" detachmentId={detachmentId} />
    </ApolloProvider>,
  )
}

describe('LedgerDashboard', () => {
  it('shows loading state initially', () => {
    renderDashboard()
    expect(screen.getByText(/ACCESSING SECURE LEDGER/i)).toBeTruthy()
  })

  it('renders ledger with detachment selector', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText(/WARCHEST LEDGER/i)).toBeTruthy()
    })
    const select = screen.getByLabelText(/SELECT ACTIVE DETACHMENT/i) as HTMLSelectElement
    expect(select).toBeTruthy()
    expect(screen.getByText('Alpha Lance')).toBeTruthy()
    expect(screen.getByText('Beta Lance')).toBeTruthy()
  })

  it('prioritizes detachmentId prop when provided', async () => {
    renderDashboard('det-2')
    await waitFor(() => {
      expect(screen.getByText(/WARCHEST LEDGER/i)).toBeTruthy()
    })
    const select = screen.getByLabelText(/SELECT ACTIVE DETACHMENT/i) as HTMLSelectElement
    expect(select.value).toBe('det-2')
  })
})
