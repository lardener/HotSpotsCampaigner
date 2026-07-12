import React, { useMemo, useRef, useState, useEffect } from 'react';

export const MarketBackground: React.FC = () => {
    const intercepts = useMemo(() => {
        const baseList = [
            "[MARKET] FREEPORT DELTA :: CATAPHRACT CM-11K LISTED AT 650K C-BILLS. SELLER: HOUSE MARCUS.",
            "[MARKET] SCRAPPERS' YARD :: RANDOM LOT AVAILABLE. MIN BID: 50K C-BILLS. NO RETURNS.",
            "[INTEL] EMPLOYER FEED :: COMBINE OUTPOST SEEKING 2 PILOTS FOR PATROL DUTY. PAY: 15K/MO.",
            "[MARKET] BLACK MARKET :: REFURBISHED ENFORCER E1-N. CONDITION 72%. ASKING 2.1M.",
            "[LOGISTICS] SUPPLY RUN :: SHIPMENT OF AC/20 SHELLS DELAYED. EXPECT 72-HOUR HOLD.",
            "[MARKET] FREEPORT DELTA :: PILOT HIRING: VETERAN 'KOWLOON' — 15 YEARS, MECH COMMANDER. RATE: 25K/MO.",
            "[INTEL] SCRAPPERS' YARD :: PULL LEDGER ENTRY #4492. UNIT: GRIFLIN GF-6X. BV: 18K.",
            "[MARKET] EMPLOYER FEED :: DRACON CO-OP OFFERING 3 MONTH CONTRACT. PAY UPFRONT.",
            "[STATUS] MARKET CLEARING :: YESTERDAY'S LOT: 4 MECHS SOLD, 2 PILOTS HIRED. VOLUME UP 12%.",
            "[ALERT] PRICE SPIKE :: PPC-COMPATIBLE HEAT SINKS NOW 40% ABOVE BASE. SUPPLY CHAIN DISRUPTION.",
            "[MARKET] FREEPORT DELTA :: SHADOW HAWK SH-HBK-4H. LOW HOURS, HIGH CONDITION. 420K.",
            "[INTEL] PILOT ROSTER :: RETIRED LIEUTENANT SEEKING CIVILIAN CONTRACT. SPECIALTY: ARTILLERY.",
            "[MARKET] SCRAPPERS' YARD :: \"LUCKY DIP\" DRAW OPEN. FEEDS UPDATED HOURLY.",
            "[LOGISTICS] TRANSPORT :: CARGO HOLD 3 CONTAINS 12 TONS OF FERRO-FIBROUS PLATING. DESTINATION: BAY 7.",
            "[MARKET] EMPLOYER FEED :: PERSEUS WAR MEMORIAL FUND OFFERING BENEVOLENT MECH LEASE. SEE DETAILS.",
            "[STATUS] EXCHANGE RATE :: 1 C-BILL = 0.00045 CREDITS. FEDERAL RESERVE STABLE.",
            "[MARKET] BLACK MARKET :: UNREGISTERED ATMOSPHERIC JUMP JET. NO PAPERWORK. 85K C-BILLS.",
            "[INTEL] PILOT HIRING :: GREEN RECRUIT \"SANDSTORM\" — 2 YEARS. MEDIC TRAINED. 8K/MO.",
            "[MARKET] FREEPORT DELTA :: CENTURION CEN-3N. FULLY ARMED. TURN-KEY. 580K.",
            "[ALERT] MARKET WATCH :: TECH BASE 5+ MECHS IN HIGH DEMAND. PRICES RISING."
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
        <div className="market-background-overlay" style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            pointerEvents: 'none', zIndex: -1, borderRadius: 'inherit', overflow: 'hidden'
        }} aria-hidden="true">
            <div className="market-overlay" style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                backgroundImage: "url('/market_showroom.png')",
                backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', opacity: 0.75
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