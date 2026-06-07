import React, { useMemo, useRef, useState, useEffect } from 'react';

export const GeneratorBackground: React.FC = () => {
    const intercepts = useMemo(() => [
        "[INTERCEPT] ENCRYPTED SIGNAL DETECTED IN HINTERLANDS. DECRYPTING DATA STREAM...",
        "[ rumor ] WOLF'S DRAGOONS MOVING TOWARD THE INNER SPHERE. CONTRACT POTENTIAL: HIGH.",
        "[DATA] DOBLESS INTEL UPLOAD: SECTOR 4 GARRISON STRENGTH ESTIMATED AT 40%.",
        "[SIGNAL] SCANNING FREQUENCIES... RECRUITMENT BROADCAST IDENTIFIED ON HESPERUS II.",
        "[INFO] REGIONAL TENSION RISING IN DRACONIS REACH. MISSION VARIETY EXPECTED TO INCREASE.",
        "[DATA] ARCHIVE ANALYSIS :: HISTORICAL COMBAT DATA SUGGESTS AMBUSH RISK IN THIS QUADRANT.",
        "[INTERCEPT] HINTERLANDS SIGNAL INTERRUPT :: 'ALL MERCS REPORT TO COORD 44.2/99.1'",
        "[LOG] SIGNAL RELAY ESTABLISHED. ACCESSING LOCAL PLANETARY DATA BANKS."
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
        <div className="generator-background" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: -1, opacity: 1.0, overflow: 'hidden' }} aria-hidden="true">
            <div className="server-overlay" style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                backgroundImage: "url('/map_of_inner_sphere.png')",
                backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', opacity: 0.4
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