import React, { useMemo, useRef, useState, useEffect } from 'react';

export const LedgerBackground: React.FC = () => {
    const intercepts = useMemo(() => {
        const baseList = [
            "[TRANS] TRANSFER FROM COMSTAR RELAY: +50,000 SP. SOURCE: HOUSE STEINER CONTRACT #882.",
            "[DEBIT] DOCKING FEES FOR 'OUTREACH' STATION: -200 SP. PAYMENT PROCESSED AUTOMATICALLY.",
            "[LOG] QUARTERLY PAYROLL DISTRIBUTED TO 45 PERSONNEL. TOTAL DISBURSEMENT: 12,500 SP.",
            "[ALERT] INSUFFICIENT FUNDS FOR REQUISITION #A-42. AMMUNITION PROCUREMENT SUSPENDED.",
            "[TRANS] SALVAGE LIQUIDATION COMPLETE: +3,400 SP. CREDITED TO WARCHEST RESERVE.",
            "[NOTICE] LATE PAYMENT PENALTY APPLIED TO CONTRACT #771. REPUTATION IMPACT: -2.",
            "[LOG] REPAIR BILL FOR 'SHADOW HAWK' (SHD-2K): -1,200 SP. TECH TIME LOGGED.",
            "[COMM] BANK OF THARKAD :: AUDIT REQUESTED FOR MERCENARY COMMAND LEDGER SECTOR 4."
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
        <div className="ledger-background" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: -1, opacity: 1.0, overflow: 'hidden' }} aria-hidden="true">
            <div className="ledger-overlay" style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                backgroundImage: "url('/commander_desk.png')",
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