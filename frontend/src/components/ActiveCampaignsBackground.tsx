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

export const ActiveCampaignsBackground: React.FC = () => {
  const intercepts = useMemo(() => {
    const baseList = [
      '[SIGINT] - 3050.05.22 - CLAN GHOST BEAR SIGNATURES AT ALSHAIN',
      '[INTERCEPT] - 3051.11.15 - MRBC NOTICE: MISERY CONTRACT TERMINATED',
      '[SIGNAL] - 3052.05.20 - COMSTAR COMMUNIQUE: TUKAYYID DEFENSES HOLDING',
      '[DATA] - 3049.08.10 - DEEP PERIPHERY SIGNAL LOSS REPORTED',
      '[INTERCEPT] - 3055.03.12 - FEDCOM MOVEMENT TOWARD HESPERUS II',
      '[ENCRYPTED] - 3058.12.01 - LUTHRIEN SIGNAL INTERRUPT',
      "[COMM] - 3062.04.18 - WOLF'S DRAGOONS OUTREACH PROTOCOL ENGAGED",
      '[INTERCEPT] - 3057.04.12 - PAYMENT CONFIRMED: HOUSE KANASTA REMITTANCE RECEIVED IN FULL AND ON TIME.',
      '[INTERCEPT] - 3057.06.01 - PAYMENT DELAYED: LOCAL LORD OF ALSHAIN REFUSES TO SETTLE SALVAGE CLAIMS, CITING BUDGET CUTS.',
      '[SIGINT] - 3058.02.18 - WORDER TROOP MOVEMENTS DETECTED NEAR THE EDGE OF THE PERIPHERY.',
      '[ENCRYPTED] - 3059.10.30 - UNCLAIMED RAID ON OUTPOST DELTA: NO ACTOR IDENTIFIED, SENSOR LOGS WIPED.',
      '[DATA] - 3060.01.15 - RUMORS OF A LARGE-SCALE OPERATION TARGETING THE INNER CIRCLE HUB.',
      '[SIGINT] - 3061.05.22 - DRACONIS COMBINE DESTROYER CLASS SIGNATURES IN SECTOR 4.',
      '[INTERCEPT] - 3062.08.11 - CONTRACT BREACH: RECLAMATION NOTICE FOR UNPAID SECURITY SERVICES ON HESPERUS II.',
      '[SIGINT] - 3057.11.04 - CLAN BLOODGUARD SIGNATURES DETECTED IN THE NEBULA.',
      '[INTERCEPT] - 3058.09.20 - PAYMENT DENIED: CONTRACTOR CLAIMED EXCESSIVE COLLATERAL DAMAGE DURING ENGAGEMENT.',
      '[DATA] - 3059.03.14 - WHISPERS OF A MASSIVE DEPLOYMENT TOWARD THE TUKAYYID BORDER.',
      '[ENCRYPTED] - 3060.07.22 - UNIDENTIFIED STRIKE ON TRADE CONVOY: NO COMMUNICATIONS OR IDENT TAGS DETECTED.',
      '[SIGINT] - 3056.12.19 - FEDCOM LOGISTICS TRAIN MOVING TOWARD THE FRONTLINE.',
      '[INTERCEPT] - 3061.02.05 - PAYMENT RECEIVED: SUCCESSFUL RECOVERY OF LOST CARGO FROM THE PERIPHERY.',
      '[DATA] - 3062.11.10 - RUMOR OF A SECRET OPERATION UNDERWAY IN THE GREAT BEAR CLUSTER.',
      '[SIGINT] - 3055.08.30 - DRACONIS COMBINE LIGHT CAVALRY SPOTTED NEAR THE RIM.',
      '[INTERCEPT] - 3059.05.12 - PAYMENT DISPUTE: SALVAGE RIGHTS TO DESTROYED MECH DECLARED INVALID BY LOCAL AUTHORITY.',
      '[ENCRYPTED] - 3060.02.28 - SHADOW FLEET DETECTED IN DEEP SPACE; NO ORIGIN OR INTENT DETERMINED.',
      '[SIGINT] - 3054.04.17 - CLAN WOLVES RECONNAISSANCE UNITS ACTIVE NEAR THE SECTOR 9 HUB.',
      '[INTERCEPT] - 3063.01.09 - PAYMENT OVERDUE: CONTRACTOR FOR HESPERUS DEFENSES HAS CEASED ALL COMMUNICATIONS.',
      '[DATA] - 3058.06.25 - INTEL SUGGESTS PREPARATIONS FOR A LARGE-SCALE DROPSHIP INVASION IN THE WESTERN SECTOR.',
    ]
    return [...baseList].sort(() => Math.random() - 0.5)
  }, [])

  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollDuration, setScrollDuration] = useState(40)

  useEffect(() => {
    if (scrollRef.current) {
      // Animation travels 50% of total scrollHeight
      const distanceToTravel = scrollRef.current.scrollHeight / 2

      // Global terminal speed (pixels per second)
      const pixelsPerSecond = 20

      const calculatedDuration = distanceToTravel / pixelsPerSecond
      setScrollDuration(calculatedDuration)
    }
  }, [intercepts])

  return (
    <div className="active-campaigns-bg" aria-hidden="true">
      <div className="intel-overlay" />
      <svg className="star-map" viewBox="0 0 400 400">
        <g className="transmission-lines">
          <line x1="100" y1="120" x2="250" y2="80" />
          <line x1="250" y1="80" x2="320" y2="200" />
          <line x1="320" y1="200" x2="180" y2="280" />
          <line x1="180" y1="280" x2="80" y2="350" />
          <line x1="100" y1="120" x2="180" y2="280" />
        </g>
        <g className="systems">
          <circle cx="100" cy="120" r="3" />
          <text x="105" y="115">
            TUKAYYID
          </text>
          <circle cx="250" cy="80" r="3" />
          <text x="255" y="75">
            MISERY
          </text>
          <circle cx="320" cy="200" r="3" />
          <text x="325" y="195">
            LUTHIEN
          </text>
          <circle cx="180" cy="280" r="3" />
          <text x="185" y="275">
            ALSHAIN
          </text>
          <circle cx="80" cy="350" r="3" />
          <text x="85" y="345">
            OUTREACH
          </text>
        </g>
      </svg>
      <div
        className="intercept-scroll"
        ref={scrollRef}
        style={{ animationDuration: `${scrollDuration}s` }}
      >
        {[...intercepts, ...intercepts].map((text, i) => (
          <div key={i} className="intercept-line">
            {text}
          </div>
        ))}
      </div>
      <style>{`
                .active-campaigns-bg {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    pointer-events: none; 
                    z-index: -1;
                    overflow: hidden;
                }
                .intel-overlay {
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    background-image: url('/mercenary_hall.png');
                    background-size: cover;
                    background-repeat: no-repeat;
                    background-position: center;
                    opacity: 0.4;
                }
                .star-map {
                    position: absolute;
                    top: 0; right: 0;
                    width: 500px; height: 500px;
                    stroke: var(--terminal-amber);
                    fill: var(--terminal-amber);
                    font-size: 10px; font-family: monospace;
                    stroke-width: 0.5; opacity: 0.1;
                }
                .transmission-lines line {
                    stroke-dasharray: 4;
                    opacity: 0.2;
                }
                .intercept-scroll {
                    position: absolute;
                    top: 20px; left: 20px;
                    width: 500px;
                    font-family: monospace;
                    font-size: 0.7rem;
                    color: var(--terminal-amber);
                    display: flex; flex-direction: column; gap: 5px;
                    animation: scroll-intel ${scrollDuration}s linear infinite;
                    white-space: normal;
                    text-transform: uppercase;
                    opacity: 0.15;
                    mask-image: linear-gradient(to bottom, black, transparent);
                }
                @keyframes scroll-intel {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-50%); }
                }
                .intercept-line {
                    padding-left: 1.5rem;
                    text-indent: -1.5rem;
                }
            `}</style>
    </div>
  )
}
