import React, { useMemo, useRef, useState, useEffect } from 'react';

export const CampaignTheaterBackground: React.FC = () => {
    const intercepts = useMemo(() => [
        "[SIGNAL] LOCAL-INTEL :: WATCH OUT FOR THE LOCAL SAND-KRAKEN NEAR THE NORTH RIDGE. THEY'VE BEEN KNOWN TO DISRUPT SENSOR ARRAYS AND SCAVENGE LOOSE PLATING.",
        "[COMM] RECREATION :: THE 'HINTERLANDS GRILL' NEAR THE MAIN SPACEPORT HAS THE BEST SYNTH-STEAK THIS SIDE OF OUTREACH. AVOID THE HOUSE SPECIAL ALCOHOL UNLESS YOU LIKE THE TASTE OF INDUSTRIAL COOLANT.",
        "[DATA] EXPLORATION :: THERE'S A GREAT HIKING TRAIL LEADING TO THE OBSIDIAN PEAKS. EXCELLENT TOPOGRAPHICAL DATA OPPORTUNITIES AND A CLEAR VIEW OF THE DROPSHIP LANDING CORRIDORS.",
        "[INTERCEPT] WARNING :: AVOID THE VENDOR NEAR DOCKING BAY 4. HE'S SELLING REFURBISHED ACTUATORS STRIPPED FROM SALVAGE AS FACTORY NEW. CHECK THE SERIAL NUMBERS.",
        "[COMM] LOCAL-INTEL :: FLORA ANALYSIS: BLUE FERNS IN THE LOWER CANYON ARE TOXIC TO NEUROHELM SENSORS. DO NOT BRING SAMPLES INTO THE COCKPIT OR BARRACKS.",
        "[SIGNAL] RECREATION :: ANYONE UP FOR A HIKE TO THE CRYSTAL FALLS? I NEED TO GET OUT OF THIS BUNK AND BREATH SOMETHING OTHER THAN RECYCLED AIR.",
        "[DATA] MERCHANT-ALERT :: 'HONEST ED'S REPAIR SHOP' IS NEITHER HONEST NOR A COMPETENT REPAIR SHOP. THEY'RE JUST SALVAGE VULTURES. STAY CLEAR.",
        "[SIGNAL] LOCAL-INTEL :: LOCAL WILDLIFE ADVISORY: THE 'GRABBER-VINES' IN THE MARSHES ARE ACTIVE. KEEP YOUR COOLANT LINES SEALED.",
        "[SIGNAL] LOCAL-INTEL :: WATCH OUT FOR THE LOCAL SAND-KRAKEN NEAR THE NORTH RIDGE. THEY'VE BEEN KNOWN TO DISRUPT SENSOR ARRAYS AND SCAVENGE LOOSE PLATING.",
        "[COMM] RECREATION :: THE 'HINTERLANDS GRILL' NEAR THE MAIN SPACEPORT HAS THE BEST SYNTH-STEAK THIS SIDE OF OUTREACH. AVOID THE HOUSE SPECIAL ALCOHOL UNLESS YOU LIKE THE TASTE OF INDUSTRIAL COOLANT.",
        "[DATA] EXPLORATION :: THERE'S A GREAT HIKING TRAIL LEADING TO THE OBSIDIAN PEAKS. EXCELLENT TOPOGRAPHICAL DATA OPPORTUNITIES AND A CLEAR VIEW OF THE DROPSHIP LANDING CORRIDORS.",
        "[INTERCEPT] WARNING :: AVOID THE VENDOR NEAR DOCKING BAY 4. HE'S SELLING REFURBISHED ACTUATORS STRIPPED FROM SALVAGE AS FACTORY NEW. CHECK THE SERIAL NUMBERS.",
        "[COMM] LOCAL-INTEL :: FLORA ANALYSIS: BLUE FERNS IN THE LOWER CANYON ARE TOXIC TO NEUROHELM SENSORS. DO NOT BRING SAMPLES INTO THE COCKPIT OR BARRACKS.",
        "[SIGNAL] RECREATION :: ANYONE UP FOR A HIKE TO THE CRYSTAL FALLS? I NEED TO GET OUT OF THIS BUNK AND BREATH SOMETHING OTHER THAN RECYCLED AIR.",
        "[DATA] MERCHANT-ALERT :: 'HONEST ED'S REPAIR SHOP' IS NEITHER HONEST NOR A COMPETENT REPAIR SHOP. THEY'RE JUST SALVAGE VULTURES. STAY CLEAR.",
        "[SIGNAL] LOCAL-INTEL :: LOCAL WILDLIFE ADVISORY: THE 'GRABBER-VINES' IN THE MARSHES ARE ACTIVE. KEEP YOUR COOLANT LINES SEALED.",
        "[SIGNAL] LOCAL-INTEL :: WATCH OUT FOR THE LOCAL SAND-KRAKEN NEAR THE NORTH RIDGE. THEY'VE BEEN KNOWN TO DISRUPT SENSOR ARRAYS AND SCAVENGE LOOSE PLATING.",
        "[COMM] RECREATION :: THE 'HINTERLANDS GRILL' NEAR THE MAIN SPACEPORT HAS THE BEST SYNTH-STEAK THIS SIDE OF OUTREACH. AVOID THE HOUSE SPECIAL ALCOHOL UNLESS YOU LIKE THE TASTE OF INDUSTRIAL COOLANT.",
        "[DATA] EXPLORATION :: THERE'S A GREAT HIKING TRAIL LEADING TO THE OBSIDIAN PEAKS. EXCELLENT TOPOGRAPHICAL DATA OPPORTUNITIES AND A CLEAR VIEW OF THE DROPSHIP LANDING CORRIDORS.",
        "[INTERCEPT] WARNING :: AVOID THE VENDOR NEAR DOCKING BAY 4. HE'S SELLING REFURBISHED ACTUATORS STRIPPED FROM SALVAGE AS FACTORY NEW. CHECK THE SERIAL NUMBERS.",
        "[COMM] LOCAL-INTEL :: FLORA ANALYSIS: BLUE FERNS IN THE LOWER CANYON ARE TOXIC TO NEUROHELM SENSORS. DO NOT BRING SAMPLES INTO THE COCKPIT OR BARRACKS.",
        "[SIGNAL] RECREATION :: ANYONE UP FOR A HIKE TO THE CRYSTAL FALLS? I NEED TO GET OUT OF THIS BUNK AND BREATH SOMETHING OTHER THAN RECYCLED AIR.",
        "[DATA] MERCHANT-ALERT :: 'HONEST ED'S REPAIR SHOP' IS NEITHER HONEST NOR A COMPETENT REPAIR SHOP. THEY'RE JUST SALVAGE VULTURES. STAY CLEAR.",
        "[SIGNAL] LOCAL-INTEL :: LOCAL WILDLIFE ADVISORY: THE 'GRABBER-VINES' IN THE MARSHES ARE ACTIVE. KEEP YOUR COOLANT LINES SEALED.",
        "[SIGNAL] LOCAL-INTEL :: WATCH OUT FOR THE LOCAL SAND-KRAKEN NEAR THE NORTH RIDGE. THEY'VE BEEN KNOWN TO DISRUPT SENSOR ARRAYS AND SCAVENGE LOOSE PLATING.",
        "[COMM] RECREATION :: THE 'HINTERLANDS GRILL' NEAR THE MAIN SPACEPORT HAS THE BEST SYNTH-STEAK THIS SIDE OF OUTREACH. AVOID THE HOUSE SPECIAL ALCOHOL UNLESS YOU LIKE THE TASTE OF INDUSTRIAL COOLANT.",
        "[DATA] EXPLORATION :: THERE'S A GREAT HIKING TRAIL LEADING TO THE OBSIDIAN PEAKS. EXCELLENT TOPOGRAPHICAL DATA OPPORTUNITIES AND A CLEAR VIEW OF THE DROPSHIP LANDING CORRIDORS.",
        "[INTERCEPT] WARNING :: AVOID THE VENDOR NEAR DOCKING BAY 4. HE'S SELLING REFURBISHED ACTUATORS STRIPPED FROM SALVAGE AS FACTORY NEW. CHECK THE SERIAL NUMBERS.",
        "[COMM] LOCAL-INTEL :: FLORA ANALYSIS: BLUE FERNS IN THE LOWER CANYON ARE TOXIC TO NEUROHELM SENSORS. DO NOT BRING SAMPLES INTO THE COCKPIT OR BARRACKS.",
        "[SIGNAL] RECREATION :: ANYONE UP FOR A HIKE TO THE CRYSTAL FALLS? I NEED TO GET OUT OF THIS BUNK AND BREATH SOMETHING OTHER THAN RECYCLED AIR.",
        "[DATA] MERCHANT-ALERT :: 'HONEST ED'S REPAIR SHOP' IS NEITHER HONEST NOR A COMPETENT REPAIR SHOP. THEY'RE JUST SALVAGE VULTURES. STAY CLEAR.",
        "[SIGNAL] LOCAL-INTEL :: LOCAL WILDLIFE ADVISORY: THE 'GRABBER-VINES' IN THE MARSHES ARE ACTIVE. KEEP YOUR COOLANT LINES SEALED.",
    ], []);

    const scrollRef = useRef<HTMLDivElement>(null);
    const [scrollDuration, setScrollDuration] = useState(80);

    useEffect(() => {
        if (scrollRef.current) {
            const distanceToTravel = scrollRef.current.scrollHeight / 2;
            const pixelsPerSecond = 20;

            const calculatedDuration = distanceToTravel / pixelsPerSecond;
            setScrollDuration(calculatedDuration);
        }
    }, [intercepts]);

    return (
        <div className="theater-background" aria-hidden="true">
            <div className="map-overlay" />
            <div className="intercept-scroll" ref={scrollRef} style={{ animationDuration: `${scrollDuration}s` }}>
                {[...intercepts, ...intercepts].map((text, i) => (
                    <div key={i} className="intercept-line">{text}</div>
                ))}
            </div>
            <style>{`
                .theater-background {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    pointer-events: none; z-index: -1;
                    overflow: hidden;
                }
                .map-overlay {
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    background-image: url('/regiment_camp_map.png');
                    background-size: contain;
                    background-repeat: no-repeat;
                    background-position: center;
                    opacity: 0.4;
                }
                .intercept-scroll {
                    position: absolute;
                    top: 20px; left: 20px;
                    width: 500px;
                    font-family: monospace;
                    font-size: 0.7rem;
                    color: var(--terminal-amber);
                    display: flex; flex-direction: column; gap: 15px;
                    animation: scroll-intel linear infinite;
                    white-space: normal;
                    text-transform: uppercase;
                    opacity: 0.15;
                    mask-image: linear-gradient(to bottom, black, transparent);
                }
                @keyframes scroll-intel {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-50%); }
                }
                .intercept-line {
                    padding-left: 1.5rem;
                    text-indent: -1.5rem;
                }
            `}</style>
        </div>
    );
};