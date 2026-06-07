import React, { useMemo, useRef, useState, useEffect } from 'react';

export const PilotBackground: React.FC = () => {
    const intercepts = useMemo(() => [
        "[MEDICAL] SUBJECT 442 :: NEURAL INTERFACE TOLERANCE TEST PASSED. NO COCKPIT FEEDBACK DETECTED.",
        "[TRAINING] SIM-ROOM 3 :: PILOT 'GHOST' ACHIEVED VETERAN RATING IN URBAN COMBAT MODULE.",
        "[LOG] QUARTERS :: NOISE COMPLAINT ON DECK 4. MECHWARRIORS REMINDED OF 2200 CURFEW.",
        "[STATUS] ROSTER :: NEW HIRE 'RAVEN' PENDING SECURITY CLEARANCE. ASSIGNMENT: SCOUT LANCE.",
        "[NOTICE] MED-BAY :: ALL PERSONNEL MUST REPORT FOR PERIODIC NEURO-SYNCHRONIZATION CHECKS.",
        "[COMM] BARRACKS :: LOST: DATA SLAB CONTAINING 'LORDS OF LUTHRIEN' S03. REWARD: 50 SP.",
        "[DATA] PSYCH-EVAL :: SUBJECT 112 SHOWS INCREASED AGGRESSION. MONITOR COCKPIT VITALS.",
        "[COMM] DECK-COMM :: TRANSPORT SHUTTLE FOR LEAVE AT OUTREACH DEPARTS IN 2 HOURS."
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
        <div className="pilot-background-overlay" style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            pointerEvents: 'none', zIndex: -1, borderRadius: 'inherit', overflow: 'hidden'
        }} aria-hidden="true">
            <div className="helmet-overlay" style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                backgroundImage: "url('/commander_desk_personnel.png')",
                backgroundSize: '40%', backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom left', opacity: 0.12
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