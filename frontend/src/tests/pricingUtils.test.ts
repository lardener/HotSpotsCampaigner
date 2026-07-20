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
    getTechTax,
    calculatePurchasePrice,
    calculateReconfigureCost,
} from '../util/pricingUtils'
import type { PublicCampaignMetadataWithRules } from '../types/helpers'

const metadata: PublicCampaignMetadataWithRules = {
    clanTechModifier: 2.0,
    mixedTechModifier: 1.5,
    omnimechReconfigureModifier: 0.5,
    pvPurchaseUnitMultiplier: 40,
} as PublicCampaignMetadataWithRules

describe('getTechTax', () => {
    it('returns 1.0 for Inner Sphere (default)', () => {
        expect(getTechTax('Inner Sphere')).toBe(1.0)
        expect(getTechTax('Unknown')).toBe(1.0)
    })

    it('returns 2.0 for Clan, with metadata override', () => {
        expect(getTechTax('Clan')).toBe(2.0)
        expect(getTechTax('Clan', metadata)).toBe(2.0)
    })

    it('returns 1.5 for Mixed, with metadata override', () => {
        expect(getTechTax('Mixed')).toBe(1.5)
        expect(getTechTax('Mixed', metadata)).toBe(1.5)
    })

    it('uses metadata defaults when not provided', () => {
        expect(getTechTax('Clan', { clanTechModifier: 3.0 } as PublicCampaignMetadataWithRules)).toBe(3.0)
        expect(getTechTax('Mixed', { mixedTechModifier: 2.5 } as PublicCampaignMetadataWithRules)).toBe(2.5)
    })
})

describe('calculatePurchasePrice', () => {
    it('returns override price when provided', () => {
        expect(calculatePurchasePrice(100, 10, 'Clan', 'Core', 999, metadata)).toBe(999)
    })

    it('Core rule uses BV * techTax', () => {
        expect(calculatePurchasePrice(100, 10, 'Inner Sphere', 'Core', undefined, metadata)).toBe(100)
        expect(calculatePurchasePrice(100, 10, 'Clan', 'Core', undefined, metadata)).toBe(200)
        expect(calculatePurchasePrice(100, 10, 'Mixed', 'Core', undefined, metadata)).toBe(150)
    })

    it('Alpha Strike rule uses PV * pvPurchaseUnitMultiplier', () => {
        expect(calculatePurchasePrice(100, 10, 'Clan', 'Alpha Strike', undefined, metadata)).toBe(400)
    })

    it('Alpha Strike falls back to default multiplier 40', () => {
        expect(calculatePurchasePrice(100, 5, 'Inner Sphere', 'Alpha Strike', undefined)).toBe(200)
    })
})

describe('calculateReconfigureCost', () => {
    it('returns 0 when mode is not edit', () => {
        expect(
            calculateReconfigureCost('create', null, 50, 5, 60, 4, 'Clan', 'd1', 'Core', metadata),
        ).toBe(0)
    })

    it('returns 0 when unit is null', () => {
        expect(
            calculateReconfigureCost('edit', null, 50, 5, 60, 4, 'Clan', 'd1', 'Core', metadata),
        ).toBe(0)
    })

    it('returns 0 when detachmentId is null', () => {
        expect(
            calculateReconfigureCost('edit', { id: 'u1', bv: 50 } as any, 50, 5, 60, 4, 'Clan', null, 'Core', metadata),
        ).toBe(0)
    })

    it('returns 0 when BV and PV unchanged', () => {
        const unit = { id: 'u1', bv: 50, pv: 5 } as any
        expect(
            calculateReconfigureCost('edit', unit, 50, 5, 60, 4, 'Clan', 'd1', 'Core', metadata),
        ).toBe(0)
    })

    it('Core rule uses tonnage * modifier * techTax', () => {
        const unit = { id: 'u1', bv: 50, pv: 5 } as any
        // basis = tonnage 60, modifier 0.5, techTax 2.0 => 60
        expect(
            calculateReconfigureCost('edit', unit, 99, 99, 60, 4, 'Clan', 'd1', 'Core', metadata),
        ).toBe(60)
    })

    it('Alpha Strike rule uses asSize*20 * modifier * techTax', () => {
        const unit = { id: 'u1', bv: 50, pv: 5 } as any
        // basis = asSize 4 * 20 = 80, modifier 0.5, techTax 1.5 => 60
        expect(
            calculateReconfigureCost('edit', unit, 99, 99, 60, 4, 'Mixed', 'd1', 'Alpha Strike', metadata),
        ).toBe(60)
    })
})
