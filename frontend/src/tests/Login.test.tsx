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
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { Login } from '../components/Login'

describe('Login Component', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the Google login button', () => {
    render(<Login />)
    const button = screen.getByRole('button', { name: /login with google/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('mode-btn')
    expect(button).toHaveClass('theme-red')
  })

  it('redirects to the OAuth2 authorization endpoint on click', () => {
    const hrefSpy = vi.spyOn(window.Location.prototype, 'href', 'set')
    render(<Login />)
    const button = screen.getByRole('button', { name: /login with google/i })
    fireEvent.click(button)

    expect(hrefSpy).toHaveBeenCalledWith(
      expect.stringContaining('/login/oauth2/authorization/google'),
    )
  })
})
