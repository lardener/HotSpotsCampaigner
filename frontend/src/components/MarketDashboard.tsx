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
import React, { useState, lazy, Suspense } from 'react'
import { MarketBackground } from './MarketBackground'
import { ScrapperDrawButton } from './ScrapperDrawButton'
import { TerminalOverlay } from './TerminalOverlay'

// Code-split the heavy market rendering view.
const MarketView = lazy(() => import('./MarketView').then((m) => ({ default: m.MarketView })))

export type MarketType = 'FREE' | 'PRIMARY_EMPLOYER' | 'OPPOSITION_EMPLOYER' | 'SCRAPPERS'

import { MercenaryCommand } from '../types/generated'

interface MarketDashboardProps {
  campaignId: string
  onClose: () => void
  onRefresh?: () => Promise<any>
  campaign: any
  setOverlay: (overlay: any) => void
  userCommands?: MercenaryCommand[]
}

export const MarketDashboard: React.FC<MarketDashboardProps> = ({
  campaignId,
  onClose,
  campaign,
  setOverlay,
  userCommands,
}) => {
  const [activeTab, setActiveTab] = useState<MarketType>('FREE')

  const primaryEmployer: string | undefined = campaign?.primaryEmployer
  const secondaryEmployer: string | undefined = campaign?.secondaryEmployer

  return (
    <TerminalOverlay title="[ THEATER MARKET ]" message="" onConfirm={() => {}} onCancel={onClose}>
      <MarketBackground />
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div
          className="market-container"
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            padding: '20px',
            color: 'var(--terminal-amber)',
            fontFamily: 'monospace',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            className="market-tabs"
            style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '20px',
              borderBottom: '1px solid var(--terminal-amber)',
              paddingBottom: '10px',
              flexWrap: 'wrap',
            }}
          >
            <button
              className={`mode-btn ${activeTab === 'FREE' ? 'theme-amber' : ''}`}
              onClick={() => setActiveTab('FREE')}
              style={{ fontSize: '0.8rem' }}
            >
              [ FREE MARKET ]
            </button>

            {primaryEmployer && (
              <button
                className={`mode-btn ${activeTab === 'PRIMARY_EMPLOYER' ? 'theme-amber' : ''}`}
                onClick={() => setActiveTab('PRIMARY_EMPLOYER')}
                style={{ fontSize: '0.8rem' }}
              >
                [ {primaryEmployer.toUpperCase()} ]
              </button>
            )}

            {secondaryEmployer && (
              <button
                className={`mode-btn ${activeTab === 'OPPOSITION_EMPLOYER' ? 'theme-amber' : ''}`}
                onClick={() => setActiveTab('OPPOSITION_EMPLOYER')}
                style={{ fontSize: '0.8rem' }}
              >
                [ {secondaryEmployer.toUpperCase()} ]
              </button>
            )}

            <button
              className={`mode-btn ${activeTab === 'SCRAPPERS' ? 'theme-amber' : ''}`}
              onClick={() => setActiveTab('SCRAPPERS')}
              style={{ fontSize: '0.8rem' }}
            >
              [ SCRAPPERS' YARD ]
            </button>
          </div>

          <Suspense fallback={<div className="loading-intel">LOADING MARKET DATA...</div>}>
            <div
              className="market-content"
              style={{ flex: 1, overflowY: 'auto', position: 'relative' }}
            >
              <div style={{ display: activeTab === 'FREE' ? 'block' : 'none' }}>
                <MarketView
                  campaignId={campaignId}
                  marketType="FREE"
                  campaign={campaign}
                  setOverlay={setOverlay}
                  userCommands={userCommands}
                />
              </div>

              {primaryEmployer && (
                <div style={{ display: activeTab === 'PRIMARY_EMPLOYER' ? 'block' : 'none' }}>
                  <MarketView
                    campaignId={campaignId}
                    marketType="PRIMARY_EMPLOYER"
                    campaign={campaign}
                    setOverlay={setOverlay}
                    userCommands={userCommands}
                  />
                </div>
              )}

              {secondaryEmployer && (
                <div style={{ display: activeTab === 'OPPOSITION_EMPLOYER' ? 'block' : 'none' }}>
                  <MarketView
                    campaignId={campaignId}
                    marketType="OPPOSITION_EMPLOYER"
                    campaign={campaign}
                    setOverlay={setOverlay}
                    userCommands={userCommands}
                  />
                </div>
              )}

              <div style={{ display: activeTab === 'SCRAPPERS' ? 'block' : 'none' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    gap: '20px',
                  }}
                >
                  <MarketView
                    campaignId={campaignId}
                    marketType="SCRAPPERS"
                    campaign={campaign}
                    setOverlay={setOverlay}
                    userCommands={userCommands}
                  />
                  <ScrapperDrawButton
                    campaignId={campaignId}
                    campaign={campaign}
                    setOverlay={setOverlay}
                  />
                </div>
              </div>
            </div>
          </Suspense>
        </div>
      </div>
    </TerminalOverlay>
  )
}
