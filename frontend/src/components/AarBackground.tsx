import React, { useMemo, useRef, useState, useEffect } from 'react';

export const AarBackground: React.FC = () => {
    const intercepts = useMemo(() => [
        "[COMM] CMD-ACTUAL :: MISSION DATA SYNCED. REVIEW DEBRIEFING AND LEGALIZE SALVAGE LOGS.",
        "[SIGINT] - 3051.12.04 - JUMPSHIP 'PRIDE OF HESPERUS' REPORTS DOCKING RING FAILURE.",
        "[DATA] - 3049.08.10 - DEEP PERIPHERY SIGNAL LOSS REPORTED IN SECTOR 7.",
        "[SIGNAL] FROM: LT. CHEN TO: CMD :: THE MECHWARRIORS ARE BORED, AND THE COFFEE IS GONE.",
        "[INTERCEPT] MRBC RECLAMATION NOTICE :: 'PAY DOCKING FEES OR WE SEIZE THE DROPSHIP.'",
        "[COMM] ENGINEERING :: RECYCLING UNIT 4 IS CLOGGED AGAIN. STOP FLUSHING UNOFFICIAL GEAR."
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
        <div className="aar-background-overlay" style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            pointerEvents: 'none', zIndex: -1, borderRadius: 'inherit', overflow: 'hidden'
        }} aria-hidden="true">
            <div className="desk-overlay" style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                backgroundImage: "url('/commander_desk_large.png')",
                backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.4
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