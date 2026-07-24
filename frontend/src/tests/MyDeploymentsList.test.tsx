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
import { MyDeploymentsList } from '../components/MyDeploymentsList'
import type { MercenaryCommand } from '../types/generated'

function makeCommand(id: string, name: string, detachments: any[]): MercenaryCommand {
  return {
    id,
    name,
    detachments: detachments as any,
  } as MercenaryCommand
}

describe('MyDeploymentsList', () => {
  it('shows placeholder when no deployments', () => {
    render(<MyDeploymentsList commands={[]} onSelectDetachment={() => {}} />)
    expect(screen.getByText(/NO ACTIVE DEPLOYMENTS/i)).toBeInTheDocument()
  })

  it('renders deployed detachments from commands', () => {
    const cmd = makeCommand('cmd-1', "Wolf's Dragoons", [
      { id: 'det-1', name: 'Alpha Lance', campaignId: 'camp-1', campaignName: 'Draconis Reach' },
      { id: 'det-2', name: 'Beta Lance', campaignId: null },
    ])
    render(<MyDeploymentsList commands={[cmd]} onSelectDetachment={() => {}} />)
    expect(screen.getByText('Alpha Lance')).toBeInTheDocument()
    // det-2 has no campaignId, so it should not appear
    expect(screen.queryByText('Beta Lance')).toBeNull()
  })

  it('calls onSelectDetachment when a deployment is clicked', () => {
    const onSelect = vi.fn()
    const cmd = makeCommand('cmd-1', "Wolf's Dragoons", [
      { id: 'det-1', name: 'Alpha Lance', campaignId: 'camp-1', campaignName: 'Draconis Reach' },
    ])
    render(<MyDeploymentsList commands={[cmd]} onSelectDetachment={onSelect} />)
    fireEvent.click(screen.getByText('Alpha Lance'))
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'deployment-det-1',
        label: "Wolf's Dragoons - Alpha Lance",
        metadata: {
          campaignId: 'camp-1',
          commandId: 'cmd-1',
          detachmentId: 'det-1',
        },
        type: 'DETACHMENT',
      }),
    )
  })

  it('handles null detachments gracefully', () => {
    const cmd = makeCommand('cmd-1', "Wolf's Dragoons", [null, undefined])
    render(<MyDeploymentsList commands={[cmd]} onSelectDetachment={() => {}} />)
    expect(screen.getByText(/NO ACTIVE DEPLOYMENTS/i)).toBeInTheDocument()
  })
})
