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
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MarketDashboard } from '../components/MarketDashboard'
import type { Campaign } from '../types/generated'

// Mock MarketView to avoid Apollo dependency issues
vi.mock('../components/MarketView', () => ({
  MarketView: () => <div data-testid="mock-market-view">Market View Mock</div>,
}))

function makeCampaign(): Campaign {
  return {
    id: 'camp-1',
    primaryEmployer: 'DCMS',
    secondaryEmployer: 'ISF',
    participatingDetachments: [{ id: 'det-1', mercenaryCommandId: 'cmd-1', name: 'Alpha' } as any],
  } as Campaign
}

describe('MarketDashboard', () => {
  it('renders market tabs and the scrapper draw button', async () => {
    render(
      <MarketDashboard
        campaignId="camp-1"
        onClose={() => {}}
        campaign={makeCampaign()}
        setOverlay={() => {}}
      />,
    )
    expect(screen.getByText(/THEATER MARKET/i)).toBeInTheDocument()
    expect(screen.getByText(/FREE MARKET/i)).toBeInTheDocument()
    expect(screen.getByText(/DCMS/)).toBeInTheDocument()
    // Click on SCRAPPERS' YARD tab to reveal the draw button
    fireEvent.click(screen.getByRole('button', { name: /SCRAPPERS/i }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /DRAW FROM THE SCRAP HEAP/i })).toBeInTheDocument()
    })
  })

  it('switches active tab when clicked', async () => {
    render(
      <MarketDashboard
        campaignId="camp-1"
        onClose={() => {}}
        campaign={makeCampaign()}
        setOverlay={() => {}}
      />,
    )
    const primaryTab = screen.getByText(/DCMS/)
    fireEvent.click(primaryTab)
    await waitFor(() => {
      expect(primaryTab.className).toContain('theme-amber')
    })
  })

  it('calls onClose when close is triggered', () => {
    const onClose = vi.fn()
    render(
      <MarketDashboard
        campaignId="camp-1"
        onClose={onClose}
        campaign={makeCampaign()}
        setOverlay={() => {}}
      />,
    )
    // The TerminalOverlay cancel button renders with the default label "ABORT"
    const cancelBtn = screen.getByRole('button', { name: /ABORT/i })
    fireEvent.click(cancelBtn)
    expect(onClose).toHaveBeenCalled()
  })
})
