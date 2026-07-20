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
import React, { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { gql } from '@apollo/client'

const GENERATE_UNIT_LINK_MUTATION = gql`
  mutation GenerateUnitMarketLink($url: String!) {
    generateUnitMarketLink(url: $url)
  }
`

const GENERATE_RANDOM_PILOT_LINK_MUTATION = gql`
  mutation GenerateRandomPilotLink($campaignId: ID!, $weightClass: String!) {
    generateRandomPilotLink(campaignId: $campaignId, weightClass: $weightClass)
  }
`

interface MarketLinkGeneratorProps {
  campaignId: string
}

interface GenerateUnitLinkData {
  generateUnitMarketLink: string
}

interface GenerateRandomPilotLinkData {
  generateRandomPilotLink: string
}

export const MarketLinkGenerator: React.FC<MarketLinkGeneratorProps> = ({ campaignId }) => {
  const [unitUrl, setUnitUrl] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [weightClass, setWeightClass] = useState('Medium')

  const [genUnitLink] = useMutation<GenerateUnitLinkData>(GENERATE_UNIT_LINK_MUTATION)
  const [genRandomPilotLink] = useMutation<GenerateRandomPilotLinkData>(
    GENERATE_RANDOM_PILOT_LINK_MUTATION,
  )

  const handleGenerateUnitLink = async () => {
    try {
      const { data } = await genUnitLink({ variables: { url: unitUrl } })
      if (data?.generateUnitMarketLink) {
        setGeneratedLink(data.generateUnitMarketLink)
      }
    } catch (e) {
      console.error('Error generating unit link:', e)
    }
  }

  const handleGenerateRandomPilot = async () => {
    try {
      const { data } = await genRandomPilotLink({ variables: { campaignId, weightClass } })
      if (data?.generateRandomPilotLink) {
        setGeneratedLink(data.generateRandomPilotLink)
      }
    } catch (e) {
      console.error('Error generating random pilot link:', e)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink)
  }

  return (
    <div
      className="market-link-generator"
      style={{
        marginTop: '20px',
        padding: '15px',
        border: '1px solid var(--terminal-amber)',
        backgroundColor: 'rgba(0,0,0,0.4)',
        color: 'var(--terminal-amber)',
        fontFamily: 'monospace',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
      }}
    >
      <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem' }}>[ LINK GENERATOR ]</h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label style={{ fontSize: '0.7rem' }}>IMPORT UNIT LINK FROM MUL/MORDEL</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={unitUrl}
            onChange={(e) => setUnitUrl(e.target.value)}
            placeholder="https://..."
            style={{
              flex: 1,
              backgroundColor: 'black',
              color: 'var(--terminal-amber)',
              border: '1px solid var(--terminal-amber)',
              padding: '5px',
            }}
          />
          <button
            className="mode-btn theme-amber"
            style={{ fontSize: '0.6rem' }}
            onClick={handleGenerateUnitLink}
          >
            [ GENERATE ]
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label style={{ fontSize: '0.7rem' }}>GENERATE RANDOM PILOT</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            value={weightClass}
            onChange={(e) => setWeightClass(e.target.value)}
            style={{
              backgroundColor: 'black',
              color: 'var(--terminal-amber)',
              border: '1px solid var(--terminal-amber)',
              padding: '5px',
            }}
          >
            <option value="Light">Light</option>
            <option value="Medium">Medium</option>
            <option value="Heavy">Heavy</option>
            <option value="Assault">Assault</option>
          </select>
          <button
            className="mode-btn theme-amber"
            style={{ fontSize: '0.6rem' }}
            onClick={handleGenerateRandomPilot}
          >
            [ GENERATE ]
          </button>
        </div>
      </div>

      {generatedLink && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            marginTop: '10px',
            borderTop: '1px solid rgba(255,255,0,0.2)',
            paddingTop: '10px',
          }}
        >
          <label style={{ fontSize: '0.7rem' }}>GENERATED LINK</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              readOnly
              value={generatedLink}
              style={{
                flex: 1,
                backgroundColor: 'black',
                color: 'var(--terminal-amber)',
                border: '1px solid var(--terminal-amber)',
                padding: '5px',
                fontSize: '0.7rem',
              }}
            />
            <button
              className="mode-btn theme-amber"
              style={{ fontSize: '0.6rem' }}
              onClick={copyToClipboard}
            >
              [ COPY ]
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
