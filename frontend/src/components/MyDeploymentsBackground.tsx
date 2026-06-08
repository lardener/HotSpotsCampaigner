import React, { useMemo, useRef, useState, useEffect } from 'react';

export const MyDeploymentsBackground: React.FC = () => {
    const intercepts = useMemo(() => {
        const baseList = [
            "[COMM] FROM: CAPT. H. MILLER (DS 'STRAY BULLET') TO: J. VANCE (JS 'STELLAR WIND') :: HEY JIM, ANOTHER BURN TO THE NADIR POINT. THESE MERCS ARE TEARING UP THE MESS HALL AGAIN. IF THEY DON'T STOP 'TESTING' THEIR NEUROHELMS IN THE CARGO BAY, I'M LOCKING THE AIRLOCK. PAY'S LATE, AS USUAL.",
            "[SIGNAL] FROM: PILOT K. ROSSI (DS 'IRON DRAGON') TO: NAV-COM 7 :: DELTA-V IS SLUGGISH. TELL THE CLIENT THAT IF THEY WANT HIGH-G MANEUVERS, THEY BETTER PAY FOR THE REACTION MASS. I'M NOT BURNING OUT MY ENGINES FOR A 'PRIORITY 1' SALVAGE GRAB THAT'S MOSTLY SCRAP.",
            "[DATA] SECURE CHANNEL - INTERCEPT 0942 :: CLIENT WANTS A HOT DROP INTO A VOLCANO, BASICALLY. THEY CALL IT A 'TACTICAL ADVANTAGE'. I CALL IT A QUICK WAY TO MELT MY LANDING STRUTS. NEXT TIME, I'M TAKING THE CONTRACT WITH THE MAGISTRACY. AT LEAST THE FOOD'S BETTER.",
            "[SIGINT] - 3051.12.04 - JUMPSHIP 'PRIDE OF HESPERUS' REPORTS DOCKING RING FAILURE. IT'S THE SECOND TIME THIS WEEK. THESE MECHWARRIORS ACT LIKE THEY OWN THE STATION. SOMEONE TELL THEM MY DOCKING COLLARS AREN'T FOR TARGET PRACTICE",
            "[COMM] FROM: V. SANCHEZ (JS 'VOID WALKER') TO: ALL DS PILOTS :: REMINDER: JUMP SIGNATURES ARE MONITORED. STOP DUMPING WASTE FLUIDS NEAR THE K-F DRIVE. THE LAST JUMP WAS ROUGH ENOUGH WITHOUT YOUR SLUDGE FREEZING ON MY SENSORS.",
            "[INTERCEPT] MRBC RECLAMATION NOTICE :: TO THE PILOT OF THE 'LEAPING LIZARD': YOUR DOCKING FEES ARE 3 MONTHS OVERDUE. EITHER PAY OR WE WILL SEIZE THE DROPSHIP UPON LANDING AT OUTREACH.",
            "[SIGNAL] FROM: LT. CHEN TO: CMD :: WE'RE ON BURN FOR NEW AVALON. THE JUMPSHIP CREW IS GRUMPY, THE MECHWARRIORS ARE BORED, AND THE COFFEE IS GONE. GOD HELP US ALL.",
            "[COMM] FROM: CAPT. THORNE (DS STRAY BULLET) TO: J. VANCE (JS STELLAR WIND) :: MEET ME AT THE OUTREACH TAVERN AFTER THIS DROP. I HEARD THEY HAVE A NEW BATCH OF SYNTH-ALE THAT DOES NOT TASTE LIKE FUEL.",
            "[SIGNAL] FROM: PILOT K. KOVIC (DS VOID WALKER) TO: V. SANCHEZ (JS STELLAR WIND) :: YOUR JUMP SIGNATURE WAS ALL OVER THE RADAR, SANCHEZ. TRY NOT TO WAKE THE WHOLE SECTOR NEXT TIME YOU HIT THE K-F FIELD.",
            "[COMM] FROM: LT. RENARD (DS IRON DRAGON) TO: CAPT. GRAVES (JS TITAN REACH) :: AVOID THAT CONTRACT IN THE ST IVES COMPACT. THEY PROMISED REARMING, BUT WE SPENT THREE DAYS WAITING ON A BROKEN TUG.",
            "[SIGNAL] FROM: PILOT JAX (DS SHADOW RUNNER) TO: LT. CHEN :: WHY IS YOUR DROPSHIP STILL AT THE STATION? WE HAVE BEEN READY FOR DEPLOYMENT FOR FOUR HOURS. GET A MOVE ON!",
            "[COMM] FROM: CAPT. STERLING (JS SOLARIS EXPRESS) TO: PILOT SATO :: IF YOU NEED RELIABLE TRANSIT, HIRE THE CREW FROM THE VOID WALKER. THEY ACTUALLY KNOW HOW TO NAVIGATE A JUMP WITHOUT VOMITING.",
            "[SIGNAL] FROM: PILOT BELTRAN (DS NIGHTHAWK) TO: CAPT. THORNE :: MEET ME AT THE DOCKING RING AFTER YOUR REFIT. I HAVE SOME INTEL ON A NEW LEGACY CONTRACT IN THE DRACONIS REACH.",
            "[COMM] FROM: PILOT ROSSI (DS LIGHTNING) TO: CAPT. THORNE :: DO NOT TAKE THAT MAGISTRACY JOB. THE PAY IS GOOD, BUT THEIR REARMING SCHEDULE IS A TOTAL DISASTER.",
            "[DATA] INTERCEPT :: THE CREW ON THE LEAPING LIZARD ARE TOTAL AMATEURS. THEY DROPPED US SO HARD I THINK MY SPINE IS PERMANENTLY RECALIBRATED.",
            "[SIGNAL] FROM: PILOT HENDERSON (DS BOLT) TO: PILOT KOVIC :: WE ARE STILL WAITING FOR YOUR FUELING SLUGS TO ARRIVE AT THE REFUELING POINT. DO NOT EXPECT US TO WAIT PAST 0600.",
            "[COMM] FROM: CAPT. DRAKEN (JS STAR CHASER) TO: J. VANCE :: THE CREW ON STELLAR WIND IS TOO SLOW. BY THE TIME THEY ARRIVED, THE TARGET WAS ALREADY ASHES.",
            "[SIGNAL] FROM: PILOT JAX (DS SHADOW RUNNER) TO: V. SANCHEZ :: MEET ME AT THE SPACEPORT BAR AFTER THE DROP. I AM BUYING THE FIRST ROUND OF RECYCLED WATER.",
            "[COMM] FROM: LT. KOVIC (DS IRON DRAGON) TO: CAPT. GRAVES :: STAY AWAY FROM THE TAURIAN CONCORDAT CONTRACTS. THE LOCAL ARMIES ARE UNPREDICTABLE AND THE PAY IS ALWAYS LATE.",
            "[SIGNAL] FROM: PILOT MILLER (DS STRAY BULLET) TO: LT. CHEN :: IF YOU SEE THE CREW FROM THE TITAN REACH, TELL THEM THEY STILL OWE ME FOR THAT ENGINE PART I LOANED THEM.",
            "[COMM] FROM: CAPT. STERLING (JS SOLARIS EXPRESS) TO: PILOT RENARD :: HIRE THE STRAY BULLET CREW FOR YOUR NEXT LONG-RANGE BURN. THEY ARE GRUMPY, BUT THEY NEVER MISS A JUMP WINDOW."
        ];
        return [...baseList].sort(() => Math.random() - 0.5);
    }, []);

    const scrollRef = useRef<HTMLDivElement>(null);
    const [scrollDuration, setScrollDuration] = useState(60);

    useEffect(() => {
        if (scrollRef.current) {
            const distanceToTravel = scrollRef.current.scrollHeight / 2;
            const pixelsPerSecond = 20;

            const calculatedDuration = distanceToTravel / pixelsPerSecond;
            setScrollDuration(calculatedDuration);
        }
    }, [intercepts]);

    return (
        <div className="deployments-bg" aria-hidden="true">
            <div className="schematic-overlay" />
            <div className="intercept-scroll" ref={scrollRef} style={{ animationDuration: `${scrollDuration}s` }}>
                {[...intercepts, ...intercepts].map((text, i) => (
                    <div key={i} className="intercept-line">{text}</div>
                ))}
            </div>
            <style>{`
                .deployments-bg {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    pointer-events: none;
                    z-index: -1;
                    overflow: hidden;
                }
                .schematic-overlay {
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    background-image: url('/cargo_loading.png');
                    background-size: cover;
                    background-repeat: no-repeat;
                    background-position: center;
                    opacity: 0.15;
                }
                .intercept-scroll {
                    position: absolute;
                    top: 20px; left: 20px;
                    width: 500px;
                    font-family: monospace;
                    font-size: 0.7rem;
                    color: var(--terminal-amber);
                    display: flex; flex-direction: column; gap: 5px;
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