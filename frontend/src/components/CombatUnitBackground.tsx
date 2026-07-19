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
import React, { useMemo, useRef, useState, useEffect } from 'react';

export const CombatUnitBackground: React.FC = () => {
    const intercepts = useMemo(() => {
        const baseList = [
            "[LOG] MAINTENANCE BAY 4 :: SHADOW HAWK RE-FIT COMMENCING. ESTIMATED COMPLETION: 48 HOURS.",
            "[ALERT] ARMORY :: REQUISITION FOR AC/5 AMMO PENDING. STOCK LEVELS AT 15%.",
            "[DATA] SCAN-SYNC :: NEUROHELM CALIBRATION SUCCESSFUL FOR ARCHER CHASSIS.",
            "[COMM] TECH-LEAD :: WHO LEFT THE COOLANT COUPLING OPEN? BAY FLOOR IS HAZARDOUS.",
            "[STATUS] SALVAGE LOGGED :: 2.5 TONS OF FERRO-FIBROUS SCRAP SECURED FROM PREVIOUS ENGAGEMENT.",
            "[NOTICE] BAY-2 :: CRITICAL COMPONENT FAILURE: LOWER LEG ACTUATOR. ORDERING REPLACEMENTS.",
            "[COMM] ENGINEERING :: ENGINE SWAP ON THE JENNER IS BEHIND SCHEDULE. BLAME THE K-F LEAK.",
            "[DATA] DIAGNOSTICS :: POWER SURGE DETECTED IN RIGHT ARM LASER ARRAY. RE-WIRING REQUIRED.",
            "[ALERT] ARMORY :: SRM-6 MISSILE RESERVES DROPPING BELOW CRITICAL THRESHOLD. IMMEDIATE REARM REQUIRED BEFORE NEXT SORTIE.",
            "[LOG] MECH-BAY 2 :: CENTURION CHASSIS REFIT IN PROGRESS. EXPECT DELAYS DUE TO SOURCED PART SHORTAGE.",
            "[DATA] LOGISTICS :: SHIPMENT OF GRADE-A HEAT SINKS DELAYED BY INTERCEPTOR ACTIVITY IN SECTOR 4.",
            "[NOTICE] TECH-BAY :: URGENT RECALL: CHECK ALL LANCEWOOD-BRAND GYROS FOR PREMATURE BEARING WEAR.",
            "[COMM] ENGINEERING :: THE AC/10 SHELLS FROM THE LAST DROP WERE HALF-DAMP. REQUESTING NEW BATCH FROM SUPPLY.",
            "[STATUS] REFIT :: HAWK CHASSIS ARMOR REPLACEMENT COMPLETED. READY FOR FIELD TESTING.",
            "[ALERT] ARMORY :: AUTOCANNON/5 SHELL COUNT IS AT 10%. DO NOT ENGAGE LONG-RANGE TARGETS UNTIL REARMED.",
            "[DATA] PROCUREMENT :: LOCAL DEPOT OFFERING 30% DISCOUNT ON REFURBISHED LEG ACTUATORS. STOCK IS LIMITED.",
            "[LOG] MAINTENANCE :: REARM SCHEDULE FOR LANCE ALPHA: 0200 HOURS. ALL PILOTS REPORT TO THE ARMORY.",
            "[COMM] TECH-LEAD :: WHO LEFT THE HYDRAULIC PRESS UNLOADED? WE HAVE THREE MECHS WAITING ON LEG REPAIRS.",
            "[ALERT] ARMORY :: PPC CAPACITOR BANKS SHOWING HIGH VOLTAGE INSTABILITY. REQUESTING IMMEDIATE INSPECTION.",
            "[DATA] LOGISTICS :: ARRIVAL OF FERRO-FIBROUS ARMOR PLATING EXPECTED WITHIN 48 HOURS. STAND BY FOR UNLOADING.",
            "[NOTICE] TECH-BAY :: WARNING: SECOND-HAND GYROS FROM THE LAST SALVAGE RUN SHOW SIGNS OF THERMAL FATIGUE.",
            "[STATUS] REFIT :: JEFFERSON'S ENFORCER CHASSIS REARM SCHEDULED FOR POST-MISSION WINDOW. DO NOT DISRUPT.",
            "[COMM] ENGINEERING :: THE NEW SHIPMENT OF CONDUCTIVE GREASE IS MISSING TWO CRATES. CHECK THE LOADING MANIFEST.",
            "[ALERT] ARMORY :: LARGE CALIBER AMMO LEVELS ARE UNACCEPTABLE. REQUISITION ORDER 99-B HAS BEEN DENIED.",
            "[LOG] MAINTENANCE :: CENTURION KNEE ACTUATOR FAILURE DETECTED. PART ARRIVAL PENDING LOGISTICS CLEARANCE.",
            "[DATA] PROCUREMENT :: PROMOTION ON REFURBISHED NEUROHELM LINERS AT THE MAIN SPACEPORT DEPOT.",
            "[STATUS] REARM :: LANCE BRAVO IS CLEARED FOR AMMUNITION LOADING. PROCEED WITH SRM AND AC/2 RESERVES.",
            "[COMM] TECH-LEAD :: STOP USING THE EMERGENCY COOLANT TO PATCH LOOSE PIPES. WE ARE RUNNING OUT OF STOCKS.",
            "[ALERT] ARMORY :: REQUISITION FOR 20MM CANNON SHELLS PENDING. DO NOT EXHAUST CURRENT STOCK DURING DRILLS.",
            "[DATA] LOGISTICS :: SHIPMENT OF REPLACEMENT LASER DIODES IS LOST IN TRANSIT. EXPECT LONG DELAYS FOR LIGHT ARMS.",
            "[NOTICE] TECH-BAY :: MANDATORY INSPECTION OF ALL AC/20 MUZZLE BRAKES FOLLOWING THE LAST ENGAGEMENT.",
            "[STATUS] REFIT :: THE ATLAS ARMOR REPLACEMENT PROJECT IS NOW BEHIND SCHEDULE BY THREE DAYS.",
            "[COMM] ENGINEERING :: SOMEONE STOLE THE TORQUE WRENCH FROM BAY 3. RETURN IT OR FACE DISCIPLINARY ACTION.",
            "[ALERT] ARMORY :: AMMO COUNT FOR LANCE CHARLIE IS AT CRITICAL LEVELS. REARM IMMEDIATERS AFTER DROP.",
            "[DATA] PROCUREMENT :: WATCH OUT FOR FAKE BOLTS IN THE NEW SHIPMENT OF LEG ACTUATORS. CHECK ALL SERIAL NUMBERS.",
            "[LOG] MAINTENANCE :: SHADOW HAWK RE-FIT COMMENCING. ESTIMATED COMPLETION: 48 HOURS.",
            "[STATUS] SALVAGE :: 2.5 TONS OF FERRO-FIBROUS SCRAP SECURED FROM PREVIOUS ENGAGEMENT.",
            "[COMM] TECH-LEAD :: THE ENGINE SWAP ON THE JENNER IS BEHIND SCHEDULE. BLAME THE K-F LEAK."
        ];
        return [...baseList].sort(() => Math.random() - 0.5);
    }, []);

    const scrollRef = useRef<HTMLDivElement>(null);
    const [scrollDuration, setScrollDuration] = useState(80);

    useEffect(() => {
        if (scrollRef.current) {
            const distanceToTravel = scrollRef.current.scrollHeight / 2;
            setScrollDuration(distanceToTravel / 20);
        }
    }, [intercepts]);

    return (
        <div className="combat-unit-background-overlay" style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            pointerEvents: 'none', zIndex: -1, borderRadius: 'inherit', overflow: 'hidden'
        }} aria-hidden="true">
            <div className="mech-overlay" style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                backgroundImage: "url('/mech_repair_bay.png')",
                backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom right', opacity: 0.15
            }} />
            <div className="intercept-scroll" ref={scrollRef} style={{
                position: 'absolute', top: '20px', left: '20px', width: '400px',
                fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--terminal-amber)',
                display: 'flex', flexDirection: 'column', gap: '15px', animation: `scroll-intel ${scrollDuration}s linear infinite`,
                whiteSpace: 'normal', textTransform: 'uppercase', opacity: 0.15, maskImage: 'linear-gradient(to bottom, black, transparent)'
            }}>
                {[...intercepts, ...intercepts].map((text, i) => (
                    <div key={i} className="intercept-line" style={{ paddingLeft: '1.5rem', textIndent: '-1.5rem' }}>{text}</div>
                ))}
            </div>
            <style>{`
                @keyframes scroll-intel {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-50%); }
                }
            `}</style>
        </div>
    );
};