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
    // BM and CV appear in both unit types and pilot specs tables
    const bmElements = screen.getAllByText('BM')
    expect(bmElements.length).toBe(2) // BM in both tables
    const cvElements = screen.getAllByText('CV')
    expect(cvElements.length).toBe(2) // CV in both tables
    // Qty 2 appears in both tables (BM count and CV count)
    const qtyElements = screen.getAllByText('2')
    expect(qtyElements.length).toBe(2)
    expect(screen.getByText('150')).toBeInTheDocument() // BM tons
    expect(screen.getByText('3000')).toBeInTheDocument() // BM BV
    expect(screen.getByText('45')).toBeInTheDocument() // BM PV
    expect(screen.getByText('350')).toBeInTheDocument() // Total tons
    expect(screen.getByText('4500')).toBeInTheDocument() // Total BV
    expect(screen.getByText('70')).toBeInTheDocument() // Total PV
  })

  it('renders pilot spec summaries', () => {
    render(<DetachmentReadinessSummary units={units} pilots={pilots} />)
    // BM and CV appear in both tables
    const bmElements = screen.getAllByText('BM')
    expect(bmElements.length).toBe(2)
    const cvElements = screen.getAllByText('CV')
    expect(cvElements.length).toBe(2)
    // AS values are averaged and rendered as separate text nodes, use regex
    expect(screen.getByText(/3\.5/)).toBeInTheDocument() // BM avg AS
    expect(screen.getByText(/2\.0/)).toBeInTheDocument() // CV avg AS
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
