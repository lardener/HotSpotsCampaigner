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

export const MarketBackground: React.FC = () => {
  const intercepts = useMemo(() => {
    const baseList = [
      '[MARKET] FREEPORT DELTA :: CATAPHRACT CM-11K LISTED AT 650K C-BILLS. SELLER: HOUSE MARCUS.',
      "[MARKET] SCRAPPERS' YARD :: RANDOM LOT AVAILABLE. MIN BID: 50K C-BILLS. NO RETURNS.",
      '[INTEL] EMPLOYER FEED :: COMBINE OUTPOST SEEKING 2 PILOTS FOR PATROL DUTY. PAY: 15K/MO.',
      '[MARKET] BLACK MARKET :: REFURBISHED ENFORCER E1-N. CONDITION 72%. ASKING 2.1M.',
      '[LOGISTICS] SUPPLY RUN :: SHIPMENT OF AC/20 SHELLS DELAYED. EXPECT 72-HOUR HOLD.',
      "[MARKET] FREEPORT DELTA :: PILOT HIRING: VETERAN 'KOWLOON' — 15 YEARS, MECH COMMANDER. RATE: 25K/MO.",
      "[INTEL] SCRAPPERS' YARD :: PULL LEDGER ENTRY #4492. UNIT: GRIFLIN GF-6X. BV: 18K.",
      '[MARKET] EMPLOYER FEED :: DRACON CO-OP OFFERING 3 MONTH CONTRACT. PAY UPFRONT.',
      "[STATUS] MARKET CLEARING :: YESTERDAY'S LOT: 4 MECHS SOLD, 2 PILOTS HIRED. VOLUME UP 12%.",
      '[ALERT] PRICE SPIKE :: PPC-COMPATIBLE HEAT SINKS NOW 40% ABOVE BASE. SUPPLY CHAIN DISRUPTION.',
      '[MARKET] FREEPORT DELTA :: SHADOW HAWK SH-HBK-4H. LOW HOURS, HIGH CONDITION. 420K.',
      '[INTEL] PILOT ROSTER :: RETIRED LIEUTENANT SEEKING CIVILIAN CONTRACT. SPECIALTY: ARTILLERY.',
      '[MARKET] SCRAPPERS\' YARD :: "LUCKY DIP" DRAW OPEN. FEEDS UPDATED HOURLY.',
      '[LOGISTICS] TRANSPORT :: CARGO HOLD 3 CONTAINS 12 TONS OF FERRO-FIBROUS PLATING. DESTINATION: BAY 7.',
      '[MARKET] EMPLOYER FEED :: PERSEUS WAR MEMORIAL FUND OFFERING BENEVOLENT MECH LEASE. SEE DETAILS.',
      '[STATUS] EXCHANGE RATE :: 1 C-BILL = 0.00045 CREDITS. FEDERAL RESERVE STABLE.',
      '[MARKET] BLACK MARKET :: UNREGISTERED ATMOSPHERIC JUMP JET. NO PAPERWORK. 85K C-BILLS.',
      '[INTEL] PILOT HIRING :: GREEN RECRUIT "SANDSTORM" — 2 YEARS. MEDIC TRAINED. 8K/MO.',
      '[MARKET] FREEPORT DELTA :: CENTURION CEN-3N. FULLY ARMED. TURN-KEY. 580K.',
      '[ALERT] MARKET WATCH :: TECH BASE 5+ MECHS IN HIGH DEMAND. PRICES RISING.',
      // --- [MARKET] LORE-FRIENDLY SALES & LISTINGS ---
      '[MARKET] FREEPORT DELTA :: CATAPHRACT CM-11K LISTED AT 650K C-BILLS. SELLER: HOUSE MARCUS.',
      '[MARKET] BLACK MARKET :: REFURBISHED ENFORCER E1-N. CONDITION 72%. ASKING 2.1M.',
      '[MARKET] FREEPORT DELTA :: SHADOW HAWK SH-HBK-4H. LOW HOURS, HIGH CONDITION. 420K.',
      '[MARKET] FREEPORT DELTA :: CENTURION CEN-3N. FULLY ARMED. TURN-KEY. 580K.',
      '[MARKET] OUTPOST OMEGA :: ATLAS AS7-D RECOVERY FRAME. CORE INTACT. ASKING 4.2M C-BILLS.',
      '[MARKET] FREEPORT DELTA :: URBANMECH UM-R60. CUSTOM PINK PAINT. INCLUDES RESIDUAL AC/10 AMMO. 120K.',
      '[MARKET] FREEPORT DELTA :: ORION ON1-K. EXCELLENT CONDITION. PREVIOUS OWNER: CAPELLAN DESERTER. 1.8M.',
      '[MARKET] FREEPORT DELTA :: JENNER JR7-D. LEGS RE-REINFORCED AFTER ACTUATOR BLOWOUT. 340K C-BILLS.',
      '[MARKET] SOLARIS BAZAAR :: RIFLEMAN RFL-3N. LRM REPLACED WITH ADDITIONAL HEAT SINKS. ARENA READY. 1.1M.',
      '[MARKET] OUTRIDER HUB :: LOCUST LCT-1V. ENGINE RE-RATED FOR SCOUT SPEEDS. CHEAP. 190K C-BILLS.',
      '[MARKET] GALATEA PRIME :: DRAGON DRG-1N. CHASSIS RIGIDITY IS 94%. HOUSE KURITA SURPLUS. 950K.',
      '[MARKET] GALATEA PRIME :: ARCHER ARC-2R. RE-WIRED FOR LRM-20 COOLDOWN EFFICIENCY. 2.4M C-BILLS.',
      '[MARKET] RIM HUB :: THUG THG-11E. DUAL PPC SPEC. INTERNAL FRAME RUST TREATED. 3.8M C-BILLS.',
      '[MARKET] BLACK MARKET :: SALVAGED CLAN ER-PPC. CAPACITOR STABLE. NO QUESTIONS ASKED. 1.2M C-BILLS.',
      '[MARKET] BLACK MARKET :: UNREGISTERED ATMOSPHERIC JUMP JET. NO PAPERWORK. 85K C-BILLS.',
      '[MARKET] BLACK MARKET :: STREAK SRM-2 LAUNCHER (STAR LEAGUE SURPLUS). SERIAL NUMBERS SCRAPED. 310K.',
      '[MARKET] BLACK MARKET :: FELL OFF A JUMPSHIP SPREAD: 4X DEFACED MARAUDER MAD-3R RIGHT ARM ASSEMBLIES. 400K OBO.',
      "[MARKET] SCRAPPERS' YARD :: RANDOM LOT AVAILABLE. MIN BID: 50K C-BILLS. NO RETURNS.",
      '[MARKET] SCRAPPERS\' YARD :: "LUCKY DIP" DRAW OPEN. FEEDS UPDATED HOURLY.',
      "[MARKET] SCRAPPERS' YARD :: HUNCHBACK HBK-4G CHASSIS (LEFT TORSO MISSING). MIN BID: 180K C-BILLS.",
      "[MARKET] SCRAPPERS' YARD :: SPIDER SDR-5V JUMP CASING. CRUMPLED BUT STRIPPABLE. 35K C-BILLS.",
      // --- [INTEL] CONTRACTS, EMPLOYER FEEDS, & CONTRACTORS ---
      '[INTEL] EMPLOYER FEED :: COMBINE OUTPOST SEEKING 2 PILOTS FOR PATROL DUTY. PAY: 15K/MO.',
      "[INTEL] SCRAPPERS' YARD :: PULL LEDGER ENTRY #4492. UNIT: GRIFFIN GRF-1N. BV: 1.2K.",
      '[INTEL] PILOT ROSTER :: RETIRED LIEUTENANT SEEKING CIVILIAN CONTRACT. SPECIALTY: ARTILLERY.',
      '[INTEL] PILOT HIRING :: GREEN RECRUIT "SANDSTORM" — 2 YEARS. MEDIC TRAINED. 8K/MO.',
      '[INTEL] EMPLOYER FEED :: LYRAN NOBLE SEEKING RETINUE SECURITY. HEAVY/ASSAULT TONNAGE REQUIRED. TOP C-BILLS.',
      "[INTEL] PILOT ROSTER :: DISCHARGED FWL RECON PILOT 'SPECTER' — 6 YEARS, LRM SPECIALIST. RATE: 12K/MO.",
      '[INTEL] EMPLOYER FEED :: INDEPENDENT MINING CORP SEEKING ANTI-PIRACY ESCORT. 60-DAY CONTRACT. SALVAGE RIGHTS NEGOTIABLE.',
      "[INTEL] PILOT HIRING :: VETERAN 'HELLION' — 18 YEARS. SEVERE BATTLE PSYCHOSIS, HIGH GUNNERY. RATE: 30K/MO.",
      '[INTEL] EMPLOYER FEED :: FEDSUNS BORDER PATROL RECRUITING COVERT OPERATIVES. BLIND BIDDING ONLY.',
      "[INTEL] PILOT ROSTER :: GREEN RECRUIT 'BOOTS' — 1 YEAR. DRIVES A COMMANDO. WILLING TO WORK FOR K-RATIONS & 5K/MO.",
      '[INTEL] MERCS-R-US :: DISGRACED SOLARIS GLADIATOR SEEKING LANCE PLACEMENT. AGGRESSIVE MELEE BIAS. 18K/MO.',
      '[INTEL] EMPLOYER FEED :: TAURIAN CONCORDAT PERIPHERY DEFENSE. LONG-TERM CONTRACT. BRING TRIPLE-STRENGTH MYOMER.',
      '[INTEL] SIGN-ON HUB :: TECH TEAM "GREASE MONKEYS" AVAILABLE. LEAD ENGINES SPECIALIST. 40K CONTRACT FEE.',
      '[INTEL] BROADCAST :: UNVERIFIED COORDINATES IN THE OUTWORLDS ALLIANCE SPOTTED WITH STAR LEAGUE CACHE SIGNALS.',
      // --- [LOGISTICS] SUPPLY CHAIN & AMMO TRUCKING ---
      '[LOGISTICS] SUPPLY RUN :: SHIPMENT OF AC/20 SHELLS DELAYED. EXPECT 72-HOUR HOLD.',
      '[LOGISTICS] TRANSPORT :: CARGO HOLD 3 CONTAINS 12 TONS OF FERRO-FIBROUS PLATING. DESTINATION: BAY 7.',
      '[LOGISTICS] REPAIR BAY :: CRITICAL SHORTAGE OF MEDIUM LASER DIODES. SUBSTITUTING MAGNA MK II WHERE POSSIBLE.',
      '[LOGISTICS] AMMO DUMP :: MULTIPLE LOTS OF SRM-6 AMMO (HE) ARRIVING VIA LEOPARD-CLASS DROPSHIP.',
      '[LOGISTICS] SUPPLY RUN :: TRIPLE-STRENGTH MYOMER SHIPMENT INTERCEPTED BY PIRATES. MARKET PRICE SURGING.',
      '[LOGISTICS] FLIGHT DECK :: DROPMASTER WARNS OVER-TONNAGE LANCES WILL INCUR DOUBLE FUEL SURCHARGES THIS JUMP.',
      '[LOGISTICS] ASSET MANAGEMENT :: 40 TONS OF ENDO-STEEL SCRAP REDIRECTED TO NAIS LABS FOR EVALUATION.',
      // --- [STATUS & ALERTS] SYSTEM ECONOMICS, WEATHER & MARKET METRICS ---
      "[STATUS] MARKET CLEARING :: YESTERDAY'S LOT: 4 MECHS SOLD, 2 PILOTS HIRED. VOLUME UP 12%.",
      '[STATUS] EXCHANGE RATE :: 1 C-BILL = 0.00045 CREDITS. COMBINE RYU RECEDING.',
      '[STATUS] BLACK-BOX FEED :: COMBAT LOSSES IN SOLARIS VII DRIVING UP DEMAND FOR 55-TON INNER SPHERE CHASSIS.',
      '[STATUS] MERCENARY REVIEW :: MRBC RATING ADJUSTMENT COMMENCING FOR LOCAL OUTFITS. ENSURE LOGS ARE CURRENT.',
      '[ALERT] PRICE SPIKE :: PPC-COMPATIBLE HEAT SINKS NOW 40% ABOVE BASE. SUPPLY CHAIN DISRUPTION.',
      '[ALERT] MARKET WATCH :: TECH BASE 5+ MECHS IN HIGH DEMAND. PRICES RISING.',
      "[ALERT] BOUNTY POSTING :: TARGET 'ROUGHNECK' LAST SEEN PILOTING A JAGERMECH. 250K DEAD OR ALIVE.",
      '[ALERT] SYSTEM RADIATION :: SOLAR FLARES EXPECTED IN THE QUADRANT. SENSORS PENALTY IN EFFECT FOR 48 HOURS.',
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
      className="market-background-overlay"
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
        className="market-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: "url('/market_showroom.png')",
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          opacity: 0.35,
        }}
      />
      <div
        className="intercept-scroll"
        ref={scrollRef}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          width: '400px',
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
