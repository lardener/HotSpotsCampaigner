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
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { ApolloClient, InMemoryCache } from '@apollo/client'
import { ApolloProvider } from '@apollo/client/react'
import { MockLink } from '@apollo/client/testing'
import { describe, it, expect } from 'vitest'
import { MonthlyExpensesEditor } from '../components/MonthlyExpensesEditor'
import { GetCampaignMetadataDocument } from '../types/operations'
import { GET_DETACHMENT_CONTRACT_NEGOTIATIONS } from '../gql/operations/detachmentContract'

const metadataMock = {
  request: {
    query: GetCampaignMetadataDocument,
  },
  result: {
    data: {
      publicCampaignMetadata: {
        missions: { primary: ['Raid'], opponent: ['Garrison'] },
        trackTypes: ['Assault'],
        factions: ['Davion'],
        employerTypes: ['Noble'],
        resolvedSteps: [
          {
            step: 9,
            values: {
              payRate: '120%',
              salvageRights: '60%',
              supportRights: 'Battle/10%',
              transportation: '50%',
              commandRights: 'Liaison',
            },
          },
          {
            step: 11,
            values: {
              payRate: '140%',
              salvageRights: '80%',
              supportRights: 'Battle/30%',
              transportation: '100%',
              commandRights: 'Independent',
            },
          },
        ],
      },
    },
  },
}

const negotiationsMock = {
  request: {
    query: GET_DETACHMENT_CONTRACT_NEGOTIATIONS,
    variables: { campaignId: 'campaign-1' },
  },
  result: {
    data: {
      getDetachmentContractNegotiations: [],
    },
  },
}

describe('MonthlyExpensesEditor', () => {
  it('recomputes monthly expenses amount and description when contract selection changes', async () => {
    const client = new ApolloClient({
      link: new MockLink([metadataMock, negotiationsMock]),
      cache: new InMemoryCache(),
    })

    const campaignDetails = {
      id: 'campaign-1',
      name: 'Winter Campaign',
      monthlyPay: 1000,
      monthlyMaintenance: 100,
      transportationCost: 200,
      contracts: [
        {
          id: 'contract-primary',
          primaryContract: true,
          employerCategory: 'Noble',
          payStep: 9,
          salvageStep: 9,
          supportStep: 9,
          transportStep: 9,
          commandStep: 9,
        },
        {
          id: 'contract-opposition',
          primaryContract: false,
          employerCategory: 'Mercantile',
          payStep: 11,
          salvageStep: 11,
          supportStep: 11,
          transportStep: 11,
          commandStep: 11,
        },
      ],
    }

    const detachments = [
      {
        id: 'det-1',
        name: 'Alpha Lance',
        mercenaryCommandId: 'cmd-1',
      },
    ]

    render(
      <ApolloProvider client={client}>
        <MonthlyExpensesEditor
          campaignDetails={campaignDetails as any}
          detachments={detachments as any}
          currentMonthIndex={2}
          onClose={() => {}}
          onLedgerEntryAdded={() => {}}
        />
      </ApolloProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText(/MONTHLY EXPENSES: Winter Campaign/i)).toBeInTheDocument()
    })

    const amountInput = screen.getByTitle('Amount in Support Points') as HTMLInputElement
    const descriptionInput = screen.getByTitle('Transaction description') as HTMLInputElement
    const contractSelect = screen.getByTitle('Select contract terms') as HTMLSelectElement

    await waitFor(() => {
      expect(amountInput.value).toBe('1100')
      expect(descriptionInput.value).toContain('PAY: 120%')
    })

    fireEvent.change(contractSelect, { target: { value: 'contract-opposition' } })

    await waitFor(() => {
      expect(amountInput.value).toBe('1300')
      expect(descriptionInput.value).toContain('PAY: 140%')
    })
  })

  it('recomputes transport amount when switching from primary to opposition contract', async () => {
    const client = new ApolloClient({
      link: new MockLink([metadataMock, negotiationsMock]),
      cache: new InMemoryCache(),
    })

    const campaignDetails = {
      id: 'campaign-1',
      name: 'Winter Campaign',
      monthlyPay: 1000,
      monthlyMaintenance: 100,
      transportationCost: 200,
      contracts: [
        {
          id: 'contract-primary',
          primaryContract: true,
          employerCategory: 'Noble',
          payStep: 9,
          salvageStep: 9,
          supportStep: 9,
          transportStep: 9,
          commandStep: 9,
        },
        {
          id: 'contract-opposition',
          primaryContract: false,
          employerCategory: 'Mercantile',
          payStep: 11,
          salvageStep: 11,
          supportStep: 11,
          transportStep: 11,
          commandStep: 11,
        },
      ],
    }

    const detachments = [
      {
        id: 'det-1',
        name: 'Alpha Lance',
        mercenaryCommandId: 'cmd-1',
      },
    ]

    render(
      <ApolloProvider client={client}>
        <MonthlyExpensesEditor
          campaignDetails={campaignDetails as any}
          detachments={detachments as any}
          currentMonthIndex={2}
          onClose={() => {}}
          onLedgerEntryAdded={() => {}}
        />
      </ApolloProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText(/MONTHLY EXPENSES: Winter Campaign/i)).toBeInTheDocument()
    })

    const contractSelect = screen.getByTitle('Select contract terms') as HTMLSelectElement
    const chargeTypeSelect = screen.getByTitle('Select charge type') as HTMLSelectElement
    const amountInput = screen.getByTitle('Amount in Support Points') as HTMLInputElement

    fireEvent.change(chargeTypeSelect, { target: { value: 'Transport' } })

    await waitFor(() => {
      expect(amountInput.value).toBe('-100')
    })

    fireEvent.change(contractSelect, { target: { value: 'contract-opposition' } })

    await waitFor(() => {
      expect(amountInput.value).toBe('0')
    })
  })
})
