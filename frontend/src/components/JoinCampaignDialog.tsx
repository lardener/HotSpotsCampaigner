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
import React, { useState, useMemo } from 'react'
import { useMutation } from '@apollo/client/react'
import { TerminalOverlay } from './TerminalOverlay'
import { AutoJoinCampaignDocument } from '../types/operations'
import { AutoJoinCampaignMutation } from '../types/operations'
import { Detachment } from '../types/generated'

interface JoinCampaignDialogProps {
  campaignId: string
  campaignName: string
  systemName: string | null
  onClose: () => void
  onSuccess: () => void
  userCommands:
    | Array<{
        detachments?: Detachment[] | null
      } | null>
    | undefined
}

export const JoinCampaignDialog: React.FC<JoinCampaignDialogProps> = ({
  campaignId,
  campaignName,
  systemName,
  onClose,
  onSuccess,
  userCommands,
}) => {
  const [selectedDetachmentId, setSelectedDetachmentId] = useState<string>('')
  const [selectedDetachmentName, setSelectedDetachmentName] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [joining, setJoining] = useState(false)

  const [autoJoin] = useMutation<AutoJoinCampaignMutation>(AutoJoinCampaignDocument)

  // Flatten all detachments from all commands
  const availableDetachments = useMemo(() => {
    if (!userCommands) return []
    const all: Detachment[] = []
    for (const cmd of userCommands) {
      if (cmd?.detachments) {
        for (const det of cmd.detachments) {
          if (det) all.push(det)
        }
      }
    }
    return all
  }, [userCommands])

  const handleDeploy = async () => {
    if (!selectedDetachmentId) return

    // Check if detachment is already in this campaign
    const selectedDet = availableDetachments.find((d) => d.id === selectedDetachmentId)
    if (selectedDet?.campaignId === campaignId) {
      setError('THIS DETACHMENT IS ALREADY DEPLOYED TO THIS THEATER.')
      return
    }

    setJoining(true)
    setError(null)
    try {
      const result = await autoJoin({
        variables: { campaignId, detachmentId: selectedDetachmentId },
      })
      if (result.data?.autoJoinCampaign) {
        onSuccess()
      } else {
        setError('DEPLOYMENT FAILED. SERVER RETURNED NULL.')
      }
    } catch (err: any) {
      const msg = err?.message || 'DEPLOYMENT SEQUENCE FAILED'
      setError(msg.replace('GRAPHQL ERROR:', '').trim())
    } finally {
      setJoining(false)
    }
  }

  const handleCancel = async () => {
    onClose()
  }

  const handleSelectDetachment = (detId: string) => {
    setSelectedDetachmentId(detId)
    const det = availableDetachments.find((d) => d.id === detId)
    setSelectedDetachmentName(det?.name || '')
  }

  return (
    <TerminalOverlay
      title="DEPLOY TO THEATER"
      message={`SELECT A DETACHMENT TO DEPLOY TO ${campaignName.toUpperCase()}`}
      onConfirm={handleDeploy}
      onCancel={handleCancel}
      cancelLabel="CANCEL"
      confirmLabel={joining ? 'DEPLOYING...' : 'DEPLOY'}
      themeClass="theme-green"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* Campaign Info */}
        <div
          style={{
            padding: '10px 15px',
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: '4px',
            border: '1px solid var(--terminal-border)',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: 'var(--accent-dim)', marginBottom: '5px' }}>
            OPERATIONAL ZONE
          </div>
          <div style={{ color: 'var(--terminal-green)' }}>{campaignName}</div>
          {systemName && (
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-dim)' }}>
              SYSTEM: {systemName.toUpperCase()}
            </div>
          )}
        </div>

        {/* Detachment Selector */}
        <div>
          <label
            className="restricted-text"
            style={{
              fontSize: '0.7rem',
              color: 'var(--terminal-amber)',
              display: 'block',
              marginBottom: '8px',
            }}
          >
            SELECT UNIT TO DEPLOY
          </label>
          {!availableDetachments.length ? (
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-dim)' }}>
              NO DETACHMENTS AVAILABLE. CREATE A DETACHMENT IN YOUR COMMAND FIRST.
            </div>
          ) : (
            <select
              className="table-input"
              value={selectedDetachmentId}
              onChange={(e) => handleSelectDetachment(e.target.value)}
              style={{ width: '100%', padding: '10px', backgroundColor: 'rgba(0,0,0,0.3)' }}
            >
              <option value="">-- SELECT DETACHMENT --</option>
              {availableDetachments.map((det) => (
                <option key={det.id} value={det.id}>
                  {det.name}
                  {det.campaignId ? ` [CAMPAIGN: ${det.campaignId.substring(0, 8)}]` : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Selected Detachment Summary */}
        {selectedDetachmentId && (
          <div
            style={{
              padding: '10px 15px',
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '4px',
              border: '1px solid var(--terminal-border)',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-dim)', marginBottom: '5px' }}>
              DEPLOYING
            </div>
            <div style={{ color: 'var(--terminal-green)' }}>
              {selectedDetachmentName || selectedDetachmentId}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-dim)', marginTop: '5px' }}>
              {availableDetachments.find((d) => d.id === selectedDetachmentId)?.campaignId
                ? 'WARNING: THIS DETACHMENT IS CURRENTLY ASSIGNED TO ANOTHER THEATER. IT WILL BE REASSIGNED.'
                : 'READY FOR DEPLOYMENT'}
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div
            style={{
              padding: '10px 15px',
              backgroundColor: 'rgba(255,50,50,0.1)',
              borderRadius: '4px',
              border: '1px solid rgba(255,50,50,0.3)',
              color: 'var(--terminal-red)',
              fontSize: '0.8rem',
            }}
          >
            {error}
          </div>
        )}
      </div>
    </TerminalOverlay>
  )
}
