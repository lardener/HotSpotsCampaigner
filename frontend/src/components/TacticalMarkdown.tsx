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
import React from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface TacticalMarkdownProps {
  content: string
  onAction: (url: string) => void
}

export const TacticalMarkdown: React.FC<TacticalMarkdownProps> = ({ content, onAction }) => {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      urlTransform={(url) => (url.startsWith('hsc://') ? url : url)}
      components={{
        a: ({ node, href, children, ...props }: any) => {
          // Handle custom HSC action protocol by intercepting the click
          if (href?.startsWith('hsc://')) {
            return (
              <a
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onAction(href)
                }}
                className="hsc-action-link"
                style={{
                  color: 'var(--terminal-blue)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
              >
                {children}
              </a>
            )
          }
          // Default behavior for external links, ensuring they don't trigger parent edit modes
          return (
            <a
              href={href}
              onClick={(e) => e.stopPropagation()}
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          )
        },
      }}
    >
      {content}
    </Markdown>
  )
}
