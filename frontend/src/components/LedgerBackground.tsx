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
            "[COMM] BANK OF THARKAD :: AUDIT REQUESTED FOR MERCENARY COMMAND LEDGER SECTOR 4.",
            "[TRANS] TRANSFER FROM HOUSE KANASTA: +150,000 C-BILLS. SOURCE: SECURITY CONTRACT #442.",
            "[DEBIT] DOCKING FEES FOR STATION OUTREACH: -5,000 C-BILLS. PAYMENT PROCESSED AUTOMATICALLY.",
            "[LOG] QUARTERLY PAYROLL DISTRIBUTED TO 62 PERSONNEL. TOTAL DISBURSEMENT: 84,000 C-BILLS.",
            "[ALERT] INSUFFICIENT FUNDS FOR REQUISITION #B-99. AMMUNITION PROCUREMENT SUSPENDED.",
            "[TRANS] SALVAGE LIQUIDATION COMPLETE: +12,500 C-BILLS. CREDITED TO WARCHEST RESERVE.",
            "[DEBIT] MAINTENANCE BILL (DROPSHIP): -22,000 C-BILLS. PARTS AND LABOR FOR ENGINE REPAIR.",
            "[TRANS] INTEREST EARNED: +1,200 C-BILLS. SOURCE: ST IVES SAVINGS ACCOUNT.",
            "[NOTICE] LATE PAYMENT PENALTY APPLIED TO CONTRACT #902. REPUTATION IMPACT: -5.",
            "[LOG] REPAIR BILL FOR CENTURION 7K: -8,500 C-BILLS. TECH TIME LOGGED.",
            "[COMM] BANK OF NEW BABYLON :: AUDIT REQUESTED FOR MERCENARY COMMAND LEDGER SECTOR 4.",
            "[DEBIT] FUEL REPLENISHMENT (DROPSHIP): -15,000 C-BILLS. PROCESSED AT OUTREACH DOCKING BAY 2.",
            "[TRANS] BONUS PAYOUT: +2,500 C-BILLS. SOURCE: PERFORMANCE IN OPERATION SILVER SWORD.",
            "[ALERT] OVERDUE DEBT NOTICE: PAYMENT FOR MECH-BAY RENT IS 45 DAYS LATE.",
            "[LOG] PROCUREMENT COMPLETED: -45,000 C-BILLS. ITEM: REPLACEMENT HEAT SINKS (BATCH X-9).",
            "[TRANS] TRANSFER FROM COMSTAR RELAY: +25,000 C-BILLS. SOURCE: DATA INTERCEPT SERVICE FEE.",
            "[DEBIT] MEDICAL REIMBURSEMENT FOR PILOT ROSSI: -1,200 C-BILLS. TREATMENT FOR THERMAL BURN.",
            "[LOG] SALVAGE SALE (RECOVERED ARMOR): +3,000 C-BILLS. CREDITED TO LOGISTICS FUND.",
            "[TRANS] TRANSFER FROM HOUSE DAVION: +65,000 C-BILLS. SOURCE: BORDER PATROL CONTRACT #25.",
            "[DEBIT] MECHWARRIOR INSURANCE PREMIUM: -4,000 C-BILLS. MONTHLY DEDUCTION.",
            "[ALERT] FUNDS DEPLETED: AMMUNITION REQUISITION FOR LANCE BRAVO DENIED.",
            "[TRANS] INTEREST EARNED (SAVINGS): +850 C-BILLS. SOURCE: PERIPHERY HOLDING ACCOUNT.",
            "[LOG] PROCUREMENT COMPLETED: -3,500 C-BILLS. ITEM: REPLACEMENT NEUROHELM LINERS.",
            "[DEBIT] DOCKING FEE PENALTY: -2,000 C-BILLS. UNPROMPTED DEPARTURE FROM STATION OUTREACH.",
            "[TRANS] SALVAGE LIQUIDATION COMPLETE: +7,800 C-BILLS. SOURCE: DESTROYED MECH ARMOR PLATING.",
            "[COMM] BANK OF THARKAD :: NOTIFYING OF FUNDS TRANSFER INBOUND: +10,000 C-BILLS."
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
                backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', opacity: 0.1
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