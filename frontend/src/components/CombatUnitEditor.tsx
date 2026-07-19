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
import React, { useState, useEffect, useMemo } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import {
  useFloating,
  useInteractions,
  useRole,
  useDismiss,
  FloatingPortal,
  FloatingOverlay,
  FloatingFocusManager,
} from '@floating-ui/react'
import { TerminalOverlay } from './TerminalOverlay'
import { CombatUnit, CombatUnitUpdateInput } from '../types/generated'
import { UnitType, UnitStatus, TechBase } from '../types/helpers'
import { calculateReconfigureCost, calculatePurchasePrice } from '../util/pricingUtils'
import {
  AddCombatUnitDocument as ADD_UNIT,
  UpdateUnitDocument,
  ImportAssetsDocument,
  GetCampaignMetadataDocument,
  AddLedgerEntryDocument,
} from '../types/operations'
import { GetCampaignMetadataQuery } from '../types/operations'
import { CombatUnitBackground } from './CombatUnitBackground'

interface CombatUnitEditorProps {
  unit?: CombatUnit | null
  commandId: string
  detachmentId?: string | null
  mode: 'create' | 'edit'
  onSave: (unit: CombatUnit) => void
  onCancel: () => void
  unitTypes: UnitType[]
  unitStatuses: UnitStatus[]
  techBases: TechBase[]
  availableSP?: number
  overridePrice?: number
}

export const CombatUnitEditor: React.FC<CombatUnitEditorProps> = ({
  unit,
  commandId,
  mode,
  onSave,
  onCancel,
  unitTypes,
  unitStatuses,
  techBases,
  availableSP,
  detachmentId,
  overridePrice,
}) => {
  const createDefaultUnit = (): CombatUnit => ({
    id: '',
    model: 'NEW UNIT',
    type: unitTypes[0] || 'BM',
    variant: '',
    techBase: techBases[0] || 'Inner Sphere',
    tonnage: 0,
    asSize: 0,
    bv: 0,
    pv: 0,
    status: unitStatuses[0] || 'OPERATIONAL',
    detachmentId: detachmentId ?? null, // Ensure undefined from props is null
  })

  const [formData, setFormData] = useState<CombatUnit>(() =>
    unit
      ? ({
          ...unit,
          detachmentId: unit.detachmentId ?? detachmentId ?? null,
        } as CombatUnit)
      : createDefaultUnit(),
  )
  const [pricingRule, setPricingRule] = useState<'Core' | 'Alpha Strike'>('Core')

  // Ensure form updates if the unit prop changes (e.g. clicking edit on a different unit while editor is open)
  useEffect(() => {
    setFormData(
      unit
        ? ({
            ...unit,
            detachmentId: unit.detachmentId ?? detachmentId ?? null,
          } as CombatUnit)
        : createDefaultUnit(),
    )
  }, [unit, detachmentId])

  const [importLink, setImportLink] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [overlay, setOverlay] = useState<{
    title: string
    message: string
    onConfirm: (val?: string) => void | Promise<void>
    variant?: 'alert' | 'info'
    children?: React.ReactNode
    showInputField?: boolean
    inputPlaceholder?: string
    inputInitialValue?: string
    inputType?: string
    inputLabel?: string
  } | null>(null)

  const { refs, context } = useFloating({
    open: true,
    onOpenChange: (open) => !open && onCancel(),
  })

  const dismiss = useDismiss(context)
  const role = useRole(context, { role: 'dialog' })
  const { getFloatingProps } = useInteractions([dismiss, role])

  const [addUnit] = useMutation(ADD_UNIT)
  const [updateUnit] = useMutation(UpdateUnitDocument)
  const [importAssets] = useMutation(ImportAssetsDocument)
  const [addLedgerEntry] = useMutation(AddLedgerEntryDocument)
  const { data: metadataData } = useQuery<GetCampaignMetadataQuery>(GetCampaignMetadataDocument)

  const purchasePrice = useMemo(() => {
    if (overridePrice !== undefined) {
      return overridePrice
    }
    return calculatePurchasePrice(
      formData.bv || 0,
      formData.pv || 0,
      formData.techBase || 'Inner Sphere',
      pricingRule,
      overridePrice,
      metadataData?.publicCampaignMetadata as any,
    )
  }, [formData, metadataData, pricingRule, overridePrice])

  const reconfigureCost = useMemo(() => {
    if (mode !== 'edit' || !unit || !formData.detachmentId) return 0
    if (formData.bv === unit.bv && formData.pv === unit.pv) return 0
    return calculateReconfigureCost(
      mode,
      unit,
      formData.bv || 0,
      formData.pv || 0,
      formData.tonnage || 0,
      formData.asSize || 0,
      formData.techBase || 'Inner Sphere',
      formData.detachmentId,
      pricingRule,
      metadataData?.publicCampaignMetadata as any,
    )
  }, [
    mode,
    unit,
    formData.detachmentId,
    formData.bv,
    formData.pv,
    formData.tonnage,
    formData.asSize,
    formData.techBase,
    pricingRule,
    metadataData,
  ])

  const handleInputChange = (field: keyof CombatUnit, value: any) => {
    const isNumeric = ['tonnage', 'asSize', 'bv', 'pv'].includes(field)
    setFormData((prev) => ({
      ...prev,
      [field]: isNumeric ? parseInt(value) || 0 : value,
    }))
  }

  const handleSave = async (isTransaction: boolean = false) => {
    if (!formData.model || !formData.model.trim()) {
      setOverlay({
        title: 'VALIDATION ERROR',
        message: 'UNIT MODEL DESIGNATION REQUIRED.',
        variant: 'alert',
        onConfirm: () => setOverlay(null),
      })
      return
    }

    const cost = mode === 'create' ? purchasePrice : reconfigureCost

    if (isTransaction && cost > 0 && availableSP !== undefined && availableSP < cost) {
      setOverlay({
        title: 'INSUFFICIENT FUNDS',
        message: `COMMAND WARCHEST (${availableSP} SP) IS INSUFFICIENT FOR THIS ${mode === 'create' ? 'PROCUREMENT' : 'RECONFIGURATION'} (${cost} SP).`,
        variant: 'alert',
        onConfirm: () => setOverlay(null),
      })
      return
    }

    setIsSaving(true)
    try {
      const input: CombatUnitUpdateInput = {
        model: formData.model,
        type: formData.type,
        variant: formData.variant,
        techBase: formData.techBase,
        tonnage: formData.tonnage,
        asSize: formData.asSize,
        bv: formData.bv,
        pv: formData.pv,
        status: formData.status,
        detachmentId: detachmentId || null, // Use the prop detachmentId for new units
      }

      let savedUnit: CombatUnit | undefined

      if (mode === 'create') {
        const result = await addUnit({
          variables: {
            commandId,
            input,
          },
        })
        savedUnit = result.data?.addCombatUnit as CombatUnit | undefined
      } else if (mode === 'edit' && unit?.id) {
        const result = await updateUnit({
          variables: {
            id: unit.id,
            input,
          },
        })
        savedUnit = result.data?.updateCombatUnit as CombatUnit | undefined
      }

      if (savedUnit) {
        if (isTransaction && cost > 0) {
          try {
            await addLedgerEntry({
              variables: {
                commandId,
                detachmentId: detachmentId || formData.detachmentId || null,
                input: {
                  amount: -cost,
                  description:
                    mode === 'create'
                      ? `UNIT PURCHASE: ${formData.model} ${formData.variant}`.trim()
                      : `OMNIMECH RECONFIGURE: ${formData.model} ${formData.variant}`.trim(),
                } as any,
              },
            })
          } catch (ledgerErr) {
            console.error('Ledger entry failed for unit purchase:', ledgerErr)
          }
        }
        onSave(savedUnit)
      }
    } catch (err) {
      console.error(err)
      setOverlay({
        title: mode === 'create' ? 'PROCUREMENT ERROR' : 'UPDATE ERROR',
        message:
          mode === 'create'
            ? 'ASSET ACQUISITION FAILURE: UNABLE TO PROCURE UNIT.'
            : 'ASSET DATABASE UPDATE FAILED.',
        variant: 'alert',
        onConfirm: () => setOverlay(null),
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleImport = async () => {
    if (!importLink.trim()) {
      setOverlay({
        title: 'VALIDATION ERROR',
        message: 'LINK URL REQUIRED. PROVIDE EXTERNAL DATA SOURCE.',
        variant: 'alert',
        onConfirm: () => setOverlay(null),
      })
      return
    }

    setIsSaving(true)
    try {
      const result = await importAssets({
        variables: {
          commandId,
          detachmentId: detachmentId || null, // Use the prop detachmentId for imported units
          link: importLink,
        },
      })

      const importedUnits = result.data?.importCombatUnitsFromLink
      if (importedUnits && importedUnits.length > 0) {
        const imported = importedUnits[0]
        if (imported) {
          setFormData((prev) => ({
            ...prev,
            model: imported.model ?? prev.model,
            variant: imported.variant ?? prev.variant,
            type: (imported.type as CombatUnit['type']) ?? prev.type,
            techBase: (imported.techBase as CombatUnit['techBase']) ?? prev.techBase,
            tonnage: imported.tonnage ?? prev.tonnage,
            asSize: imported.asSize ?? prev.asSize,
            bv: imported.bv ?? prev.bv,
            pv: imported.pv ?? prev.pv,
          }))
        }
        setImportLink('')
      }
    } catch (err) {
      console.error(err)
      setOverlay({
        title: 'DATA SCRAPE FAILURE',
        message: 'LINK FORMAT NOT RECOGNIZED OR SITE UNREACHABLE.',
        variant: 'alert',
        onConfirm: () => setOverlay(null),
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <FloatingPortal>
      <FloatingOverlay
        className="terminal-overlay-backdrop theme-amber"
        lockScroll
        style={{
          zIndex: 10000,
          display: 'grid',
          placeItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.97)',
        }}
      >
        <FloatingFocusManager context={context}>
          <div
            className="mech-card-form terminal-overlay-panel"
            ref={refs.setFloating}
            {...getFloatingProps()}
            style={{
              zIndex: 10001,
              maxWidth: '900px',
              width: '95%',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <CombatUnitBackground />
            <header className="mech-card-header overlay-header">
              <h2
                className="terminal-text"
                style={{ margin: 0, display: 'flex', alignItems: 'center' }}
              >
                <span className="blink-fast" style={{ marginRight: '10px' }}>
                  ▶
                </span>
                {mode === 'create' ? 'UNIT PROCUREMENT' : 'UNIT RECORD'}
              </h2>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {((mode === 'create' && overridePrice === undefined) ||
                  (mode === 'edit' && reconfigureCost > 0)) && (
                  <button
                    type="button"
                    className="mode-btn theme-amber"
                    style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                    onClick={() =>
                      setPricingRule((prev) => (prev === 'Core' ? 'Alpha Strike' : 'Core'))
                    }
                    title="Switch between Core and Alpha Strike pricing rules"
                  >
                    {pricingRule === 'Core' ? 'RULESET: CORE' : 'RULESET: AS'}
                  </button>
                )}
                {mode === 'create' && detachmentId && (
                  <button
                    className={`mode-btn ${availableSP !== undefined && availableSP < purchasePrice ? 'theme-amber' : 'theme-blue'}`}
                    onClick={() => handleSave(true)}
                    disabled={isSaving}
                    style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                    title={
                      availableSP !== undefined && availableSP < purchasePrice
                        ? `INSUFFICIENT FUNDS: ${availableSP} SP AVAILABLE`
                        : `Purchase unit for ${purchasePrice} SP and record transaction`
                    }
                  >
                    {isSaving ? '>> PROCESSING...' : `$ PURCHASE: ${purchasePrice}`}
                  </button>
                )}
                {mode === 'edit' && reconfigureCost > 0 && (
                  <button
                    className={`mode-btn ${availableSP !== undefined && availableSP < reconfigureCost ? 'theme-amber' : 'theme-blue'}`}
                    onClick={() => handleSave(true)}
                    disabled={isSaving}
                    style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                    title={
                      availableSP !== undefined && availableSP < reconfigureCost
                        ? `INSUFFICIENT FUNDS: ${availableSP} SP AVAILABLE`
                        : `Reconfigure OmniMech for ${reconfigureCost} SP`
                    }
                  >
                    {isSaving ? '...' : `RECONFIGURE: ${reconfigureCost}`}
                  </button>
                )}
                <button
                  className="mode-btn theme-green"
                  onClick={() => handleSave(false)}
                  disabled={isSaving}
                  style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                  title="Confirm and save"
                >
                  {isSaving ? '>> PROCESSING...' : mode === 'create' ? '✓ PROCURE' : '✓ SAVE'}
                </button>
                <button
                  className="mode-btn theme-red"
                  onClick={onCancel}
                  disabled={isSaving}
                  style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                  title="Discard changes and return"
                >
                  ✕ DISCARD
                </button>
              </div>
            </header>

            <div
              style={{
                border: '1px solid var(--terminal-border)',
                margin: '0 10px 8px 10px',
                padding: '10px 15px',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
              }}
            >
              <div className="mech-card-body">
                {mode === 'create' && (
                  <div
                    className="mb-20 pb-15"
                    style={{ borderBottom: '1px dashed var(--accent-dim)' }}
                  >
                    <h3 className="zone-header" style={{ margin: '0 0 10px 0' }}>
                      IMPORT DATA SOURCE
                    </h3>
                    <div className="flex flex-gap-10" style={{ alignItems: 'top' }}>
                      <div
                        className="status-bar theme-amber flex-grow"
                        style={{ padding: '0 5px', display: 'flex', alignItems: 'center' }}
                      >
                        <input
                          id="import-link"
                          type="text"
                          className="table-input w-100"
                          style={{ border: 'none', width: '30em' }}
                          value={importLink}
                          onChange={(e) => setImportLink(e.target.value)}
                          placeholder="MASTER UNIT LIST LINK (MUL)..."
                          title="External data source URL"
                        />
                      </div>
                      <button
                        type="button"
                        className="mode-btn theme-green"
                        onClick={handleImport}
                        disabled={isSaving || !importLink.trim()}
                        style={{ padding: '2px 2px', fontSize: '0.7rem', height: '22px' }}
                      >
                        {isSaving ? 'SCRAPING...' : '✓ IMPORT'}
                      </button>
                    </div>

                    {/* <div class="flex-between mb-5" style="align-items: flex-start;">
                                            <div class="status-bar theme-amber" style="flex: 1 1 0%; margin-right: 10px; padding: 0px 5px; display: flex; align-items: center;">
                                                <div class="inline-edit cursor-pointer theme-amber" style="font-weight: bold; width: 100%; min-height: 1.2em; padding: 0px 2px;">
                                                    Flank
                                                </div>
                                            </div>
                                            <button class="mode-btn theme-amber sm-text mr-10" style="padding: 0px 5px; height: 18px; font-size: 0.6rem;">
                                                REROLL
                                            </button>
                                            <span class="restricted-text" style="font-size: 0.6rem;">
                                                #1
                                            </span>
                                        </div> */}

                    {/* <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button
                                    className="mode-btn theme-green"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                                    title="Confirm and save"
                                >
                                    {isSaving ? '>> PROCESSING...' : (mode === 'create' ? '✓ PROCURE' : '✓ SAVE')}
                                </button>
                                <button
                                    className="mode-btn theme-red"
                                    onClick={onCancel}
                                    disabled={isSaving}
                                    style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                                    title="Discard changes and return"
                                >
                                    ✕ DISCARD
                                </button>
                            </div> */}
                    <div className="restricted-text xs-text mt-5" style={{ opacity: 0.7 }}>
                      SUPPORTED SOURCES: Master Unit List (MUL), Mordel.net
                    </div>
                  </div>
                )}
                <h3 className="zone-header" style={{ margin: '0 0 5px 0' }}>
                  ASSET PARAMETERS
                </h3>
                <div className="flex-col flex-gap-5 mb-10">
                  <div className="input-group flex items-center mb-10">
                    <label
                      htmlFor="mech-model"
                      className="restricted-text sm-text"
                      style={{ minWidth: '160px' }}
                    >
                      MODEL
                    </label>
                    <div
                      className="status-bar theme-amber flex-grow"
                      style={{ padding: '0 5px', display: 'flex', alignItems: 'center' }}
                    >
                      <input
                        id="mech-model"
                        type="text"
                        className="table-input w-100"
                        style={{ border: 'none' }}
                        value={formData.model || ''}
                        onChange={(e) => handleInputChange('model', e.target.value)}
                        placeholder="UNIT MODEL DESIGNATION"
                        title="Unit chassis model"
                        maxLength={50}
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="input-group flex items-center mb-10">
                    <label
                      htmlFor="mech-variant"
                      className="restricted-text sm-text"
                      style={{ minWidth: '160px' }}
                    >
                      VARIANT
                    </label>
                    <div
                      className="status-bar theme-amber flex-grow"
                      style={{ padding: '0 5px', display: 'flex', alignItems: 'center' }}
                    >
                      <input
                        id="mech-variant"
                        type="text"
                        className="table-input w-100"
                        style={{ border: 'none' }}
                        value={formData.variant || ''}
                        onChange={(e) => handleInputChange('variant', e.target.value)}
                        placeholder="VARIANT CODE (E.G., SHD-2K)"
                        title="Unit variant designation"
                        maxLength={30}
                      />
                    </div>
                  </div>
                  <div className="flex flex-gap-10 mb-10">
                    <div className="input-group flex-col" style={{ flex: 1 }}>
                      <label htmlFor="mech-type" className="restricted-text sm-text">
                        TYPE
                      </label>
                      <div
                        className="status-bar theme-amber"
                        style={{ padding: '0 5px', display: 'flex', alignItems: 'center' }}
                      >
                        <select
                          id="mech-type"
                          className="table-input w-100"
                          style={{ border: 'none' }}
                          value={formData.type || ''}
                          onChange={(e) => handleInputChange('type', e.target.value)}
                          title="Unit classification"
                        >
                          {unitTypes.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="input-group flex-col" style={{ flex: 1 }}>
                      <label htmlFor="mech-tech" className="restricted-text sm-text">
                        TECH
                      </label>
                      <div
                        className="status-bar theme-amber"
                        style={{ padding: '0 5px', display: 'flex', alignItems: 'center' }}
                      >
                        <select
                          id="mech-tech"
                          className="table-input w-100"
                          style={{ border: 'none' }}
                          value={formData.techBase || ''}
                          onChange={(e) => handleInputChange('techBase', e.target.value)}
                          title="Technology base"
                        >
                          {techBases.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="input-group flex-col" style={{ flex: 1 }}>
                      <label htmlFor="mech-status" className="restricted-text sm-text">
                        STATUS
                      </label>
                      <div
                        className="status-bar theme-amber"
                        style={{ padding: '0 5px', display: 'flex', alignItems: 'center' }}
                      >
                        <select
                          id="mech-status"
                          className="table-input w-100"
                          style={{ border: 'none' }}
                          value={formData.status || ''}
                          onChange={(e) => handleInputChange('status', e.target.value)}
                          title="Operational status"
                        >
                          {unitStatuses.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="zone-header" style={{ margin: '0 0 5px 0' }}>
                  SPECIFICATIONS
                </h3>
                <div className="flex flex-gap-10 mb-10">
                  <div className="flex-col" style={{ flex: 1 }}>
                    <label
                      htmlFor="mech-tonnage"
                      className="restricted-text"
                      style={{
                        fontSize: '0.55rem',
                        opacity: 0.7,
                        marginBottom: '2px',
                        display: 'block',
                      }}
                    >
                      TONNAGE
                    </label>
                    <div className="status-bar theme-amber" style={{ padding: '0 5px' }}>
                      <input
                        id="mech-tonnage"
                        type="number"
                        className="table-input text-center"
                        style={{ border: 'none', width: '100%' }}
                        value={formData.tonnage || 0}
                        onChange={(e) => handleInputChange('tonnage', e.target.value)}
                        title="Unit tonnage"
                      />
                    </div>
                  </div>
                  <div className="flex-col" style={{ flex: 1 }}>
                    <label
                      htmlFor="mech-assize"
                      className="restricted-text"
                      style={{
                        fontSize: '0.55rem',
                        opacity: 0.7,
                        marginBottom: '2px',
                        display: 'block',
                      }}
                    >
                      AS SIZE
                    </label>
                    <div className="status-bar theme-amber" style={{ padding: '0 5px' }}>
                      <input
                        id="mech-assize"
                        type="number"
                        className="table-input text-center"
                        style={{ border: 'none', width: '100%' }}
                        value={formData.asSize || 0}
                        onChange={(e) => handleInputChange('asSize', e.target.value)}
                        title="Alpha Strike size"
                      />
                    </div>
                  </div>
                  <div className="flex-col" style={{ flex: 1 }}>
                    <label
                      htmlFor="mech-bv"
                      className="restricted-text"
                      style={{
                        fontSize: '0.55rem',
                        opacity: 0.7,
                        marginBottom: '2px',
                        display: 'block',
                      }}
                    >
                      BATTLE VALUE
                    </label>
                    <div className="status-bar theme-amber" style={{ padding: '0 5px' }}>
                      <input
                        id="mech-bv"
                        type="number"
                        className="table-input text-center"
                        style={{ border: 'none', width: '100%' }}
                        value={formData.bv || 0}
                        onChange={(e) => handleInputChange('bv', e.target.value)}
                        title="Battle value"
                      />
                    </div>
                  </div>
                  <div className="flex-col" style={{ flex: 1 }}>
                    <label
                      htmlFor="mech-pv"
                      className="restricted-text"
                      style={{
                        fontSize: '0.55rem',
                        opacity: 0.7,
                        marginBottom: '2px',
                        display: 'block',
                      }}
                    >
                      POINT VALUE
                    </label>
                    <div className="status-bar theme-amber" style={{ padding: '0 5px' }}>
                      <input
                        id="mech-pv"
                        type="number"
                        className="table-input text-center"
                        style={{ border: 'none', width: '100%' }}
                        value={formData.pv || 0}
                        onChange={(e) => handleInputChange('pv', e.target.value)}
                        title="Point value"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <footer
              className="mech-card-footer overlay-body"
              style={{
                marginTop: '5px',
                paddingTop: '5px',
                borderTop: '1px dashed var(--terminal-border)',
              }}
            >
              <span className="restricted-text" style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                {mode === 'create' ? 'NEW ASSET FILE' : 'EXISTING ASSET RECORD'}
              </span>
            </footer>
          </div>
        </FloatingFocusManager>
      </FloatingOverlay>

      {overlay && (
        <TerminalOverlay
          title={overlay.title}
          message={overlay.message}
          variant={overlay.variant}
          onConfirm={overlay.onConfirm}
          onCancel={() => setOverlay(null)}
          themeClass="theme-amber"
          showInputField={overlay.showInputField}
          inputPlaceholder={overlay.inputPlaceholder}
          inputInitialValue={overlay.inputInitialValue}
          inputType={overlay.inputType}
          inputLabel={overlay.inputLabel}
        >
          {overlay.children}
        </TerminalOverlay>
      )}

      <style>{`
                .theme-amber .cursor-pointer:hover { background-color: rgba(255, 176, 0, 0.15); box-shadow: 0 0 5px rgba(255, 176, 0, 0.1); }
                .theme-blue .cursor-pointer:hover { background-color: rgba(0, 191, 255, 0.15); box-shadow: 0 0 5px rgba(0, 191, 255, 0.1); }
                .theme-green .cursor-pointer:hover { background-color: rgba(51, 255, 51, 0.15); box-shadow: 0 0 5px rgba(51, 255, 51, 0.1); }
                .theme-red .cursor-pointer:hover { background-color: rgba(255, 51, 51, 0.15); box-shadow: 0 0 5px rgba(255, 51, 51, 0.1); }

                .status-bar:focus-within { 
                    background-color: rgba(255, 255, 255, 0.05); 
                    box-shadow: 0 0 8px rgba(255, 255, 255, 0.1); 
                }
                .theme-amber .status-bar:focus-within { border-color: var(--terminal-amber); box-shadow: 0 0 8px rgba(255, 176, 0, 0.3); }
                .theme-blue .status-bar:focus-within { border-color: var(--terminal-blue); box-shadow: 0 0 8px rgba(0, 191, 255, 0.3); }
                .theme-green .status-bar:focus-within { border-color: var(--terminal-green); box-shadow: 0 0 8px rgba(51, 255, 51, 0.3); }
                .theme-red .status-bar:focus-within { border-color: var(--terminal-red); box-shadow: 0 0 8px rgba(255, 51, 51, 0.3); }

                .status-bar input.table-input, .status-bar select.table-input, .status-bar textarea.table-input {
                    background: transparent !important;
                    color: inherit !important;
                    outline: none !important;
                    border: none !important;
                    box-shadow: none !important;
                }
            `}</style>
    </FloatingPortal>
  )
}
