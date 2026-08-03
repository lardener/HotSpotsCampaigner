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
  parseMultiplier,
  parseSupportTerms,
  parseNumericInput,
  isInputInvalid,
  resolveStepValueWithGravity,
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

