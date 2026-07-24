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
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ApolloClient, InMemoryCache } from '@apollo/client'
import { ApolloProvider } from '@apollo/client/react'
import { MockLink } from '@apollo/client/testing'
import { CreateCommandForm } from '../components/CreateCommandForm'
import { EstablishCommandDocument as ESTABLISH_COMMAND } from '../types/operations'

function renderForm(onSuccess = vi.fn(), onCancel = vi.fn()) {
  const mocks = [
    {
      request: {
        query: ESTABLISH_COMMAND,
        variables: {
          input: { name: 'NEW COMMAND', commandingOfficer: 'CO Name' },
        },
      },
      result: {
        data: { establishCommand: { id: 'cmd-1', name: 'NEW COMMAND' } },
      },
    },
  ]
  const client = new ApolloClient({
    link: new MockLink(mocks),
    cache: new InMemoryCache(),
  })
  render(
    <ApolloProvider client={client}>
      <CreateCommandForm
        user={{ name: 'jdoe', displayName: 'CO Name' }}
        onCancel={onCancel}
        onSuccess={onSuccess}
      />
    </ApolloProvider>,
  )
}

describe('CreateCommandForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('prefills commanding officer from user display name', () => {
    renderForm()
    const coInput = screen.getByDisplayValue('CO Name') as HTMLInputElement
    expect(coInput).toBeInTheDocument()
  })

  it('shows error when command name is empty', async () => {
    const onSuccess = vi.fn()
    renderForm(onSuccess)
    fireEvent.click(screen.getByRole('button', { name: /ESTABLISH/i }))
    await waitFor(() => {
      expect(screen.getByText(/COMMAND NAME REQUIRED/i)).toBeInTheDocument()
      expect(onSuccess).not.toHaveBeenCalled()
    })
  })

  it('submits successfully with a valid name', async () => {
    const onSuccess = vi.fn()
    renderForm(onSuccess)
    const nameInput = screen.getByPlaceholderText(/command name/i) as HTMLInputElement
    fireEvent.change(nameInput, { target: { value: 'New Command' } })
    fireEvent.click(screen.getByRole('button', { name: /ESTABLISH/i }))
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('calls onCancel when cancel is clicked', () => {
    const onCancel = vi.fn()
    renderForm(vi.fn(), onCancel)
    fireEvent.click(screen.getByText(/ABORT/i))
    expect(onCancel).toHaveBeenCalled()
  })
})
