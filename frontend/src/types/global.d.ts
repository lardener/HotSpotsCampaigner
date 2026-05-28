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
    availableFromMonth: number;
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
    availableFromMonth?: number;
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
    handicap: string;
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
    handicap?: string;
    totalSpEarned?: number;
    gunnerySpEarned?: number;
    pilotingSpEarned?: number;
    edgeTokensSpEarned?: number;
    edgeAbilitySpEarned?: number;
    detachmentId?: string | null;
}

export interface CommandUpdateInput {
    name?: string;
    commandingOfficer?: string;
    totalSupportPoints?: number;
    reputation?: number;
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