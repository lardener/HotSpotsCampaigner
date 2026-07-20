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
import { TacticalMarkdown } from '../components/TacticalMarkdown'

describe('TacticalMarkdown', () => {
    it('renders markdown content as HTML', () => {
        render(<TacticalMarkdown content={'# Heading\n\nsome **bold** text'} onAction={() => { }} />)
        expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
        expect(screen.getByText(/some/)).toBeTruthy()
    })

    it('renders tables via remark-gfm', () => {
        const md = '| A | B |\n| --- | --- |\n| 1 | 2 |'
        render(<TacticalMarkdown content={md} onAction={() => { }} />)
        const table = document.querySelector('table')
        expect(table).toBeTruthy()
        expect(table?.textContent).toContain('A')
        expect(table?.textContent).toContain('1')
    })

    it('intercepts hsc:// links and calls onAction with the url', () => {
        const onAction = vi.fn()
        render(
            <TacticalMarkdown
                content={'[Procure](hsc://market/procure?model=Atlas)'}
                onAction={onAction}
            />,
        )
        const link = screen.getByText('Procure')
        expect(link).toHaveClass('hsc-action-link')
        fireEvent.click(link)
        expect(onAction).toHaveBeenCalledWith('hsc://market/procure?model=Atlas')
    })

    it('does not trigger onAction for external links', () => {
        const onAction = vi.fn()
        render(
            <TacticalMarkdown content={'[External](https://example.com)'} onAction={onAction} />,
        )
        const link = screen.getByText('External')
        expect(link).not.toHaveClass('hsc-action-link')
        expect(link.getAttribute('target')).toBe('_blank')
        fireEvent.click(link)
        expect(onAction).not.toHaveBeenCalled()
    })

    it('renders plain text without links', () => {
        render(<TacticalMarkdown content={'Just some plain intel.'} onAction={() => { }} />)
        expect(screen.getByText(/Just some plain intel/)).toBeTruthy()
    })
})
