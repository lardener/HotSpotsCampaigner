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
import React, { useState, useEffect, useRef, useMemo } from 'react'
import './navigation-tree.css'

export type NodeType = 'ROOT' | 'DEPLOYMENT' | 'COMMAND' | 'DETACHMENT' | 'CAMPAIGN' | 'INTEL'

export interface TreeItemMetadata {
  detachmentId?: string
  commandId?: string | null
  campaignId?: string | null
  managerView?: boolean
}

export interface TreeItem {
  id: string
  label: string
  type: NodeType
  children?: TreeItem[]
  initiallyExpanded?: boolean
  metadata?: TreeItemMetadata
}

export const hasSelectedDescendant = (item: TreeItem, selectedId?: string): boolean => {
  if (!selectedId || !item.children || item.children.length === 0) return false
  return item.children.some(
    (child) => child.id === selectedId || hasSelectedDescendant(child, selectedId),
  )
}

export const isIdInTree = (items: TreeItem[], id?: string): boolean => {
  if (!id) return false
  return items.some(
    (item) => item.id === id || (item.children ? isIdInTree(item.children, id) : false),
  )
}

const getNodeIcon = (type: NodeType) => {
  switch (type) {
    case 'DEPLOYMENT':
      return (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      )
    case 'COMMAND':
      return (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      )
    case 'DETACHMENT':
      return (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="7 7 12 12 7 17" />
          <polyline points="13 7 18 12 13 17" />
        </svg>
      )
    case 'CAMPAIGN':
      return (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      )
    case 'INTEL':
      return (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
    default:
      return <span className="node-dot" />
  }
}

interface TreeNodeProps {
  item: TreeItem
  level: number
  onSelect: (item: TreeItem) => void
  selectedId?: string
  isFirstItem?: boolean
  hasAnySelected?: boolean
}

const focusAdjacentNode = (currentEl: HTMLElement, direction: 1 | -1) => {
  const treeRoot = currentEl.closest('[role="tree"]')
  if (!treeRoot) return
  const visibleNodes = Array.from(treeRoot.querySelectorAll<HTMLElement>('[role="treeitem"]'))
  const currentIndex = visibleNodes.indexOf(currentEl)
  if (currentIndex === -1) return
  const targetIndex = currentIndex + direction
  if (targetIndex >= 0 && targetIndex < visibleNodes.length) {
    visibleNodes[targetIndex].focus()
  }
}

const TreeNode: React.FC<TreeNodeProps> = ({
  item,
  level,
  onSelect,
  selectedId,
  isFirstItem = false,
  hasAnySelected = false,
}) => {
  const [isOpen, setIsOpen] = useState(item.initiallyExpanded ?? false)
  const hasChildren = Boolean(item.children && item.children.length > 0)
  const isSelected = selectedId === item.id
  const isRoot = item.type === 'ROOT'
  const isFocusable = isSelected || (!hasAnySelected && isFirstItem)

  const prevInitiallyExpandedRef = useRef(item.initiallyExpanded)
  useEffect(() => {
    if (item.initiallyExpanded !== prevInitiallyExpandedRef.current) {
      prevInitiallyExpandedRef.current = item.initiallyExpanded
      if (item.initiallyExpanded !== undefined) {
        setIsOpen(item.initiallyExpanded)
      }
    }
  }, [item.initiallyExpanded])

  useEffect(() => {
    if (selectedId && hasSelectedDescendant(item, selectedId)) {
      setIsOpen(true)
    }
  }, [selectedId, item])

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen((prev) => !prev)
  }

  const handleNodeClick = () => {
    onSelect(item)
    if (isRoot && hasChildren) {
      setIsOpen((prev) => !prev)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return

    switch (e.key) {
      case 'Enter':
      case ' ': {
        e.preventDefault()
        handleNodeClick()
        break
      }
      case 'ArrowRight': {
        e.preventDefault()
        if (hasChildren) {
          if (!isOpen) {
            setIsOpen(true)
          } else {
            const nextNode = e.currentTarget.parentElement?.querySelector(
              '.children-container > .tree-node-wrapper > .tree-node',
            ) as HTMLElement | null
            nextNode?.focus()
          }
        }
        break
      }
      case 'ArrowLeft': {
        e.preventDefault()
        if (hasChildren && isOpen) {
          setIsOpen(false)
        } else {
          const parentWrapper = e.currentTarget
            .closest('.children-container')
            ?.closest('.tree-node-wrapper')
          const parentNode = parentWrapper?.querySelector(
            ':scope > .tree-node',
          ) as HTMLElement | null
          parentNode?.focus()
        }
        break
      }
      case 'ArrowDown': {
        e.preventDefault()
        focusAdjacentNode(e.currentTarget, 1)
        break
      }
      case 'ArrowUp': {
        e.preventDefault()
        focusAdjacentNode(e.currentTarget, -1)
        break
      }
      case 'Home': {
        e.preventDefault()
        const treeRoot = e.currentTarget.closest('[role="tree"]')
        const firstNode = treeRoot?.querySelector('[role="treeitem"]') as HTMLElement | null
        firstNode?.focus()
        break
      }
      case 'End': {
        e.preventDefault()
        const treeRoot = e.currentTarget.closest('[role="tree"]')
        const allNodes = treeRoot?.querySelectorAll<HTMLElement>('[role="treeitem"]')
        if (allNodes && allNodes.length > 0) {
          allNodes[allNodes.length - 1]?.focus()
        }
        break
      }
    }
  }

  const childCount = item.children?.length ?? 0
  const showBadge =
    (isRoot && item.children !== undefined) ||
    ((item.type === 'COMMAND' || item.type === 'CAMPAIGN') && childCount > 0)

  return (
    <div className="tree-node-wrapper">
      <div
        role="treeitem"
        aria-expanded={hasChildren ? isOpen : undefined}
        aria-selected={isSelected}
        aria-level={level + 1}
        tabIndex={isFocusable ? 0 : -1}
        className={`tree-node ${isSelected ? 'selected' : ''} ${isRoot ? 'root-node' : ''}`}
        onClick={handleNodeClick}
        onKeyDown={handleKeyDown}
        title={item.label}
      >
        {hasChildren ? (
          <span className={`toggle-arrow ${isOpen ? 'open' : ''}`} onClick={handleToggle}>
            ▶
          </span>
        ) : (
          <span className="toggle-spacer" />
        )}
        {!isRoot && <span className="node-icon">{getNodeIcon(item.type)}</span>}
        <span className={`label type-${item.type.toLowerCase()}`}>{item.label}</span>
        {showBadge && (
          <span className="node-badge" aria-label={`${childCount} items`}>
            [{childCount}]
          </span>
        )}
      </div>
      {hasChildren && isOpen && (
        <div role="group" className="children-container">
          {item.children!.map((child) => (
            <TreeNode
              key={child.id}
              item={child}
              level={level + 1}
              onSelect={onSelect}
              selectedId={selectedId}
              isFirstItem={false}
              hasAnySelected={hasAnySelected}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export const NavigationTree: React.FC<{
  data: TreeItem[]
  onSelect: (item: TreeItem) => void
  selectedId?: string
}> = ({ data, onSelect, selectedId }) => {
  const hasAnySelected = useMemo(() => isIdInTree(data, selectedId), [data, selectedId])

  return (
    <div
      role="tree"
      aria-label="Tactical Navigation Tree"
      className="navigation-tree"
      style={{ padding: '0 10px' }}
    >
      {data.map((item, index) => (
        <TreeNode
          key={item.id}
          item={item}
          level={0}
          onSelect={onSelect}
          selectedId={selectedId}
          isFirstItem={index === 0}
          hasAnySelected={hasAnySelected}
        />
      ))}
    </div>
  )
}
