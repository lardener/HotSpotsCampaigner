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
import { MercenaryRegistryView } from '../components/MercenaryRegistryView'
import type { MercenaryCommand } from '../types/generated'

function makeCommand(id: string, name: string): MercenaryCommand {
  return { id, name } as MercenaryCommand
}

describe('MercenaryRegistryView', () => {
  it('renders all commands', () => {
    const commands = [makeCommand('c1', "Wolf's Dragoons"), makeCommand('c2', 'Gray Death Legion')]
    render(
      <MercenaryRegistryView
        commands={commands}
        selectedCommandId={null}
        onSelectCommand={() => {}}
        onDeleteCommand={() => {}}
        onEstablishCommand={() => {}}
        onViewUnitProfile={() => {}}
      />,
    )
    expect(screen.getByText("Wolf's Dragoons")).toBeTruthy()
    expect(screen.getByText('Gray Death Legion')).toBeTruthy()
  })

  it('calls onSelectCommand when a command is clicked', () => {
    const onSelect = vi.fn()
    const commands = [makeCommand('c1', "Wolf's Dragoons")]
    render(
      <MercenaryRegistryView
        commands={commands}
        selectedCommandId={null}
        onSelectCommand={onSelect}
        onDeleteCommand={() => {}}
        onEstablishCommand={() => {}}
        onViewUnitProfile={() => {}}
      />,
    )
    fireEvent.click(screen.getByText("Wolf's Dragoons"))
    expect(onSelect).toHaveBeenCalledWith('c1')
  })

  it('highlights the selected command', () => {
    const commands = [makeCommand('c1', "Wolf's Dragoons"), makeCommand('c2', 'Gray Death Legion')]
    const { container } = render(
      <MercenaryRegistryView
        commands={commands}
        selectedCommandId="c2"
        onSelectCommand={() => {}}
        onDeleteCommand={() => {}}
        onEstablishCommand={() => {}}
        onViewUnitProfile={() => {}}
      />,
    )
    const selected = container.querySelector('.active-command-panel')
    expect(selected).toBeTruthy()
    expect(selected?.textContent).toContain('Gray Death Legion')
  })

  it('shows unnamed fallback for commands without a name', () => {
    const commands = [makeCommand('c1', null as any)]
    render(
      <MercenaryRegistryView
        commands={commands}
        selectedCommandId={null}
        onSelectCommand={() => {}}
        onDeleteCommand={() => {}}
        onEstablishCommand={() => {}}
        onViewUnitProfile={() => {}}
      />,
    )
    expect(screen.getByText('UNNAMED UNIT')).toBeTruthy()
  })

  it('calls onEstablishCommand when establish button clicked', () => {
    const onEstablish = vi.fn()
    const commands: MercenaryCommand[] = []
    render(
      <MercenaryRegistryView
        commands={commands}
        selectedCommandId={null}
        onSelectCommand={() => {}}
        onDeleteCommand={() => {}}
        onEstablishCommand={onEstablish}
        onViewUnitProfile={() => {}}
      />,
    )
    fireEvent.click(screen.getByText(/ESTABLISH NEW MERCENARY COMMAND/i))
    expect(onEstablish).toHaveBeenCalled()
  })
})
