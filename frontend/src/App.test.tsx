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
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { App } from './App'
import { useUserProfile } from './hooks/useUserProfile'

vi.mock('./hooks/useUserProfile')
vi.mock('./components/MainDashboard', () => ({
  MainDashboard: ({ user }: { user: any }) =>
    user ? (
      <div data-testid="main-dashboard">Welcome, {user.displayName}!</div>
    ) : (
      <div>Not authenticated</div>
    ),
}))

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state initially', () => {
    vi.mocked(useUserProfile).mockReturnValue({
      user: null,
      loading: true,
      fetchProfile: vi.fn(),
    })
    render(<App />)
    expect(screen.getByText('INITIALIZING NEURAL LINK...')).toBeInTheDocument()
  })

  it('renders main dashboard when unauthenticated', async () => {
    vi.mocked(useUserProfile).mockReturnValue({
      user: null,
      loading: false,
      fetchProfile: vi.fn(),
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Not authenticated')).toBeInTheDocument()
    })
  })

  it('renders main dashboard when authenticated', async () => {
    vi.mocked(useUserProfile).mockReturnValue({
      user: {
        name: 'jdoe',
        displayName: 'John Doe',
        email: 'test@test.com',
        id: 'user-1',
        role: 'ROLE_AUTHENTICATED',
      },
      loading: false,
      fetchProfile: vi.fn(),
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByTestId('main-dashboard')).toBeInTheDocument()
    })
  })
})
