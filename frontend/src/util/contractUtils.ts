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
import { Campaign, CampaignFaction, Contract } from '../types/generated'
import { DetachmentContractNegotiation } from '../types/detachmentContract'
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
  const pct = parseMultiplier(t)

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

export interface ResolvedStepValues {
  payRate: string
  salvageRights: string
  supportRights: string
  transportation: string
  commandRights: string
}

/**
 * Resolves a contract term for a given step with gravity towards Step 7.
 * If a value is '-', null, or undefined at the given step, moves step-by-step
 * towards Step 7 until a valid non-dash value is found.
 */
export const resolveStepValueWithGravity = (
  step: number,
  field: keyof ResolvedStepValues,
  resolvedSteps: Record<number, ResolvedStepValues>,
): string => {
  if (!resolvedSteps || !resolvedSteps[step]) return '-'
  const val = resolvedSteps[step][field]

  if (val === '-' || val === null || val === undefined) {
    let current = step
    const target = 7
    while (current !== target) {
      current = current < target ? current + 1 : current - 1
      const nextVal = resolvedSteps[current]?.[field]
      if (nextVal !== '-' && nextVal !== null && nextVal !== undefined) {
        return nextVal
      }
    }
    return resolvedSteps[target]?.[field] || '-'
  }
  return val
}

export type DetachmentNegotiationBucket = {
  primary?: DetachmentContractNegotiation
  opposition?: DetachmentContractNegotiation
  default?: DetachmentContractNegotiation
}

const normalizeEmployerString = (value?: string | null): string =>
  (value || '').trim().toLowerCase()

const isEmployerMatch = (factionName?: string | null, employerName?: string | null) => {
  const normalizedFaction = normalizeEmployerString(factionName)
  const normalizedEmployer = normalizeEmployerString(employerName)
  if (!normalizedFaction || !normalizedEmployer) return false
  return (
    normalizedFaction === normalizedEmployer ||
    normalizedFaction.startsWith(normalizedEmployer) ||
    normalizedEmployer.startsWith(normalizedFaction)
  )
}

const findEmployerFactionId = (
  campaign?: Partial<Campaign> | null,
  employerName?: string | null,
): string | undefined => {
  if (!campaign?.factions || !employerName) return undefined
  return campaign.factions
    .filter((f): f is CampaignFaction => !!f && !!f.id && !!f.factionName)
    .find((f) => isEmployerMatch(f.factionName, employerName))?.id
}

export const buildDetachmentNegotiationMap = (
  negotiations: DetachmentContractNegotiation[] | null | undefined,
  campaign?: Partial<Campaign> | null,
): Record<string, DetachmentNegotiationBucket> => {
  const map: Record<string, DetachmentNegotiationBucket> = {}
  const primaryFactionId = findEmployerFactionId(campaign, campaign?.primaryEmployer)
  const oppositionFactionId = findEmployerFactionId(campaign, campaign?.secondaryEmployer)

  ;((negotiations as DetachmentContractNegotiation[]) || []).forEach((negotiation) => {
    if (!negotiation?.detachmentId) return
    const bucket = map[negotiation.detachmentId] ?? {}

    if (primaryFactionId && negotiation.employerFactionId === primaryFactionId) {
      bucket.primary = negotiation
    } else if (oppositionFactionId && negotiation.employerFactionId === oppositionFactionId) {
      bucket.opposition = negotiation
    } else if (!bucket.default) {
      bucket.default = negotiation
    }

    map[negotiation.detachmentId] = bucket
  })

  return map
}

export const selectDetachmentNegotiationOverride = (
  bucket: DetachmentNegotiationBucket | undefined,
  contract: Partial<Contract> | Partial<Campaign> | null | undefined,
): DetachmentContractNegotiation | undefined => {
  if (!bucket) return undefined
  if (contract && 'primaryContract' in contract && contract.primaryContract === true)
    return bucket.primary ?? bucket.default
  if (contract && 'primaryContract' in contract && contract.primaryContract === false)
    return bucket.opposition ?? bucket.default
  return bucket.default
}

const resolveEffectiveStep = (
  baselineStep: number | null | undefined,
  adjustment: number | null | undefined,
  negotiatedStep: number | null | undefined,
): number => {
  const safeBaseline = baselineStep ?? 1
  if (negotiatedStep != null) {
    return Math.max(1, Math.min(17, negotiatedStep))
  }
  if (adjustment != null) {
    return Math.max(1, Math.min(17, safeBaseline + adjustment))
  }
  return safeBaseline
}

export const resolveEffectiveContract = (
  baseContract: Partial<Contract> | Partial<Campaign> | null | undefined,
  override: Partial<DetachmentContractNegotiation> | null | undefined,
  resolvedSteps: Record<number, ResolvedStepValues> = {},
) => {
  const baseline = baseContract ?? {}
  const payStep = resolveEffectiveStep(
    baseline.payStep,
    override?.payStepAdjustment,
    override?.negotiatedPayStep,
  )
  const salvageStep = resolveEffectiveStep(
    baseline.salvageStep,
    override?.salvageStepAdjustment,
    override?.negotiatedSalvageStep,
  )
  const supportStep = resolveEffectiveStep(
    baseline.supportStep,
    override?.supportStepAdjustment,
    override?.negotiatedSupportStep,
  )
  const transportStep = resolveEffectiveStep(
    baseline.transportStep,
    override?.transportStepAdjustment,
    override?.negotiatedTransportStep,
  )
  const commandStep = resolveEffectiveStep(
    baseline.commandStep,
    override?.commandStepAdjustment,
    override?.negotiatedCommandStep,
  )

  const payRate = parseMultiplier(resolveStepValueWithGravity(payStep, 'payRate', resolvedSteps))
  const salvageTerms = resolveStepValueWithGravity(salvageStep, 'salvageRights', resolvedSteps)
  const supportTerms = resolveStepValueWithGravity(supportStep, 'supportRights', resolvedSteps)
  const transportTerms = resolveStepValueWithGravity(transportStep, 'transportation', resolvedSteps)
  const commandRights = resolveStepValueWithGravity(commandStep, 'commandRights', resolvedSteps)

  return {
    ...baseline,
    payStep,
    salvageStep,
    supportStep,
    transportStep,
    commandStep,
    payRate: payRate || baseline.payRate || 1.0,
    salvageTerms: salvageTerms !== '-' ? salvageTerms : baseline.salvageTerms || '',
    supportTerms: supportTerms !== '-' ? supportTerms : baseline.supportTerms || '',
    transportTerms: transportTerms !== '-' ? transportTerms : baseline.transportTerms || '',
    commandRights: commandRights !== '-' ? commandRights : baseline.commandRights || '',
  }
}
