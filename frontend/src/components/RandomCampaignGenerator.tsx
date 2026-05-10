import React, { useState, useEffect } from 'react';

const FACTIONS = ["Alyina Consent", "Vesper Marches", "Tamar Pact", "Clan Hell's Horses", "Jade Falcon", "Belter Alliance"];
const MISSIONS = ["Expedition", "Raid", "Cadre Duty", "Extraction", "Planetary Assault", "Garrison", "Insurrection"];
const SUPPORT_TYPES = ["Standard", "Full"];
const TRANSPORT_TYPES = ["Employer Provided", "Mercenary Provided"];
const SALVAGE_TYPES = ["None", "Shared", "Exchange", "Full"];
const COMMAND_TYPES = ["Independent", "Liaison", "House"];

interface ContractPreview {
    employerCategory: string;
    missionType: string;
    warchestMultiplier: number;
    salvageTerms: string;
    supportTerms: string;
    transportTerms: string;
    commandRights: string;
    paymentSp: number;
    lengthInMonths: number;
    trackCount: number;
}

interface Proposal {
    campaign: { name: string, systemName: string };
    contracts: ContractPreview[];
    tracks: string[];
}

interface Props {
    user?: { name: string };
}

export const RandomCampaignGenerator: React.FC<Props> = ({ user }) => {
    const [employer, setEmployer] = useState('');
    const [opponent, setOpponent] = useState('');
    const [mission, setMission] = useState('');
    const [employerCategory, setEmployerCategory] = useState('');
    const [systemName, setSystemName] = useState('');
    const [warchestMultiplier, setWarchestMultiplier] = useState('');
    const [salvageTerms, setSalvageTerms] = useState('');
    const [supportTerms, setSupportTerms] = useState('');
    const [transportTerms, setTransportTerms] = useState('');
    const [commandRights, setCommandRights] = useState('');
    const [lengthInMonths, setLengthInMonths] = useState('');
    const [paymentSp, setPaymentSp] = useState('');
    const [trackCount, setTrackCount] = useState('');

    const [employerTypes, setEmployerTypes] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [proposal, setProposal] = useState<Proposal | null>(null);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetch('http://localhost:8080/api/campaigns/metadata/employer-types', {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => setEmployerTypes(data))
            .catch(err => console.error("Failed to load employer types", err));
    }, []);

    const getQueryParams = () => {
        const params = new URLSearchParams({ employer, opponent, mission });
        if (employerCategory) params.append('employerCategory', employerCategory);
        if (systemName) params.append('systemName', systemName);
        if (warchestMultiplier) params.append('warchestMultiplier', warchestMultiplier);
        if (salvageTerms) params.append('salvageTerms', salvageTerms);
        if (supportTerms) params.append('supportTerms', supportTerms);
        if (transportTerms) params.append('transportTerms', transportTerms);
        if (commandRights) params.append('commandRights', commandRights);
        if (lengthInMonths) params.append('lengthInMonths', lengthInMonths);
        if (paymentSp) params.append('paymentSp', paymentSp);
        if (trackCount) params.append('trackCount', trackCount);
        return params;
    };

    const handlePreview = async () => {
        setLoading(true);
        setSaved(false);
        try {
            const response = await fetch(`http://localhost:8080/api/campaigns/dobless/preview?${getQueryParams().toString()}`, {
                method: 'GET',
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setProposal(data);
            }
        } catch (error) {
            console.error("Dobless preview failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/api/campaigns/dobless?${getQueryParams().toString()}`, {
                method: 'POST',
                credentials: 'include'
            });
            if (response.ok) {
                setSaved(true);
            }
        } catch (error) {
            console.error("Dobless save failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="dashboard-section generator-panel">
            <h2 className="section-title">DOBLESS INFORMATION SERVICE</h2>
            <p className="restricted-text">HINTERLANDS REGIONAL INTEL UPDATED</p>

            <div className="generator-controls">
                <div className="form-group">
                    <label>FIXED EMPLOYER (OPTIONAL)</label>
                    <select value={employer} onChange={(e) => setEmployer(e.target.value)}>
                        <option value="">[ RANDOMIZE ]</option>
                        {FACTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label>FIXED OPPONENT (OPTIONAL)</label>
                    <select value={opponent} onChange={(e) => setOpponent(e.target.value)}>
                        <option value="">[ RANDOMIZE ]</option>
                        {FACTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label>MISSION TYPE (OPTIONAL)</label>
                    <select value={mission} onChange={(e) => setMission(e.target.value)}>
                        <option value="">[ RANDOMIZE ]</option>
                        {MISSIONS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label>EMPLOYER TYPE</label>
                    <select value={employerCategory} onChange={(e) => setEmployerCategory(e.target.value)}>
                        <option value="">[ RANDOMIZE ]</option>
                        {employerTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label>SYSTEM NAME</label>
                    <input type="text" value={systemName} onChange={(e) => setSystemName(e.target.value)} placeholder="RANDOM" />
                </div>

                <div className="form-group">
                    <label>WARCHEST MULTIPLIER</label>
                    <input type="number" step="0.1" value={warchestMultiplier} onChange={(e) => setWarchestMultiplier(e.target.value)} placeholder="RANDOM" />
                </div>

                <div className="form-group">
                    <label>SALVAGE TERMS</label>
                    <select value={salvageTerms} onChange={(e) => setSalvageTerms(e.target.value)}>
                        <option value="">[ RANDOMIZE ]</option>
                        {SALVAGE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label>SUPPORT TERMS</label>
                    <select value={supportTerms} onChange={(e) => setSupportTerms(e.target.value)}>
                        <option value="">[ RANDOMIZE ]</option>
                        {SUPPORT_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label>TRANSPORTATION</label>
                    <select value={transportTerms} onChange={(e) => setTransportTerms(e.target.value)}>
                        <option value="">[ RANDOMIZE ]</option>
                        {TRANSPORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label>COMMAND RIGHTS</label>
                    <select value={commandRights} onChange={(e) => setCommandRights(e.target.value)}>
                        <option value="">[ RANDOMIZE ]</option>
                        {COMMAND_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label>LENGTH (MONTHS)</label>
                    <input type="number" value={lengthInMonths} onChange={(e) => setLengthInMonths(e.target.value)} placeholder="RANDOM" />
                </div>

                <div className="form-group">
                    <label>BASE PAY (SP)</label>
                    <input type="number" value={paymentSp} onChange={(e) => setPaymentSp(e.target.value)} placeholder="RANDOM" />
                </div>

                <div className="form-group">
                    <label>EXPECTED TRACKS</label>
                    <input type="number" value={trackCount} onChange={(e) => setTrackCount(e.target.value)} placeholder="RANDOM" />
                </div>
            </div>

            <button
                onClick={handlePreview}
                disabled={loading}
                className="login-button"
                style={{ marginTop: '20px' }}
            >
                {loading ? 'ANALYZING INTEL...' : 'GENERATE CONTRACT OFFERS'}
            </button>

            {proposal && (
                <div className="proposal-view" style={{ marginTop: '30px' }}>
                    <h3 className="section-title">DOBLESS INTEL: {proposal.campaign.name}</h3>
                    <p><strong>OPERATIONAL SYSTEM:</strong> {proposal.campaign.systemName}</p>

                    <div className="campaign-tracks" style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'rgba(255,0,0,0.05)', border: '1px solid #c00' }}>
                        <strong>THEATER OPERATIONAL TRACKS</strong>
                        <div style={{ marginTop: '10px', fontSize: '0.9em' }}>
                            {proposal.tracks.map((t, idx) => <div key={idx}>TRACK {idx + 1}: {t}</div>)}
                        </div>
                    </div>

                    <div className="contract-grid">
                        {proposal.contracts.map((c, i) => (
                            <div key={i} className="summary-item" style={{ marginBottom: '20px', border: '1px solid #444', padding: '15px' }}>
                                <strong>CONTRACT OF MERCENARY EMPLOYMENT #{i + 1}</strong>
                                <p><strong>EMPLOYER:</strong> {c.employerCategory}</p>
                                <p><strong>MISSION:</strong> {c.missionType}</p>
                                <p><strong>PAYMENT:</strong> {c.paymentSp} SP | <strong>WARCHEST:</strong> {c.warchestMultiplier.toFixed(1)}x</p>
                                <p><strong>SALVAGE:</strong> {c.salvageTerms} | <strong>SUPPORT:</strong> {c.supportTerms}</p>
                                <p><strong>TRANSPORT:</strong> {c.transportTerms} | <strong>COMMAND:</strong> {c.commandRights}</p>
                                <p><strong>DURATION:</strong> {c.lengthInMonths} MONTHS | <strong>EXPECTED TRACKS:</strong> {c.trackCount}</p>
                            </div>
                        ))}
                    </div>

                    {user ? (
                        <button onClick={handleSave} disabled={loading || saved} className="login-button">
                            {saved ? 'CAMPAIGN ARCHIVED' : 'CONFIRM & SAVE CAMPAIGN'}
                        </button>
                    ) : (
                        <p className="restricted-text">AUTHENTICATION REQUIRED TO PERSIST CAMPAIGN DATA</p>
                    )}
                </div>
            )}
        </section>
    );
};