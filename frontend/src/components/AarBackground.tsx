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

export const AarBackground: React.FC = () => {
  const intercepts = useMemo(() => {
    const baseList = [
      '[COMM] CMD-ACTUAL :: MISSION DATA SYNCED. REVIEW DEBRIEFING AND LEGALIZE SALVAGE LOGS.',
      "[SIGINT] - 3051.12.04 - JUMPSHIP 'PRIDE OF HESPERUS' REPORTS DOCKING RING FAILURE.",
      '[DATA] - 3049.08.10 - DEEP PERIPHERY SIGNAL LOSS REPORTED IN SECTOR 7.',
      '[SIGNAL] FROM: LT. CHEN TO: CMD :: THE MECHWARRIORS ARE BORED, AND THE COFFEE IS GONE.',
      "[INTERCEPT] MRBC RECLAMATION NOTICE :: 'PAY DOCKING FEES OR WE SEIZE THE DROPSHIP.'",
      '[COMM] ENGINEERING :: RECYCLING UNIT 4 IS CLOGGED AGAIN. STOP FLUSHING UNOFFICIAL GEAR.',
      '[COMM] CMD-ACTUAL :: BATTLE LOGS ARCHIVED. SALVAGE PRIORITY: ENFORCER CHASSIS, DISCARDED ARMOR PLATING.',
      '[DATA] DEBRIEF_LOG :: UNIT LOSSES WITHIN ACCEPTABLE PARAMETERS. REQUESTING REPLACEMENT AMMO FOR AC/10S.',
      '[COMM] TAC-OFFICER :: TARGET NEUTRALIZED. ALL REMAINING UNITS RETREAT TO EXTRACTION POINT DELTA IMMEDIATELY.',
      '[DATA] DEBRIEF_LOG :: MISSION SUCCESSFUL. OBJECTIVE ALPHA SECURED. COMMENCE CLEANUP AND REARM.',
      '[COMM] MECHWARRIOR-1 TO: SQUAD-LEAD :: TARGET ESCAPED INTO THE FOREST. REQUESTING PERMISSION TO PURSUE.',
      '[DATA] AFTER-ACTION :: CASUALTY LIST UPDATED. REMEMBER TO NOTIFY NEXT-OF-KIN (IF CONTRACT ALLOWS).',
      '[COMM] COMMANDER :: MISSION DATA SYNCED. REVIEW DEBRIEFING AND LEGALIZE SALVAGE LOGS.',
      '[DATA] POST-OP :: TOTAL AMMUNITION EXPENDITURE: 42% ABOVE ESTIMATED BUDGET. ADJUST FUTURE QUOTES.',
      '[SIGINT] - 3051.12.04 - JUMPSHIP PRIDE OF HESPERUS REPORTS DOCKING RING FAILURE.',
      '[DATA] - 3049.08.10 - DEEP PERIPHERY SIGNAL LOSS REPORTED IN SECTOR 7.',
      '[SIGINT] - 3052.01.15 - UNIDENTIFIED LIGHT SIGNAL DETECTED IN THE GREAT BEAR CLUSTER.',
      '[DATA] - 3054.04.02 - MASSIVE ENERGY SPIKE DETECTED NEAR THE EDGE OF THE PERIPHERY.',
      '[SIGINT] - 3050.11.22 - DROPSHIP IRON WILL REPORTING STRUCTURAL FATIGUE AFTER HIGH-G BURN.',
      '[DATA] - 3048.05.19 - LOSS OF CONTACT WITH SCOUT SQUAD VULTURE.',
      '[SIGINT] - 3/55/3053 - DISTRESS BEACON DETECTED, ORIGIN UNKNOWN.',
      '[DATA] - 3045.02.12 - LOST CONNECTION TO COLONY HUB EPSILON.',
      '[SIGNAL] FROM: LT. CHEN TO: CMD :: THE MECHWARRIORS ARE BORED, AND THE COFFEE IS GONE.',
      '[SIGNAL] FROM: LT. MILLER TO: ENG-CHIEF :: THE HYDRAULICS ON MY CENTURION ARE LEAKING AGAIN. FIX IT BEFORE THE NEXT DROP.',
      '[SIGNAL] FROM: PILOT-BRAVO TO: COMMAND :: THE LANDING WAS ROUGH. I NEED A NEW RECLINER IN THE COCKPIT.',
      '[SIGNAL] FROM: MECH-TECH TO: COMMAND :: THE ATLAS IS LEAKING COOLANT LIKE A SIEVE. WE CANNOT DEPLOY UNTIL IT IS PATCHED.',
      '[SIGNAL] FROM: MECHWARRIOR-9 TO: SQUAD-LEAD :: REQUESTING PERMISSION TO TAKE A SHORT BREAK. THIS BATTLE HAS BEEN GOING ON FOR 14 HOURS.',
      '[SIGNAL] FROM: COOK TO: ALL CREW :: REMINDER: NO EATING IN THE MECH-BAY DURING MAINTENANCE.',
      '[SIGNAL] FROM: PILOT-7 TO: COCKPIT-TECH :: WHY IS MY HUD FLICKERING EVERY TIME I FIRE THE AC/20?',
      '[SIGNAL] FROM: NAV-OFFICER TO: BRIDGE :: THE JUMP POINT IS SHIFTING. PREPARE FOR EMERGENCY CALCULATIONS.',
      '[INTERCEPT] MRBC RECLAMATION NOTICE :: PAY DOCKING FEES OR WE SEIZE THE DROPSHIP.',
      '[INTERCEPT] BANK OF NEW BABYLON :: DEBT OVERDUE. INTEREST ACCRUING AT 15% PER JUMP.',
      '[INTERCEPT] CORPS-INTEL :: REINFORCEMENTS EN ROUTE TO SECTOR 4. ALL MERCENARIES ADVISED TO CLEAR OUT.',
      '[INTERCEPT] TRADE FEDERATION :: TARIFF INCREASE EFFECTIVE IMMEDIATELY FOR ALL NON-MEMBER VESSELS.',
      '[INTERCEPT] PORT-AUTHORITY :: UNAUTHORIZED RADIATION DETECTED ON CARGO. PROCEED TO SCANNING BAY.',
      '[INTERCEPT] MERCENARY CONTRACT NOTICE :: MISSION SUCCESSFUL. PAYMENT PENDING VERIFICATION OF TARGET DESTRUCTION.',
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
      className="aar-background-overlay"
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
        className="desk-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: "url('/commander_desk_large.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.4,
        }}
      />
      <div
        className="intercept-scroll"
        ref={scrollRef}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          width: '500px',
          fontFamily: 'monospace',
          fontSize: '0.7rem',
          color: 'var(--terminal-amber)',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          animation: `scroll-intel ${scrollDuration}s linear infinite`,
          whiteSpace: 'normal',
          textTransform: 'uppercase',
          opacity: 0.15,
          maskImage: 'linear-gradient(to bottom, black, transparent)',
        }}
      >
        {[...intercepts, ...intercepts].map((text, i) => (
          <div
            key={i}
            className="intercept-line"
            style={{ paddingLeft: '1.5rem', textIndent: '-1.5rem' }}
          >
            {text}
          </div>
        ))}
      </div>
      <style>{`
                @keyframes scroll-intel {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-50%); }
                }
            `}</style>
    </div>
  )
}
