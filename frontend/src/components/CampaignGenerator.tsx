import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client/react';
import { CampaignCreateInput, RepairRulesInput, ContractPreview, ProposedTrack, Proposal, ResolvedStepValues } from '../types/global.d';
import { MetadataDataFull, PreviewData, GenerateTracksData, CreateCampaignData, UpdateCampaignData } from '../types/graphql.d';
import {
    GET_METADATA,
    PREVIEW_CAMPAIGN,
    GENERATE_TRACKS,
    CREATE_CAMPAIGN
} from '../types/operations';

interface Props {
    user?: { name: string };
    onSaveSuccess?: (newCampaign: UpdateCampaignData['updateCampaign']) => void;
}

export const CampaignGenerator: React.FC<Props> = ({ user, onSaveSuccess }) => {
    const [primaryMissions, setPrimaryMissions] = useState<string[]>([]);
    const [opponentMissions, setOpponentMissions] = useState<string[]>([]);
    const [resolvedSteps, setResolvedSteps] = useState<Record<number, ResolvedStepValues>>({});
    const [trackTypes, setTrackTypes] = useState<string[]>([]);

    const [previewError, setPreviewError] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [proposal, setProposal] = useState<Proposal | null>(null);
    const [isNameManuallyEdited, setIsNameManuallyEdited] = useState(false);
    const [saved, setSaved] = useState(false);

    const { loading: metadataLoading, error: metadataError, data: metadataData } = useQuery<MetadataDataFull>(GET_METADATA);

    useEffect(() => {
        if (metadataData?.publicCampaignMetadata) {
            setPrimaryMissions(metadataData.publicCampaignMetadata.missions.primary);
            setOpponentMissions(metadataData.publicCampaignMetadata.missions.opponent);
            setTrackTypes(metadataData.publicCampaignMetadata.trackTypes);

            const steps: Record<number, ResolvedStepValues> = {};
            metadataData.publicCampaignMetadata.resolvedSteps.forEach((entry) => {
                steps[entry.step] = entry.values;
            });
            setResolvedSteps(steps);
        }
    }, [metadataData]);

    const resolveStepValueWithGravity = (step: number, field: keyof ResolvedStepValues): string => {
        if (!resolvedSteps[step]) return '-';
        const val = resolvedSteps[step][field];

        // If the result is '-', we must move toward Step 7 to find the nearest valid entry
        if (val === '-' || val === null || val === undefined) {
            let current = step;
            const target = 7;
            while (current !== target) {
                current = current < target ? current + 1 : current - 1;
                const nextVal = resolvedSteps[current]?.[field];
                if (nextVal !== '-' && nextVal !== null && nextVal !== undefined) {
                    return nextVal;
                }
            }
            // Fallback to whatever is at Step 7 if everything else fails
            return resolvedSteps[target]?.[field] || '-';
        }
        return val;
    };

    const [getPreview, { loading: previewLoading, error: previewErrorStatus, data: previewData }] = useLazyQuery<PreviewData>(PREVIEW_CAMPAIGN, {
        fetchPolicy: 'network-only'
    });
    const [getTracks] = useLazyQuery<GenerateTracksData>(GENERATE_TRACKS);

    useEffect(() => {
        if (previewData?.publicPreviewCampaign && Object.keys(resolvedSteps).length > 0) {
            const prop = JSON.parse(JSON.stringify(previewData.publicPreviewCampaign)) as Proposal;
            // Enforce "Move toward 7" logic on the initial preview data
            prop.contracts.forEach((c) => {
                const payStr = resolveStepValueWithGravity(c.payStep, 'payRate');
                c.payRate = parseFloat(payStr.replace('%', '')) / 100;
                c.salvageTerms = resolveStepValueWithGravity(c.salvageStep, 'salvageRights');
                c.supportTerms = resolveStepValueWithGravity(c.supportStep, 'supportRights');
                c.transportTerms = resolveStepValueWithGravity(c.transportStep, 'transportation');
                c.commandRights = resolveStepValueWithGravity(c.commandStep, 'commandRights');
            });
            // Ensure repair rules are synchronized from metadata if not present in preview
            if (!prop.repairRules && metadataData?.publicCampaignMetadata.repairRules) {
                prop.repairRules = metadataData.publicCampaignMetadata.repairRules;
            }
            setProposal(prop);
        }
    }, [previewData, resolvedSteps, metadataData]);

    // Monitor track count changes to fetch additional tracks if needed
    useEffect(() => {
        if (!proposal || !proposal.contracts[0]) return;
        const targetCount = proposal.campaign.trackCount;
        const currentCount = proposal.tracks.length;

        if (targetCount > currentCount) {
            const primary = proposal.contracts[0];
            const opposition = proposal.contracts[1];
            getTracks({
                variables: {
                    mission: primary.missionType,
                    commandRights: primary.commandRights,
                    oppCommandRights: opposition?.commandRights || "Independent",
                    count: targetCount,
                    existing: proposal.tracks.map(t => ({
                        name: t.name,
                        complication: t.complication,
                        oppositionComplication: t.oppositionComplication
                    }))
                }
            }).then(({ data: trackData }: any) => {
                if (trackData?.generateTracks) {
                    setProposal(prev => prev ? { ...prev, tracks: trackData.generateTracks } : null);
                }
            });
        }
    }, [proposal?.campaign.trackCount, getTracks]);

    const [createCampaign, { loading: saveLoading }] = useMutation<CreateCampaignData, { input: CampaignCreateInput }>(CREATE_CAMPAIGN);

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

    const getSaveParams = (): CampaignCreateInput => {
        if (!proposal || !proposal.contracts[0] || !proposal.contracts[1]) {
            return {};
        }

        const primary = proposal.contracts[0];
        const opponent = proposal.contracts[1];

        // Strip metadata added by Apollo Client (__typename) which is invalid for GraphQL Input types
        let cleanRepairRules: RepairRulesInput | undefined;
        if (proposal.repairRules) {
            // Cast to any to safely destructure __typename, then cast the rest to RepairRulesInput
            const { __typename, ...rest } = proposal.repairRules as any;
            cleanRepairRules = rest as RepairRulesInput;
        }

        // Parse the combined string to extract faction and category for backend compatibility
        const primaryParts = primary.employerCategory.split(': ');
        const employerFaction = primaryParts[0];
        const employerCategorySuffix = primaryParts.length > 1 ? primaryParts.slice(1).join(': ') : undefined;

        const opponentParts = opponent.employerCategory.split(': ');
        const opponentFaction = opponentParts[0];
        const opponentCategorySuffix = opponentParts.length > 1 ? opponentParts.slice(1).join(': ') : undefined;

        return {
            name: proposal.campaign.name,
            employer: employerFaction,
            opponent: opponentFaction,
            mission: primary.missionType,
            employerCategory: employerCategorySuffix,
            opponentCategory: opponentCategorySuffix,
            oppMission: opponent.missionType,
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
            oppPayRate: opponent.payRate,
            oppPayStep: opponent.payStep,
            oppSalvageTerms: opponent.salvageTerms,
            oppSalvageStep: opponent.salvageStep,
            oppSupportTerms: opponent.supportTerms,
            oppSupportStep: opponent.supportStep,
            oppTransportTerms: opponent.transportTerms,
            oppTransportStep: opponent.transportStep,
            oppCommandRights: opponent.commandRights,
            oppCommandStep: opponent.commandStep,
            trackCount: proposal.campaign.trackCount,
            lengthInMonths: proposal.campaign.lengthInMonths,
            monthlyPay: proposal.campaign.monthlyPay,
            monthlyMaintenance: proposal.campaign.monthlyMaintenance,
            transportationCost: proposal.campaign.transportationCost,
            combatPay: proposal.campaign.combatPay,
            repairRules: cleanRepairRules,
            tracks: proposal.tracks.map(t => ({
                name: t.name,
                complication: t.complication,
                oppositionComplication: t.oppositionComplication
            }))
        };
    };

    const handleSave = async () => {
        setSaveError(null);

        try {
            const result = await createCampaign({ variables: { input: getSaveParams() } });
            setSaved(true);
            setTimeout(() => setProposal(null), 2000); // Allow user to see success state
            if (onSaveSuccess && result.data?.createCampaign) {
                onSaveSuccess(result.data.createCampaign);
            }
        } catch (error) {
            console.error('Dobless save failed', error);
            setSaveError('Failed to save the campaign. Please confirm your session and try again.');
        }
    };

    const updateProposalCampaign = (field: keyof Proposal['campaign'], value: string | number) => {
        if (!proposal) return;

        if (field === 'name') {
            setIsNameManuallyEdited(true);
        }

        setProposal(prev => {
            if (!prev) return null;
            let updatedTracks = prev.tracks;
            const updatedVal = field === 'trackCount' ? Number(value) : value;

            if (field === 'trackCount' && !isNaN(updatedVal as number)) {
                const newCount = updatedVal as number;
                if (newCount < updatedTracks.length) {
                    updatedTracks = updatedTracks.slice(0, newCount);
                }
            }

            const updatedCampaign = { ...prev.campaign, [field]: updatedVal };

            if (field === 'trackCount' && !isNaN(updatedVal as number)) {
                updatedCampaign.lengthInMonths = updatedVal as number;
            }

            if (field === 'systemName' && !isNameManuallyEdited) {
                const primary = prev.contracts[0];
                const employerFaction = primary.employerCategory.split(': ')[0];
                updatedCampaign.name = `${String(value).toUpperCase()}: OP ${primary.missionType.toUpperCase()} [${employerFaction}]`;
            }

            return {
                ...prev,
                campaign: updatedCampaign,
                tracks: updatedTracks
            };
        });
    };

    const updateProposalTrack = (index: number, name: string) => {
        if (!proposal) return;
        const newTracks = [...proposal.tracks];
        newTracks[index] = { ...newTracks[index], name };
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
        const newContracts = [...proposal.contracts];
        const c = newContracts[contractIdx];

        if (termType === 'pay') {
            c.payStep = step;
            const payStr = resolveStepValueWithGravity(step, 'payRate');
            c.payRate = parseFloat(payStr.replace('%', '')) / 100;
        } else if (termType === 'salvage') {
            c.salvageStep = step;
            c.salvageTerms = resolveStepValueWithGravity(step, 'salvageRights');
        } else if (termType === 'support') {
            c.supportStep = step;
            c.supportTerms = resolveStepValueWithGravity(step, 'supportRights');
        } else if (termType === 'transport') {
            c.transportStep = step;
            c.transportTerms = resolveStepValueWithGravity(step, 'transportation');
        } else if (termType === 'command') {
            c.commandStep = step;
            c.commandRights = resolveStepValueWithGravity(step, 'commandRights');
        }
        setProposal({ ...proposal, contracts: newContracts });
    };

    return (
        <section className="dashboard-section generator-panel">
            <h2 className="section-title">DOBLESS INFORMATION SERVICE</h2>
            <p className="restricted-text">MERCENARY INTEL UPDATED</p>

            <div style={{ marginTop: '20px' }}>
                <button type="button"
                    onClick={handlePreview}
                    disabled={previewLoading || metadataLoading}
                    className="mode-btn theme-red"
                >
                    {previewLoading ? 'ANALYZING INTEL...' : 'GENERATE CONTRACT OFFERS'}
                </button>
            </div>
            {metadataError && <div className="error-message" style={{ marginTop: '12px' }}>{metadataError.message}</div>}
            {previewError && <div className="error-message" style={{ marginTop: '12px' }}>{previewError}</div>}
            {previewErrorStatus && <div className="error-message" style={{ marginTop: '12px' }}>{previewErrorStatus.message}</div>}

            {proposal && (
                <div className="proposal-view" style={{ marginTop: '30px' }}>
                    <div className="campaign-summary-header" style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'rgba(0,0,0,0.1)', borderLeft: '4px solid #c00' }}>
                        <h3 className="section-title">
                            CAMPAIGN INTEL:
                            <div className="status-bar theme-red cursor-pointer" style={{ display: 'inline-flex', marginLeft: '10px', width: '60%', padding: '0 5px' }}>
                                <input // Campaign name input
                                    id="proposal-name"
                                    type="text"
                                    className="table-input"
                                    value={proposal.campaign.name}
                                    onChange={(e) => updateProposalCampaign('name', e.target.value)}
                                    title="Campaign Name Designation"
                                    placeholder="CAMPAIGN NAME..."
                                    style={{
                                        width: '100%',
                                        border: 'none',
                                        fontSize: 'inherit',
                                        fontWeight: 'bold'
                                    }}
                                />
                            </div>
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div> {/* Added title to input */}
                                <label htmlFor="proposal-system" className="restricted-text sm-text">STAR SYSTEM</label>
                                <div className="status-bar theme-red cursor-pointer" style={{ padding: '0 5px' }}>
                                    <input id="proposal-system" type="text" className="table-input w-100" style={{ border: 'none' }} value={proposal.campaign.systemName} onChange={(e) => updateProposalCampaign('systemName', e.target.value)} placeholder="Terra..." title="Star system location" />
                                </div>
                            </div>
                            <div> {/* Added title to input */}
                                <label htmlFor="proposal-tracks" className="restricted-text sm-text">TRACKS</label>
                                <div className="status-bar theme-red cursor-pointer" style={{ padding: '0 5px' }}>
                                    <input id="proposal-tracks" type="number" value={proposal.campaign.trackCount}
                                        onChange={(e) => updateProposalCampaign('trackCount', e.target.value)} // Update state on change
                                        onBlur={(e) => updateProposalCampaign('trackCount', parseInt(e.target.value) || 0)} // Trigger backend call on blur
                                        title="Number of tracks"
                                        className="table-input"
                                        style={{ border: 'none', width: '100%' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="campaign-tracks bg-tracks-proposal mb-20 p-15">
                        <div className="restricted-text sm-text mb-10">THEATER OPERATIONAL TRACKS</div>
                        <div className="mt-10 fs-09em">
                            {proposal.tracks.map((t: ProposedTrack, idx: number) => (
                                <div key={idx} className="mb-5">
                                    <label htmlFor={`track-${idx}`} className="restricted-text sm-text">TRACK {idx + 1}</label> {/* Added title to select */}
                                    <div className="status-bar theme-red cursor-pointer" style={{ padding: '0 5px' }}>
                                        <select id={`track-${idx}`} value={t.name} onChange={(e) => updateProposalTrack(idx, e.target.value)} className="table-input" style={{ border: 'none' }} title={`Select track type for track ${idx + 1}`}>
                                            {trackTypes.map(track => <option key={track} value={track}>{track}</option>)}
                                        </select>
                                    </div>
                                    {(t.complication !== 'None' || t.oppositionComplication !== 'None') && (
                                        <div className="sm-text mt-5 opacity-08" style={{ color: '#aaa', fontStyle: 'italic' }}>
                                            {t.complication !== 'None' && <div className="mb-2">PRIMARY: {t.complication}</div>}
                                            {t.oppositionComplication !== 'None' && <div>OPPOSITION: {t.oppositionComplication}</div>}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="contract-grid">
                        {proposal.contracts.map((c, i) => (
                            <div key={i} className="summary-item" style={{ marginBottom: '20px', border: '1px solid #444', padding: '15px' }}>
                                <div className="restricted-text mb-10">{c.primaryContract ? 'PRIMARY CONTRACT OFFER' : 'OPPOSITION CONTRACT OFFER'}</div>
                                <p><label className="restricted-text sm-text block-label">EMPLOYER</label>
                                    <div className="status-bar theme-red cursor-pointer" style={{ padding: '0 5px' }}>
                                        <input
                                            type="text"
                                            value={c.employerCategory}
                                            onChange={(e) => updateProposalContract(i, 'employerCategory', e.target.value)}
                                            className="table-input w-100"
                                            style={{ border: 'none', width: '40em' }}
                                            title="Employer Faction and Category"
                                        />
                                    </div>
                                </p>
                                <p><label className="restricted-text sm-text block-label">MISSION</label>
                                    <div className="status-bar theme-red cursor-pointer" style={{ padding: '0 5px' }}>
                                        <select className="table-input w-100" style={{ border: 'none' }} value={c.missionType} onChange={(e) => updateProposalContract(i, 'missionType', e.target.value)} title="Mission Type">
                                            {(c.primaryContract ? primaryMissions : opponentMissions).map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                    </div>
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <p><label className="restricted-text sm-text block-label">PAY STEP</label>
                                        <div className="status-bar theme-red cursor-pointer" style={{ padding: '0 5px', display: 'inline-block' }}>
                                            <select className="table-input" style={{ border: 'none' }} value={c.payStep} onChange={(e) => updateContractByStep(i, 'pay', parseInt(e.target.value))} title="Pay Step">
                                                {Object.keys(resolvedSteps).map(s => <option key={s} value={s}>Step {s}</option>)}
                                            </select>
                                        </div>
                                        <span className="ml-5">({Math.round(c.payRate * 100)}%)</span>
                                    </p>
                                    <p><label className="restricted-text sm-text block-label">SALVAGE STEP</label>
                                        <div className="status-bar theme-red cursor-pointer" style={{ padding: '0 5px', display: 'inline-block' }}>
                                            <select className="table-input" style={{ border: 'none' }} value={c.salvageStep} onChange={(e) => updateContractByStep(i, 'salvage', parseInt(e.target.value))} title="Salvage Step">
                                                {Object.keys(resolvedSteps).map(s => <option key={s} value={s}>Step {s}</option>)}
                                            </select>
                                        </div>
                                        <span className="ml-5">({c.salvageTerms})</span>
                                    </p>
                                    <p><label className="restricted-text sm-text block-label">SUPPORT STEP</label>
                                        <div className="status-bar theme-red cursor-pointer" style={{ padding: '0 5px', display: 'inline-block' }}>
                                            <select className="table-input" style={{ border: 'none' }} value={c.supportStep} onChange={(e) => updateContractByStep(i, 'support', parseInt(e.target.value))} title="Support Step">
                                                {Object.keys(resolvedSteps).map(s => <option key={s} value={s}>Step {s}</option>)}
                                            </select>
                                        </div>
                                        <span className="ml-5">({c.supportTerms})</span>
                                    </p>
                                    <p><label className="restricted-text sm-text block-label">TRANSPORT STEP</label>
                                        <div className="status-bar theme-red cursor-pointer" style={{ padding: '0 5px', display: 'inline-block' }}>
                                            <select className="table-input" style={{ border: 'none' }} value={c.transportStep} onChange={(e) => updateContractByStep(i, 'transport', parseInt(e.target.value))} title="Transport Step">
                                                {Object.keys(resolvedSteps).map(s => <option key={s} value={s}>Step {s}</option>)}
                                            </select>
                                        </div>
                                        <span className="ml-5">({c.transportTerms})</span>
                                    </p>
                                    <p><label className="restricted-text sm-text block-label">COMMAND STEP</label>
                                        <div className="status-bar theme-red cursor-pointer" style={{ padding: '0 5px', display: 'inline-block' }}>
                                            <select className="table-input" style={{ border: 'none' }} value={c.commandStep} onChange={(e) => updateContractByStep(i, 'command', parseInt(e.target.value))} title="Command Step">
                                                {Object.keys(resolvedSteps).map(s => <option key={s} value={s}>Step {s}</option>)}
                                            </select>
                                        </div>
                                        <span className="ml-5">({c.commandRights})</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {saveError && <div className="error-message" style={{ marginTop: '12px' }}>{saveError}</div>}
                    {user ? (
                        <button type="button" onClick={handleSave} disabled={saveLoading || saved} className="mode-btn theme-red" style={{ padding: '10px 20px' }}>
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