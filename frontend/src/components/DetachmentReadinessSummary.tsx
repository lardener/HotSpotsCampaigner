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
import React from 'react'
import { CombatUnit, Pilot } from '../types/generated'
import { UnitType } from '../types/helpers'

interface Props {
  units: CombatUnit[]
  pilots: Pilot[]
  campaignRating?: number
  compact?: boolean
}

interface UnitTypeSummary {
  type: UnitType | 'UNKNOWN'
  count: number
  tons: number
  bv: number
  pv: number
  sz: number
}

interface PilotSpecSummary {
  spec: UnitType | 'UNKNOWN'
  count: number
  gun: number
  pil: number
  as: number
  handicap: number
}

export const DetachmentReadinessSummary: React.FC<Props> = ({
  units,
  pilots,
  campaignRating,
  compact = false,
}) => {
  const unitSummaries = Object.values(
    units.reduce<Record<string, UnitTypeSummary>>(
      (acc, u) => {
        const type = u.type ?? 'UNKNOWN'
        if (!acc[type])
          acc[type] = { type: type as UnitType | 'UNKNOWN', count: 0, tons: 0, bv: 0, pv: 0, sz: 0 }
        acc[type].count++
        acc[type].tons += u.tonnage || 0
        acc[type].bv += u.bv || 0
        acc[type].pv += u.pv || 0
        acc[type].sz += u.asSize || 0
        return acc
      },
      {} as Record<string, UnitTypeSummary>,
    ),
  ) as UnitTypeSummary[]

  const pilotSummaries = Object.values(
    pilots.reduce<Record<string, PilotSpecSummary>>(
      (acc, p) => {
        const spec = p.unitType ?? 'UNKNOWN'
        if (!acc[spec])
          acc[spec] = {
            spec: spec as UnitType | 'UNKNOWN',
            count: 0,
            gun: 0,
            pil: 0,
            as: 0,
            handicap: 0,
          }
        acc[spec].count++
        acc[spec].gun += p.gunnery || 0
        acc[spec].pil += p.piloting || 0
        acc[spec].as += p.asSkill || 0
        acc[spec].handicap += p.handicap || 0
        return acc
      },
      {} as Record<string, PilotSpecSummary>,
    ),
  ) as PilotSpecSummary[]

  return (
    <div
      className="flex flex-gap-20"
      style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : '1fr 1fr', gap: '15px' }}
    >
      {campaignRating != null && (
        <div
          style={{
            gridColumn: '1 / -1',
            borderBottom: '1px solid var(--accent-dim)',
            paddingBottom: '5px',
            marginBottom: '5px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span className="restricted-text" style={{ fontSize: '0.65rem' }}>
            DETACHMENT CAMPAIGN RATING
          </span>
          <span
            className="terminal-text"
            style={{ color: 'var(--terminal-amber)', fontWeight: 'bold' }}
          >
            {campaignRating}
          </span>
        </div>
      )}
      <div>
        <span className="restricted-text" style={{ fontSize: '0.6rem' }}>
          COMBAT UNIT READINESS
        </span>
        <table className="tactical-table sm-text" style={{ marginTop: '5px', fontSize: '0.7rem' }}>
          <thead>
            <tr>
              <th className="text-center">TYPE</th>
              <th className="text-center">QTY</th>
              <th className="text-center">TONS</th>
              <th className="text-center">BV</th>
              <th className="text-center">PV</th>
            </tr>
          </thead>
          <tbody>
            {unitSummaries.map((s) => (
              <tr key={s.type}>
                <td className="text-center">{s.type}</td>
                <td className="text-center">{s.count}</td>
                <td className="text-right">{s.tons}</td>
                <td className="text-right">{s.bv}</td>
                <td className="text-right">{s.pv}</td>
              </tr>
            ))}
            <tr style={{ borderTop: '1px dashed var(--accent-dim)', fontWeight: 'bold' }}>
              <td className="text-center">TTL</td>
              <td className="text-center">
                {unitSummaries.reduce((sum: number, s) => sum + s.count, 0)}
              </td>
              <td className="text-right">
                {unitSummaries.reduce((sum: number, s) => sum + s.tons, 0)}
              </td>
              <td className="text-right">
                {unitSummaries.reduce((sum: number, s) => sum + s.bv, 0)}
              </td>
              <td className="text-right">
                {unitSummaries.reduce((sum: number, s) => sum + s.pv, 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div>
        <span className="restricted-text" style={{ fontSize: '0.6rem' }}>
          PILOT READINESS
        </span>
        <table className="tactical-table sm-text" style={{ marginTop: '5px', fontSize: '0.7rem' }}>
          <thead>
            <tr>
              <th className="text-center">SPEC</th>
              <th className="text-center">QTY</th>
              <th className="text-center">AVG G/P [AS]</th>
              <th className="text-center">H</th>
            </tr>
          </thead>
          <tbody>
            {pilotSummaries.map((s) => (
              <tr key={s.spec}>
                <td className="text-center">{s.spec}</td>
                <td className="text-center">{s.count}</td>
                <td className="text-center">
                  {(s.gun / s.count).toFixed(1)}/{(s.pil / s.count).toFixed(1)} [
                  {(s.as / s.count).toFixed(1)}]
                </td>
                <td className="text-center">{s.handicap}</td>
              </tr>
            ))}
            <tr style={{ borderTop: '1px dashed var(--accent-dim)', fontWeight: 'bold' }}>
              <td className="text-center">TTL</td>
              <td className="text-center">
                {pilotSummaries.reduce((sum: number, s) => sum + s.count, 0)}
              </td>
              <td className="text-center">---</td>
              <td className="text-center">
                {pilotSummaries.reduce((sum: number, s) => sum + s.handicap, 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
