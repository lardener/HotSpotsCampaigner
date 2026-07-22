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
import { NavigationTree, TreeItem } from '../components/NavigationTree'

const tree: TreeItem[] = [
  {
    id: 'root-1',
    label: 'My Commands',
    type: 'ROOT',
    initiallyExpanded: true,
    children: [
      {
        id: 'cmd-1',
        label: "Wolf's Dragoons",
        type: 'COMMAND',
        children: [
          { id: 'det-1', label: 'Alpha Lance', type: 'DETACHMENT' },
          { id: 'det-2', label: 'Beta Lance', type: 'DETACHMENT' },
        ],
      },
    ],
  },
]

describe('NavigationTree', () => {
  it('renders root and expanded children', () => {
    render(<NavigationTree data={tree} onSelect={() => {}} />)
    expect(screen.getByRole('button', { name: /My Commands/i })).toBeInTheDocument()
    expect(screen.getByText("Wolf's Dragoons")).toBeInTheDocument()
    expect(screen.getByText('Alpha Lance')).toBeInTheDocument()
    expect(screen.getByText('Beta Lance')).toBeInTheDocument()
  })

  it('collapses children when toggle arrow clicked', () => {
    const collapsedTree: TreeItem[] = [
      {
        id: 'root-1',
        label: 'My Commands',
        type: 'ROOT',
        initiallyExpanded: false,
        children: [{ id: 'cmd-1', label: "Wolf's Dragoons", type: 'COMMAND' }],
      },
    ]
    render(<NavigationTree data={collapsedTree} onSelect={() => {}} />)
    expect(screen.queryByText("Wolf's Dragoons")).toBeNull()
    const arrow = screen.getByText('▶')
    fireEvent.click(arrow)
    expect(screen.getByText("Wolf's Dragoons")).toBeInTheDocument()
  })

  it('calls onSelect when a node is clicked', () => {
    const onSelect = vi.fn()
    render(<NavigationTree data={tree} onSelect={onSelect} />)
    fireEvent.click(screen.getByText('Alpha Lance'))
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'det-1', type: 'DETACHMENT' }),
    )
  })

  it('highlights the selected node', () => {
    render(<NavigationTree data={tree} onSelect={() => {}} selectedId="det-1" />)
    const node = screen.getByText('Alpha Lance').closest('.tree-node')
    expect(node?.classList).toContain('selected')
  })

  it('renders multiple root items', () => {
    const multiRoot: TreeItem[] = [
      { id: 'r1', label: 'Root One', type: 'ROOT' },
      { id: 'r2', label: 'Root Two', type: 'ROOT' },
    ]
    render(<NavigationTree data={multiRoot} onSelect={() => {}} />)
    expect(screen.getByText('Root One')).toBeInTheDocument()
    expect(screen.getByText('Root Two')).toBeInTheDocument()
  })
})
