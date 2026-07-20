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
import {
    getActiveThreshold,
    gunneryThresholds,
    pilotingThresholds,
    edgeTokensThresholds,
    edgeAbilityThresholds,
} from '../constants/pilotThresholds'

describe('getActiveThreshold', () => {
    it('returns the first (lowest) threshold when alloc is below all', () => {
        expect(getActiveThreshold(gunneryThresholds, -100)).toBe(gunneryThresholds[0])
    })

    it('returns the highest threshold when alloc exceeds all', () => {
        const last = gunneryThresholds[gunneryThresholds.length - 1]
        expect(getActiveThreshold(gunneryThresholds, 99999)).toBe(last)
    })

    it('selects the correct threshold at a boundary', () => {
        // gunnery: sp 700 -> skill 2
        expect(getActiveThreshold(gunneryThresholds, 700).skill).toBe(2)
        // just below boundary falls to previous level
        expect(getActiveThreshold(gunneryThresholds, 699).skill).toBe(3)
    })

    it('returns the matching entry for an exact mid allocation', () => {
        expect(getActiveThreshold(pilotingThresholds, 200).skill).toBe(3)
        expect(getActiveThreshold(edgeTokensThresholds, 420).skill).toBe(6)
        expect(getActiveThreshold(edgeAbilityThresholds, 360).skill).toBe(3)
    })
})

describe('threshold tables', () => {
    it('gunnery thresholds are ordered and well-formed', () => {
        expect(gunneryThresholds.length).toBe(5)
        expect(gunneryThresholds[0]).toEqual({ sp: 0, skill: 4, handicap: 0 })
        expect(gunneryThresholds[4]).toEqual({ sp: 2200, skill: 0, handicap: 88 })
    })

    it('piloting thresholds are ordered and well-formed', () => {
        expect(pilotingThresholds.length).toBe(5)
        expect(pilotingThresholds[0]).toEqual({ sp: 0, skill: 5, handicap: 0 })
        expect(pilotingThresholds[4]).toEqual({ sp: 1200, skill: 1, handicap: 48 })
    })

    it('edge tokens thresholds span 10 levels', () => {
        expect(edgeTokensThresholds.length).toBe(10)
        expect(edgeTokensThresholds[9]).toEqual({ sp: 1100, skill: 10, handicap: 44 })
    })

    it('edge ability thresholds span 6 levels', () => {
        expect(edgeAbilityThresholds.length).toBe(6)
        expect(edgeAbilityThresholds[5]).toEqual({ sp: 900, skill: 5, handicap: 36 })
    })
})
