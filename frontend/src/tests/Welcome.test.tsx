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
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Welcome } from '../components/Welcome'

describe('Welcome Component', () => {
  it('should display welcome message with user name', () => {
    render(<Welcome userName="John Doe" />)
    expect(screen.getByText(/welcome john doe to the mercenary life/i)).toBeTruthy()
  })

  it('should center the welcome message', () => {
    const { container } = render(<Welcome userName="Jane Smith" />)
    const welcomeDiv = container.firstChild as HTMLElement
    expect(welcomeDiv?.classList.contains('welcome-container')).toBe(true)
  })
})
