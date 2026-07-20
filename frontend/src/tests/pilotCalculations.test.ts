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
import { describe, it, expect } from 'vitest'
import { recalcDerived } from '../util/pilotCalculations'
import type { Pilot } from '../types/generated'

function makePilot(): Pilot {
  return {
    id: 'p1',
    gunnerySpEarned: 0,
    pilotingSpEarned: 0,
    edgeTokensSpEarned: 0,
    edgeAbilitySpEarned: 0,
  } as Pilot
}

describe('recalcDerived', () => {
  it('sums total SP from component allocations', () => {
    const p = makePilot()
    p.gunnerySpEarned = 300
    p.pilotingSpEarned = 100
    p.edgeTokensSpEarned = 60
    p.edgeAbilitySpEarned = 60
    recalcDerived(p)
    expect(p.totalSpEarned).toBe(520)
  })

  it('treats missing allocations as zero', () => {
    const p = makePilot()
    recalcDerived(p)
    expect(p.totalSpEarned).toBe(0)
    expect(p.gunnery).toBe(4) // lowest gunnery threshold
    expect(p.piloting).toBe(5) // lowest piloting threshold
  })

  it('maps SP to skill levels via thresholds', () => {
    const p = makePilot()
    p.gunnerySpEarned = 2200 // max gunnery
    p.pilotingSpEarned = 1200 // max piloting
    p.edgeTokensSpEarned = 1100 // max edge tokens
    p.edgeAbilitySpEarned = 900 // max edge ability
    recalcDerived(p)
    expect(p.gunnery).toBe(0)
    expect(p.piloting).toBe(1)
    expect(p.edgeTokensSkill).toBe(10)
    expect(p.edgeAbilitySkill).toBe(5)
  })

  it('computes asSkill as floor((gunnery + piloting) / 2)', () => {
    const p = makePilot()
    p.gunnerySpEarned = 300 // skill 3
    p.pilotingSpEarned = 100 // skill 4
    recalcDerived(p)
    expect(p.asSkill).toBe(Math.floor((3 + 4) / 2)) // 3
  })

  it('sums handicaps across all components', () => {
    const p = makePilot()
    p.gunnerySpEarned = 300 // handicap 12
    p.pilotingSpEarned = 100 // handicap 4
    p.edgeTokensSpEarned = 60 // handicap 2
    p.edgeAbilitySpEarned = 60 // handicap 2
    recalcDerived(p)
    expect(p.handicap).toBe(12 + 4 + 2 + 2)
  })

  it('returns the same mutated pilot instance', () => {
    const p = makePilot()
    const result = recalcDerived(p)
    expect(result).toBe(p)
  })
})
