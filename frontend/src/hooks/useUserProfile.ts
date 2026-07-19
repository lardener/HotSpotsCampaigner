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
import { useCallback, useEffect, useState } from 'react'
import { useQuery, useApolloClient } from '@apollo/client/react'
import { GetUserProfileDocument, GetUserProfileQuery } from '../types/operations'
import { UserProfile } from '../types/generated'

interface UseUserProfileResult {
    user: UserProfile | null
    loading: boolean
    fetchProfile: () => void
}

function mapProfile(
    profile: GetUserProfileQuery['userProfile'] | undefined | null,
): UserProfile | null {
    if (!profile) return null
    return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        displayName: profile.displayName,
    }
}

/**
 * Fetches the current user's profile from the GraphQL endpoint.
 * Guest sessions (no active session) resolve to a null user without error.
 */
export function useUserProfile(): UseUserProfileResult {
    const client = useApolloClient()
    const [user, setUser] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)

    const { data, error } = useQuery<GetUserProfileQuery>(GetUserProfileDocument, {
        fetchPolicy: 'network-only',
    })

    useEffect(() => {
        if (data) {
            setUser(mapProfile(data.userProfile))
            setLoading(false)
        } else if (error) {
            // Profile fetch failing is normal for guests; proceed with null user state
            console.log('[AUTH] Guest access initialized (No active session)')
            setUser(null)
            setLoading(false)
        }
    }, [data, error])

    const fetchProfile = useCallback(() => {
        client
            .query<GetUserProfileQuery>({
                query: GetUserProfileDocument,
                fetchPolicy: 'network-only',
            })
            .then((result) => {
                setUser(mapProfile(result.data?.userProfile))
                setLoading(false)
            })
            .catch(() => {
                // Profile fetch failing is normal for guests; proceed with null user state
                console.log('[AUTH] Guest access initialized (No active session)')
                setUser(null)
                setLoading(false)
            })
    }, [client])

    return { user, loading, fetchProfile }
}
