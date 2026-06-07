import React, { useMemo, useRef, useState, useEffect } from 'react';

export const MercenaryRegistryBackground: React.FC = () => {
    const intercepts = useMemo(() => [
        "[STATUS] LICENSE #MRBC-992-K EXPIRES IN 48 HOURS. SUBMIT RENEWAL FEE OR FACE BONDING REVOCATION.",
        "[ALERT] BOUNTY ISSUED FOR 'THE CRIMSON RAVEN'. LAST SEEN IN LYRAN SPACE. DEAD OR ALIVE.",
        "[NOTICE] DETACHMENT 'BULLDOGS' HAS ACHIEVED VETERAN STATUS. ADJUSTING RATING IN REGISTRY.",
        "[INTERCEPT] MRBC SECURE CHANNEL :: NEW MERCENARY COMMAND PENDING AUTHORIZATION IN SECTOR 7.",
        "[DATA] DISPUTE FILED: CAPTAIN MILLER VS HOUSE DAVION REGARDING SALVAGE RIGHTS ON NEW AVALON.",
        "[COMM] RECRUITMENT ADVISORY :: ALL ACTIVE COMMANDS MUST LOG CREW ROSTERS BY END OF CYCLE.",
        "[NOTICE] COMMAND 'IRON DRAGON' HAS CLEARED ALL OUTSTANDING DEBTS. BONDING STATUS: STABLE.",
        "[LOG] AUDIT COMMENCING FOR ALL MERCENARY COMMANDS OPERATING IN THE HINTERLANDS."
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
        <div className="registry-background" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: -1, opacity: 1.0, overflow: 'hidden' }} aria-hidden="true">
            <div className="dossier-overlay" style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                backgroundImage: "url('/commander_desk_personnel.png')",
                backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', opacity: 0.5
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