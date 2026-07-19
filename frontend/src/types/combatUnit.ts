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
import { UnitType, TechBase, UnitStatus } from './common'

/**
 * Represents a tactical unit in the database and UI.
 */
export interface CombatUnit {
  __typename?: string
  id: string
  type: UnitType
  model: string
  variant: string
  techBase: TechBase
  tonnage: number
  asSize: number
  bv: number
  pv: number
  status: UnitStatus
  detachmentId: string | null
}

export type CombatUnitUpdateInput = Partial<Omit<CombatUnit, 'id' | '__typename'>>

// ==================== Mutation Input Variables ====================

export interface UpdateUnitVars {
  id: string
  input: CombatUnitUpdateInput
}

export interface AddUnitVars {
  commandId: string
  input: CombatUnitUpdateInput
}

export interface ImportAssetsVars {
  commandId: string
  detachmentId: string | null
  link: string
}

export interface DeleteUnitVars {
  unitId: string
}
