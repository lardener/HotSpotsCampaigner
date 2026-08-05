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
 * MERCHANTABILITY or FITNESS OR PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { gql } from '@apollo/client'

export const GET_DETACHMENT_CONTRACT_NEGOTIATIONS = gql`
  query GetDetachmentContractNegotiations($campaignId: ID!) {
    getDetachmentContractNegotiations(campaignId: $campaignId) {
      id
      campaignId
      detachmentId
      employerFactionId
      payStepAdjustment
      salvageStepAdjustment
      supportStepAdjustment
      transportStepAdjustment
      commandStepAdjustment
      negotiatedPayStep
      negotiatedSalvageStep
      negotiatedSupportStep
      negotiatedTransportStep
      negotiatedCommandStep
      resultingPayTerms
      resultingSalvageTerms
      resultingSupportTerms
      resultingTransportTerms
      resultingCommandRights
      salvageTerms
      supportTerms
      transportTerms
      commandRights
    }
  }
`

export const NEGOTIATE_DETACHMENT_CONTRACT = gql`
  mutation NegotiateDetachmentContract($input: NegotiateContractInput!) {
    negotiateDetachmentContract(input: $input) {
      id
      campaignId
      detachmentId
      employerFactionId
      payStepAdjustment
      salvageStepAdjustment
      supportStepAdjustment
      transportStepAdjustment
      commandStepAdjustment
      negotiatedPayStep
      negotiatedSalvageStep
      negotiatedSupportStep
      negotiatedTransportStep
      negotiatedCommandStep
      resultingPayTerms
      resultingSalvageTerms
      resultingSupportTerms
      resultingTransportTerms
      resultingCommandRights
      salvageTerms
      supportTerms
      transportTerms
      commandRights
    }
  }
`


