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
import React, { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { TacticalMarkdown } from './TacticalMarkdown'
import { useHscActionHandler } from './useHscActionHandler'
import {
  GetCampaignMarketDocument,
  SaveMarketMarkdownDocument,
  GetCampaignMetadataDocument,
} from '../types/operations'
import { MarketLinkGenerator } from './MarketLinkGenerator'
import { MercenaryCommand, CombatUnit, Pilot } from '../types/generated'
import { CombatUnitEditor } from './CombatUnitEditor'
import { PilotEditor } from './PilotEditor'
import { UnitType, UnitStatus, TechBase } from '../types/helpers'
import {
  UNIT_STATUS_OPTIONS as FALLBACK_STATUSES,
  UNIT_TYPES as FALLBACK_TYPES,
  TECH_BASES as FALLBACK_TECH,
} from './Rules'

type MarketType = 'FREE' | 'PRIMARY_EMPLOYER' | 'OPPOSITION_EMPLOYER' | 'SCRAPPERS'

interface MarketViewProps {
  campaignId: string
  marketType: MarketType
  campaign: any
  setOverlay: (overlay: any) => void
  userCommands?: MercenaryCommand[]
}

// Markdown templates inserted via the utility buttons in edit mode.
// The mech table format mirrors MarkdownMarketFormatter.parseUnitTable() so it
// can be consumed by the scrapper random draw.
const EMPTY_MECH_TABLE = `## Available Units

| Model | Variant | BV [PV] | Tech | Condition | Price | Action |
|-------|---------|---------|------|-----------|-------|--------|
| Unknown Model | Unknown Variant | 0 [0] | Inner Sphere | OPERATIONAL | 0 | [Buy](hsc://procure?model=Unknown%20Model&variant=Unknown%20Variant&bv=0&pv=0&sz=0&type=BM&tech=Inner%20Sphere&tons=0&price=0) |`

const GENERIC_MECH_LINK = '[Buy Generic Mech](hsc://procure?model=Generic%20Mech&variant=Standard&bv=1000&pv=20&sz=4&type=BM&tech=Inner%20Sphere&tons=50&price=1000000)'

const EMPTY_PILOT_TABLE = `## Available Pilots

| Name | Unit Type | Gunnery | Piloting | Wounds | Price | Action |
|------|-----------|---------|----------|--------|-------|--------|
| New Pilot | BM | 4 | 5 | 0 | 20000 | [Hire](hsc://hire?name=New%20Pilot&unitType=BM&wounds=0&gunnerySpEarned=100&pilotingSpEarned=100&edgeTokensSpEarned=0&edgeAbilitySpEarned=0&edgeAbilities=None&price=20000) |`

const GENERIC_PILOT_LINK = '[Hire Generic Pilot](hsc://hire?name=New%20Pilot&unitType=BM&wounds=0&gunnerySpEarned=100&pilotingSpEarned=100&edgeTokensSpEarned=0&edgeAbilitySpEarned=0&edgeAbilities=None&price=20000)'

export const MarketView: React.FC<MarketViewProps> = ({
  campaignId,
  marketType,
  campaign,
  setOverlay,
  userCommands,
}) => {
  const {
    handleHscAction,
    showProcureEditor,
    procureAssetData,
    procureTargetDetachment,
    handleProcureSave,
    handleProcureCancel,
    showHireEditor,
    hirePilotData,
    hireTargetDetachment,
    handleHireSave,
    handleHireCancel,
  } = useHscActionHandler({
    campaign,
    userCommands,
    setOverlay,
    onActionComplete: () => refetch(),
  })
  const [isEditing, setIsEditing] = useState(false)
  const [markdown, setMarkdown] = useState('')
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data, loading, refetch } = useQuery(GetCampaignMarketDocument, {
    variables: { campaignId },
    fetchPolicy: 'cache-and-network',
  })

  const { data: metaData } = useQuery(GetCampaignMetadataDocument)

  const [saveMarkdown] = useMutation(SaveMarketMarkdownDocument)

  useEffect(() => {
    // Always refetch when campaignId or marketType changes to ensure fresh data
    refetch()
  }, [campaignId, marketType, refetch])

  useEffect(() => {
    if (data) {
      const market = data.campaignMarket
      //console.log('DEBUG: Market Data:', market);
      if (marketType === 'FREE') {
        setMarkdown(market?.freeMarketMarkdown || '# Free Market\nNo units currently available.')
      } else if (marketType === 'SCRAPPERS') {
        setMarkdown(
          market?.scrapperMarketMarkdown || "# Scrappers' Yard\nWelcome to the scrap heap.",
        )
      } else if (marketType === 'PRIMARY_EMPLOYER') {
        const employerName = campaign.primaryEmployer
        const employerMarket = market?.employerMarkets?.find(
          (m: any) => m.factionId === employerName,
        )
        setMarkdown(
          employerMarket?.markdown ||
          `# ${employerName || 'Primary Employer'}\nNo employer listings available.`,
        )
      } else if (marketType === 'OPPOSITION_EMPLOYER') {
        const employerName = campaign.secondaryEmployer
        const employerMarket = market?.employerMarkets?.find(
          (m: any) => m.factionId === employerName,
        )
        setMarkdown(
          employerMarket?.markdown ||
          `# ${employerName || 'Opposition Employer'}\nNo employer listings available.`,
        )
      }
    }
  }, [data, marketType, campaign])

  const handleSave = async (value?: string) => {
    const markdownToSave = value ?? markdown
    try {
      // For employer markets, find the CampaignFaction UUID by matching the employer name
      let factionId: string | null = null
      if (marketType === 'PRIMARY_EMPLOYER' && campaign.primaryEmployer) {
        const faction = (campaign.factions || []).find(
          (f: any) => f.factionName === campaign.primaryEmployer,
        )
        factionId = faction?.id || null
      } else if (marketType === 'OPPOSITION_EMPLOYER' && campaign.secondaryEmployer) {
        const faction = (campaign.factions || []).find(
          (f: any) => f.factionName === campaign.secondaryEmployer,
        )
        factionId = faction?.id || null
      }

      await saveMarkdown({
        variables: {
          campaignId,
          marketType: marketType.toUpperCase() as any,
          markdown: markdownToSave,
          factionId,
        },
      })
      if (!value) {
        setIsEditing(false)
      }
    } catch (e) {
      console.error('Failed to save market markdown:', e)
    }
  }

  // Cleanup effect to save any pending changes when the component unmounts or marketType changes
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      // Save current markdown state if in editing mode
      // This is crucial for preserving unsaved changes when switching tabs or closing the dashboard.
      if (isEditing && markdown.length > 0) {
        handleSave(markdown)
      }
    }
  }, [isEditing, markdown, campaignId, marketType, saveMarkdown, handleSave])

  const handleMarkdownChange = (value: string) => {
    setMarkdown(value)

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      handleSave(value)
    }, 5000)
  }

  const appendTemplate = (template: string) => {
    const base = markdown.trim()
    const next = base.length > 0 ? `${base}\n\n${template}` : template
    setMarkdown(next)

    // Schedule an autosave that preserves edit mode. Passing no value to
    // handleSave keeps isEditing true (only an explicit CLOSE flips it).
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = setTimeout(() => {
      handleSave()
    }, 5000)
  }

  if (loading)
    return (
      <div className="restricted-text" style={{ color: 'var(--terminal-amber)' }}>
        [ LOADING MARKET DATA... ]
      </div>
    )

  return (
    <div
      className="market-view"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
      }}
    >
      <div
        className="view-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--terminal-amber)',
          paddingBottom: '10px',
        }}
      >
        <h3
          className="restricted-text"
          style={{ margin: 0, fontSize: '1rem', color: 'var(--terminal-amber)' }}
        >
          {marketType === 'FREE'
            ? '[ FREE MARKET ]'
            : marketType === 'PRIMARY_EMPLOYER'
              ? `[ ${campaign.primaryEmployer?.toUpperCase() || 'PRIMARY EMPLOYER'} MARKET ]`
              : marketType === 'OPPOSITION_EMPLOYER'
                ? `[ ${campaign.secondaryEmployer?.toUpperCase() || 'OPPOSITION EMPLOYER'} MARKET ]`
                : "[ SCRAPPERS' YARD ]"}
        </h3>
        <button
          className="mode-btn theme-amber"
          onClick={() => {
            if (isEditing) {
              handleSave()
            } else {
              setIsEditing(true)
            }
          }}
          style={{ fontSize: '0.6rem' }}
        >
          {isEditing ? '[ CLOSE ]' : '[ EDIT ]'}
        </button>
      </div>

      {isEditing ? (
        <div
          className="edit-mode"
          style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
        >
          <textarea
            className="table-input"
            style={{
              width: '100%',
              minHeight: '400px',
              fontFamily: 'monospace',
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'var(--terminal-amber)',
              border: '1px solid var(--terminal-amber)',
              padding: '10px',
              fontSize: '0.8rem',
            }}
            value={markdown}
            onChange={(e) => handleMarkdownChange(e.target.value)}
            onBlur={() => handleSave()}
          />
          <div
            className="market-template-buttons"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <button
              type="button"
              className="mode-btn theme-amber"
              style={{ fontSize: '0.6rem' }}
              onClick={() => appendTemplate(EMPTY_MECH_TABLE)}
            >
              [ + MECH TABLE ]
            </button>
            <button
              type="button"
              className="mode-btn theme-amber"
              style={{ fontSize: '0.6rem' }}
              onClick={() => appendTemplate(GENERIC_MECH_LINK)}
            >
              [ + MECH LINK ]
            </button>
            <button
              type="button"
              className="mode-btn theme-amber"
              style={{ fontSize: '0.6rem' }}
              onClick={() => appendTemplate(EMPTY_PILOT_TABLE)}
            >
              [ + PILOT TABLE ]
            </button>
            <button
              type="button"
              className="mode-btn theme-amber"
              style={{ fontSize: '0.6rem' }}
              onClick={() => appendTemplate(GENERIC_PILOT_LINK)}
            >
              [ + PILOT LINK ]
            </button>
          </div>
          <MarketLinkGenerator campaignId={campaignId} />
        </div>
      ) : (
        <div
          className="view-mode"
          style={{
            backgroundColor: 'rgba(0,0,0,0.3)',
            padding: '20px',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '4px',
          }}
        >
          <TacticalMarkdown content={markdown} onAction={handleHscAction} />
        </div>
      )}

      {showProcureEditor && procureTargetDetachment && (
        <CombatUnitEditor
          mode="create"
          commandId={procureTargetDetachment.mercenaryCommandId || ''}
          detachmentId={procureTargetDetachment.id}
          availableSP={procureTargetDetachment.totalSupportPoints}
          unit={
            {
              ...procureAssetData,
              id: '',
              type: (procureAssetData?.type as UnitType) || 'BM',
              model: procureAssetData?.model || 'NEW UNIT',
              variant: procureAssetData?.variant || '',
              techBase: (procureAssetData?.techBase as TechBase) || 'Inner Sphere',
              tonnage: procureAssetData?.tonnage || 0,
              asSize: procureAssetData?.asSize || 0,
              bv: procureAssetData?.bv || 0,
              pv: procureAssetData?.pv || 0,
              status:
                (metaData?.publicCampaignMetadata?.unitStatuses?.[0] as UnitStatus) ||
                'OPERATIONAL',
              detachmentId: procureTargetDetachment.id,
            } as CombatUnit
          }
          unitTypes={(metaData?.publicCampaignMetadata?.unitTypes || FALLBACK_TYPES) as UnitType[]}
          unitStatuses={
            (metaData?.publicCampaignMetadata?.unitStatuses || FALLBACK_STATUSES) as UnitStatus[]
          }
          techBases={(metaData?.publicCampaignMetadata?.techBases || FALLBACK_TECH) as TechBase[]}
          onSave={handleProcureSave}
          onCancel={handleProcureCancel}
          overridePrice={procureAssetData?.overridePrice}
        />
      )}

      {showHireEditor && hireTargetDetachment && (
        <PilotEditor
          mode="create"
          commandId={hireTargetDetachment.mercenaryCommandId || ''}
          detachmentId={hireTargetDetachment.id}
          availableSP={hireTargetDetachment.totalSupportPoints}
          pilot={
            {
              ...hirePilotData,
              id: '',
              name: hirePilotData?.name || 'NEW PILOT',
              gunnery: 4,
              piloting: 5,
              asSkill: 4,
              edgeTokensSkill: null,
              edgeAbilitySkill: null,
              edgeAbilities: hirePilotData?.edgeAbilities ?? null,
              unitType: hirePilotData?.unitType || 'BM',
              wounds: hirePilotData?.wounds || 0,
              handicap: 0,
              totalSpEarned: hirePilotData?.totalSpEarned || 0,
              gunnerySpEarned: hirePilotData?.gunnerySpEarned || 0,
              pilotingSpEarned: hirePilotData?.pilotingSpEarned || 0,
              edgeTokensSpEarned: hirePilotData?.edgeTokensSpEarned || 0,
              edgeAbilitySpEarned: hirePilotData?.edgeAbilitySpEarned || 0,
              detachmentId: hireTargetDetachment.id,
            } as Pilot
          }
          onSave={handleHireSave}
          onCancel={handleHireCancel}
          overridePrice={hirePilotData?.overridePrice}
          campaignHireCost={campaign.hireNamedPilotCost ?? undefined}
        />
      )}
    </div>
  )
}
