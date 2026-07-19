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
// Pilot skill threshold configuration for Hot Spots & Campaigners
// Thresholds map skill points (SP) → skill level + handicap penalty
// Higher SP = lower skill value (better), higher handicap penalty

/** Single threshold entry mapping SP requirement to skill level and handicap. */
export interface ThresholdEntry {
  /** Minimum SP required to reach this level. */
  sp: number
  /** Skill level at this threshold (lower = better for gunnery/piloting). */
  skill: number
  /** Handicap penalty contributed by this skill at this level. */
  handicap: number
}

/** Finds the active threshold (skill level + handicap) for a given SP allocation. */
export function getActiveThreshold(thresholds: ThresholdEntry[], alloc: number): ThresholdEntry {
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (alloc >= thresholds[i].sp) return thresholds[i]
  }
  return thresholds[0]
}

// ---------------------------------------------------------------------------
// Gunnery thresholds – 5 levels, SP 0→2200, skill 4→0, handicap 0→88
// ---------------------------------------------------------------------------
export const gunneryThresholds: ThresholdEntry[] = [
  { sp: 0, skill: 4, handicap: 0 },
  { sp: 300, skill: 3, handicap: 12 },
  { sp: 700, skill: 2, handicap: 28 },
  { sp: 1200, skill: 1, handicap: 48 },
  { sp: 2200, skill: 0, handicap: 88 },
]

// ---------------------------------------------------------------------------
// Piloting thresholds – 5 levels, SP 0→1200, skill 5→1, handicap 0→48
// ---------------------------------------------------------------------------
export const pilotingThresholds: ThresholdEntry[] = [
  { sp: 0, skill: 5, handicap: 0 },
  { sp: 100, skill: 4, handicap: 4 },
  { sp: 200, skill: 3, handicap: 8 },
  { sp: 700, skill: 2, handicap: 28 },
  { sp: 1200, skill: 1, handicap: 48 },
]

// ---------------------------------------------------------------------------
// Edge Tokens thresholds – 10 levels, SP 0→1100, skill 1→10, handicap 0→44
// ---------------------------------------------------------------------------
export const edgeTokensThresholds: ThresholdEntry[] = [
  { sp: 0, skill: 1, handicap: 0 },
  { sp: 60, skill: 2, handicap: 2 },
  { sp: 120, skill: 3, handicap: 5 },
  { sp: 200, skill: 4, handicap: 8 },
  { sp: 300, skill: 5, handicap: 13 },
  { sp: 420, skill: 6, handicap: 17 },
  { sp: 560, skill: 7, handicap: 22 },
  { sp: 720, skill: 8, handicap: 29 },
  { sp: 900, skill: 9, handicap: 36 },
  { sp: 1100, skill: 10, handicap: 44 },
]

// ---------------------------------------------------------------------------
// Edge Ability thresholds – 6 levels, SP 0→900, skill 0→5, handicap 0→36
// ---------------------------------------------------------------------------
export const edgeAbilityThresholds: ThresholdEntry[] = [
  { sp: 0, skill: 0, handicap: 0 },
  { sp: 60, skill: 1, handicap: 2 },
  { sp: 180, skill: 2, handicap: 8 },
  { sp: 360, skill: 3, handicap: 14 },
  { sp: 600, skill: 4, handicap: 24 },
  { sp: 900, skill: 5, handicap: 36 },
]
