/*
 * HotSpots Campaigner - Battletech Mercenaries campaign management SaaS.
 * Copyright (C) 2026 Jose Ferrer
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
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
