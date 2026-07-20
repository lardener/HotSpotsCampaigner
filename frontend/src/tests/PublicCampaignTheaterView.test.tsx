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
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ApolloClient, InMemoryCache } from '@apollo/client'
import { ApolloProvider } from '@apollo/client/react'
import { MockLink } from '@apollo/client/testing'
import { PublicCampaignTheaterView } from '../components/PublicCampaignTheaterView'
import { GetCampaignDetailsDocument as GET_PUBLIC_CAMPAIGN_DETAILS } from '../types/operations'

const campaign = {
  id: 'camp-1',
  name: 'Draconis Reach',
  systemName: 'Luthien',
  description: 'A campaign in the Draconis Combine.',
  lengthInMonths: 12,
  trackCount: 5,
  status: 'ACTIVE',
  primaryEmployer: 'DCMS',
  secondaryEmployer: 'ISF',
  monthlyPay: 500,
  monthlyMaintenance: 500,
  transportationCost: 300,
  combatPay: 500,
  payRate: 1,
  payStep: 7,
  salvageTerms: 'Full',
  salvageStep: 7,
  supportTerms: 'Battle',
  supportStep: 7,
  transportationTerms: 'Full',
  transportationStep: 7,
  commandRights: 'House',
  commandStep: 7,
  tracks: [{ id: 't1', monthIndex: 3, trackName: 'Raid' }],
  participatingDetachments: [],
  contracts: [],
  units: [],
  pilots: [],
}

function renderView(onBack = vi.fn()) {
  const mocks = [
    {
      request: { query: GET_PUBLIC_CAMPAIGN_DETAILS, variables: { campaignId: 'camp-1' } },
      result: { data: { getCampaign: campaign } },
    },
  ]
  const client = new ApolloClient({
    link: new MockLink(mocks),
    cache: new InMemoryCache(),
  })
  render(
    <ApolloProvider client={client}>
      <PublicCampaignTheaterView campaignId="camp-1" onBack={onBack} />
    </ApolloProvider>,
  )
}

describe('PublicCampaignTheaterView', () => {
  it('shows loading state initially', () => {
    renderView()
    expect(screen.getByText(/ACCESSING THEATER DATA/i)).toBeTruthy()
  })

  it('renders campaign details after load', async () => {
    renderView()
    await waitFor(() => {
      expect(screen.getByText('Draconis Reach')).toBeTruthy()
    })
    expect(screen.getByText(/LUTHIEN/)).toBeTruthy()
  })

  it('calls onBack when return button clicked', async () => {
    const onBack = vi.fn()
    renderView(onBack)
    await waitFor(() => {
      expect(screen.getByText('Draconis Reach')).toBeTruthy()
    })
    fireEvent.click(screen.getByText(/RETURN/i))
    expect(onBack).toHaveBeenCalled()
  })

  it('shows not found when campaign missing', async () => {
    const mocks = [
      {
        request: { query: GET_PUBLIC_CAMPAIGN_DETAILS, variables: { campaignId: 'camp-1' } },
        result: { data: { getCampaign: null } },
      },
    ]
    const client = new ApolloClient({
      link: new MockLink(mocks),
      cache: new InMemoryCache(),
    })
    render(
      <ApolloProvider client={client}>
        <PublicCampaignTheaterView campaignId="camp-1" onBack={() => {}} />
      </ApolloProvider>,
    )
    await waitFor(() => {
      expect(screen.getByText(/THEATER NOT FOUND/i)).toBeTruthy()
    })
  })
})
