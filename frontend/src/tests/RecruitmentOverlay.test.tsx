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
import { MockLink } from '@apollo/client/testing'
import { RecruitmentOverlay } from '../components/RecruitmentOverlay'
import {
    CreateInviteDocument as CREATE_INVITE,
    DeleteInviteDocument as DELETE_INVITE,
} from '../types/operations'
import type { CampaignInvite } from '../types/generated'

beforeEach(() => {
    vi.restoreAllMocks()
    Object.assign(navigator, {
        clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
})

function renderOverlay(invites: CampaignInvite[] = []) {
    const mocks = [
        {
            request: {
                query: CREATE_INVITE,
                variables: { campaignId: 'camp-1', recipientName: 'John' },
            },
            result: { data: { createInvite: { id: 'inv-1', token: 'TOKEN-123', recipientName: 'John' } } },
        },
        {
            request: { query: DELETE_INVITE, variables: { id: 'inv-1' } },
            result: { data: { deleteInvite: true } },
        },
    ]
    const client = new ApolloClient({
        link: new MockLink(mocks),
        cache: new InMemoryCache(),
    })
    render(
        <ApolloProvider client={client}>
            <RecruitmentOverlay
                campaignId="camp-1"
                invites={invites}
                onClose={() => { }}
                onRefresh={() => { }}
            />
        </ApolloProvider>,
    )
}

describe('RecruitmentOverlay', () => {
    it('renders the recruitment protocol title', () => {
        renderOverlay()
        expect(screen.getByText(/RECRUITMENT PROTOCOL/i)).toBeTruthy()
    })

    it('shows existing invites', () => {
        const invites: CampaignInvite[] = [
            { id: 'inv-1', token: 'TOKEN-123', recipientName: 'John', campaignId: 'camp-1' } as CampaignInvite,
        ]
        renderOverlay(invites)
        expect(screen.getByText(/TOKEN-123/)).toBeTruthy()
    })

    it('generates an invite when recipient name is entered', async () => {
        renderOverlay()
        fireEvent.click(screen.getByText(/GENERATE NEW INVITE KEY/i))
        const input = screen.getByPlaceholderText(/RECIPIENT NAME/i) as HTMLInputElement
        fireEvent.change(input, { target: { value: 'John' } })
        fireEvent.click(screen.getByText(/\[ CONFIRM \]/))
        await waitFor(() => {
            expect(screen.getByText(/TOKEN-123/)).toBeTruthy()
        })
    })

    it('does not generate invite with empty recipient name', async () => {
        renderOverlay()
        fireEvent.click(screen.getByText(/GENERATE NEW INVITE KEY/i))
        const input = screen.getByPlaceholderText(/RECIPIENT NAME/i) as HTMLInputElement
        fireEvent.change(input, { target: { value: '   ' } })
        fireEvent.click(screen.getByText(/\[ CONFIRM \]/))
        await waitFor(() => {
            expect(screen.queryByText(/TOKEN-123/)).toBeNull()
        })
    })
})
