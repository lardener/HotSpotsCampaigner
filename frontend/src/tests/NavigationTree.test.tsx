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
        initiallyExpanded: true,
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
    expect(screen.getByText('My Commands')).toBeInTheDocument()
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

  it('auto-expands collapsed parent when selectedId targets a descendant', () => {
    const collapsedParentTree: TreeItem[] = [
      {
        id: 'root-1',
        label: 'My Commands',
        type: 'ROOT',
        initiallyExpanded: false,
        children: [
          {
            id: 'cmd-1',
            label: "Wolf's Dragoons",
            type: 'COMMAND',
            initiallyExpanded: false,
            children: [{ id: 'det-target', label: 'Target Lance', type: 'DETACHMENT' }],
          },
        ],
      },
    ]
    render(<NavigationTree data={collapsedParentTree} onSelect={() => {}} selectedId="det-target" />)
    expect(screen.getByText('Target Lance')).toBeInTheDocument()
    const targetNode = screen.getByText('Target Lance').closest('.tree-node')
    expect(targetNode?.classList).toContain('selected')
  })

  it('toggles root node expansion when root row is clicked', () => {
    const rootTree: TreeItem[] = [
      {
        id: 'root-1',
        label: 'Mercenary Commands',
        type: 'ROOT',
        initiallyExpanded: true,
        children: [{ id: 'cmd-1', label: "Eridani Light Horse", type: 'COMMAND' }],
      },
    ]
    render(<NavigationTree data={rootTree} onSelect={() => {}} />)
    expect(screen.getByText('Eridani Light Horse')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Mercenary Commands'))
    expect(screen.queryByText('Eridani Light Horse')).toBeNull()
    fireEvent.click(screen.getByText('Mercenary Commands'))
    expect(screen.getByText('Eridani Light Horse')).toBeInTheDocument()
  })

  it('renders tactical count badges for root sections and commands with children', () => {
    render(<NavigationTree data={tree} onSelect={() => {}} />)
    expect(screen.getByLabelText('1 items')).toBeInTheDocument()
    expect(screen.getByLabelText('2 items')).toBeInTheDocument()
  })

  it('includes proper WAI-ARIA tree roles and attributes', () => {
    render(<NavigationTree data={tree} onSelect={() => {}} selectedId="det-1" />)
    expect(screen.getByRole('tree')).toBeInTheDocument()
    const items = screen.getAllByRole('treeitem')
    expect(items.length).toBeGreaterThan(0)
    const selectedItem = screen.getByText('Alpha Lance').closest('[role="treeitem"]')
    expect(selectedItem).toHaveAttribute('aria-selected', 'true')
  })

  it('supports keyboard navigation via ArrowDown, ArrowUp, ArrowRight, ArrowLeft, and Enter', () => {
    const onSelect = vi.fn()
    render(<NavigationTree data={tree} onSelect={onSelect} />)
    const firstItem = screen.getByText('My Commands').closest('[role="treeitem"]') as HTMLElement
    firstItem.focus()

    // ArrowDown should move focus to Wolf's Dragoons
    fireEvent.keyDown(firstItem, { key: 'ArrowDown' })
    const cmdItem = screen.getByText("Wolf's Dragoons").closest('[role="treeitem"]') as HTMLElement
    expect(document.activeElement).toBe(cmdItem)

    // ArrowLeft on open command collapses it
    fireEvent.keyDown(cmdItem, { key: 'ArrowLeft' })
    expect(screen.queryByText('Alpha Lance')).toBeNull()

    // ArrowRight expands it back
    fireEvent.keyDown(cmdItem, { key: 'ArrowRight' })
    expect(screen.getByText('Alpha Lance')).toBeInTheDocument()

    // Enter triggers selection
    fireEvent.keyDown(cmdItem, { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'cmd-1', type: 'COMMAND' }),
    )
  })
})
