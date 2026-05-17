import React, { useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client/react';

export const GET_METADATA = gql`
  query GetCampaignMetadata {
    campaignMetadata {
      missions {
        primary
        opponent
      }
      trackTypes
      factions
      employerTypes
      resolvedSteps {
        step
        values {
          payRate
          salvageRights
          supportRights
          transportation
          commandRights
        }
      }
    }
  }
`;

export const PREVIEW_CAMPAIGN = gql`
  query PreviewCampaign($input: CampaignInput!) {
    previewCampaign(input: $input) {
      campaign {
        name
        systemName
        trackCount
      }
      contracts {
        employerCategory
        missionType
        primaryContract
        payRate
        payStep
        salvageTerms
        salvageStep
        supportTerms
        supportStep
        transportTerms
        transportStep
        commandRights
        commandStep
        trackCount
      }
      tracks
    }
  }
`;

export const GENERATE_TRACKS = gql`
  query GenerateTracks($mission: String!, $commandRights: String!, $count: Int!) {
    generateTracks(mission: $mission, commandRights: $commandRights, count: $count)
  }
`;

export const CREATE_CAMPAIGN = gql`
  mutation CreateCampaign($input: CampaignInput!) {
    createCampaign(input: $input) {
      id
      name
    }
  }
`;

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
    trackCount: number;
}

interface Proposal {
    campaign: {
        name: string,
        systemName: string,
        trackCount: number
    };
    contracts: ContractPreview[];
    tracks: string[];
}

interface MetadataData {
    campaignMetadata: {
        missions: {
            primary: string[];
            opponent: string[];
        };
        trackTypes: string[];
        factions: string[];
        employerTypes: string[];
        resolvedSteps: {
            step: number;
            values: any;
        }[];
    };
}

interface PreviewData {
    previewCampaign: Proposal;
}

interface GenerateTracksData {
    generateTracks: string[];
}

interface Props {
    user?: { name: string };
    onSaveSuccess?: () => void;
}

export const RandomCampaignGenerator: React.FC<Props> = ({ user, onSaveSuccess }) => {
    const [primaryMissions, setPrimaryMissions] = useState<string[]>([]);
    const [opponentMissions, setOpponentMissions] = useState<string[]>([]);
    const [resolvedSteps, setResolvedSteps] = useState<Record<number, any>>({});
    const [trackTypes, setTrackTypes] = useState<string[]>([]);

    const { loading: metadataLoading, error: metadataError, data: metadataData } = useQuery<MetadataData>(GET_METADATA);

    useEffect(() => {
        if (metadataData) {
            setPrimaryMissions(metadataData.campaignMetadata.missions.primary);
            setOpponentMissions(metadataData.campaignMetadata.missions.opponent);
            setTrackTypes(metadataData.campaignMetadata.trackTypes);

            const steps: Record<number, any> = {};
            metadataData.campaignMetadata.resolvedSteps.forEach((entry: any) => {
                steps[entry.step] = entry.values;
            });
            setResolvedSteps(steps);
        }
    }, [metadataData]);

    const [getPreview, { loading: previewLoading, error: previewErrorStatus, data: previewData }] = useLazyQuery<PreviewData>(PREVIEW_CAMPAIGN, {
        fetchPolicy: 'network-only'
    });
    const [getTracks] = useLazyQuery<GenerateTracksData>(GENERATE_TRACKS);

    useEffect(() => {
        if (previewData) {
            setProposal(previewData.previewCampaign);
        }
    }, [previewData]);

    const [createCampaign, { loading: saveLoading }] = useMutation(CREATE_CAMPAIGN);

    const [previewError, setPreviewError] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [proposal, setProposal] = useState<Proposal | null>(null);
    const [isNameManuallyEdited, setIsNameManuallyEdited] = useState(false);
    const [saved, setSaved] = useState(false);

    const handlePreview = () => {
        setSaved(false);
        setPreviewError(null);
        setIsNameManuallyEdited(false);
        getPreview({ variables: { input: {} } });
    };

    useEffect(() => {
        if (!metadataLoading && Object.keys(resolvedSteps).length > 0 && !proposal) {
            handlePreview();
        }
    }, [metadataLoading, resolvedSteps, proposal, handlePreview]);

    const getSaveParams = () => {
        if (!proposal) {
            return {} as Record<string, string | number | undefined>;
        }

        const primary = proposal.contracts[0];
        const opponent = proposal.contracts[1];

        // Parse the combined string to extract faction and category for backend compatibility
        const primaryParts = primary.employerCategory.split(': ');
        const employerFaction = primaryParts[0];
        const employerCategorySuffix = primaryParts.length > 1 ? primaryParts.slice(1).join(': ') : primaryParts[0];

        return {
            employer: employerFaction,
            opponent: opponent.employerCategory.split(': ')[0],
            mission: primary.missionType,
            employerCategory: employerCategorySuffix,
            systemName: proposal.campaign.systemName,
            payRate: primary.payRate,
            salvageTerms: primary.salvageTerms,
            supportTerms: primary.supportTerms,
            transportTerms: primary.transportTerms,
            commandRights: primary.commandRights,
            payStep: primary.payStep,
            salvageStep: primary.salvageStep,
            supportStep: primary.supportStep,
            transportStep: primary.transportStep,
            commandStep: primary.commandStep,
            trackCount: proposal.campaign.trackCount
        };
    };

    const handleSave = async () => {
        setSaveError(null);

        try {
            await createCampaign({ variables: { input: getSaveParams() } });
            setSaved(true);
            setTimeout(() => setProposal(null), 2000); // Allow user to see success state
            if (onSaveSuccess) {
                onSaveSuccess();
            }
        } catch (error) {
            console.error('Dobless save failed', error);
            setSaveError('Failed to save the campaign. Please confirm your session and try again.');
        }
    };

    const updateProposalCampaign = async (field: keyof Proposal['campaign'], value: string | number) => {
        if (!proposal) return;

        if (field === 'name') {
            setIsNameManuallyEdited(true);
        }

        const updatedCampaign = { ...proposal.campaign, [field]: value };

        if (field === 'systemName' && !isNameManuallyEdited) {
            const primary = proposal.contracts[0];
            const employerFaction = primary.employerCategory.split(': ')[0];
            updatedCampaign.name = `${String(value).toUpperCase()}: OP ${primary.missionType.toUpperCase()} [${employerFaction}]`;
        }

        let updatedTracks = [...proposal.tracks];

        if (field === 'trackCount') {
            const newCount = Number(value);
            const currentCount = proposal.tracks.length;

            updatedCampaign.trackCount = newCount; // Track count is the source of truth

            if (newCount < currentCount) {
                // Delete from the end
                updatedTracks = updatedTracks.slice(0, newCount);
            } else if (newCount > currentCount) {
                // Add to the end by calling backend for appropriate track types
                const numToAdd = newCount - currentCount;
                const primary = proposal.contracts[0];
                const { data: trackData } = await getTracks({
                    variables: {
                        mission: primary.missionType,
                        commandRights: primary.commandRights,
                        count: numToAdd
                    }
                });
                const fillers = trackData?.generateTracks || Array(numToAdd).fill('Assault');
                updatedTracks = [...updatedTracks, ...fillers];
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
        const contractToUpdate = newContracts[index];
        (contractToUpdate as any)[field] = value;

        // If the primary contract mission changes, update the campaign name to match
        let updatedCampaign = { ...proposal.campaign };
        if (!isNameManuallyEdited && index === 0 && (field === 'missionType' || field === 'employerCategory')) {
            const mission = field === 'missionType' ? String(value) : contractToUpdate.missionType;
            const employerStr = field === 'employerCategory' ? String(value) : contractToUpdate.employerCategory;
            const employerParts = employerStr.split(': ');
            const employerFaction = employerParts[0];

            updatedCampaign.name = `${updatedCampaign.systemName.toUpperCase()}: OP ${mission.toUpperCase()} [${employerFaction}]`;
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
                disabled={previewLoading || metadataLoading}
                className="login-button"
                style={{ marginTop: '20px' }}
            >
                {previewLoading ? 'ANALYZING INTEL...' : 'GENERATE CONTRACT OFFERS'}
            </button>
            {metadataError && <div className="error-message" style={{ marginTop: '12px' }}>{metadataError.message}</div>}
            {previewError && <div className="error-message" style={{ marginTop: '12px' }}>{previewError}</div>}
            {previewErrorStatus && <div className="error-message" style={{ marginTop: '12px' }}>{previewErrorStatus.message}</div>}

            {proposal && (
                <div className="proposal-view" style={{ marginTop: '30px' }}>
                    <div className="campaign-summary-header" style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'rgba(0,0,0,0.1)', borderLeft: '4px solid #c00' }}>
                        <h3 className="section-title">
                            DOBLESS INTEL:
                            <input
                                type="text"
                                value={proposal.campaign.name}
                                onChange={(e) => updateProposalCampaign('name', e.target.value)}
                                style={{
                                    marginLeft: '10px',
                                    width: '60%',
                                    fontSize: '0.9em',
                                    color: '#c00',
                                    backgroundColor: 'rgba(0,0,0,0.3)',
                                    border: '1px solid #c00',
                                    padding: '2px 8px'
                                }}
                            />
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                            <div><strong>SYSTEM:</strong> <input type="text" value={proposal.campaign.systemName} onChange={(e) => updateProposalCampaign('systemName', e.target.value)} style={{ width: '100%' }} /></div>
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
                                <p><strong>EMPLOYER:</strong>
                                    <input
                                        type="text"
                                        value={c.employerCategory}
                                        onChange={(e) => updateProposalContract(i, 'employerCategory', e.target.value)}
                                        style={{ width: 'calc(100% - 110px)', marginLeft: '10px' }}
                                    />
                                </p>
                                <p><strong>MISSION:</strong>
                                    <select value={c.missionType} onChange={(e) => updateProposalContract(i, 'missionType', e.target.value)}>
                                        {(c.primaryContract ? primaryMissions : opponentMissions).map(m => <option key={m} value={m}>{m}</option>)}
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
                        <button onClick={handleSave} disabled={saveLoading || saved} className="login-button">
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