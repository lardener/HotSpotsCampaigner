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
import { useMutation, useQuery } from '@apollo/client/react'
import {
  GET_DETACHMENT_CONTRACT_NEGOTIATIONS,
  NEGOTIATE_DETACHMENT_CONTRACT,
} from '../gql/operations/detachmentContract'
import { DetachmentContractNegotiation, NegotiateContractInput } from '../types/detachmentContract'

/**
 * Hook for fetching detachment contract negotiations for a campaign.
 */
export function useDetachmentContractNegotiations(campaignId: string) {
  const { data, loading, error, refetch } = useQuery(GET_DETACHMENT_CONTRACT_NEGOTIATIONS, {
    variables: { campaignId },
    fetchPolicy: 'cache-and-network',
  })

  const negotiations = (data as any)?.getDetachmentContractNegotiations ?? []

  return {
    negotiations: negotiations as DetachmentContractNegotiation[],
    loading,
    error,
    refetch,
  }
}

/**
 * Hook for negotiating contract terms for a detachment.
 */
export function useNegotiateDetachmentContract() {
  const [mutate, { loading, error }] = useMutation(NEGOTIATE_DETACHMENT_CONTRACT)

  const negotiate = async (input: NegotiateContractInput) => {
    const result = await mutate({
      variables: { input },
    })
    return (result.data as any)?.negotiateDetachmentContract as DetachmentContractNegotiation
  }

  return { negotiate, loading, error }
}
