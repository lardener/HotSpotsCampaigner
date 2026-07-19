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

export const GeneratorBackground: React.FC = () => {
    const intercepts = useMemo(() => {
        const baseList = [
            "[INTERCEPT] ENCRYPTED SIGNAL DETECTED IN HINTERLANDS. DECRYPTING DATA STREAM...",
            "[ rumor ] WOLF'S DRAGOONS MOVING TOWARD THE INNER SPHERE. CONTRACT POTENTIAL: HIGH.",
            "[DATA] DOBLESS INTEL UPLOAD: SECTOR 4 GARRISON STRENGTH ESTIMATED AT 40%.",
            "[SIGNAL] SCANNING FREQUENCIES... RECRUITMENT BROADCAST IDENTIFIED ON HESPERUS II.",
            "[INFO] REGIONAL TENSION RISING IN DRACONIS REACH. MISSION VARIETY EXPECTED TO INCREASE.",
            "[DATA] ARCHIVE ANALYSIS :: HISTORICAL COMBAT DATA SUGGESTS AMBUSH RISK IN THIS QUADRANT.",
            "[INTERCEPT] HINTERLANDS SIGNAL INTERRUPT :: 'ALL MERCS REPORT TO COORD 44.2/99.1'",
            "[LOG] SIGNAL RELAY ESTABLISHED. ACCESSING LOCAL PLANETARY DATA BANKS.",
            "[SIGINT] - DRACONIS REACH ::... [STATIC] ...DRACONIS... IS PREPARING FOR A... [REDACTED]... MASSIVE STRIKE ON THE FRONTIER.",
            "[rumor] - ST IVES COMPACT :: NEW... [SIGNAL LOSS] ...TECHNOLOGY DETECTED IN THE OUTLANDS. EXPECT HIGH-VALUE MERCENARY CONTRACTS.",
            "[DATA] - DIERON MILITARY DISTRICT :: REINFORCEMENTS DETECTED... [ERR]... NEAR THE BORDER... [SIGNAL INTERRUPT]",
            "[SIGNAL] - TAURIAN CONCORDAT ::... [CORRUPT] ...Militia numbers swelling near the frontier. High risk of... [STATIC].",
            "[INTERCEPT] - UNKNOWN SOURCE :: OPERATION... [REDACTED]... COMMENCING IN THE... [STATIC]... SECTOR.",
            "[rumor] - DRACONIS REACH :: HOUSE KURITA... [SIGNAL LOSS] ...MOVING HEAVY ARMOR TOWARD THE PERIPHERY BORDER.",
            "[DATA] - ST IVES COMPACT :: ECONOMIC... [REDACTED] ...INSTABILITY EXPECTED. PAYMENTS MAY BE DELAYED OR... [STATIC].",
            "[SIGINT] - DIERON DISTRICT :: LARGE ARMOR GROUP... [SIGNAL LOSS]... MOVING TOWARD THE ST. IVES BORDER.",
            "[INTERCEPT] - UNIDENTIFIED ::... [STATIC] ...UNCLAIMED RAID ON TAURIAN TRADE ROUTE. NO ACTOR IDENTIFIED.",
            "[rumor] - TAURIAN CONCORDAT :: PIRATE FLEETS... [REDACTED] ...GATHERING NEAR THE EDGE OF THE... [ERR]... NEBULA.",
            "[DATA] - DRACONIS REACH :: INTEL SUGGESTS... [SIGNAL INTERRUPT] ...PREPARATIONS FOR A LARGE-SCALE INVASION FORCE.",
            "[ENCRYPTED] - UNKNOWN ORIGIN :: TARGETING ST IVES TRADE ROUTES... [REDACTED]... NO SIGNATURE DETECTED.",
            "[SIGNAL] - DIERON DISTRICT ::... [STATIC] ...SUPPLY LINES ARE VULNERABLE. EXPECT INCREASED... [ERR]... ACTIVITY.",
            "[rumor] - ST IVES COMPACT :: SECRET OPERATION... [REDACTED]... IN THE DEEP REACH. NO ONE HAS CLAIMED RESPONSIBILITY.",
            "[DATA] - TAURIAN CONCORDAT ::... [SIGNAL LOSS] ...DEFENSES ARE WEAKENING AT THE OUTER... [STATIC]... OUTPOSTS.",
            "[INTERCEPT] - UNKNOWN SHIPMENT :: LARGE QUANTITY OF... [REDACTED]... MOVING THROUGH DIERON SPACE. NO MANIFEST FOUND.",
            "[SIGINT] - DRACONIS REACH ::... [CORRUPT] ...SCOUT UNITS SPOTTED NEAR THE CONCORDAT BORDER.",
            "[rumor] - ST IVES COMPACT :: NEW CONTRACTS AVAILABLE... [SIGNAL LOSS]... BUT WATCH OUT FOR... [REDACTED].",
            "[DATA] - DIERON DISTRICT :: MASSIVE ENERGY SPIKE DETECTED... [ERR]... NEAR THE PLANETARY HUB. UNKNOWN ORIGIN.",
            "[INTERCEPT] - UNIDENTIFIED ::... [STATIC] ...COORDINATES 44.2/99.1... ALL UNITS... [SIGNAL LOSS]... REPORT."
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
        <div className="generator-background" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: -1, opacity: 1.0, overflow: 'hidden' }} aria-hidden="true">
            <div className="server-overlay" style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                backgroundImage: "url('/map_of_inner_sphere.png')",
                backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', opacity: 0.4
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