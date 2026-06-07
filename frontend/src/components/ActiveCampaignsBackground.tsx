import React, { useMemo, useRef, useState, useEffect } from 'react';

export const ActiveCampaignsBackground: React.FC = () => {
    const intercepts = useMemo(() => [
        "[SIGINT] - 3050.05.22 - CLAN GHOST BEAR SIGNATURES AT ALSHAIN",
        "[INTERCEPT] - 3051.11.15 - MRBC NOTICE: MISERY CONTRACT TERMINATED",
        "[SIGNAL] - 3052.05.20 - COMSTAR COMMUNIQUE: TUKAYYID DEFENSES HOLDING",
        "[DATA] - 3049.08.10 - DEEP PERIPHERY SIGNAL LOSS REPORTED",
        "[INTERCEPT] - 3055.03.12 - FEDCOM MOVEMENT TOWARD HESPERUS II",
        "[ENCRYPTED] - 3058.12.01 - LUTHRIEN SIGNAL INTERRUPT",
        "[COMM] - 3062.04.18 - WOLF'S DRAGOONS OUTREACH PROTOCOL ENGAGED"
    ], []);

    const scrollRef = useRef<HTMLDivElement>(null);
    const [scrollDuration, setScrollDuration] = useState(40);

    useEffect(() => {
        if (scrollRef.current) {
            // Animation travels 50% of total scrollHeight
            const distanceToTravel = scrollRef.current.scrollHeight / 2;

            // Global terminal speed (pixels per second)
            const pixelsPerSecond = 20;

            const calculatedDuration = distanceToTravel / pixelsPerSecond;
            setScrollDuration(calculatedDuration);
        }
    }, [intercepts]);

    return (
        <div className="active-campaigns-bg" aria-hidden="true">
            <div className="intel-overlay" />
            <svg className="star-map" viewBox="0 0 400 400">
                <g className="transmission-lines">
                    <line x1="100" y1="120" x2="250" y2="80" />
                    <line x1="250" y1="80" x2="320" y2="200" />
                    <line x1="320" y1="200" x2="180" y2="280" />
                    <line x1="180" y1="280" x2="80" y2="350" />
                    <line x1="100" y1="120" x2="180" y2="280" />
                </g>
                <g className="systems">
                    <circle cx="100" cy="120" r="3" /><text x="105" y="115">TUKAYYID</text>
                    <circle cx="250" cy="80" r="3" /><text x="255" y="75">MISERY</text>
                    <circle cx="320" cy="200" r="3" /><text x="325" y="195">LUTHIEN</text>
                    <circle cx="180" cy="280" r="3" /><text x="185" y="275">ALSHAIN</text>
                    <circle cx="80" cy="350" r="3" /><text x="85" y="345">OUTREACH</text>
                </g>
            </svg>
            <div className="intercept-scroll" ref={scrollRef} style={{ animationDuration: `${scrollDuration}s` }}>
                {[...intercepts, ...intercepts].map((text, i) => (
                    <div key={i} className="intercept-line">{text}</div>
                ))}
            </div>
            <style>{`
                .active-campaigns-bg {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    pointer-events: none; 
                    z-index: -1;
                    overflow: hidden;
                }
                .intel-overlay {
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    background-image: url('/map_of_inner_sphere.png');
                    background-size: contain;
                    background-repeat: no-repeat;
                    background-position: center;
                    opacity: 0.4;
                }
                .star-map {
                    position: absolute;
                    top: 0; right: 0;
                    width: 500px; height: 500px;
                    stroke: var(--terminal-amber);
                    fill: var(--terminal-amber);
                    font-size: 10px; font-family: monospace;
                    stroke-width: 0.5; opacity: 0.1;
                }
                .transmission-lines line {
                    stroke-dasharray: 4;
                    opacity: 0.2;
                }
                .intercept-scroll {
                    position: absolute;
                    top: 20px; left: 20px;
                    width: 500px;
                    font-family: monospace;
                    font-size: 0.7rem;
                    color: var(--terminal-amber);
                    display: flex; flex-direction: column; gap: 5px;
                    animation: scroll-intel ${scrollDuration}s linear infinite;
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