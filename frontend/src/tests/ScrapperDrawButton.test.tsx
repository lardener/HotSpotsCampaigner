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
import { render, screen, fireEvent } from '@testing-library/react'
import { ScrapperDrawButton } from '../components/ScrapperDrawButton'
import type { Campaign } from '../types/generated'

function makeCampaign(): Campaign {
  return {
    id: 'camp-1',
    participatingDetachments: [{ id: 'det-1', mercenaryCommandId: 'cmd-1', name: 'Alpha' } as any],
  } as Campaign
}

describe('ScrapperDrawButton', () => {
  it('renders the draw button with fee label', () => {
    render(
      <ScrapperDrawButton campaignId="camp-1" campaign={makeCampaign()} setOverlay={() => {}} />,
    )
    expect(screen.getByText(/DRAW FROM THE SCRAP HEAP/i)).toBeTruthy()
    expect(screen.getByText(/50,000 C-BILLS/i)).toBeTruthy()
  })

  it('opens the scrap heap draw overlay on click', () => {
    const setOverlay = vi.fn()
    render(
      <ScrapperDrawButton campaignId="camp-1" campaign={makeCampaign()} setOverlay={setOverlay} />,
    )
    fireEvent.click(screen.getByText(/DRAW FROM THE SCRAP HEAP/i))
    expect(setOverlay).toHaveBeenCalledWith(expect.objectContaining({ title: 'SCRAP HEAP DRAW' }))
  })
})
