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
import { ActiveCampaignsList } from '../components/ActiveCampaignsList'
import { GetActiveCampaignsDocument as GET_ACTIVE_CAMPAIGNS } from '../types/operations'

const campaigns = [
  {
    id: 'c1',
    name: 'Draconis Reach',
    systemName: 'Luthien',
    status: 'ACTIVE',
    trackCount: 5,
    primaryEmployer: 'DCMS',
    secondaryEmployer: 'ISF',
  },
  {
    id: 'c2',
    name: 'Federated Suns Op',
    systemName: 'New Avalon',
    status: 'ACTIVE',
    trackCount: 3,
    primaryEmployer: 'AFFS',
    secondaryEmployer: null,
  },
]

function renderList() {
  const mocks = [
    {
      request: { query: GET_ACTIVE_CAMPAIGNS, variables: { page: 0, size: 10 } },
      result: { data: { publicActiveCampaigns: campaigns } },
    },
  ]
  const client = new ApolloClient({
    link: new MockLink(mocks),
    cache: new InMemoryCache(),
  })
  render(
    <ApolloProvider client={client}>
      <ActiveCampaignsList onSelectCampaign={() => {}} />
    </ApolloProvider>,
  )
}

describe('ActiveCampaignsList', () => {
  it('shows loading state initially', () => {
    const mocks = [
      {
        request: { query: GET_ACTIVE_CAMPAIGNS, variables: { page: 0, size: 10 } },
        result: { data: { publicActiveCampaigns: campaigns } },
      },
    ]
    const client = new ApolloClient({
      link: new MockLink(mocks),
      cache: new InMemoryCache(),
    })
    render(
      <ApolloProvider client={client}>
        <ActiveCampaignsList onSelectCampaign={() => {}} />
      </ApolloProvider>,
    )
    expect(screen.getByText(/DECRYPTING THEATER INTEL/i)).toBeTruthy()
  })

  it('renders campaigns after load', async () => {
    renderList()
    await waitFor(() => {
      expect(screen.getByText('Draconis Reach')).toBeTruthy()
    })
    expect(screen.getByText('Federated Suns Op')).toBeTruthy()
  })

  it('filters campaigns by search term (name)', async () => {
    renderList()
    await waitFor(() => {
      expect(screen.getByText('Draconis Reach')).toBeTruthy()
    })
    const search = screen.getByPlaceholderText(/search/i) as HTMLInputElement
    fireEvent.change(search, { target: { value: 'Federated' } })
    await waitFor(() => {
      expect(screen.queryByText('Draconis Reach')).toBeNull()
    })
    expect(screen.getByText('Federated Suns Op')).toBeTruthy()
  })

  it('filters campaigns by system name', async () => {
    renderList()
    await waitFor(() => {
      expect(screen.getByText('Draconis Reach')).toBeTruthy()
    })
    const search = screen.getByPlaceholderText(/search/i) as HTMLInputElement
    fireEvent.change(search, { target: { value: 'Luthien' } })
    await waitFor(() => {
      expect(screen.queryByText('Federated Suns Op')).toBeNull()
    })
    expect(screen.getByText('Draconis Reach')).toBeTruthy()
  })

  it('calls onSelectCampaign when a campaign is clicked', async () => {
    const onSelect = vi.fn()
    const mocks = [
      {
        request: { query: GET_ACTIVE_CAMPAIGNS, variables: { page: 0, size: 10 } },
        result: { data: { publicActiveCampaigns: campaigns } },
      },
    ]
    const client = new ApolloClient({
      link: new MockLink(mocks),
      cache: new InMemoryCache(),
    })
    render(
      <ApolloProvider client={client}>
        <ActiveCampaignsList onSelectCampaign={onSelect} />
      </ApolloProvider>,
    )
    await waitFor(() => {
      expect(screen.getByText('Draconis Reach')).toBeTruthy()
    })
    fireEvent.click(screen.getByText('Draconis Reach'))
    expect(onSelect).toHaveBeenCalledWith('c1')
  })
})
