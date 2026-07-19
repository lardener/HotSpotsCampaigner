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

export const MercenaryRegistryBackground: React.FC = () => {
    const intercepts = useMemo(() => {
        const baseList = [
            "[STATUS] LICENSE #MRBC-992-K EXPIRES IN 48 HOURS. SUBMIT RENEWAL FEE OR FACE BONDING REVOCATION.",
            "[ALERT] BOUNTY ISSUED FOR 'THE CRIMSON RAVEN'. LAST SEEN IN LYRAN SPACE. DEAD OR ALIVE.",
            "[NOTICE] DETACHMENT 'BULLDOGS' HAS ACHIEVED VETERAN STATUS. ADJUSTING RATING IN REGISTRY.",
            "[INTERCEPT] MRBC SECURE CHANNEL :: NEW MERCENARY COMMAND PENDING AUTHORIZATION IN SECTOR 7.",
            "[DATA] DISPUTE FILED: CAPTAIN MILLER VS HOUSE DAVION REGARDING SALVAGE RIGHTS ON NEW AVALON.",
            "[COMM] RECRUITMENT ADVISORY :: ALL ACTIVE COMMANDS MUST LOG CREW ROSTERS BY END OF CYCLE.",
            "[NOTICE] COMMAND 'IRON DRAGON' HAS CLEARED ALL OUTSTANDING DEBTS. BONDING STATUS: STABLE.",
            "[LOG] AUDIT COMMENCING FOR ALL MERCENARY COMMANDS OPERATING IN THE HINTERLANDS.",
            "[INTERCEPT] - 3057.04.12 - PAYMENT CONFIRMED: HOUSE KANASTA REMITTANCE RECEIVED IN FULL AND ON TIME.",
            "[INTERCEPT] - 3057.06.01 - PAYMENT DELAYED: LOCAL LORD OF ALSHAIN REFUSES TO SETTLE SALVAGE CLAIMS, CITING BUDGET CUTS.",
            "[SIGINT] - 3058.02.18 - WORDER TROOP MOVEMENTS DETECTED NEAR THE EDGE OF THE PERIPHERY.",
            "[ENCRYPTED] - 3059.10.30 - UNCLAIMED RAID ON OUTPOST DELTA: NO ACTOR IDENTIFIED, SENSOR LOGS WIPED.",
            "[DATA] - 3060.01.15 - RUMORS OF A LARGE-SCALE OPERATION TARGETING THE INNER CIRCLE HUB.",
            "[SIGINT] - 3061.05.22 - DRACONIS COMBINE DESTROYER CLASS SIGNATURES IN SECTOR 4.",
            "[INTERCEPT] - 3062.08.11 - CONTRACT BREACH: RECLAMATION NOTICE FOR UNPAID SECURITY SERVICES ON HESPERUS II.",
            "[SIGINT] - 3057.11.04 - CLAN BLOODGUARD SIGNATURES DETECTED IN THE NEBULA.",
            "[INTERCEPT] - 3058.09.20 - PAYMENT DENIED: CONTRACTOR CLAIMED EXCESSIVE COLLATERAL DAMAGE DURING ENGAGEMENT.",
            "[DATA] - 3059.03.14 - WHISPERS OF A MASSIVE DEPLOYMENT TOWARD THE TUKAYYID BORDER.",
            "[ENCRYPTED] - 3060.07.22 - UNIDENTIFIED STRIKE ON TRADE CONVOY: NO COMMUNICATIONS OR IDENT TAGS DETECTED.",
            "[SIGINT] - 3056.12.19 - FEDCOM LOGISTICS TRAIN MOVING TOWARD THE FRONTLINE.",
            "[INTERCEPT] - 3061.02.05 - PAYMENT RECEIVED: SUCCESSFUL RECOVERY OF LOST CARGO FROM THE PERIPHERY.",
            "[DATA] - 3062.11.10 - RUMOR OF A SECRET OPERATION UNDERWAY IN THE GREAT BEAR CLUSTER.",
            "[SIGINT] - 3055.08.30 - DRACONIS COMBINE LIGHT CAVALRY SPOTTED NEAR THE RIM.",
            "[INTERCEPT] - 3059.05.12 - PAYMENT DISPUTE: SALVAGE RIGHTS TO DESTROYED MECH DECLARED INVALID BY LOCAL AUTHORITY.",
            "[ENCRYPTED] - 3060.02.28 - SHADOW FLEET DETECTED IN DEEP SPACE; NO ORIGIN OR INTENT DETERMINED.",
            "[SIGINT] - 3054.04.17 - CLAN WOLVES RECONNAISSANCE UNITS ACTIVE NEAR THE SECTOR 9 HUB.",
            "[INTERCEPT] - 3063.01.09 - PAYMENT OVERDUE: CONTRACTOR FOR HESPERUS DEFENSES HAS CEASED ALL COMMUNICATIONS.",
            "[DATA] - 3058.06.25 - INTEL SUGGESTS PREPARATIONS FOR A LARGE-SCALE DROPSHIP INVASION IN THE WESTERN SECTOR."
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
        <div className="registry-background" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: -1, opacity: 1.0, overflow: 'hidden' }} aria-hidden="true">
            <div className="dossier-overlay" style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                backgroundImage: "url('/commander_desk_personnel.png')",
                backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', opacity: 0.15
            }} />
            <div className="intercept-scroll" ref={scrollRef} style={{
                position: 'absolute', top: '20px', left: '20px', width: '500px',
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