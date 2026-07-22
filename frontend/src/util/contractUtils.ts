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
import { NumericInput } from '../types/helpers'
export type SupportType = 'BATTLE' | 'STRAIGHT' | 'NONE'

export interface SupportTerms {
  type: SupportType
  pct: number
}

/**
 * Extracts a decimal multiplier from strings like "50%", "1/2", "Full", etc.
 * Handles percentages, fractions, and standard contract keywords.
 */
export const parseMultiplier = (term: string | undefined | null): number => {
  const t = (term || '').toUpperCase().trim()
  if (!t || t === 'NONE' || t === '0%' || t === '-') return 0
  if (t === 'FULL' || t === '100%') return 1

  // Handle fractions common in Support/Transport terms (e.g., 1/2, 3/4)
  const fracMatch = t.match(/(\d+)\/(\d+)/)
  if (fracMatch) return parseInt(fracMatch[1]) / parseInt(fracMatch[2])

  // Handle standard percentage strings
  const pctMatch = t.match(/(\d+)%/)
  if (pctMatch) return parseInt(pctMatch[1]) / 100

  return 0
}

/**
 * Advanced parser for support terms to handle Chaos Campaign Straight vs Battle logic.
 * - BATTLE: 100% logistics coverage, %-based unit replacement.
 * - STRAIGHT: %-based logistics coverage, 0% unit replacement.
 */
export const parseSupportTerms = (term: string | undefined | null): SupportTerms => {
  const t = (term || '').toUpperCase().trim()
  let pct = parseMultiplier(t)

  if (t.includes('BATTLE'))
    return { type: 'BATTLE', pct: t.includes('%') || t.includes('/') ? pct : 1 }
  if (t.includes('STRAIGHT')) return { type: 'STRAIGHT', pct }
  if (pct > 0) return { type: 'STRAIGHT', pct } // Fallback for simple percentage strings
  return { type: 'NONE', pct: 0 }
}

/**
 * Safely parses a NumericInput (string | number) into an actual number.
 * Returns the fallback if the input is not a valid number (e.g., "", "-", or junk).
 */
export const parseNumericInput = (
  val: NumericInput | undefined | null,
  fallback: number = 0,
): number => {
  if (val === undefined || val === null || val === '') return fallback
  if (typeof val === 'number') return val

  const parsed = parseInt(val)
  return isNaN(parsed) ? fallback : parsed
}

/**
 * Checks if a NumericInput contains invalid non-numeric content.
 * Ignores intermediate states like empty strings or a single minus sign.
 */
export const isInputInvalid = (val: NumericInput | undefined | null): boolean => {
  if (val === undefined || val === null) return false
  const s = val.toString()
  return s !== '' && s !== '-' && isNaN(Number(s))
}
