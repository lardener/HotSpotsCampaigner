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
import { CombatUnit } from './combatUnit'
import { Pilot } from './pilot'

export interface LedgerEntryInput {
  amount: number
  description: string
  reputationChange?: number | null
  campaignId?: string | null
  campaignName?: string | null
  monthIndex?: number | null
}

export interface LedgerEntry extends LedgerEntryInput {
  __typename?: string
  id: string
  detachmentId: string | null
  timestamp: string
}

export interface Detachment {
  __typename?: string
  id: string
  name: string
  campaignId: string | null
  campaignName: string | null
  mercenaryCommandId: string | null
  mercenaryCommandName: string | null
  units?: CombatUnit[]
  pilots?: Pilot[]
  campaignRating?: number
}

export type Command = MercenaryCommand

export interface MercenaryCommand {
  __typename?: string
  id: string
  name: string
  totalSupportPoints: number
  reputation: number
  isManager?: boolean
  isParticipant?: boolean
  commandingOfficer: string
  detachments?: Detachment[]
  units?: CombatUnit[]
  pilots?: Pilot[]
  allLedgerEntries?: LedgerEntry[]
}

export type CommandUpdateInput = Partial<
  Pick<MercenaryCommand, 'name' | 'commandingOfficer' | 'totalSupportPoints' | 'reputation'>
>

// ==================== Mutation Input Variables ====================

export interface UpdateCommandVars {
  id: string
  input: CommandUpdateInput
}

export interface AssignAssetVars {
  assetType: string
  assetId: string
  detachmentId: string | null
}

export interface DeleteDetachmentVars {
  detachmentId: string
}

export interface CreateDetachmentVars {
  commandId: string
  campaignId: string | null
  name: string
}
