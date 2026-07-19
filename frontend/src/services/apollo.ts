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
import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_GRAPHQL_API_URL || ''
const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
const wsHost = apiBaseUrl.startsWith('http')
    ? apiBaseUrl.replace(/^http/, 'ws')
    : `${wsProtocol}//${window.location.host}${apiBaseUrl || '/api'}`

export const httpLink = new HttpLink({
    uri: apiBaseUrl ? `${apiBaseUrl}/graphql` : '/api/graphql',
    // Critical for OAuth2/Session cookie support
    credentials: 'include',
})

const wsLink = new GraphQLWsLink(
    createClient({
        url: `${wsHost}/graphql`,
    }),
)

// Split link to handle both HTTP and WebSocket transports
const splitLink = split(
    ({ query }) => {
        const definition = getMainDefinition(query)
        return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
    },
    wsLink,
    httpLink,
)

export const apolloClient = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
})

export const API_BASE_URL = apiBaseUrl
