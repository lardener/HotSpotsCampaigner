import React, { useState, useEffect } from 'react';
import * as campaignApi from '../services/campaignApi';

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
    const [resolvedSteps, setResolvedSteps] = useState<Record<string, any>>({});
    const [trackTypes, setTrackTypes] = useState<string[]>([]);

    const [loading, setLoading] = useState(false);
    const [metadataLoading, setMetadataLoading] = useState(true);
    const [metadataError, setMetadataError] = useState<string | null>(null);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [proposal, setProposal] = useState<Proposal | null>(null);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const fetchMetadata = async () => {
            setMetadataLoading(true);
            setMetadataError(null);
            try {
                const [missionsData, trackTypesData, stepsData] = await Promise.all([
                    campaignApi.getMissions(),
                    campaignApi.getTrackTypes(),
                    campaignApi.getResolvedSteps()
                ]);
                setMissions(missionsData);
                setTrackTypes(trackTypesData);
                setResolvedSteps(stepsData);
            } catch (err) {
                console.error('Failed to load generator metadata', err);
                setMetadataError('Failed to load campaign metadata. Please refresh the page or try again later.');
            } finally {
                setMetadataLoading(false);
            }
        };
        fetchMetadata();
    }, []);

    const getQueryParams = () => {
        return {} as Record<string, string | number | undefined>;
    };

    const getSaveParams = () => {
        if (!proposal) {
            return {} as Record<string, string | number | undefined>;
        }

        const primary = proposal.contracts[0];
        const opponent = proposal.contracts[1];

        return {
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
            payStep: primary.payStep,
            salvageStep: primary.salvageStep,
            supportStep: primary.supportStep,
            transportStep: primary.transportStep,
            commandStep: primary.commandStep,
            lengthInMonths: proposal.campaign.lengthInMonths,
            trackCount: proposal.campaign.trackCount
        };
    };

    const handlePreview = async () => {
        setLoading(true);
        setSaved(false);
        setPreviewError(null);

        try {
            const params = getQueryParams();
            const data = await campaignApi.previewCampaign(params);
            setProposal(data);
        } catch (error) {
            console.error('Dobless preview failed', error);
            setPreviewError('Failed to generate campaign preview. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setSaveError(null);

        try {
            await campaignApi.saveCampaign(getSaveParams());
            setSaved(true);
        } catch (error) {
            console.error('Dobless save failed', error);
            setSaveError('Failed to save the campaign. Please confirm your session and try again.');
        } finally {
            setLoading(false);
        }
    };

    const updateProposalCampaign = async (field: keyof Proposal['campaign'], value: string | number) => {
        if (!proposal) return;

        const updatedCampaign = { ...proposal.campaign, [field]: value };
        let updatedTracks = [...proposal.tracks];

        if (field === 'trackCount') {
            const newCount = Number(value);
            const currentCount = proposal.tracks.length;

            if (newCount < currentCount) {
                // Delete from the end
                updatedTracks = updatedTracks.slice(0, newCount);
            } else if (newCount > currentCount) {
                // Add to the end by calling backend for appropriate track types
                const numToAdd = newCount - currentCount;
                const primaryContract = proposal.contracts[0];

                try {
                    const newTracks = await campaignApi.generateTracks(
                        primaryContract.missionType,
                        primaryContract.commandRights,
                        numToAdd
                    );
                    updatedTracks = [...updatedTracks, ...newTracks];
                } catch (error) {
                    console.error('Failed to generate additional tracks', error);
                    // Fallback: Add generic tracks if backend fails
                    const fillers = Array(numToAdd).fill('Assault');
                    updatedTracks = [...updatedTracks, ...fillers];
                }
            }
        }

        setProposal({
            ...proposal,
            campaign: updatedCampaign,
            tracks: updatedTracks
        });
    };

    const updateProposalTrack = (index: number, value: string) => {
        if (!proposal) return;
        const currentTrack = proposal.tracks[index];
        // Detect if there's an existing complication suffix (e.g., " (Forced Complication)")
        const suffixMatch = currentTrack.match(/\s\(.*\)$/);
        const suffix = suffixMatch ? suffixMatch[0] : '';

        const newTracks = [...proposal.tracks];
        newTracks[index] = value + suffix;
        setProposal({ ...proposal, tracks: newTracks });
    };

    const updateProposalContract = (index: number, field: keyof ContractPreview, value: string | number) => {
        if (!proposal) return;
        const newContracts = [...proposal.contracts];
        // @ts-ignore - dynamic key assignment
        newContracts[index][field] = value;

        // If the primary contract mission changes, update the campaign name to match
        let updatedCampaign = { ...proposal.campaign };
        if (index === 0 && field === 'missionType') {
            const employerName = newContracts[0].employerCategory.split(': ')[0];
            updatedCampaign.name = `DOBLESS OP: ${String(value).toUpperCase()} [${employerName}]`;
        }

        setProposal({
            ...proposal,
            campaign: updatedCampaign,
            contracts: newContracts
        });
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
                disabled={loading || metadataLoading}
                className="login-button"
                style={{ marginTop: '20px' }}
            >
                {loading ? 'ANALYZING INTEL...' : 'GENERATE CONTRACT OFFERS'}
            </button>
            {metadataError && <div className="error-message" style={{ marginTop: '12px' }}>{metadataError}</div>}
            {previewError && <div className="error-message" style={{ marginTop: '12px' }}>{previewError}</div>}

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
                                    {/* Strip suffix for the value so it matches the options in trackTypes */}
                                    <select value={t.split(' (')[0]} onChange={(e) => updateProposalTrack(idx, e.target.value)} style={{ marginLeft: '10px' }}>
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

                    {saveError && <div className="error-message" style={{ marginTop: '12px' }}>{saveError}</div>}
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