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
import { describe, it, expect, vi } from 'vitest'
import { TerminalOverlay } from '../components/TerminalOverlay'

describe('TerminalOverlay', () => {
  it('renders title and message', () => {
    render(<TerminalOverlay title="TEST TITLE" message="TEST MESSAGE" onConfirm={() => {}} />)
    expect(screen.getByText(/TEST TITLE/)).toBeTruthy()
    expect(screen.getByText('TEST MESSAGE')).toBeTruthy()
  })

  it('calls onConfirm when confirm button clicked', () => {
    const onConfirm = vi.fn()
    render(<TerminalOverlay title="T" message="M" confirmLabel="OK" onConfirm={onConfirm} />)
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(onConfirm).toHaveBeenCalled()
  })

  it('calls onCancel when cancel button clicked', () => {
    const onCancel = vi.fn()
    render(
      <TerminalOverlay
        title="T"
        message="M"
        cancelLabel="ABORT"
        onConfirm={() => {}}
        onCancel={onCancel}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'ABORT' }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('renders an input field when showInputField is set', () => {
    render(
      <TerminalOverlay
        title="T"
        message="M"
        showInputField
        inputLabel="TOKEN"
        inputPlaceholder="enter token"
        onConfirm={() => {}}
      />,
    )
    const input = screen.getByPlaceholderText('enter token') as HTMLInputElement
    expect(input).toBeTruthy()
    fireEvent.change(input, { target: { value: 'abc123' } })
    expect(input.value).toBe('abc123')
  })

  it('renders custom children', () => {
    render(
      <TerminalOverlay title="T" message="M" onConfirm={() => {}}>
        <div data-testid="custom-child">CUSTOM CONTENT</div>
      </TerminalOverlay>,
    )
    expect(screen.getByTestId('custom-child')).toBeTruthy()
  })

  it('shows loading state on confirm button', () => {
    render(
      <TerminalOverlay title="T" message="M" loading confirmLabel="WORKING" onConfirm={() => {}} />,
    )
    const btn = screen.getByRole('button', { name: 'WORKING' }) as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })
})
