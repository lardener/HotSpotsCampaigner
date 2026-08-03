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

/**
 * Represents a negotiated contract override for a detachment.
 */
export interface DetachmentContractNegotiation {
  id: string
  campaignId: string
  detachmentId: string
  employerFactionId: string
  payStepAdjustment: number | null
  salvageStepAdjustment: number | null
  supportStepAdjustment: number | null
  transportStepAdjustment: number | null
  commandStepAdjustment: number | null
  negotiatedPayStep?: number | null
  negotiatedSalvageStep?: number | null
  negotiatedSupportStep?: number | null
  negotiatedTransportStep?: number | null
  negotiatedCommandStep?: number | null
  resultingPayTerms?: string | null
  resultingSalvageTerms?: string | null
  resultingSupportTerms?: string | null
  resultingTransportTerms?: string | null
  resultingCommandRights?: string | null
  salvageTerms: string | null
  supportTerms: string | null
  transportTerms: string | null
  commandRights: string | null
}

/**
 * Input for negotiating contract terms.
 */
export interface NegotiateContractInput {
  campaignId: string
  detachmentId: string
  employerFactionId: string
  payStepAdjustment?: number | null
  salvageStepAdjustment?: number | null
  supportStepAdjustment?: number | null
  transportStepAdjustment?: number | null
  commandStepAdjustment?: number | null
  negotiatedPayStep?: number | null
  negotiatedSalvageStep?: number | null
  negotiatedSupportStep?: number | null
  negotiatedTransportStep?: number | null
  negotiatedCommandStep?: number | null
  resultingPayTerms?: string | null
  resultingSalvageTerms?: string | null
  resultingSupportTerms?: string | null
  resultingTransportTerms?: string | null
  resultingCommandRights?: string | null
  salvageTerms?: string | null
  supportTerms?: string | null
  transportTerms?: string | null
  commandRights?: string | null
}

/**
 * Baseline contract terms from the employer faction.
 */
export interface BaselineContractTerms {
  payStep: number
  salvageStep: number
  supportStep: number
  transportStep: number
  commandStep: number
  salvageTerms: string
  supportTerms: string
  transportTerms: string
  commandRights: string
}

/**
 * Final calculated terms after applying overrides.
 */
export interface CalculatedContractTerms extends BaselineContractTerms {
  hasOverrides: boolean
  overridesApplied: Partial<BaselineContractTerms>
}

/**
 * Step adjustment options for negotiation UI.
 */
export const STEP_ADJUSTMENT_OPTIONS = [-3, -2, -1, 0, 1, 2, 3] as const

/**
 * Available salvage terms options.
 */
export const SALVAGE_TERMS_OPTIONS = [
  { value: 'Full', label: 'Full Salvage' },
  { value: 'Shared', label: 'Shared Salvage' },
  { value: 'None', label: 'No Salvage' },
  { value: 'Government', label: 'Government Salvage' },
  { value: 'Other', label: 'Other Terms' },
] as const

/**
 * Available support terms options.
 */
export const SUPPORT_TERMS_OPTIONS = [
  { value: 'Full', label: 'Full Support' },
  { value: 'Shared', label: 'Shared Support' },
  { value: 'None', label: 'No Support' },
  { value: 'Government', label: 'Government Support' },
  { value: 'Other', label: 'Other Terms' },
] as const

/**
 * Available transport terms options.
 */
export const TRANSPORT_TERMS_OPTIONS = [
  { value: 'Free', label: 'Free Transport' },
  { value: 'Discounted', label: 'Discounted Transport' },
  { value: 'Market Rate', label: 'Market Rate' },
  { value: 'Other', label: 'Other Terms' },
] as const

/**
 * Available command rights options.
 */
export const COMMAND_RIGHTS_OPTIONS = [
  { value: 'Independent', label: 'Independent' },
  { value: 'Liaison', label: 'Liaison Officer' },
  { value: 'House', label: 'House Command' },
  { value: 'Other', label: 'Other Terms' },
] as const
