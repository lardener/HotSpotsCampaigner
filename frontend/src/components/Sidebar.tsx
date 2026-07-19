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
import { NavigationTree, TreeItem } from './NavigationTree'
import '../styles/Sidebar.css'

interface SidebarProps {
  treeData: TreeItem[]
  onSelect: (item: TreeItem) => void
  selectedId?: string
  user: { name: string; id: string; role?: string; displayName?: string | null } | null
  onLogout: () => void
  syncing: boolean
  onManualRefresh: () => void
  isEditingName: boolean
  setIsEditingName: (val: boolean) => void
  editName: string
  setEditName: (val: string) => void
  onNameUpdate: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  treeData,
  onSelect,
  selectedId,
  user,
  onLogout,
  syncing,
  onManualRefresh,
  isEditingName,
  setIsEditingName,
  editName,
  setEditName,
  onNameUpdate,
  isCollapsed,
  onToggleCollapse,
}) => {
  return (
    <aside
      className="sidebar-container"
      style={{
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        height: '100vh',
        width: isCollapsed ? '60px' : '280px',
        borderRight: '1px solid var(--terminal-border)',
        transition: 'width 0.3s ease',
      }}
    >
      <div
        className="sidebar-header-main"
        style={{
          padding: isCollapsed ? '10px 5px' : '20px',
          borderBottom: '1px solid var(--terminal-border)',
          position: 'relative',
        }}
      >
        <button
          type="button"
          className="mode-btn theme-amber"
          style={{
            position: 'absolute',
            right: isCollapsed ? '50%' : '10px',
            top: '10px',
            transform: isCollapsed ? 'translateX(50%)' : 'none',
            padding: '2px 6px',
            fontSize: '0.8rem',
            zIndex: 10,
            minWidth: 'auto',
          }}
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? '▶' : '◀'}
        </button>
        {!isCollapsed && (
          <>
            <div className="flex-center mb-5">
              <svg width="24" height="24" viewBox="0 0 100 100" className="sidebar-icon-svg">
                <polygon
                  points="50,10 85,30 85,70 50,90 15,70 15,30"
                  fill="none"
                  stroke="var(--terminal-amber)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="18"
                  fill="none"
                  stroke="var(--terminal-amber)"
                  strokeWidth="4"
                />
                <path
                  d="M50 20 L50 80 M20 50 L80 50"
                  stroke="var(--terminal-amber)"
                  strokeWidth="4"
                />
              </svg>
              <span className="sidebar-logo-text">HSC-TACTICAL</span>
            </div>
            <div className="restricted-text sidebar-subtitle" style={{ textAlign: 'center' }}>
              COMMAND & CONTROL INTERFACE
            </div>
            <div
              style={{
                borderBottom: '1px solid var(--terminal-border)',
                opacity: 0.3,
                marginTop: '8px',
              }}
            />
            <div
              className="flex items-center mt-5"
              style={{ gap: '10px', height: '20px', justifyContent: 'center' }}
            >
              {syncing ? (
                <span
                  className="pulse"
                  style={{
                    fontSize: '0.6rem',
                    color: 'var(--terminal-amber)',
                    border: '1px solid var(--terminal-amber)',
                    padding: '0 4px',
                  }}
                  title="Synchronizing mercenary registry, campaign theater data, and active tactical updates."
                >
                  SYNCING
                </span>
              ) : (
                <button
                  type="button"
                  className="mode-btn theme-amber"
                  style={{ padding: '0 4px', fontSize: '0.6rem', height: '18px' }}
                  onClick={onManualRefresh}
                  title="Manual synchronization of all active tactical data"
                >
                  RESYNC
                </button>
              )}
            </div>
          </>
        )}
        {isCollapsed && (
          <div className="flex-center mt-20">
            <svg width="24" height="24" viewBox="0 0 100 100" className="sidebar-icon-svg">
              <polygon
                points="50,10 85,30 85,70 50,90 15,70 15,30"
                fill="none"
                stroke="var(--terminal-amber)"
                strokeWidth="8"
              />
            </svg>
          </div>
        )}
      </div>
      <div
        className="sidebar-content-scroll"
        style={{ overflowY: 'auto', padding: '10px 0', display: isCollapsed ? 'none' : 'block' }}
      >
        <NavigationTree data={treeData} onSelect={onSelect} selectedId={selectedId} />
      </div>
      <div
        className="sidebar-footer-main"
        style={{
          padding: isCollapsed ? '10px 5px' : '20px',
          borderTop: '1px solid var(--terminal-border)',
          backgroundColor: 'rgba(0,0,0,0.3)',
          textAlign: isCollapsed ? 'center' : 'left',
        }}
      >
        {!isCollapsed ? (
          <>
            <div className="user-profile-mini sidebar-user-info">
              👤{' '}
              {isEditingName ? (
                <div
                  className="status-bar theme-amber"
                  style={{ display: 'inline-flex', padding: '0 5px', alignItems: 'center' }}
                >
                  <input
                    className="table-input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={onNameUpdate}
                    onKeyDown={(e) => e.key === 'Enter' && onNameUpdate()}
                    autoFocus
                    style={{ fontSize: '0.8rem', padding: '2px', width: '150px', border: 'none' }}
                    title="Enter to save, click away to cancel"
                  />
                </div>
              ) : (
                <span
                  onClick={() => setIsEditingName(true)}
                  style={{ cursor: 'pointer' }}
                  title="Click to set callsign"
                >
                  {user?.displayName || user?.name || 'Commander'}
                </span>
              )}
            </div>
            <button
              type="button"
              className="mode-btn logout-btn sidebar-logout-btn"
              onClick={onLogout}
              title="Disconnect from the system"
            >
              DISCONNECT NEURAL LINK
            </button>
          </>
        ) : (
          <span
            onClick={onToggleCollapse}
            style={{ cursor: 'pointer' }}
            title={user?.displayName || user?.name || 'Commander'}
          >
            👤
          </span>
        )}
      </div>
    </aside>
  )
}
