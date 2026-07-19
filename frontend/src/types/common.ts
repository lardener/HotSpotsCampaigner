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
/**
 * Shared Common and UI helper types.
 */

/**
 * Represents a numeric value during UI entry.
 * Allows strings to handle intermediate states like empty fields or
 * a lone negative sign ("-") before the number is fully typed.
 */
export type NumericInput = string | number

export type UnitType = 'BM' | 'CV' | 'PM' | 'IM' | 'BA' | 'CI'
export type TechBase = 'Inner Sphere' | 'Clan' | 'Mixed'
export type UnitStatus =
  'OPERATIONAL' | 'ARMOR DAMAGE' | 'INTERNAL DAMAGE' | 'CRIPPLED' | 'DESTROYED' | 'TRULY DESTROYED'

/**
 * Utility to map a query name to an entity type for GraphQL response structures.
 */
export type GQLResponse<K extends string, T> = {
  [P in K]: T
}
