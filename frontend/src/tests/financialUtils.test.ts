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
    calculatePilotFinancials,
    calculateAwardFinancials,
    calculateUnitFinancials,
} from '../util/financialUtils'
import type { CampaignDetail, UnitStatus } from '../types/helpers'
import type { CombatUnit } from '../types/generated'

describe('calculatePilotFinancials', () => {
    it('BATTLE support => zero mercenary cost', () => {
        const r = calculatePilotFinancials(
            { healed: 3 },
            { support: { type: 'BATTLE', pct: 1 } },
            30,
            'Core',
        )
        expect(r.rawMedicalCost).toBe(90)
        expect(r.mercenaryCost).toBe(0)
        expect(r.mercenaryCostSigned).toBe(0)
        expect(r.supportType).toBe('BATTLE')
    })

    it('STRAIGHT support => discounted mercenary cost', () => {
        const r = calculatePilotFinancials(
            { healed: 3 },
            { support: { type: 'STRAIGHT', pct: 0.5 } },
            30,
            'Core',
        )
        expect(r.rawMedicalCost).toBe(90)
        expect(r.mercenaryCost).toBe(45) // 90 * (1 - 0.5)
        expect(r.mercenaryCostSigned).toBe(-45)
    })

    it('NONE support => full mercenary cost', () => {
        const r = calculatePilotFinancials(
            { healed: 2 },
            { support: { type: 'NONE', pct: 0 } },
            30,
            'Core',
        )
        expect(r.mercenaryCost).toBe(60)
    })

    it('Alpha Strike caps healed at 1', () => {
        const r = calculatePilotFinancials(
            { healed: 5 },
            { support: { type: 'NONE', pct: 0 } },
            30,
            'Alpha Strike',
        )
        expect(r.rawMedicalCost).toBe(30)
        expect(r.healed).toBe(5) // original count preserved in output
    })
})

describe('calculateAwardFinancials', () => {
    const campaign: CampaignDetail = { combatPay: 100 } as CampaignDetail

    it('computes pay award from combat pay, multiplier and level', () => {
        const r = calculateAwardFinancials(campaign, {
            salvageValue: 200,
            customAward: 50,
            outcomeMultiplier: 2,
            selectedLevel: 3,
            salvageCoverage: 0.5,
            payRate: 1,
        } as any)
        expect(r.payAward).toBe(600) // 100 * 2 * 3
        expect(r.salvageAward).toBe(100) // 200 * 0.5
        expect(r.total).toBe(750) // 600 + 100 + 50
    })

    it('handles string numeric inputs via parseNumericInput', () => {
        const r = calculateAwardFinancials(campaign, {
            salvageValue: '200',
            customAward: '50',
            outcomeMultiplier: 1,
            selectedLevel: 1,
            salvageCoverage: 0,
            payRate: 1,
        } as any)
        expect(r.salvageAward).toBe(0)
        expect(r.total).toBe(150) // pay 100 + custom 50
    })

    it('defaults missing multipliers/levels to 1', () => {
        const r = calculateAwardFinancials(campaign, {
            salvageValue: 0,
            customAward: 0,
            salvageCoverage: 0,
            payRate: 1,
        } as any)
        expect(r.payAward).toBe(100)
    })
})

describe('calculateUnitFinancials', () => {
    const statuses: UnitStatus[] = [
        'OPERATIONAL',
        'ARMOR DAMAGE',
        'INTERNAL DAMAGE',
        'CRIPPLED',
        'DESTROYED',
        'TRULY DESTROYED',
    ]

    it('operational unit has zero repair cost', () => {
        const unit = { tonnage: 50, bv: 100, type: 'BM', techBase: 'Inner Sphere' } as CombatUnit
        const r = calculateUnitFinancials(unit, 'OPERATIONAL', {} as any, statuses, 'Core')
        expect(r.baseRepairCost).toBe(0)
        expect(r.isTrulyDestroyed).toBe(false)
    })

    it('armor damage uses armor multiplier', () => {
        const unit = { tonnage: 50, bv: 100, type: 'BM', techBase: 'Inner Sphere' } as CombatUnit
        const r = calculateUnitFinancials(unit, 'ARMOR DAMAGE', {} as any, statuses, 'Core')
        expect(r.damageMultiplier).toBe(0.5)
        expect(r.baseRepairCost).toBe(25) // 50 * 0.5
    })

    it('non-mech types get the non-mech modifier', () => {
        const unit = { tonnage: 50, bv: 100, type: 'CV', techBase: 'Inner Sphere' } as CombatUnit
        const r = calculateUnitFinancials(unit, 'ARMOR DAMAGE', {} as any, statuses, 'Core')
        expect(r.unitModifier).toBe(0.5)
        expect(r.baseRepairCost).toBe(12.5) // 50 * 0.5 * 0.5
    })

    it('clan tech applies clan tax', () => {
        const unit = { tonnage: 50, bv: 100, type: 'BM', techBase: 'Clan' } as CombatUnit
        const r = calculateUnitFinancials(unit, 'ARMOR DAMAGE', {} as any, statuses, 'Core')
        expect(r.techTax).toBe(2.0)
        expect(r.baseRepairCost).toBe(50) // 50 * 0.5 * 2.0
    })

    it('truly destroyed uses replacement value', () => {
        const unit = { tonnage: 50, bv: 100, pv: 10, type: 'BM', techBase: 'Inner Sphere' } as CombatUnit
        const r = calculateUnitFinancials(unit, 'TRULY DESTROYED', {} as any, statuses, 'Core')
        expect(r.isTrulyDestroyed).toBe(true)
        expect(r.baseReplacementValue).toBe(50) // 100 * 0.5
    })

    it('Alpha Strike truly destroyed uses pv basis', () => {
        const unit = { tonnage: 50, bv: 100, pv: 10, type: 'BM', techBase: 'Inner Sphere' } as CombatUnit
        const r = calculateUnitFinancials(unit, 'TRULY DESTROYED', {} as any, statuses, 'Alpha Strike')
        expect(r.baseReplacementValue).toBe(200) // 10 * 40 * 0.5
    })
})
