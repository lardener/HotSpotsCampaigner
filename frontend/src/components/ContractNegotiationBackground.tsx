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
import React, { useMemo, useRef, useState, useEffect } from 'react'

export const ContractNegotiationBackground: React.FC = () => {
  const intercepts = useMemo(() => {
    const baseList = [
      '[CONTRACT] CLAN WOLF :: SALVAGE DIVISION PENDING FINAL APPROVAL. EMPLOYER TERMS UNDER REVIEW.',
      '[COMMS] DRAGOON REGULARS :: NEGOTIATION PROTOCOL INITIATED. AWAITING FACTION CREDENTIALS.',
      '[INTEL] MERCEX :: STANDARD CONTRACT RATE ADJUSTMENT EFFECTIVE NEXT QUARTER.',
      '[DATA] CONTRACT_DB :: TERMS OF ENGAGEMENT UPDATED. SALVAGE RIGHTS NOW GOVERNED BY ARTICLE 7.',
      '[SIGINT] - 3061.04.17 - FACTION ALLIANCE BROKEN. NEW CONTRACT RATES EFFECTIVE IMMEDIATELY.',
      '[COMM] LEGAL AFFAIRS :: CONTRACT AMENDMENT FILED. Awaiting Employer Response.',
      '[DATA] CONTRACT_REGISTRY :: DETACHMENT CONTRACT STATUS: PENDING SIGNATURE.',
      '[SIGNAL] FROM: CONTRACT_OFFICER TO: COMMAND :: TERMS NEGOTIATED. AWAITING FINAL APPROVAL.',
      '[COMM] FACTION_LIAISON :: NEW CONTRACT OFFER RECEIVED. TERMS: PAY 85%, SALVAGE 60%.',
      '[DATA] NEGOTIATION_LOG :: EMPLOYER REQUESTS MODIFICATION TO COMMAND STRUCTURE CLAUSES.',
      '[SIGINT] - 3062.08.22 - SECRET CONTRACT TERMS DISCOVERED DURING POST-MISSION AUDIT.',
      '[COMM] PROCUREMENT :: CONTRACT FOR SUPPLIES EXTENDED. TRANSPORT TERMS NEGOTIATED.',
      '[DATA] CONTRACT_REGISTRY :: DETACHMENT CONTRACT EXPIRED. RENEWAL PENDING.',
      '[SIGNAL] FROM: NEGOTIATOR TO: FACTION :: COUNTER-OFFER SUBMITTED. AWAITING RESPONSE.',
      '[COMM] LEGAL AFFAIRS :: CONTRACT DISPUTE RESOLVED. TERMS ENFORCED.',
      '[DATA] FACTION_INTEL :: EMPLOYER PREFERENCE: LONG-TERM CONTRACTS ONLY.',
      '[SIGINT] - 3063.01.05 - CONTRACT SABOTAGE ATTEMPTED. SUSPECTED INTERNAL AGENT.',
      '[COMM] MERCEX :: STANDARD CONTRACT TEMPLATES UPDATED. NEW TERMS EFFECTIVE.',
      '[DATA] NEGOTIATION_LOG :: CONTRACT AMENDMENT FILED. TERMS UNDER REVIEW.',
      '[SIGNAL] FROM: FACTION_REP TO: CONTRACT_OFFICER :: COUNTER-OFFER RECEIVED.',
      '[COMM] LEGAL AFFAIRS :: CONTRACT DISPUTE PENDING RESOLUTION.',
      '[DATA] FACTION_INTEL :: EMPLOYER PREFERENCE: SHORT-TERM CONTRACTS ONLY.',
      '[SIGINT] - 3064.05.30 - CONTRACT TERMS CLASSIFIED. AUTHORIZATION REQUIRED.',
      '[COMM] PROCUREMENT :: CONTRACT FOR AMMUNITION EXTENDED. TRANSPORT TERMS NEGOTIATED.',
      '[DATA] CONTRACT_REGISTRY :: DETACHMENT CONTRACT RENEWED. NEW TERMS EFFECTIVE.',
      '[SIGNAL] FROM: NEGOTIATOR TO: FACTION :: TERMS NEGOTIATED. AWAITING SIGNATURE.',
      '[COMM] LEGAL AFFAIRS :: CONTRACT DISPUTE RESOLVED. TERMS ENFORCED.',
      '[DATA] FACTION_INTEL :: EMPLOYER PREFERENCE: BALANCED CONTRACTS.',
      '[SIGINT] - 3065.09.14 - CONTRACT TERMS CLASSIFIED. AUTHORIZATION REQUIRED.',
      '[COMM] MERCEX :: STANDARD CONTRACT TEMPLATES UPDATED. NEW TERMS EFFECTIVE.',
      '[DATA] NEGOTIATION_LOG :: CONTRACT AMENDMENT FILED. TERMS UNDER REVIEW.',
      '[SIGNAL] FROM: FACTION_REP TO: CONTRACT_OFFICER :: COUNTER-OFFER RECEIVED.',
      '[COMM] LEGAL AFFAIRS :: CONTRACT DISPUTE PENDING RESOLUTION.',
      '[DATA] FACTION_INTEL :: EMPLOYER PREFERENCE: LONG-TERM CONTRACTS ONLY.',
    ]
    return [...baseList].sort(() => Math.random() - 0.5)
  }, [])

  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollDuration, setScrollDuration] = useState(80)

  useEffect(() => {
    if (scrollRef.current) {
      const distanceToTravel = scrollRef.current.scrollHeight / 2
      setScrollDuration(distanceToTravel / 20)
    }
  }, [intercepts])

  return (
    <div
      className="contract-negotiation-background-overlay"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: -1,
        borderRadius: 'inherit',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      <div
        className="contract-negotiation-background"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: "url('/contract_negotiations.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3,
        }}
      />
      <div
        className="negotiation-scroll"
        ref={scrollRef}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          width: '500px',
          fontFamily: 'monospace',
          fontSize: '0.65rem',
          color: 'var(--terminal-amber)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          animation: `scroll-negotiation ${scrollDuration}s linear infinite`,
          whiteSpace: 'normal',
          textTransform: 'uppercase',
          opacity: 0.12,
          maskImage: 'linear-gradient(to bottom, black, transparent)',
        }}
      >
        {[...intercepts, ...intercepts].map((text, i) => (
          <div
            key={i}
            className="negotiation-line"
            style={{ paddingLeft: '1.5rem', textIndent: '-1.5rem' }}
          >
            {text}
          </div>
        ))}
      </div>
      <style>{`
                @keyframes scroll-negotiation {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-50%); }
                }
            `}</style>
    </div>
  )
}
