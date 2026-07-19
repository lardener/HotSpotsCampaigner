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
import { UnitStatus, UnitType, TechBase } from '../types/helpers'
export const UNIT_STATUS_OPTIONS: UnitStatus[] = [
  'OPERATIONAL',
  'ARMOR DAMAGE',
  'INTERNAL DAMAGE',
  'CRIPPLED',
  'DESTROYED',
  'TRULY DESTROYED',
]

export const UNIT_TYPES: UnitType[] = ['BM', 'CV', 'PM', 'IM', 'BA', 'CI']
export const TECH_BASES: TechBase[] = ['Inner Sphere', 'Clan', 'Mixed']

export const HIRE_NAMED_PILOT_COST = 150 // Default cost for hiring a named pilot
