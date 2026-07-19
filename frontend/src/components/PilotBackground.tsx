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

export const PilotBackground: React.FC = () => {
    const intercepts = useMemo(() => {
        const baseList = [
            "[MEDICAL] SUBJECT 442 :: NEURAL INTERFACE TOLERANCE TEST PASSED. NO COCKPIT FEEDBACK DETECTED.",
            "[TRAINING] SIM-ROOM 3 :: PILOT 'GHOST' ACHIEVED VETERAN RATING IN URBAN COMBAT MODULE.",
            "[LOG] QUARTERS :: NOISE COMPLAINT ON DECK 4. MECHWARRIORS REMINDED OF 2200 CURFEW.",
            "[STATUS] ROSTER :: NEW HIRE 'RAVEN' PENDING SECURITY CLEARANCE. ASSIGNMENT: SCOUT LANCE.",
            "[NOTICE] MED-BAY :: ALL PERSONNEL MUST REPORT FOR PERIODIC NEURO-SYNCHRONIZATION CHECKS.",
            "[COMM] BARRACKS :: LOST: DATA SLAB CONTAINING 'LORDS OF LUTHRIEN' S03. REWARD: 50 SP.",
            "[DATA] PSYCH-EVAL :: SUBJECT 112 SHOWS INCREASED AGGRESSION. MONITOR COCKPIT VITALS.",
            "[COMM] DECK-COMM :: TRANSPORT SHUTTLE FOR LEAVE AT OUTREACH DEPARTS IN 2 HOURS.",
            "[TRAINING] SIM-ROOM 1 :: PILOT SNAKE FAILED URBAN COMBAT MODULE. MANDATORY RETAKE SCHEDULED FOR 0400 HOURS.",
            "[LOG] FLIGHT-REPORTS :: PILOT VULCAN HAS THREE DAYS OF UNFILLED AFTER-ACTION LOGS. SUBMIT IMMEDIATELY OR ACCESS TO MECH-BAY IS REVOKED.",
            "[MEDICAL] NEURO-SYNC :: ALL MECHWARRIORS IN LANCE DELTA DUE FOR INTERFACE CALIBRATION BY END OF WEEK.",
            "[COMM] BARRACKS :: LOST: ONE LEFT FLIGHT GLOVE (TAN). REWARD: A VOUCHER FOR ONE EXTRA RATION PACK.",
            "[STATUS] LEAVE-ROSTER :: PILOT RAVEN AND PILOT STORM HAVE CONFLICTING LEAVE REQUESTS. RESOLVE WITH COMMAND BEFORE FRIDAY.",
            "[DATA] DAMAGE-REPORT :: REQUISITION FOR CENTURION 4-B ARMOR IS STALLED DUE TO INCOMPLETE DAMAGE LOGGING BY PILOT.",
            "[NOTICE] MED-BAY :: ALL PERSONNEL MUST UNDERGO POST-DROP PHYSICAL EXAMS WITHIN 12 HOURS OF ARRIVAL AT STATION.",
            "[COMM] BARRACKS :: FOUND: A DAMAGED DATA SLAB IN THE MESS HALL. PLEASE CHECK WITH SECURITY OR THE TECH CORPS.",
            "[TRAINING] SIM-ROOM 3 :: PILOT GHOST ACHIEVED VETERAN RATING IN URBAN COMBAT MODULE.",
            "[LOG] QUARTERS :: NOISE COMPLAINT ON DECK 4. MECHWARRIORS REMINDED OF 2200 CURFEW.",
            "[MEDICAL] SUBJECT 442 :: NEURAL INTERFACE TOLERANCE TEST PASSED. NO COCKPIT FEEDBACK DETECTED.",
            "[DATA] PSYCH-EVAL :: SUBJECT 112 SHOWS INCREASED AGGRESSION. MONITOR COCKPIT VITALS DURING HIGH-G MANEUVERS.",
            "[COMM] DECK-COMM :: TRANSPORT SHUTTLE FOR LEAVE AT OUTREACH DEPARTS IN 2 HOURS.",
            "[TRAINING] SCHEDULE :: LANCE LEADERS DRILLS COMMENCE TOMORROW AT 0500. BE ON TIME OR RUN THE CIRCUIT.",
            "[LOG] REQUISITION :: PILOT MILLER HAS NOT FILED EXPENSE CLAIMS FOR RECENT MECH MAINTENANCE. SUBMIT PAPERWORK TO LOGISTICS.",
            "[COMM] BARRACKS :: LOST: A CUSTOMIZED HELMET LINER. IF FOUND, PLEASE RETURN TO BARRACKS 3.",
            "[NOTICE] MED-BAY :: POST-MISSION NEURO-SYNC CHECKS ARE NOW MANDATORY FOR ALL PILOTS IN THE SCOUT LANCE.",
            "[STATUS] ROSTER :: NEW HIRE RAVEN PENDING SECURITY CLEARANCE. ASSIGNMENT: SCOUT LANCE.",
            "[DATA] FLIGHT-LOGS :: ERROR: UNIDENTED DATA ENTRY IN MECH-BAY 2 LOGS. PILOT IDENTIFICATION REQUIRED.",
            "[COMM] BARRACKS :: REMINDER: ALL PERSONAL GEAR MUST BE STOWED BY THE START OF THE NEXT COMBAT SORTIE.",
            "[MEDICAL] SUBJECT 881 :: POST-DROP CONCUSSION EVALUATION COMPLETE. RETURN TO DUTY STATUS: RESTRICTED.",
            "[TRAINING] SIM-ROOM 2 :: PILOT IRONCLAD FAILED THERMAL MANAGEMENT DRILL. RE-CALIBRATE HEAT SINK PROCEDURES.",
            "[LOG] SUPPLY :: REQUEST FOR NEW FLIGHT SUITS IS PENDING APPROVAL DUE TO INCOMPLETE PERSONNEL COUNT.",
            "[COMM] BARRACKS :: LOST: ONE HANDHELD DATA SLAB CONTAINING SEASON FINALE OF LORDS OF LUTHRIEN. REWARD: 50 SP.",
            "[COMM] DECK-COMM :: ALL PERSONNEL ON LEAVE MUST CHECK IN WITH COMMAND AT LEAST 4 HOURS BEFORE SHUTTLE DEPARTURE."
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
        <div className="pilot-background-overlay" style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            pointerEvents: 'none', zIndex: -1, borderRadius: 'inherit', overflow: 'hidden'
        }} aria-hidden="true">
            <div className="helmet-overlay" style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                backgroundImage: "url('/commander_desk_personnel.png')",
                backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom left', opacity: 0.15
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