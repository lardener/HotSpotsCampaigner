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
import { DetachmentContractNegotiation } from '../types/detachmentContract'
import {
  buildDetachmentNegotiationMap,
  parseMultiplier,
  parseSupportTerms,
  parseNumericInput,
  isInputInvalid,
  resolveStepValueWithGravity,
  resolveEffectiveContract,
  selectDetachmentNegotiationOverride,
} from '../util/contractUtils'

describe('parseMultiplier', () => {
  it('returns 0 for empty/undefined/null', () => {
    expect(parseMultiplier(undefined)).toBe(0)
    expect(parseMultiplier(null)).toBe(0)
    expect(parseMultiplier('')).toBe(0)
  })

  it('returns 0 for explicit none markers', () => {
    expect(parseMultiplier('NONE')).toBe(0)
    expect(parseMultiplier('0%')).toBe(0)
    expect(parseMultiplier('-')).toBe(0)
  })

  it('returns 1 for full coverage', () => {
    expect(parseMultiplier('FULL')).toBe(1)
    expect(parseMultiplier('100%')).toBe(1)
  })

  it('parses fractions', () => {
    expect(parseMultiplier('1/2')).toBe(0.5)
    expect(parseMultiplier('3/4')).toBe(0.75)
  })

  it('parses percentages', () => {
    expect(parseMultiplier('50%')).toBe(0.5)
    expect(parseMultiplier('25%')).toBe(0.25)
  })

  it('is case-insensitive and trims', () => {
    expect(parseMultiplier('  Full  ')).toBe(1)
    expect(parseMultiplier('  1/2 ')).toBe(0.5)
  })

  it('returns 0 for unrecognized input', () => {
    expect(parseMultiplier('banana')).toBe(0)
  })
})

describe('parseSupportTerms', () => {
  it('classifies BATTLE terms', () => {
    expect(parseSupportTerms('BATTLE')).toEqual({ type: 'BATTLE', pct: 1 })
    expect(parseSupportTerms('Battle 100%')).toEqual({ type: 'BATTLE', pct: 1 })
  })

  it('classifies STRAIGHT terms', () => {
    expect(parseSupportTerms('STRAIGHT')).toEqual({ type: 'STRAIGHT', pct: 0 })
    expect(parseSupportTerms('Straight 50%')).toEqual({ type: 'STRAIGHT', pct: 0.5 })
  })

  it('falls back to STRAIGHT for a bare percentage', () => {
    expect(parseSupportTerms('50%')).toEqual({ type: 'STRAIGHT', pct: 0.5 })
  })

  it('returns NONE when no recognizable term', () => {
    expect(parseSupportTerms('NONE')).toEqual({ type: 'NONE', pct: 0 })
    expect(parseSupportTerms(undefined)).toEqual({ type: 'NONE', pct: 0 })
  })
})

describe('parseNumericInput', () => {
  it('returns fallback for undefined/null/empty', () => {
    expect(parseNumericInput(undefined)).toBe(0)
    expect(parseNumericInput(null)).toBe(0)
    expect(parseNumericInput('')).toBe(0)
    expect(parseNumericInput(undefined, 5)).toBe(5)
  })

  it('returns number inputs directly', () => {
    expect(parseNumericInput(42)).toBe(42)
    expect(parseNumericInput(7, 99)).toBe(7)
  })

  it('parses numeric strings', () => {
    expect(parseNumericInput('123')).toBe(123)
  })

  it('returns fallback for non-numeric strings', () => {
    expect(parseNumericInput('abc')).toBe(0)
    expect(parseNumericInput('abc', 9)).toBe(9)
  })
})

describe('isInputInvalid', () => {
  it('returns false for undefined/null', () => {
    expect(isInputInvalid(undefined)).toBe(false)
    expect(isInputInvalid(null)).toBe(false)
  })

  it('returns false for empty or single minus (intermediate states)', () => {
    expect(isInputInvalid('')).toBe(false)
    expect(isInputInvalid('-')).toBe(false)
  })

  it('returns false for valid numbers', () => {
    expect(isInputInvalid('42')).toBe(false)
    expect(isInputInvalid(42)).toBe(false)
  })

  it('returns true for invalid non-numeric content', () => {
    expect(isInputInvalid('4a')).toBe(true)
    expect(isInputInvalid('abc')).toBe(true)
  })
})

describe('resolveEffectiveContract', () => {
  const sampleSteps = {
    1: {
      payRate: '100%',
      salvageRights: 'Full',
      supportRights: 'Straight/50%',
      transportation: 'Free',
      commandRights: 'Independent',
    },
    3: {
      payRate: '110%',
      salvageRights: 'Shared',
      supportRights: 'Battle/25%',
      transportation: 'Discounted',
      commandRights: 'Liaison',
    },
    4: {
      payRate: '120%',
      salvageRights: 'None',
      supportRights: 'None',
      transportation: 'Market Rate',
      commandRights: 'House',
    },
  }

  it('applies negotiated adjustments and resolves new contract terms', () => {
    const baseContract = {
      payStep: 1,
      salvageStep: 1,
      supportStep: 1,
      transportStep: 1,
      commandStep: 1,
      payRate: 1,
      salvageTerms: 'Original',
      supportTerms: 'Original',
      transportTerms: 'Original',
      commandRights: 'Original',
    }

    const effective = resolveEffectiveContract(
      baseContract,
      {
        payStepAdjustment: 2,
        salvageStepAdjustment: 2,
        supportStepAdjustment: 2,
        transportStepAdjustment: 2,
        commandStepAdjustment: 2,
      },
      sampleSteps as any,
    )

    expect(effective.payStep).toBe(3)
    expect(effective.payRate).toBe(1.1)
    expect(effective.salvageTerms).toBe('Shared')
    expect(effective.supportTerms).toBe('Battle/25%')
    expect(effective.transportTerms).toBe('Discounted')
    expect(effective.commandRights).toBe('Liaison')
  })

  it('uses negotiated steps when present', () => {
    const effective = resolveEffectiveContract(
      { payStep: 1, salvageStep: 1, supportStep: 1, transportStep: 1, commandStep: 1, payRate: 1 },
      {
        negotiatedPayStep: 4,
        negotiatedSalvageStep: 4,
        negotiatedSupportStep: 4,
        negotiatedTransportStep: 4,
        negotiatedCommandStep: 4,
      },
      sampleSteps as any,
    )

    expect(effective.payStep).toBe(4)
    expect(effective.salvageTerms).toBe('None')
    expect(effective.supportTerms).toBe('None')
    expect(effective.transportTerms).toBe('Market Rate')
    expect(effective.commandRights).toBe('House')
  })

  it('computes a distinct effective contract per detachment for primary and opposition baselines', () => {
    const primaryContract = {
      id: 'primary-contract',
      payStep: 2,
      salvageStep: 2,
      supportStep: 2,
      transportStep: 2,
      commandStep: 2,
      payRate: 1,
      salvageTerms: 'Original',
      supportTerms: 'Original',
      transportTerms: 'Original',
      commandRights: 'Original',
    }

    const oppositionContract = {
      id: 'opposition-contract',
      payStep: 5,
      salvageStep: 5,
      supportStep: 5,
      transportStep: 5,
      commandStep: 5,
      payRate: 1,
      salvageTerms: 'Original',
      supportTerms: 'Original',
      transportTerms: 'Original',
      commandRights: 'Original',
    }

    const primaryEffective = resolveEffectiveContract(
      primaryContract,
      {
        payStepAdjustment: 1,
        salvageStepAdjustment: 1,
        supportStepAdjustment: 1,
        transportStepAdjustment: 1,
        commandStepAdjustment: 1,
      },
      sampleSteps as any,
    )

    const oppositionEffective = resolveEffectiveContract(
      oppositionContract,
      {
        negotiatedPayStep: 4,
        negotiatedSalvageStep: 4,
        negotiatedSupportStep: 4,
        negotiatedTransportStep: 4,
        negotiatedCommandStep: 4,
      },
      sampleSteps as any,
    )

    expect(primaryEffective.payStep).toBe(3)
    expect(primaryEffective.payRate).toBe(1.1)
    expect(primaryEffective.supportTerms).toBe('Battle/25%')

    expect(oppositionEffective.payStep).toBe(4)
    expect(oppositionEffective.salvageTerms).toBe('None')
    expect(oppositionEffective.supportTerms).toBe('None')
    expect(oppositionEffective.transportTerms).toBe('Market Rate')
    expect(oppositionEffective.commandRights).toBe('House')
  })
})

describe('buildDetachmentNegotiationMap and selectDetachmentNegotiationOverride', () => {
  it('buckets negotiations by detachment and employer type', () => {
    const campaign = {
      factions: [
        { id: 'primary-faction', factionName: 'Primary Employer' },
        { id: 'secondary-faction', factionName: 'Opposition Employer' },
      ],
      primaryEmployer: 'Primary Employer',
      secondaryEmployer: 'Opposition Employer',
    } as any

    const negotiations = [
      {
        detachmentId: 'det-1',
        employerFactionId: 'primary-faction',
        negotiatedPayStep: 3,
      },
      {
        detachmentId: 'det-1',
        employerFactionId: 'secondary-faction',
        negotiatedPayStep: 5,
      },
      {
        detachmentId: 'det-1',
        employerFactionId: 'other-faction',
        negotiatedPayStep: 7,
      },
    ] as any

    const map = buildDetachmentNegotiationMap(negotiations, campaign)
    expect(map['det-1'].primary?.negotiatedPayStep).toBe(3)
    expect(map['det-1'].opposition?.negotiatedPayStep).toBe(5)
    expect(map['det-1'].default?.negotiatedPayStep).toBe(7)
  })

  it('selects the correct negotiation override for primary and opposition contracts', () => {
    const bucket = {
      primary: {
        id: 'primary-1',
        campaignId: 'camp',
        detachmentId: 'det-1',
        employerFactionId: 'primary-faction',
        payStepAdjustment: null,
        salvageStepAdjustment: null,
        supportStepAdjustment: null,
        transportStepAdjustment: null,
        commandStepAdjustment: null,
        salvageTerms: null,
        supportTerms: null,
        transportTerms: null,
        commandRights: null,
        negotiatedPayStep: 3,
      } as DetachmentContractNegotiation,
      opposition: {
        id: 'opposition-1',
        campaignId: 'camp',
        detachmentId: 'det-1',
        employerFactionId: 'secondary-faction',
        payStepAdjustment: null,
        salvageStepAdjustment: null,
        supportStepAdjustment: null,
        transportStepAdjustment: null,
        commandStepAdjustment: null,
        salvageTerms: null,
        supportTerms: null,
        transportTerms: null,
        commandRights: null,
        negotiatedPayStep: 5,
      } as DetachmentContractNegotiation,
      default: {
        id: 'default-1',
        campaignId: 'camp',
        detachmentId: 'det-1',
        employerFactionId: 'other-faction',
        payStepAdjustment: null,
        salvageStepAdjustment: null,
        supportStepAdjustment: null,
        transportStepAdjustment: null,
        commandStepAdjustment: null,
        salvageTerms: null,
        supportTerms: null,
        transportTerms: null,
        commandRights: null,
        negotiatedPayStep: 7,
      } as DetachmentContractNegotiation,
    }

    expect(selectDetachmentNegotiationOverride(bucket, { primaryContract: true })).toBe(
      bucket.primary,
    )
    expect(selectDetachmentNegotiationOverride(bucket, { primaryContract: false })).toBe(
      bucket.opposition,
    )
    expect(selectDetachmentNegotiationOverride(bucket, { id: 'fallback' })).toBe(bucket.default)
  })
})

describe('resolveStepValueWithGravity', () => {
  const sampleSteps = {
    7: {
      payRate: '100%',
      salvageRights: '40%',
      supportRights: 'Straight/90%',
      transportation: '50%',
      commandRights: 'House',
    },
    8: {
      payRate: '110%',
      salvageRights: '50%',
      supportRights: 'Straight/100%',
      transportation: '75%',
      commandRights: 'Liaison',
    },
    9: {
      payRate: '120%',
      salvageRights: '60%',
      supportRights: 'Battle/10%',
      transportation: '100%',
      commandRights: '-',
    },
    10: {
      payRate: '130%',
      salvageRights: '70%',
      supportRights: 'Battle/20%',
      transportation: '-',
      commandRights: '-',
    },
    11: {
      payRate: '140%',
      salvageRights: '80%',
      supportRights: 'Battle/30%',
      transportation: '-',
      commandRights: 'Independent',
    },
  }

  it('resolves exact values when present', () => {
    expect(resolveStepValueWithGravity(11, 'supportRights', sampleSteps)).toBe('Battle/30%')
    expect(resolveStepValueWithGravity(9, 'supportRights', sampleSteps)).toBe('Battle/10%')
    expect(resolveStepValueWithGravity(11, 'payRate', sampleSteps)).toBe('140%')
  })

  it('applies gravity towards step 7 when value is dash', () => {
    // Step 10 commandRights is '-', moves towards 7 -> step 9 is '-', step 8 is 'Liaison'
    expect(resolveStepValueWithGravity(10, 'commandRights', sampleSteps)).toBe('Liaison')
    // Step 10 transportation is '-', step 9 is '100%'
    expect(resolveStepValueWithGravity(10, 'transportation', sampleSteps)).toBe('100%')
  })

  it('returns dash if step is missing from table', () => {
    expect(resolveStepValueWithGravity(99, 'supportRights', sampleSteps)).toBe('-')
  })
})
