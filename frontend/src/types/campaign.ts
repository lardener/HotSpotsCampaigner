import { UnitType, TechBase, UnitStatus, NumericInput } from './common';
import { Detachment } from './command';

export interface CampaignMetadata {
    missions: MissionMetadata;
    trackTypes: string[];
    factions: string[];
    employerTypes: string[];
    resolvedSteps: ResolvedStepEntry[];
    armorMultiplier: number;
    internalMultiplier: number;
    crippledMultiplier: number;
    destroyedMultiplier: number;
    nonMechModifier: number;
    mixedTechModifier: number;
    clanTechModifier: number;
    omnimechReconfigureModifier: number;
    pvPurchaseUnitMultiplier: number;
    pvSellUnitMultiplier: number;
    rearmCostPerTon: number;
    rearmCostPerTonAlphaStrike: number;
    hireMechWarriorCost: number;
    hireNamedPilotCost: number;
    hireBattleArmorCost: number;
    healMechWarriorPerWoundBoxCost: number;
    healMechWarriorPerMonthLimit: number;
    healBattleArmorCost: number;
    trainFormationCommanderCost: number;
    changeFormationTrainingCost: number;
    learnCommandAbility1Cost: number;
    learnCommandAbility2Cost: number;
    learnCommandAbility3Cost: number;
    replaceCommandAbilityCost: number;
    unitTypes: UnitType[];
    techBases: TechBase[];
    unitStatuses: UnitStatus[];
}

export interface MissionMetadata {
    primary: string[];
    opponent: string[];
}

export interface ResolvedStepEntry {
    step: number;
    values: ResolvedStepValues;
}

export interface TrackUpdateInput {
    trackName?: string | null;
    location?: string | null;
    nextSession?: string | null;
    attackerFactionId?: string | null;
    monthIndex?: number | null;
    complications?: string | null;
    oppositionComplications?: string | null;
    afterActionNarrative?: string | null;
}

export interface CampaignCreateInput {
    name?: string | null;
    employer?: string | null;
    opponent?: string | null;
    mission?: string | null;
    employerCategory?: string | null;
    opponentCategory?: string | null;
    oppMission?: string | null;
    systemName?: string | null;
    description?: string | null;
    status?: string | null;
    payRate?: number | null;
    salvageTerms?: string | null;
    supportTerms?: string | null;
    transportTerms?: string | null;
    commandRights?: string | null;
    payStep?: number | null;
    salvageStep?: number | null;
    supportStep?: number | null;
    transportStep?: number | null;
    commandStep?: number | null;
    oppPayRate?: number | null;
    oppPayStep?: number | null;
    oppSalvageTerms?: string | null;
    oppSalvageStep?: number | null;
    oppSupportTerms?: string | null;
    oppSupportStep?: number | null;
    oppTransportTerms?: string | null;
    oppTransportStep?: number | null;
    oppCommandRights?: string | null;
    oppCommandStep?: number | null;
    trackCount?: number | null;
    lengthInMonths?: number | null;
    monthlyPay?: number | null;
    monthlyMaintenance?: number | null;
    transportationCost?: number | null;
    combatPay?: number | null;
    armorMultiplier?: number | null;
    internalMultiplier?: number | null;
    crippledMultiplier?: number | null;
    destroyedMultiplier?: number | null;
    nonMechModifier?: number | null;
    mixedTechModifier?: number | null;
    clanTechModifier?: number | null;
    omnimechReconfigureModifier?: number | null;
    pvPurchaseUnitMultiplier?: number | null;
    pvSellUnitMultiplier?: number | null;
    rearmCostPerTon?: number | null;
    rearmCostPerTonAlphaStrike?: number | null;
    hireMechWarriorCost?: number | null;
    hireNamedPilotCost?: number | null;
    hireBattleArmorCost?: number | null;
    healMechWarriorPerWoundBoxCost?: number | null;
    healMechWarriorPerMonthLimit?: number | null;
    healBattleArmorCost?: number | null;
    trainFormationCommanderCost?: number | null;
    changeFormationTrainingCost?: number | null;
    learnCommandAbility1Cost?: number | null;
    learnCommandAbility2Cost?: number | null;
    learnCommandAbility3Cost?: number | null;
    replaceCommandAbilityCost?: number | null;
    tracks?: ProposedTrackInput[] | null;
}

export interface ProposedTrackInput {
    name?: string | null;
    complication?: string | null;
    oppositionComplication?: string | null;
}

export type CampaignUpdateInput = Omit<Partial<CampaignCreateInput>, 'tracks'>;

export interface ResolvedStepValues {
    payRate: string;
    salvageRights: string;
    supportRights: string;
    transportation: string;
    commandRights: string;
}

export type ResolvedStep = ResolvedStepValues;
export type ResolvedSteps = Record<string, ResolvedStep>;

export type PublicCampaignMetadata = Pick<
    CampaignMetadata,
    'missions' | 'trackTypes' | 'factions' | 'employerTypes' | 'resolvedSteps' | 'unitStatuses' | 'unitTypes' | 'techBases'
>;

export type PublicCampaignMetadataWithRules = PublicCampaignMetadata &
    Pick<CampaignMetadata,
        'armorMultiplier' | 'internalMultiplier' | 'crippledMultiplier' | 'destroyedMultiplier' | 'nonMechModifier' | 'mixedTechModifier' | 'clanTechModifier' |
        'omnimechReconfigureModifier' | 'pvPurchaseUnitMultiplier' | 'pvSellUnitMultiplier' | 'rearmCostPerTon' | 'rearmCostPerTonAlphaStrike' |
        'hireMechWarriorCost' | 'hireNamedPilotCost' | 'hireBattleArmorCost' | 'healMechWarriorPerWoundBoxCost' | 'healMechWarriorPerMonthLimit' | 'healBattleArmorCost' |
        'trainFormationCommanderCost' | 'changeFormationTrainingCost' | 'learnCommandAbility1Cost' | 'learnCommandAbility2Cost' | 'learnCommandAbility3Cost' | 'replaceCommandAbilityCost'
    >;

export type PublicCampaignMetadataMinimal = Pick<
    CampaignMetadata,
    'unitStatuses' | 'unitTypes' | 'techBases' | 'armorMultiplier' | 'internalMultiplier' | 'crippledMultiplier' | 'destroyedMultiplier' | 'nonMechModifier' | 'mixedTechModifier' | 'clanTechModifier' | 'rearmCostPerTon' | 'healMechWarriorPerWoundBoxCost' | 'healMechWarriorPerMonthLimit' | 'pvPurchaseUnitMultiplier' | 'pvSellUnitMultiplier'
>;

export interface ContractPreview {
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

export interface Contract extends ContractPreview {
    __typename?: string;
    id: string;
}

export interface ProposedTrack {
    name: string;
    complication: string;
    oppositionComplication: string;
}

export interface Proposal {
    campaign: {
        name: string;
        systemName: string;
        trackCount: number;
        lengthInMonths: number;
        monthlyPay?: number | null;
        monthlyMaintenance?: number | null;
        transportationCost?: number | null;
        combatPay?: number | null;
    };
    armorMultiplier?: number | null;
    internalMultiplier?: number | null;
    crippledMultiplier?: number | null;
    destroyedMultiplier?: number | null;
    nonMechModifier?: number | null;
    mixedTechModifier?: number | null;
    clanTechModifier?: number | null;
    omnimechReconfigureModifier?: number | null;
    pvPurchaseUnitMultiplier?: number | null;
    pvSellUnitMultiplier?: number | null;
    rearmCostPerTon?: number | null;
    rearmCostPerTonAlphaStrike?: number | null;
    hireMechWarriorCost?: number | null;
    hireNamedPilotCost?: number | null;
    hireBattleArmorCost?: number | null;
    healMechWarriorPerWoundBoxCost?: number | null;
    healMechWarriorPerMonthLimit?: number | null;
    healBattleArmorCost?: number | null;
    trainFormationCommanderCost?: number | null;
    changeFormationTrainingCost?: number | null;
    learnCommandAbility1Cost?: number | null;
    learnCommandAbility2Cost?: number | null;
    learnCommandAbility3Cost?: number | null;
    replaceCommandAbilityCost?: number | null;
    contracts: ContractPreview[];
    tracks: ProposedTrack[];
}

export type CampaignProposal = Proposal;

export interface ActiveCampaignSummary {
    id: string;
    name: string;
    description?: string | null;
    systemName: string;
    trackCount: number;
    status: string;
    primaryEmployer: string;
    secondaryEmployer: string;
    participatingDetachments?: Detachment[];
}

export interface ActiveCampaignPage {
    content: ActiveCampaignSummary[];
    totalElements: number;
    totalPages: number;
}

export interface CampaignInvite {
    __typename?: string;
    id: string;
    token: string;
    recipientName: string | null;
    expiresAt: string;
    used: boolean;
}

export interface TrackDetail {
    __typename?: string;
    id: string;
    trackName: string;
    sequenceOrder: number;
    location: string | null;
    nextSession: string | null;
    attackerFactionId: string | null;
    monthIndex: number | null;
    complications: string | null;
    afterActionNarrative: string | null;
    oppositionComplications: string | null;
}

export interface CampaignFaction {
    __typename?: string;
    id: string;
    factionName: string;
}

export interface CampaignDetail {
    __typename?: string;
    id: string;
    name: string;
    systemName: string;
    description: string | null;
    lengthInMonths: number | null;
    trackCount: number | null;
    isManager?: boolean;
    isParticipant?: boolean;
    status: string;
    primaryEmployer: string;
    secondaryEmployer: string;
    payRate: number | null;
    payStep: number | null;
    salvageTerms: string | null;
    salvageStep: number | null;
    supportTerms: string | null;
    supportStep: number | null;
    transportTerms: string | null;
    transportStep: number | null;
    commandRights: string | null;
    commandStep: number | null;
    monthlyPay: number | null;
    monthlyMaintenance: number | null;
    transportationCost: number | null;
    combatPay: number | null;
    armorMultiplier: number | null;
    internalMultiplier: number | null;
    crippledMultiplier: number | null;
    destroyedMultiplier: number | null;
    nonMechModifier: number | null;
    mixedTechModifier: number | null;
    clanTechModifier: number | null;
    omnimechReconfigureModifier: number | null;
    pvPurchaseUnitMultiplier: number | null;
    pvSellUnitMultiplier: number | null;
    rearmCostPerTon: number | null;
    rearmCostPerTonAlphaStrike: number | null;
    hireMechWarriorCost: number | null;
    hireNamedPilotCost: number | null;
    hireBattleArmorCost: number | null;
    healMechWarriorPerWoundBoxCost: number | null;
    healMechWarriorPerMonthLimit: number | null;
    healBattleArmorCost: number | null;
    trainFormationCommanderCost: number | null;
    changeFormationTrainingCost: number | null;
    learnCommandAbility1Cost: number | null;
    learnCommandAbility2Cost: number | null;
    learnCommandAbility3Cost: number | null;
    replaceCommandAbilityCost: number | null;
    contracts?: Contract[];
    factions?: CampaignFaction[];
    tracks?: TrackDetail[];
    participatingDetachments?: Detachment[];
    campaignInvites?: CampaignInvite[];
}

export type CampaignDetailSummary = Pick<CampaignDetail,
    'id' | 'name' | 'monthlyPay' | 'monthlyMaintenance' | 'transportationCost' | 'combatPay' | 'contracts'
>;

export interface DetachmentAarState {
    selectedContractId: string;
    selectedLevel: number;
    outcomeMultiplier: number;
    salvageValue: NumericInput;
    customAward: NumericInput;
}

// ==================== Mutation Input Variables ====================

export interface AssignDetachmentVars {
    detachmentId: string;
    campaignId: string | null;
}

export interface JoinCampaignVars {
    token: string;
    detachmentId: string;
}

export interface CreateInviteVars {
    campaignId: string;
    recipientName: string | null;
}
