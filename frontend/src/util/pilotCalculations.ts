import { Pilot } from '../types/generated';
import {
    gunneryThresholds,
    pilotingThresholds,
    edgeTokensThresholds,
    edgeAbilityThresholds,
    getActiveThreshold
} from '../constants/pilotThresholds';

/**
 * Recalculates derived pilot values from SP allocations.
 * 
 * This function computes:
 * - totalSpEarned: Sum of all component SP allocations
 * - Individual skill levels (gunnery, piloting, edgeTokensSkill, edgeAbilitySkill): Mapped from SP via threshold tables
 * - asSkill: Floor of (gunnery + piloting) / 2
 * - handicap: Sum of all component handicaps
 * 
 * @param next - The pilot object to update with derived values
 * @returns The updated pilot object
 */
export function recalcDerived(next: Pilot): Pilot {
    // Calculate Total SP as sum of component allocations
    next.totalSpEarned = (next.gunnerySpEarned || 0) +
        (next.pilotingSpEarned || 0) +
        (next.edgeTokensSpEarned || 0) +
        (next.edgeAbilitySpEarned || 0);

    // Map component SP to Skill levels
    next.gunnery = getActiveThreshold(gunneryThresholds, next.gunnerySpEarned || 0).skill;
    next.piloting = getActiveThreshold(pilotingThresholds, next.pilotingSpEarned || 0).skill;
    next.edgeTokensSkill = getActiveThreshold(edgeTokensThresholds, next.edgeTokensSpEarned || 0).skill;
    next.edgeAbilitySkill = getActiveThreshold(edgeAbilityThresholds, next.edgeAbilitySpEarned || 0).skill;

    // AS skill = floor((gunnery + piloting) / 2)
    next.asSkill = Math.floor((next.gunnery + next.piloting) / 2);

    // Handicap is the sum of component handicaps
    next.handicap = getActiveThreshold(gunneryThresholds, next.gunnerySpEarned || 0).handicap +
        getActiveThreshold(pilotingThresholds, next.pilotingSpEarned || 0).handicap +
        getActiveThreshold(edgeTokensThresholds, next.edgeTokensSpEarned || 0).handicap +
        getActiveThreshold(edgeAbilityThresholds, next.edgeAbilitySpEarned || 0).handicap;

    return next;
}
