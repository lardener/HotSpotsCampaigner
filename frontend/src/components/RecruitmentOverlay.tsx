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
import React, { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client/react'
import { TerminalOverlay } from './TerminalOverlay'
import { CampaignInvite } from '../types/generated'
import {
  CreateInviteDocument as CREATE_INVITE,
  DeleteInviteDocument as DELETE_INVITE,
  CreateInviteMutation,
  CreateInviteMutationVariables,
} from '../types/operations'
import { RecruitmentBackground } from './RecruitmentBackground'

interface RecruitmentOverlayProps {
  campaignId: string
  invites: CampaignInvite[]
  onClose: () => void
  onRefresh: () => void
}

export const RecruitmentOverlay: React.FC<RecruitmentOverlayProps> = ({
  campaignId,
  invites,
  onClose,
  onRefresh,
}) => {
  const [createInvite] = useMutation<CreateInviteMutation, CreateInviteMutationVariables>(
    CREATE_INVITE,
  )
  const [deleteInvite] = useMutation(DELETE_INVITE)
  const [activeToken, setActiveToken] = useState<string | null>(null)
  const [recipientName, setRecipientName] = useState('')
  const [showNameInput, setShowNameInput] = useState(false)
  const [copied, setCopied] = useState(false)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleGenerateClick = () => {
    setShowNameInput(true)
    setActiveToken(null)
  }

  const confirmGenerate = async () => {
    if (!recipientName.trim()) return
    try {
      const { data } = await createInvite({ variables: { campaignId, recipientName } })
      if (data?.createInvite) {
        setActiveToken(data.createInvite.token ?? null)
        setCopied(false) // Reset copied state for new token
        onRefresh()
      }
      setShowNameInput(false)
      setRecipientName('')
    } catch (err) {
      console.error('Failed to generate invite:', err)
    }
  }

  const handleCopy = () => {
    if (activeToken) {
      navigator.clipboard.writeText(activeToken)
      setCopied(true)
      setTimeout(() => setCopied(false), 5000) // Reset "Copied!" message after 2 seconds
    }
  }

  const handleDelete = async (inviteId: string) => {
    try {
      await deleteInvite({ variables: { id: inviteId } })
      onRefresh()
    } catch (err) {
      console.error('Failed to delete invite:', err)
    }
  }

  return (
    <TerminalOverlay
      title="RECRUITMENT PROTOCOL"
      message="MANAGE THEATER INVITATION KEYS"
      onConfirm={onClose}
      confirmLabel="CLOSE"
      themeClass="theme-amber"
    >
      <RecruitmentBackground />
      <div className="mt-20" style={{ zIndex: 9999, minWidth: '450px', padding: '0 10px' }}>
        <p
          className="restricted-text mb-20"
          style={{ fontSize: '0.8rem', color: 'var(--terminal-amber)' }}
        >
          ISSUE AN INVITATION KEY TO ALLOW MERCENARY COMMANDS TO JOIN THIS THEATER.
        </p>

        {showNameInput ? (
          <div
            className="status-bar theme-amber mb-20"
            style={{ padding: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}
          >
            <input
              className="table-input flex-grow"
              placeholder="RECIPIENT NAME..."
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && confirmGenerate()}
            />
            <button
              className="mode-btn theme-green"
              onClick={confirmGenerate}
              style={{ padding: '2px 10px' }}
            >
              [ CONFIRM ]
            </button>
            <button
              className="mode-btn theme-red"
              onClick={() => setShowNameInput(false)}
              style={{ padding: '2px 10px' }}
            >
              [ CANCEL ]
            </button>
          </div>
        ) : (
          <div className="mb-20">
            {activeToken ? (
              <div
                className="status-bar theme-amber w-100"
                style={{ textAlign: 'center', padding: '15px' }}
              >
                <div className="xs-text opacity-70 mb-5">NEW ACCESS TOKEN GENERATED</div>
                <div
                  style={{
                    fontSize: '1.8rem',
                    letterSpacing: '2px',
                    fontWeight: 'bold',
                    color: 'var(--terminal-amber)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  {activeToken}
                  <button
                    className="mode-btn theme-amber"
                    onClick={handleCopy}
                    style={{ padding: '2px 10px', fontSize: '0.7rem' }}
                  >
                    {copied ? 'COPIED!' : 'COPY'}
                  </button>
                </div>

                <button
                  className="mode-btn mt-15 theme-amber"
                  onClick={handleGenerateClick}
                  style={{ fontSize: '0.7rem' }}
                >
                  GENERATE ANOTHER
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="mode-btn theme-amber w-100"
                style={{ padding: '10px', fontSize: '1rem' }}
                onClick={handleGenerateClick}
              >
                [ GENERATE NEW INVITE KEY ]
              </button>
            )}
          </div>
        )}

        <div
          style={{
            marginTop: '30px',
            borderTop: '1px dashed var(--accent-dim)',
            paddingTop: '20px',
          }}
        >
          <h4
            className="restricted-text mb-15"
            style={{ fontSize: '0.8rem', color: 'var(--terminal-amber)' }}
          >
            ACTIVE INVITATIONS
          </h4>
          <div style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '5px' }}>
            {invites.length === 0 ? (
              <div className="restricted-text subdued text-center p-20">
                NO ACTIVE INVITATIONS FOUND
              </div>
            ) : (
              invites.map((invite) => {
                const expiresAtDate = invite.expiresAt ? new Date(invite.expiresAt) : null
                const diff = expiresAtDate ? expiresAtDate.getTime() - now.getTime() : -1
                const isExpired = diff <= 0
                const isUsed = invite.used

                const h = Math.floor(Math.max(0, diff) / 3600000)
                const m = Math.floor((Math.max(0, diff) % 3600000) / 60000)
                const s = Math.floor((Math.max(0, diff) % 60000) / 1000)
                const countdownStr = `T-MINUS ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`

                return (
                  <div
                    key={invite.id}
                    className="status-bar mb-10"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      opacity: isUsed || isExpired ? 0.5 : 1,
                      textDecoration: isUsed || isExpired ? 'line-through' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--terminal-amber)' }}>
                        {invite.recipientName || 'ANONYMOUS'}
                      </span>
                      <span className="xs-text" style={{ fontFamily: 'monospace' }}>
                        TOKEN: {invite.token} {isUsed && '(USED)'}{' '}
                        {isExpired ? '(EXPIRED)' : countdownStr}
                      </span>
                    </div>
                    <button
                      className="mode-btn theme-red sm-text"
                      style={{ padding: '2px 8px', color: 'var(--terminal-alert)' }}
                      onClick={() => handleDelete(invite.id)}
                    >
                      [ DELETE ]
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
      <style>{`
                .status-bar input.table-input {
                    background: transparent !important;
                    color: inherit !important;
                    outline: none !important;
                    border: none !important;
                    box-shadow: none !important;
                }
            `}</style>
    </TerminalOverlay>
  )
}
