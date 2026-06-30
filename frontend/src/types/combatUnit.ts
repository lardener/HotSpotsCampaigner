import { UnitType, TechBase, UnitStatus } from './common';

/**
 * Represents a tactical unit in the database and UI.
 */
export interface CombatUnit {
    __typename?: string;
    id: string;
    type: UnitType;
    model: string;
    variant: string;
    techBase: TechBase;
    tonnage: number;
    asSize: number;
    bv: number;
    pv: number;
    status: UnitStatus;
    detachmentId: string | null;
}

export type CombatUnitUpdateInput = Partial<Omit<CombatUnit, 'id' | '__typename'>>;

// ==================== Mutation Input Variables ====================

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

export interface DeleteUnitVars {
    unitId: string;
}
