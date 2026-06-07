import React, { useMemo, useRef, useState, useEffect } from 'react';

export const CombatUnitBackground: React.FC = () => {
    const intercepts = useMemo(() => [
        "[LOG] MAINTENANCE BAY 4 :: SHADOW HAWK RE-FIT COMMENCING. ESTIMATED COMPLETION: 48 HOURS.",
        "[ALERT] ARMORY :: REQUISITION FOR AC/5 AMMO PENDING. STOCK LEVELS AT 15%.",
        "[DATA] SCAN-SYNC :: NEUROHELM CALIBRATION SUCCESSFUL FOR ARCHER CHASSIS.",
        "[COMM] TECH-LEAD :: WHO LEFT THE COOLANT COUPLING OPEN? BAY FLOOR IS HAZARDOUS.",
        "[STATUS] SALVAGE LOGGED :: 2.5 TONS OF FERRO-FIBROUS SCRAP SECURED FROM PREVIOUS ENGAGEMENT.",
        "[NOTICE] BAY-2 :: CRITICAL COMPONENT FAILURE: LOWER LEG ACTUATOR. ORDERING REPLACEMENTS.",
        "[COMM] ENGINEERING :: ENGINE SWAP ON THE JENNER IS BEHIND SCHEDULE. BLAME THE K-F LEAK.",
        "[DATA] DIAGNOSTICS :: POWER SURGE DETECTED IN RIGHT ARM LASER ARRAY. RE-WIRING REQUIRED."
    ], []);

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
                backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom right', opacity: 0.12
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