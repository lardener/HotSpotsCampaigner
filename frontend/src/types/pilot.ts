import { UnitType } from './common';

/**
 * Represents a pilot or MechWarrior.
 */
export interface Pilot {
    __typename?: string;
    id: string;
    name: string;
    gunnery: number;
    piloting: number;
    asSkill: number;
    edgeTokensSkill: number | null;
    edgeAbilitySkill: number | null;
    edgeAbilities: string | null;
    unitType: UnitType;
    wounds: number;
    handicap: number;
    totalSpEarned: number;
    gunnerySpEarned: number;
    pilotingSpEarned: number;
    edgeTokensSpEarned: number;
    edgeAbilitySpEarned: number;
    detachmentId: string | null;
}

export type PilotUpdateInput = Partial<Omit<Pilot, 'id' | '__typename'>>;

// ==================== Mutation Input Variables ====================

export interface UpdatePilotVars {
    id: string;
    input: PilotUpdateInput;
}

export interface HirePilotVars {
    commandId: string;
    input: PilotUpdateInput;
}

export interface DeletePilotVars {
    pilotId: string;
}
