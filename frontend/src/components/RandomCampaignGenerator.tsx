import React, { useState, useEffect } from 'react';

interface ContractPreview {
    employerCategory: string;
    missionType: string;
    primaryContract: boolean;
    payRate: number;
    payStep: number;
    salvageTerms: string;
    salvageStep: number;
    supportTerms: string;
    supportStep: number;
    transportTerms: string;
    transportStep: number;
    commandRights: string;
    commandStep: number;
    lengthInMonths: number;
    trackCount: number;
}

interface Proposal {
    campaign: {
        name: string,
        systemName: string,
        lengthInMonths: number,
        trackCount: number
    };
    contracts: ContractPreview[];
    tracks: string[];
}

interface Props {
    user?: { name: string };
}

export const RandomCampaignGenerator: React.FC<Props> = ({ user }) => {
    const [missions, setMissions] = useState<string[]>([]);
    const [resolvedSteps, setResolvedSteps] = useState<Record<number, any>>({});
    const [trackTypes, setTrackTypes] = useState<string[]>([]);

    const [loading, setLoading] = useState(false);
    const [proposal, setProposal] = useState<Proposal | null>(null);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const fetchMetadata = async () => {
            const baseUrl = 'http://localhost:8080/api/campaigns/metadata';
            try {
                const [missRes, trackRes, stepRes] = await Promise.all([
                    fetch(`${baseUrl}/missions`, { credentials: 'include' }),
                    fetch(`${baseUrl}/track-types`, { credentials: 'include' }),
                    fetch(`${baseUrl}/resolved-steps`, { credentials: 'include' })
                ]);
                if (missRes.ok) setMissions(await missRes.json());
                if (trackRes.ok) setTrackTypes(await trackRes.json());
                if (stepRes.ok) setResolvedSteps(await stepRes.json());
            } catch (err) {
                console.error("Failed to load generator metadata", err);
            }
        };
        fetchMetadata();
    }, []);

    const getQueryParams = () => {
        return new URLSearchParams();
    };

    const getSaveParams = () => {
        if (!proposal) return new URLSearchParams();
        const primary = proposal.contracts[0];
        const opponent = proposal.contracts[1];

        const params = new URLSearchParams({
            employer: primary.employerCategory.split(': ')[0],
            opponent: opponent.employerCategory.split(': ')[0],
            mission: primary.missionType,
            employerCategory: primary.employerCategory.split(': ')[1],
            systemName: proposal.campaign.systemName,
            payRate: primary.payRate.toString(),
            salvageTerms: primary.salvageTerms,
            supportTerms: primary.supportTerms,
            transportTerms: primary.transportTerms,
            commandRights: primary.commandRights,
            payStep: primary.payStep.toString(),
            salvageStep: primary.salvageStep.toString(),
            supportStep: primary.supportStep.toString(),
            transportStep: primary.transportStep.toString(),
            commandStep: primary.commandStep.toString(),
            lengthInMonths: proposal.campaign.lengthInMonths.toString(),
            trackCount: proposal.campaign.trackCount.toString()
        });
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
            const response = await fetch(`http://localhost:8080/api/campaigns/dobless?${getSaveParams().toString()}`, {
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

    const updateProposalCampaign = (field: keyof Proposal['campaign'], value: string | number) => {
        if (!proposal) return;
        setProposal({
            ...proposal,
            campaign: { ...proposal.campaign, [field]: value }
        });
    };

    const updateProposalTrack = (index: number, value: string) => {
        if (!proposal) return;
        const newTracks = [...proposal.tracks];
        newTracks[index] = value;
        setProposal({ ...proposal, tracks: newTracks });
    };

    const updateProposalContract = (index: number, field: keyof ContractPreview, value: string | number) => {
        if (!proposal) return;
        const newContracts = [...proposal.contracts];
        // @ts-ignore - dynamic key assignment
        newContracts[index][field] = value;
        setProposal({ ...proposal, contracts: newContracts });
    };

    const updateContractByStep = (contractIdx: number, termType: string, step: number) => {
        if (!proposal || !resolvedSteps[step]) return;
        const stepData = resolvedSteps[step];
        const newContracts = [...proposal.contracts];
        const c = newContracts[contractIdx];

        if (termType === 'pay') {
            c.payStep = step;
            c.payRate = parseFloat(stepData.payRate.replace('%', '')) / 100;
        } else if (termType === 'salvage') {
            c.salvageStep = step;
            c.salvageTerms = stepData.salvageRights;
        } else if (termType === 'support') {
            c.supportStep = step;
            c.supportTerms = stepData.supportRights;
        } else if (termType === 'transport') {
            c.transportStep = step;
            c.transportTerms = stepData.transportation;
        } else if (termType === 'command') {
            c.commandStep = step;
            c.commandRights = stepData.commandRights;
        }
        setProposal({ ...proposal, contracts: newContracts });
    };

    return (
        <section className="dashboard-section generator-panel">
            <h2 className="section-title">DOBLESS INFORMATION SERVICE</h2>
            <p className="restricted-text">HINTERLANDS REGIONAL INTEL UPDATED</p>

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
                    <div className="campaign-summary-header" style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'rgba(0,0,0,0.1)', borderLeft: '4px solid #c00' }}>
                        <h3 className="section-title">DOBLESS INTEL: {proposal.campaign.name}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                            <div><strong>SYSTEM:</strong> <input type="text" value={proposal.campaign.systemName} onChange={(e) => updateProposalCampaign('systemName', e.target.value)} style={{ width: '100%' }} /></div>
                            <div><strong>DURATION:</strong> <input type="number" value={proposal.campaign.lengthInMonths} onChange={(e) => updateProposalCampaign('lengthInMonths', parseInt(e.target.value))} style={{ width: '60px' }} /> MO</div>
                            <div><strong>TRACKS:</strong> <input type="number" value={proposal.campaign.trackCount} onChange={(e) => updateProposalCampaign('trackCount', parseInt(e.target.value))} style={{ width: '60px' }} /></div>
                        </div>
                    </div>

                    <div className="campaign-tracks" style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'rgba(255,0,0,0.05)', border: '1px solid #c00' }}>
                        <strong>THEATER OPERATIONAL TRACKS</strong>
                        <div style={{ marginTop: '10px', fontSize: '0.9em' }}>
                            {proposal.tracks.map((t, idx) => (
                                <div key={idx} style={{ marginBottom: '5px' }}>
                                    TRACK {idx + 1}:
                                    <select value={t} onChange={(e) => updateProposalTrack(idx, e.target.value)} style={{ marginLeft: '10px' }}>
                                        {trackTypes.map(track => <option key={track} value={track}>{track}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="contract-grid">
                        {proposal.contracts.map((c, i) => (
                            <div key={i} className="summary-item" style={{ marginBottom: '20px', border: '1px solid #444', padding: '15px' }}>
                                <strong>{c.primaryContract ? 'PRIMARY CONTRACT OFFER' : 'OPPOSITION CONTRACT OFFER'}</strong>
                                <p><strong>EMPLOYER:</strong> {c.employerCategory}</p>
                                <p><strong>MISSION:</strong>
                                    <select value={c.missionType} onChange={(e) => updateProposalContract(i, 'missionType', e.target.value)}>
                                        {missions.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <p><strong>PAY STEP:</strong>
                                        <select value={c.payStep} onChange={(e) => updateContractByStep(i, 'pay', parseInt(e.target.value))}>
                                            {Object.keys(resolvedSteps).map(s => <option key={s} value={s}>Step {s}</option>)}
                                        </select> <span>({Math.round(c.payRate * 100)}%)</span>
                                    </p>
                                    <p><strong>SALVAGE STEP:</strong>
                                        <select value={c.salvageStep} onChange={(e) => updateContractByStep(i, 'salvage', parseInt(e.target.value))}>
                                            {Object.keys(resolvedSteps).map(s => <option key={s} value={s}>Step {s}</option>)}
                                        </select> <span>({c.salvageTerms})</span>
                                    </p>
                                    <p><strong>SUPPORT STEP:</strong>
                                        <select value={c.supportStep} onChange={(e) => updateContractByStep(i, 'support', parseInt(e.target.value))}>
                                            {Object.keys(resolvedSteps).map(s => <option key={s} value={s}>Step {s}</option>)}
                                        </select> <span>({c.supportTerms})</span>
                                    </p>
                                    <p><strong>TRANSPORT STEP:</strong>
                                        <select value={c.transportStep} onChange={(e) => updateContractByStep(i, 'transport', parseInt(e.target.value))}>
                                            {Object.keys(resolvedSteps).map(s => <option key={s} value={s}>Step {s}</option>)}
                                        </select> <span>({c.transportTerms})</span>
                                    </p>
                                    <p><strong>COMMAND STEP:</strong>
                                        <select value={c.commandStep} onChange={(e) => updateContractByStep(i, 'command', parseInt(e.target.value))}>
                                            {Object.keys(resolvedSteps).map(s => <option key={s} value={s}>Step {s}</option>)}
                                        </select> <span>({c.commandRights})</span>
                                    </p>
                                </div>
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