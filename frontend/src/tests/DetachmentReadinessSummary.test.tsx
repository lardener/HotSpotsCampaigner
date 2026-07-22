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
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { DetachmentReadinessSummary } from '../components/DetachmentReadinessSummary'
import type { CombatUnit, Pilot } from '../types/generated'

describe('DetachmentReadinessSummary', () => {
  const units: CombatUnit[] = [
    { id: 'u1', type: 'BM', tonnage: 100, bv: 2000, pv: 30, asSize: 4 } as CombatUnit,
    { id: 'u2', type: 'BM', tonnage: 50, bv: 1000, pv: 15, asSize: 2 } as CombatUnit,
    { id: 'u3', type: 'CV', tonnage: 200, bv: 1500, pv: 25, asSize: 3 } as CombatUnit,
  ]

  const pilots: Pilot[] = [
    { id: 'p1', unitType: 'BM', gunnery: 4, piloting: 5, asSkill: 4, handicap: 0 } as Pilot,
    { id: 'p2', unitType: 'BM', gunnery: 3, piloting: 4, asSkill: 3, handicap: 12 } as Pilot,
    { id: 'p3', unitType: 'CV', gunnery: 2, piloting: 3, asSkill: 2, handicap: 28 } as Pilot,
  ]

  it('renders unit type summaries with aggregated totals', () => {
    render(<DetachmentReadinessSummary units={units} pilots={pilots} />)
    // BM: 2 units, 150 tons, 3000 bv, 45 pv, 6 sz
    expect(screen.getByText('BM')).toBeInTheDocument()
    expect(screen.getByText('CV')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument() // BM count
    expect(screen.getByText('150')).toBeInTheDocument() // BM tons
  })

  it('renders pilot spec summaries', () => {
    render(<DetachmentReadinessSummary units={units} pilots={pilots} />)
    expect(screen.getByText('BM')).toBeInTheDocument()
    expect(screen.getByText('CV')).toBeInTheDocument()
  })

  it('handles empty units and pilots', () => {
    const { container } = render(<DetachmentReadinessSummary units={[]} pilots={[]} />)
    expect(container).toBeTruthy()
  })

  it('handles units with missing type as UNKNOWN', () => {
    const unknownUnits: CombatUnit[] = [
      { id: 'u9', type: null, tonnage: 10, bv: 100, pv: 1, asSize: 1 } as CombatUnit,
    ]
    render(<DetachmentReadinessSummary units={unknownUnits} pilots={[]} />)
    expect(screen.getByText('UNKNOWN')).toBeTruthy()
  })

  it('respects compact mode without throwing', () => {
    const { container } = render(
      <DetachmentReadinessSummary units={units} pilots={pilots} compact={true} />,
    )
    expect(container).toBeTruthy()
  })
})
