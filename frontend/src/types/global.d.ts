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

export interface CombatUnitUpdateInput {
    type?: string;
    model?: string;
    variant?: string;
    techBase?: string;
    tonnage?: number;
    asSize?: number;
    bv?: number;
    pv?: number;
    status?: string;
    detachmentId?: string | null;
}

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

export interface PilotUpdateInput {
    name?: string;
    gunnery?: number;
    piloting?: number;
    asSkill?: number;
    edgeTokensSkill?: number;
    edgeAbilitySkill?: number;
    edgeAbilities?: string;
    unitType?: string;
    wounds?: number;
    handicap?: number;
    totalSpEarned?: number;
    gunnerySpEarned?: number;
    pilotingSpEarned?: number;
    edgeTokensSpEarned?: number;
    edgeAbilitySpEarned?: number;
    detachmentId?: string | null;
}

export interface RepairRulesInput {
    armorMultiplier?: number;
    internalMultiplier?: number;
    crippledMultiplier?: number;
    destroyedMultiplier?: number;
    nonMechModifier?: number;
    mixedTechModifier?: number;
    clanTechModifier?: number;
}

export interface CampaignUpdateInput {
    name?: string;
    status?: string;
    systemName?: string;
    description?: string;
    employer?: string;
    opponent?: string;
    mission?: string;
    employerCategory?: string;
    opponentCategory?: string;
    oppMission?: string;
    monthlyPay?: number;
    monthlyMaintenance?: number;
    transportationCost?: number;
    combatPay?: number;
    repairRules?: RepairRulesInput;
    lengthInMonths?: number;
    trackCount?: number;
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
}

export interface ProposedTrackInput {
    name?: string;
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
    repairRules?: RepairRulesInput;
    tracks?: ProposedTrackInput[];
}

export interface CommandUpdateInput {
    name?: string;
    commandingOfficer?: string;
    totalSupportPoints?: number;
    reputation?: number;
}

export interface LedgerEntryInput {
    amount: number;
    description: string;
    reputationChange?: number;
    campaignName?: string;
    monthIndex?: number;
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
}

export interface Command {
    id: string;
    name: string;
    totalSupportPoints: number;
    reputation: number;
    commandingOfficer: string;
    detachments?: Detachment[];
}