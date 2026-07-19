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

export const CampaignTheaterBackground: React.FC = () => {
    const intercepts = useMemo(() => {
        const baseList = [
            "[SIGNAL] LOCAL-INTEL :: WATCH OUT FOR THE LOCAL SAND-KRAKEN NEAR THE NORTH RIDGE. THEY'VE BEEN KNOWN TO DISRUPT SENSOR ARRAYS AND SCAVENGE LOOSE PLATING.",
            "[COMM] RECREATION :: THE 'HINTERLANDS GRILL' NEAR THE MAIN SPACEPORT HAS THE BEST SYNTH-STEAK THIS SIDE OF OUTREACH. AVOID THE HOUSE SPECIAL ALCOHOL UNLESS YOU LIKE THE TASTE OF INDUSTRIAL COOLANT.",
            "[DATA] EXPLORATION :: THERE'S A GREAT HIKING TRAIL LEADING TO THE OBSIDIAN PEAKS. EXCELLENT TOPOGRAPHICAL DATA OPPORTUNITIES AND A CLEAR VIEW OF THE DROPSHIP LANDING CORRIDORS.",
            "[INTERCEPT] WARNING :: AVOID THE VENDOR NEAR DOCKING BAY 4. HE'S SELLING REFURBISHED ACTUATORS STRIPPED FROM SALVAGE AS FACTORY NEW. CHECK THE SERIAL NUMBERS.",
            "[COMM] LOCAL-INTEL :: FLORA ANALYSIS: BLUE FERNS IN THE LOWER CANYON ARE TOXIC TO NEUROHELM SENSORS. DO NOT BRING SAMPLES INTO THE COCKPIT OR BARRACKS.",
            "[SIGNAL] RECREATION :: ANYONE UP FOR A HIKE TO THE CRYSTAL FALLS? I NEED TO GET OUT OF THIS BUNK AND BREATH SOMETHING OTHER THAN RECYCLED AIR.",
            "[DATA] MERCHANT-ALERT :: 'HONEST ED'S REPAIR SHOP' IS NEITHER HONEST NOR A COMPETENT REPAIR SHOP. THEY'RE JUST SALVAGE VULTURES. STAY CLEAR.",
            "[SIGNAL] LOCAL-INTEL :: LOCAL WILDLIFE ADVISORY: THE 'GRABBER-VINES' IN THE MARSHES ARE ACTIVE. KEEP YOUR COOLANT LINES SEALED.",
            "[COMM] RECREATION :: THE 'NEON NEBU-CASINO' HAS A GREAT SLOT ARRAY, BUT DON'T LOSE YOUR PAYCHECK IN THE FIRST HOUR.",
            "[SIGNAL] LOCAL-INTEL :: BEWARE OF THE 'STATIC-FLIES' NEAR THE RUINS. THEY CLOG UP VENTILATION GRATES AND ARE A NIGHTMARE TO CLEAN OUT.",
            "[DATA] WEATHER :: SEVERE ELECTROMAGNETIC INTERFERENCE DETECTED. EXPECT TOTAL SENSOR BLACKOUT IN THE LOWLANDS BY 0400 HOURS.",
            "[SIGNAL] LOCAL-INTEL :: THE 'GLOW-LURKERS' IN THE CRYSTAL GROVES ARE ACTIVE. THEY LOVE THE SMELL OF RECYCLED OXYGEN AND METAL.",
            "[COMM] RECREATION :: IF YOU NEED A CHANGE OF SCENERY, THE THERMAL VENTS IN SECTOR 4 ARE GREAT FOR RELAXING—JUST DON'T OVERDO THE HEAT.",
            "[DATA] WEATHER :: ACID RAIN WARNING. ALL MECHWARRIORS MUST ENSURE COCKPIT SEALS ARE FULLY OPERATIONAL BEFORE DEPLOYMENT.",
            "[SIGNAL] LOCAL-INTEL :: WATCH YOUR STEP NEAR THE IRONWOOD FOREST; THE ROOTS ARE TRIPPING UP RECON DRONES CONSTANTLY.",
            "[COMM] RECREATION :: THE 'SILVER SPIRE' HOLO-THEATER IS SHOWING A CLASSIC BATTLEMECH DRAMA. GREAT WAY TO KILL A LONG WATCH.",
            "[DATA] WEATHER :: EXTREME DUST STORM APPROACHING FROM THE WESTERN DESERT. SECURE ALL LOOSE EXTERNAL SENSORS AND GEAR.",
            "[SIGNAL] LOCAL-INTEL :: THE 'WIRE-WORMS' IN THE LOWER BARRACKS ARE BACK. CHECK YOUR POWER CABLES FOR NIBBLE MARKS.",
            "[COMM] RECREATION :: AVOID THE LOCAL STREET FOOD NEAR THE SPACEPORT UNLESS YOU WANT A STOMACH BUG THAT LASTS A WEEK.",
            "[DATA] WEATHER :: TEMPERATURE DROP EXPECTED IN THE NORTHERN BASIN. ENSURE ALL THERMAL REGULATORS ARE FUNCTIONING.",
            "[SIGNAL] LOCAL-INTEL :: THE 'SAND-SKIMMERS' ARE SWARMING THE OUTSKIRTS. THEY WON'T KILL YOU, BUT THEY WILL STRIP YOUR PAINT.",
            "[COMM] RECREATION :: THE TRADITIONAL FESTIVAL IN THE CAPITAL IS STARTING. GREAT FOR CULTURE, BAD FOR SENSORY OVERLOAD.",
            "[DATA] WEATHER :: HIGH-VELOCITY WIND WARNING. LANDING PROCEDURES FOR DROPSHIPS SHOULD BE ADJUSTED FOR CROSSWINDS.",
            "[SIGNAL] LOCAL-INTEL :: THE 'ACID-SLUGS' IN THE MARSHES CAN EAT THROUGH STANDARD-ISS BOOTS IN UNDER AN HOUR. WATCH YOUR STEP.",
            "[COMM] RECREATION :: IF YOU FIND A GOOD TRADING POST NEAR THE MOUNTAINS, LET THE CREW KNOW. WE NEED BETTER SNACKS.",
            "[DATA] WEATHER :: CORROSIVE MIST DETECTED IN THE LOWER VALLEYS. ALL EXTERNAL ARMOR PLATING SHOULD BE COATED.",
            "[SIGNAL] LOCAL-INTEL :: THE 'SCAVENGER-CRABS' ARE HITTING THE SHIPYARDS AGAIN. THEY HAVE A TASTE FOR TITANIUM ALLOY.",
            "[COMM] RECREATION :: THE 'OLD MAN'S TAVERN' HAS THE ONLY REAL ALE ON THIS PLANET. GO THERE, BUT DON'T TELL COMMAND.",
            "[DATA] WEATHER :: SUDDEN HEAT WAVE ALERT. MONITOR COOLANT LEVELS IN ALL STATIONARY POWER GENERATORS.",
            "[SIGNAL] LOCAL-INTEL :: BEWARE OF THE 'MIRAGE-TRAPS' IN THE SALT FLATS. THEY CAN TRICK YOUR NAV-COMPUTER INTO A DEAD END.",
            "[COMM] RECREATION :: THERE IS A HISTORICAL MUSEUM NEAR DOCKING BAY 1. GOOD FOR LEARNING, BUT WATCH OUT FOR THE TOURIST CROWDS.",
            "[DATA] WEATHER :: UNSTABLE ATMOSPHERIC PRESSURE DETECTED. KEEP ALL AIRLOCKS DOUBLE-CHECKED DURING TRANSIT.",
            "[SIGNAL] LOCAL-INTEL :: THE 'MUD-SKULKERS' ARE LURKING IN THE RIVERBEDS. THEY TEND TO CLOG UP HYDRAULIC JOINTS."
        ];
        return [...baseList].sort(() => Math.random() - 0.5);
    }, []);

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
                    background-size: cover;
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