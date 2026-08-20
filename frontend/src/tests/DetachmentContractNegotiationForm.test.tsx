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
import { DetachmentContractNegotiationForm } from '../components/DetachmentContractNegotiationForm'
import { GetCampaignMetadataDocument } from '../types/operations'
import { GET_DETACHMENT_CONTRACT_NEGOTIATIONS } from '../gql/operations/detachmentContract'
import { describe, it, expect } from 'vitest'
import { Maybe } from '../types/generated'

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
              transportation: '100%',
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
        unitStatuses: ['Operational', 'Under Repair', 'Decommissioned'] as Array<Maybe<string>>,
        unitTypes: ['BM', 'CV', 'PM', 'IM', 'BA', 'CI'] as Array<Maybe<string>>,
        techBases: ['Inner Sphere', 'Clan', 'Freebirth'] as Array<Maybe<string>>,
      },
    },
  },
}

const negotiationsMock = {
  request: {
    query: GET_DETACHMENT_CONTRACT_NEGOTIATIONS,
    variables: { campaignId: 'c1' },
  },
  result: {
    data: {
      getDetachmentContractNegotiations: [],
    },
  },
}

describe('DetachmentContractNegotiationForm', () => {
  it('renders form and displays resulting terms when step adjustment changes', async () => {
    const client = new ApolloClient({
      link: new MockLink([metadataMock, negotiationsMock]),
      cache: new InMemoryCache(),
    })

    render(
      <ApolloProvider client={client}>
        <DetachmentContractNegotiationForm
          campaignId="c1"
          detachmentId="d1"
          employerFactionId="f1"
          employerFactionName="House Davion"
          baselineSupportStep={11}
        />
      </ApolloProvider>,
    )

    // Verify title and baseline support step display
    await waitFor(() => {
      expect(screen.getByText(/DETACHMENT CONTRACT NEGOTIATIONS/i)).toBeInTheDocument()
      expect(screen.getByText(/Baseline: Step 11/i)).toBeInTheDocument()
    })

    // Find Support Step Adjustment dropdown
    const supportSelect = screen.getByTitle('Support Step Adjustment') as HTMLSelectElement
    expect(supportSelect).toBeInTheDocument()

    // Change support step adjustment by -2 (from step 11 to step 9)
    fireEvent.change(supportSelect, { target: { value: '-2' } })

    // Verify resulting support step (Step 9) and resulting terms (Battle/10%) are rendered
    await waitFor(() => {
      expect(screen.getByText(/Result: Step 9 \(Battle\/10%\)/i)).toBeInTheDocument()
    })
  })
})
