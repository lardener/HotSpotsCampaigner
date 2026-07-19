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
import { useEffect } from 'react'
import { ApolloProvider } from '@apollo/client/react'
import { MainDashboard } from './components/MainDashboard'
import { apolloClient, API_BASE_URL } from './services/apollo'
import { useUserProfile } from './hooks/useUserProfile'
import './styles/index.css'

console.log(`[AUTH] GraphQL Endpoint: ${API_BASE_URL ? `${API_BASE_URL}/graphql` : '/api/graphql'}`)

export function App() {
  const { user, loading, fetchProfile } = useUserProfile()

  useEffect(() => {
    // Dynamic Tactical Favicon Injection
    const link = (document.querySelector("link[rel*='icon']") ||
      document.createElement('link')) as HTMLLinkElement
    link.type = 'image/svg+xml'
    link.rel = 'shortcut icon'

    // Styled Amber Hex-Crosshair Icon
    const faviconSvg = `
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
        <rect width='100' height='100' fill='#050705'/>
        <polygon points='50,10 85,30 85,70 50,90 15,70 15,30' fill='none' stroke='#ffb000' stroke-width='8'/>
        <circle cx='50' cy='50' r='18' fill='none' stroke='#ffb000' stroke-width='4'/>
        <path d='M50 20 L50 80 M20 50 L80 50' stroke='#ffb000' stroke-width='4'/>
      </svg>
    `.trim()

    link.href = `data:image/svg+xml,${encodeURIComponent(faviconSvg)}`
    document.getElementsByTagName('head')[0].appendChild(link)
    document.title = 'HSC-TACTICAL // CAMPAIGNER'
  }, [])

  const handleLogout = async () => {
    try {
      await fetch(API_BASE_URL ? `${API_BASE_URL}/api/logout` : '/api/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (err) {
      console.error('Logout sequence failed:', err)
    } finally {
      window.location.replace('/')
    }
  }

  if (loading) {
    return (
      <div className="loading-intel" style={{ textAlign: 'center', marginTop: '20%' }}>
        <svg width="80" height="80" viewBox="0 0 100 100" style={{ marginBottom: '24px' }}>
          <polygon
            points="50,10 85,30 85,70 50,90 15,70 15,30"
            fill="none"
            stroke="var(--terminal-amber)"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r="18"
            fill="none"
            stroke="var(--terminal-amber)"
            strokeWidth="3"
          />
          <path d="M50 20 L50 80 M20 50 L80 50" stroke="var(--terminal-amber)" strokeWidth="3" />
        </svg>
        <h2>INITIALIZING NEURAL LINK...</h2>
        <p className="terminal-text">SYNCHRONIZING WITH COMSTAR RELAY</p>
      </div>
    )
  }

  return (
    // 3. Provide the client to your component tree
    <ApolloProvider client={apolloClient}>
      <MainDashboard user={user} onLogout={handleLogout} onRefreshProfile={fetchProfile} />
    </ApolloProvider>
  )
}
