/**
 * Global Tactical Data Models
 */

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
    unitTypes: string[];
    techBases: string[];
    unitStatuses: string[];
}

export interface MissionMetadata {
    primary: string[];
    opponent: string[];
}

export interface ResolvedStepEntry {
    step: number;
    values: ResolvedStepValues;
}

export interface CombatUnit {
    id: string;
    type: string;
    model: string;
    variant: string;
    techBase: string;
    tonnage: number;
    asSize: number;
    bv: number;
    pv: number;
    status: string;
    detachmentId?: string | null;
}

export type CombatUnitUpdateInput = Partial<Omit<CombatUnit, 'id'>>;

export interface Pilot {
    id: string;
    name: string;
    gunnery: number;
    piloting: number;
    asSkill: number;
    edgeTokensSkill?: number;
    edgeAbilitySkill?: number;
    edgeAbilities?: string;
    unitType: string;
    wounds: number;
    handicap: number;
    totalSpEarned: number;
    gunnerySpEarned: number;
    pilotingSpEarned: number;
    edgeTokensSpEarned: number;
    edgeAbilitySpEarned: number;
    detachmentId?: string | null;
}

export type PilotUpdateInput = Partial<Omit<Pilot, 'id'>>;

export interface TrackUpdateInput {
    trackName?: string;
    location?: string;
    nextSession?: string;
    attackerFactionId?: string;
    monthIndex?: number;
    complication?: string;
    oppositionComplication?: string;
}

export interface CampaignCreateInput {
    name?: string;
    employer?: string;
    opponent?: string;
    mission?: string;
    employerCategory?: string;
    opponentCategory?: string;
    oppMission?: string;
    systemName?: string;
    description?: string;
    status?: string;
    payRate?: number;
    salvageTerms?: string;
    supportTerms?: string;
    transportTerms?: string;
    commandRights?: string;
    payStep?: number;
    salvageStep?: number;
    supportStep?: number;
    transportStep?: number;
    commandStep?: number;
    oppPayRate?: number;
    oppPayStep?: number;
    oppSalvageTerms?: string;
    oppSalvageStep?: number;
    oppSupportTerms?: string;
    oppSupportStep?: number;
    oppTransportTerms?: string;
    oppTransportStep?: number;
    oppCommandRights?: string;
    oppCommandStep?: number;
    trackCount?: number;
    lengthInMonths?: number;
    monthlyPay?: number;
    monthlyMaintenance?: number;
    transportationCost?: number;
    combatPay?: number;
    armorMultiplier?: number;
    internalMultiplier?: number;
    crippledMultiplier?: number;
    destroyedMultiplier?: number;
    nonMechModifier?: number;
    mixedTechModifier?: number;
    clanTechModifier?: number;
    omnimechReconfigureModifier?: number;
    pvPurchaseUnitMultiplier?: number;
    pvSellUnitMultiplier?: number;
    rearmCostPerTon?: number;
    rearmCostPerTonAlphaStrike?: number;
    hireMechWarriorCost?: number;
    hireNamedPilotCost?: number;
    hireBattleArmorCost?: number;
    healMechWarriorPerWoundBoxCost?: number;
    healMechWarriorPerMonthLimit?: number;
    healBattleArmorCost?: number;
    trainFormationCommanderCost?: number;
    changeFormationTrainingCost?: number;
    learnCommandAbility1Cost?: number;
    learnCommandAbility2Cost?: number;
    learnCommandAbility3Cost?: number;
    replaceCommandAbilityCost?: number;
    tracks?: ProposedTrackInput[];
}

export interface ProposedTrackInput {
    name?: string;
    complication?: string;
    oppositionComplication?: string;
}

export type CampaignUpdateInput = Omit<Partial<CampaignCreateInput>, 'tracks'>;

export type CommandUpdateInput = Partial<Pick<MercenaryCommand, 'name' | 'commandingOfficer' | 'totalSupportPoints' | 'reputation'>>;

export interface LedgerEntryInput {
    amount: number;
    description: string;
    reputationChange?: number;
    campaignId?: string;
    campaignName?: string;
    monthIndex?: number;
}

export interface LedgerEntry extends LedgerEntryInput {
    id: string;
    detachmentId?: string;
    timestamp: string;
}

export interface Detachment {
    id: string;
    name: string;
    campaignId?: string | null;
    campaignName?: string | null;
    mercenaryCommandId?: string;
    mercenaryCommandName?: string;
    units?: CombatUnit[];
    pilots?: Pilot[];
    campaignRating?: number;
}

export type Command = MercenaryCommand;

export interface MercenaryCommand {
    id: string;
    name: string;
    totalSupportPoints: number;
    reputation: number;
    commandingOfficer: string;
    detachments?: Detachment[];
    units?: CombatUnit[];
    pilots?: Pilot[];
    allLedgerEntries?: LedgerEntry[];
}

// ==================== GraphQL Data Models ====================

export interface UserAccount {
    id: string;
    name: string;
    email: string;
    displayName?: string | null;
    role: string;
}

export interface Profile {
    email: string;
    name: string;
}

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
    'missions' | 'trackTypes' | 'factions' | 'employerTypes' | 'resolvedSteps'
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
        monthlyPay?: number;
        monthlyMaintenance?: number;
        transportationCost?: number;
        combatPay?: number;
    };
    armorMultiplier?: number;
    internalMultiplier?: number;
    crippledMultiplier?: number;
    destroyedMultiplier?: number;
    nonMechModifier?: number;
    mixedTechModifier?: number;
    clanTechModifier?: number;
    omnimechReconfigureModifier?: number;
    pvPurchaseUnitMultiplier?: number;
    pvSellUnitMultiplier?: number;
    rearmCostPerTon?: number;
    rearmCostPerTonAlphaStrike?: number;
    hireMechWarriorCost?: number;
    hireNamedPilotCost?: number;
    hireBattleArmorCost?: number;
    healMechWarriorPerWoundBoxCost?: number;
    healMechWarriorPerMonthLimit?: number;
    healBattleArmorCost?: number;
    trainFormationCommanderCost?: number;
    changeFormationTrainingCost?: number;
    learnCommandAbility1Cost?: number;
    learnCommandAbility2Cost?: number;
    learnCommandAbility3Cost?: number;
    replaceCommandAbilityCost?: number;
    contracts: ContractPreview[];
    tracks: ProposedTrack[];
}

export type CampaignProposal = Proposal;

export interface ActiveCampaignSummary {
    id: string;
    name: string;
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
    id: string;
    token: string;
    recipientName?: string;
    expiresAt: string;
    used: boolean;
}

export interface TrackDetail {
    id: string;
    trackName: string;
    sequenceOrder: number;
    location?: string;
    nextSession?: string;
    attackerFactionId?: string;
    monthIndex?: number;
    complications?: string;
    afterActionNarrative?: string;
    oppositionComplications?: string;
}

export interface CampaignFaction {
    id: string;
    factionName: string;
}

export interface CampaignDetail {
    id: string;
    name: string;
    systemName: string;
    description?: string;
    lengthInMonths?: number;
    trackCount?: number;
    status: string;
    primaryEmployer: string;
    secondaryEmployer: string;
    payRate?: number;
    payStep?: number;
    salvageTerms?: string;
    salvageStep?: number;
    supportTerms?: string;
    supportStep?: number;
    transportTerms?: string;
    transportStep?: number;
    commandRights?: string;
    commandStep?: number;
    monthlyPay?: number;
    monthlyMaintenance?: number;
    transportationCost?: number;
    combatPay?: number;
    armorMultiplier?: number;
    internalMultiplier?: number;
    crippledMultiplier?: number;
    destroyedMultiplier?: number;
    nonMechModifier?: number;
    mixedTechModifier?: number;
    clanTechModifier?: number;
    omnimechReconfigureModifier?: number;
    pvPurchaseUnitMultiplier?: number;
    pvSellUnitMultiplier?: number;
    rearmCostPerTon?: number;
    rearmCostPerTonAlphaStrike?: number;
    hireMechWarriorCost?: number;
    hireNamedPilotCost?: number;
    hireBattleArmorCost?: number;
    healMechWarriorPerWoundBoxCost?: number;
    healMechWarriorPerMonthLimit?: number;
    healBattleArmorCost?: number;
    trainFormationCommanderCost?: number;
    changeFormationTrainingCost?: number;
    learnCommandAbility1Cost?: number;
    learnCommandAbility2Cost?: number;
    learnCommandAbility3Cost?: number;
    replaceCommandAbilityCost?: number;
    contracts?: Contract[];
    factions?: CampaignFaction[];
    tracks?: TrackDetail[];
    participatingDetachments?: Detachment[];
    campaignInvites?: CampaignInvite[];
}

// Type alias for campaign detail summary (subset of full detail)
export type CampaignDetailSummary = Pick<CampaignDetail,
    'id' | 'name' | 'monthlyPay' | 'monthlyMaintenance' | 'transportationCost' | 'combatPay' | 'contracts'
>;

export interface DetachmentAarState {
    selectedContractId: string;
    selectedLevel: number;
    outcomeMultiplier: number;
    salvageValue: number;
    customAward: number;
}

// ==================== Mutation Input Variables ====================

export interface UpdateCommandVars {
    id: string;
    input: CommandUpdateInput;
}

export interface UpdateUnitVars {
    id: string;
    input: CombatUnitUpdateInput;
}

export interface AddUnitVars {
    commandId: string;
    input: CombatUnitUpdateInput;
}

export interface ImportAssetsVars {
    commandId: string;
    detachmentId: string | null;
    link: string;
}

export interface UpdatePilotVars {
    id: string;
    input: PilotUpdateInput;
}

export interface HirePilotVars {
    commandId: string;
    input: PilotUpdateInput;
}

export interface DeleteUnitVars {
    unitId: string;
}

export interface DeletePilotVars {
    pilotId: string;
}

export interface DeleteDetachmentVars {
    detachmentId: string;
}

export interface CreateDetachmentVars {
    commandId: string;
    campaignId: string | null;
    name: string;
}

export interface CreateInviteVars {
    campaignId: string;
    recipientName?: string | null;
}

/**
 * Utility to map a query name to an entity type for GraphQL response structures.
 */
export type GQLResponse<K extends string, T> = {
    [P in K]: T;
};