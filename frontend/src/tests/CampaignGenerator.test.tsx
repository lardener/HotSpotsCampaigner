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
import { render, screen, waitFor } from '@testing-library/react'
import { ApolloClient, InMemoryCache } from '@apollo/client'
import { ApolloProvider } from '@apollo/client/react'
import { MockLink } from '@apollo/client/testing'
import { CampaignGenerator } from '../components/CampaignGenerator' // Correctly import the component
import {
  GetCampaignMetadataDocument as GET_METADATA,
  GenerateCampaignDocument as GENERATE_CAMPAIGN,
} from '../types/operations' // Import GraphQL operations
import { describe, it, expect } from 'vitest'

const metadataMock = {
  request: {
    query: GET_METADATA,
  },
  result: {
    data: {
      campaignMetadata: {
        missions: {
          primary: ['Raid'],
          opponent: ['Garrison'],
        },
        trackTypes: ['Assault'],
        factions: ['Davion'],
        employerTypes: ['Noble'],
        resolvedSteps: [
          {
            step: 1,
            values: {
              payRate: '100%',
              salvageRights: 'None',
              supportRights: 'None',
              transportation: '0%',
              commandRights: 'House',
            },
          },
        ],
      },
    },
  },
}

const previewMock = {
  request: {
    query: GENERATE_CAMPAIGN,
    variables: { input: {} },
  },
  result: {
    data: {
      publicPreviewCampaign: {
        campaign: { name: 'TEST PREVIEW', systemName: 'Terra', trackCount: 5 },
        contracts: [
          {
            employerCategory: 'Davion: Noble',
            missionType: 'Raid',
            primaryContract: true,
            payRate: 1.0,
            payStep: 1,
            salvageTerms: 'None',
            salvageStep: 1,
            supportTerms: 'None',
            supportStep: 1,
            transportTerms: '0%',
            transportStep: 1,
            commandRights: 'House',
            commandStep: 1,
            trackCount: 5,
          },
        ],
        tracks: ['Assault'],
      },
    },
  },
}

describe('CampaignGenerator Integration', () => {
  it('successfully fetches metadata and triggers initial preview', async () => {
    const client = new ApolloClient({
      link: new MockLink([metadataMock, previewMock]),
      cache: new InMemoryCache(),
    })

    render(
      <ApolloProvider client={client}>
        <CampaignGenerator />
      </ApolloProvider>,
    )

    // Verify it loads metadata
    await waitFor(() => {
      expect(screen.getByText(/DOBLESS INFORMATION SERVICE/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /GENERATE CONTRACT OFFERS/i })).toBeInTheDocument()
    })
  })
})
