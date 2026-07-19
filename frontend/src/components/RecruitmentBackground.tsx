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

export const RecruitmentBackground: React.FC = () => {
  const intercepts = useMemo(() => {
    const baseList = [
      '[COMM] - RECRUITMENT DRIVE: JOIN THE HINTERLANDS DEFENSE FORCE. SIGN-ON BONUS: 5,000 SP.',
      '[NOTICE] - NAGELRING COMBAT ACADEMY: NOW ACCEPTING APPLICATIONS FOR THE 3052 SEMESTER.',
      "[rumor] - TRYOUTS FOR THE 'WOLF'S DRAGOONS' AUXILIARY UNIT COMMENCING ON OUTREACH NEXT MONTH.",
      '[DATA] - FINANCIAL OPPORTUNITY: HIGH-STAKES DEFENSE CONTRACT ON HESPERUS II. REPUTATION REQUIREMENT: VETERAN.',
      '[SIGNAL] - TRAINING OPPORTUNITY: ADVANCED URBAN COMBAT SIMULATIONS NOW OPEN AT THE MECH-BAY 3 FACILITY.',
      '[INTERCEPT] - BONDING COMMISSION: NEW RECRUITMENT PROTOCOLS IN EFFECT. ENSURE ALL COMMANDS ARE REGISTERED.',
      "[COMM] - ATTENTION PILOTS: 'THE CRIMSON RAVENS' ARE LOOKING FOR SCOUT LANCE COMMANDERS. INQUIRE AT SECTOR 7.",
      "[NOTICE] - COMBAT ACADEMY: ENROLL IN THE 'ALPHA STRIKE' PILOTING COURSE AND EARN A BONUS TO YOUR AS SKILL.",
      "[rumor] - MERCENARY OPPORTUNITY: 'HOUSE STEINER' IS OFFERING INCREASED PAY FOR RECON MISSIONS IN THE PERIPHERY.",
      '[DATA] - RECRUITMENT BONUS: EARN AN EXTRA 10% ON ALL SALVAGE CLAIMS IF YOU SIGN A 12-MONTH CONTRACT.',
      "[SIGNAL] - TRYOUTS: 'HOUSE DAVION' IS HOLDING OPEN TRIALS FOR HEAVY MECH PILOTS IN THE BORDER REGIONS.",
      "[INTERCEPT] - TRAINING: 'THE KELL HOUNDS' ARE OFFERING INTERNSHIPS FOR JUNIOR MECHWARRIORS. SPONSORED BY THE MRBC.",
      "[COMM] - FINANCIAL ALERT: 'COMSTAR' IS OFFERING LOW-INTEREST LOANS FOR NEW MERCENARY COMMANDS.",
      '[NOTICE] - ACADEMY DRILLS: MANDATORY SIBKO TRAINING SESSIONS START AT 0500 HOURS. NO EXCEPTIONS.',
      "[rumor] - RECRUITMENT: 'THE NORTHWIND HIGHLANDERS' ARE SEEKING EXPERIENCED TECHS FOR LONG-TERM DEPLOYMENTS.",
      "[DATA] - MISSION OPPORTUNITY: SECURITY DETAIL FOR JUMPSHIP 'VOID WALKER'. CONTRACT INCLUDES TRANSPORTATION COSTS.",
      "[SIGNAL] - TRYOUTS: 'HOUSE KURITA' IS EVALUATING NEW MERCENARY UNITS FOR THE FRONTIER DISTRICTS.",
      "[INTERCEPT] - TRAINING: 'SOLARIS VII' COMBAT ACADEMY: BECOME A LEGEND. SIGN UP NOW!",
      "[COMM] - RECRUITMENT DRIVE: 'THE GREY DEATH LEGION' IS HIRING INFANTRY SQUADS FOR URBAN PACIFICATION.",
      "[NOTICE] - FINANCIAL OP: 'BANK OF THARKAD' ANNOUNCES NEW REPUTATION-BASED CREDIT LINES FOR MERCENARIES.",
      '[rumor] - TRAINING: LEAKED DATA SLAB REVEALS ADVANCED NEURAL INTERFACE DRILLS FROM THE DEEP PERIPHERY.',
      '[DATA] - RECRUITMENT BONUS: DOUBLE REPUTATION GAINS FOR ALL SUCCESSFUL DEFENSE CONTRACTS THIS QUARTER.',
      "[SIGNAL] - TRYOUTS: 'THE BLACK WIDOW COMPANY' IS RECRUITING. ONLY THE BEST NEED APPLY.",
      "[INTERCEPT] - ACADEMY NEWS: 'NEW AVALON INSTITUTE OF SCIENCE' OPENS NEW BATTLEMECH RESEARCH LABS.",
      "[COMM] - RECRUITMENT DRIVE: 'THE MAGISTRACY OF CANOPUS' IS SEEKING MEDICAL STAFF FOR DROPSHIP DEPLOYMENTS.",
      "[SIGNAL] - TRYOUTS: JOIN THE 'CLAN WOLVES' GARRISON FORCE. HONOR AND GLORY AWAIT.",
      "[NOTICE] - TRAINING: 'BATTLEMECH 101' NOW OFFERED AT THE LOCAL MILITIA HANGAR.",
      "[rumor] - RECRUITMENT: 'HOUSE MARIK' IS HIRING MERCENARIES FOR AN UNDISCLOSED OPERATION NEAR THE BORDER.",
      '[DATA] - FINANCIAL OP: HIGH-VALUE SALVAGE RIGHTS GRANTED FOR ALL SUCCESSFUL RAID CONTRACTS IN SECTOR 4.',
      "[INTERCEPT] - ACADEMY NEWS: 'THE NAGELRING' REPORTS RECORD ENROLLMENT FOR THE NEW TACTICAL COMMAND PROGRAM.",
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
      className="recruitment-background-overlay"
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
        className="poster-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: "url('/recruiting_poster.png')",
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          opacity: 0.15,
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
