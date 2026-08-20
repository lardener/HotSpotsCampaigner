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
import React, { useMemo, useState, useEffect } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { TerminalOverlay } from './TerminalOverlay'
import { Campaign, Contract, Detachment } from '../types/generated'
import { NumericInput } from '../types/helpers'
import {
  AddLedgerEntryDocument as ADD_LEDGER_ENTRY,
  GetCampaignMetadataDocument,
  GetCampaignMetadataQuery,
} from '../types/operations'
import { GET_DETACHMENT_CONTRACT_NEGOTIATIONS } from '../gql/operations/detachmentContract'
import { DetachmentContractNegotiation } from '../types/detachmentContract'
import {
  buildDetachmentNegotiationMap,
  parseMultiplier,
  parseNumericInput,
  isInputInvalid,
  resolveEffectiveContract,
  selectDetachmentNegotiationOverride,
} from '../util/contractUtils'

interface MonthlyExpensesEditorProps {
  campaignDetails: Campaign
  detachments: Detachment[]
  currentMonthIndex: number
  onClose: () => void
  onLedgerEntryAdded: () => void
}

interface DetachmentFormState {
  detachmentId: string
  detachmentName: string // Renamed from name for clarity
  mercenaryCommandId: string
  selectedContractId: string
  selectedLevel: number // For future use, currently fixed at 1
  chargeType: 'Monthly Pay & Expenses' | 'Transport' | 'Freeform Entry'
  amount: NumericInput
  description: string
  isSubmitting: boolean
  error: string | null
}

export const MonthlyExpensesEditor: React.FC<MonthlyExpensesEditorProps> = ({
  campaignDetails,
  detachments,
  currentMonthIndex, // Use currentMonthIndex
  onClose,
  onLedgerEntryAdded,
}) => {
  const [detachmentForms, setDetachmentForms] = useState<DetachmentFormState[]>([])
  const [addLedgerEntry] = useMutation(ADD_LEDGER_ENTRY)
  const [notices, setNotices] = useState<Record<string, string>>({})
  const { data: metadataQuery } = useQuery<GetCampaignMetadataQuery>(GetCampaignMetadataDocument, {
    skip: !campaignDetails.id,
  })
  const { data: negotiationData } = useQuery(GET_DETACHMENT_CONTRACT_NEGOTIATIONS, {
    variables: { campaignId: campaignDetails.id },
    fetchPolicy: 'cache-and-network',
    skip: !campaignDetails.id,
  })

  const resolvedSteps = useMemo(() => {
    const steps: Record<
      number,
      {
        payRate: string
        salvageRights: string
        supportRights: string
        transportation: string
        commandRights: string
      }
    > = {}
    metadataQuery?.publicCampaignMetadata?.resolvedSteps?.forEach((entry) => {
      if (entry?.step != null && entry.values) {
        steps[entry.step] = entry.values as {
          payRate: string
          salvageRights: string
          supportRights: string
          transportation: string
          commandRights: string
        }
      }
    })
    return steps
  }, [metadataQuery?.publicCampaignMetadata?.resolvedSteps])

  const negotiationsByDetachment = useMemo(
    () =>
      buildDetachmentNegotiationMap(
        ((negotiationData as any)?.getDetachmentContractNegotiations ??
          []) as DetachmentContractNegotiation[],
        campaignDetails,
      ),
    [negotiationData, campaignDetails],
  )

  const computedFormValues = useMemo(() => {
    return detachmentForms.reduce(
      (acc, form) => {
        if (form.chargeType === 'Freeform Entry') {
          acc[form.detachmentId] = {
            amount: form.amount,
            description: form.description,
          }
          return acc
        }

        const baseContract = campaignDetails.contracts
          ?.filter((c): c is Contract => c != null)
          .find((c) => c.id === form.selectedContractId)
        const effectiveContract = resolveEffectiveContract(
          baseContract,
          selectDetachmentNegotiationOverride(
            negotiationsByDetachment[form.detachmentId],
            baseContract,
          ),
          resolvedSteps,
        )
        const levelMult = form.selectedLevel
        let amount = 0
        let termsLabel = ''

        if (form.chargeType === 'Monthly Pay & Expenses') {
          const pRate = effectiveContract.payRate || 1.0
          const grossPay = (campaignDetails.monthlyPay || 0) * pRate
          const baseExpenses = campaignDetails.monthlyMaintenance || 0
          amount = Math.round((grossPay - baseExpenses) * levelMult)
          termsLabel = `PAY: ${Math.round(pRate * 100)}%`
        } else if (form.chargeType === 'Transport') {
          const tBase = (campaignDetails.transportationCost || 0) * levelMult
          const tMult = parseMultiplier(effectiveContract.transportTerms)
          amount = -Math.round(tBase * (1 - tMult))
          termsLabel = effectiveContract.transportTerms || 'NONE'
        }

        acc[form.detachmentId] = {
          amount,
          description: `${form.chargeType.toUpperCase()}: ${campaignDetails.name} (MO ${currentMonthIndex}) [LVL ${levelMult}] [TERMS: ${termsLabel}]`,
        }
        return acc
      },
      {} as Record<string, { amount: number | string; description: string }>,
    )
  }, [detachmentForms, campaignDetails, currentMonthIndex, negotiationsByDetachment, resolvedSteps])

  const addNotice = (key: string, msg: string) => {
    setNotices((prev) => ({ ...prev, [key]: msg }))
    setTimeout(() => {
      setNotices((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }, 5000)
  }

  const calculateFormDefaults = (
    chargeType: DetachmentFormState['chargeType'],
    level: number,
    contractId: string,
    detachmentId: string,
  ) => {
    const baseContract = campaignDetails.contracts
      ?.filter((c): c is Contract => c != null)
      .find((c) => c.id === contractId)
    const effectiveContract = resolveEffectiveContract(
      baseContract,
      selectDetachmentNegotiationOverride(negotiationsByDetachment[detachmentId], baseContract),
      resolvedSteps,
    )
    const levelMult = level
    let amount = 0
    let termsLabel = ''

    switch (chargeType) {
      case 'Monthly Pay & Expenses': {
        const pRate = effectiveContract.payRate || 1.0
        const grossPay = (campaignDetails.monthlyPay || 0) * pRate
        const baseExpenses = campaignDetails.monthlyMaintenance || 0
        amount = Math.round((grossPay - baseExpenses) * levelMult)
        termsLabel = `PAY: ${Math.round(pRate * 100)}%`
        break
      }
      case 'Transport': {
        const tBase = (campaignDetails.transportationCost || 0) * levelMult
        const tMult = parseMultiplier(effectiveContract.transportTerms)
        amount = -Math.round(tBase * (1 - tMult))
        termsLabel = effectiveContract.transportTerms || 'NONE'
        break
      }
      case 'Freeform Entry':
        return { amount: 0, description: '' }
    }

    const description = `${chargeType.toUpperCase()}: ${campaignDetails.name} (MO ${currentMonthIndex}) [LVL ${level}] [TERMS: ${termsLabel}]`
    return { amount, description }
  }

  useEffect(() => {
    setDetachmentForms((prevForms) => {
      // Create a lookup map of existing form states to preserve user input during prop refreshes
      const existingFormsMap = new Map(prevForms.map((f) => [f.detachmentId, f]))

      return detachments.map((det) => {
        // If we already have state for this detachment, keep it
        if (existingFormsMap.has(det.id)) {
          return existingFormsMap.get(det.id)!
        }

        // Otherwise, initialize a new form row with defaults
        const defaultContractId = campaignDetails.contracts?.[0]?.id || ''
        const { amount, description } = calculateFormDefaults(
          'Monthly Pay & Expenses',
          1,
          defaultContractId,
          det.id,
        )
        return {
          detachmentId: det.id,
          detachmentName: det.name || '',
          mercenaryCommandId: det.mercenaryCommandId || '',
          selectedContractId: defaultContractId,
          selectedLevel: 1,
          chargeType: 'Monthly Pay & Expenses',
          amount,
          description,
          isSubmitting: false,
          error: null,
        }
      })
    })
  }, [detachments, campaignDetails, currentMonthIndex, calculateFormDefaults])

  const handleFormChange = (detachmentId: string, field: keyof DetachmentFormState, value: any) => {
    setDetachmentForms((prevForms) =>
      prevForms.map((form) => {
        if (form.detachmentId !== detachmentId) return form

        const updatedForm = { ...form, [field]: value }
        if (['chargeType', 'selectedContractId', 'selectedLevel'].includes(field)) {
          if (updatedForm.chargeType === 'Freeform Entry') {
            return updatedForm
          }

          const computed = calculateFormDefaults(
            updatedForm.chargeType,
            updatedForm.selectedLevel,
            updatedForm.selectedContractId,
            detachmentId,
          )
          return {
            ...updatedForm,
            amount: computed.amount,
            description: computed.description,
          }
        }

        return updatedForm
      }),
    )
  }

  const handleCommit = async (detachmentId: string) => {
    const form = detachmentForms.find((f) => f.detachmentId === detachmentId)
    if (!form || !form.mercenaryCommandId) return

    setDetachmentForms((prevForms) =>
      prevForms.map((f) =>
        f.detachmentId === detachmentId ? { ...f, isSubmitting: true, error: null } : f,
      ),
    )

    const computed = computedFormValues[detachmentId]
    const amountToCommit =
      form.chargeType === 'Freeform Entry'
        ? parseNumericInput(form.amount)
        : parseNumericInput(computed?.amount)
    const descriptionToCommit =
      form.chargeType === 'Freeform Entry'
        ? form.description
        : computed?.description || form.description

    try {
      await addLedgerEntry({
        variables: {
          commandId: form.mercenaryCommandId, // Use detachment's commandId
          detachmentId: form.detachmentId,
          input: {
            amount: amountToCommit,
            description: descriptionToCommit,
            campaignId: campaignDetails.id,
            campaignName: campaignDetails.name,
            monthIndex: currentMonthIndex,
          } as any,
        },
      })
      onLedgerEntryAdded()
      addNotice(form.detachmentId, `✓ COMMITTED: ${form.amount} SP`)
      setDetachmentForms((prevForms) =>
        prevForms.map((f) =>
          f.detachmentId === detachmentId
            ? { ...f, isSubmitting: false, error: null, amount: 0, description: '' }
            : f,
        ),
      )
    } catch (err: any) {
      console.error('Error committing ledger entry:', err)
      setDetachmentForms((prevForms) =>
        prevForms.map((f) =>
          f.detachmentId === detachmentId
            ? { ...f, isSubmitting: false, error: err.message || 'Failed to commit entry.' }
            : f,
        ),
      )
    }
  }

  const CHARGE_TYPES = ['Monthly Pay & Expenses', 'Transport', 'Freeform Entry']

  return (
    <TerminalOverlay
      title={`MONTHLY EXPENSES: ${campaignDetails.name}`}
      message="RECORD FINANCIAL TRANSACTIONS FOR DEPLOYED DETACHMENTS."
      confirmLabel="CLOSE"
      onConfirm={onClose}
      themeClass="theme-blue"
    >
      <div
        className="ledger-entry-table"
        style={{ marginTop: '20px', maxHeight: '60vh', overflowY: 'auto' }}
      >
        <table className="tactical-table">
          <thead>
            <tr>
              <th style={{ width: '15%' }}>DETACHMENT</th>
              <th style={{ width: '15%' }}>CONTRACT</th>
              <th style={{ width: '8%' }}>LEVEL</th>
              <th style={{ width: '18%' }}>CHARGE TYPE</th>
              <th className="text-right" style={{ width: '10%' }}>
                AMOUNT (SP)
              </th>
              <th style={{ width: '24%' }}>DESCRIPTION</th>
              <th style={{ width: '10%' }}></th>
            </tr>
          </thead>
          <tbody>
            {detachmentForms.map((form) => (
              <tr key={form.detachmentId}>
                <td>{form.detachmentName}</td>
                <td>
                  <div
                    className="status-bar theme-blue cursor-pointer"
                    style={{ padding: '0 5px' }}
                  >
                    <select
                      className="table-input"
                      style={{ border: 'none' }}
                      value={form.selectedContractId}
                      onChange={(e) =>
                        handleFormChange(form.detachmentId, 'selectedContractId', e.target.value)
                      }
                      title="Select contract terms"
                    >
                      {campaignDetails.contracts?.length === 0 && (
                        <option value="">NO CONTRACTS</option>
                      )}
                      {campaignDetails.contracts
                        ?.filter((c): c is NonNullable<typeof c> => c != null && c.id != null)
                        .map((contract) => (
                          <option key={contract.id ?? ''} value={contract.id ?? ''}>
                            {contract.primaryContract ? 'PRIMARY' : 'OPPOSITION'} (
                            {contract.employerCategory || 'N/A'})
                          </option>
                        ))}
                    </select>
                  </div>
                </td>
                <td>
                  <div className="status-bar theme-blue" style={{ padding: '0 5px' }}>
                    <select
                      className="table-input"
                      style={{ border: 'none' }}
                      value={form.selectedLevel}
                      onChange={(e) =>
                        handleFormChange(
                          form.detachmentId,
                          'selectedLevel',
                          parseInt(e.target.value),
                        )
                      }
                      title="Select level"
                    >
                      {[1, 2, 3].map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
                <td>
                  <div className="status-bar theme-blue" style={{ padding: '0 5px' }}>
                    <select
                      className="table-input"
                      style={{ border: 'none' }}
                      value={form.chargeType}
                      onChange={(e) =>
                        handleFormChange(
                          form.detachmentId,
                          'chargeType',
                          e.target.value as DetachmentFormState['chargeType'],
                        )
                      }
                      title="Select charge type"
                    >
                      {CHARGE_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
                <td>
                  <div
                    className={`status-bar theme-blue ${isInputInvalid(form.amount) ? 'invalid' : ''}`}
                    style={{ padding: '0 5px' }}
                  >
                    <input
                      type="number"
                      className="table-input text-right"
                      style={{ border: 'none' }}
                      value={
                        form.chargeType === 'Freeform Entry'
                          ? form.amount
                          : (computedFormValues[form.detachmentId]?.amount ?? form.amount)
                      }
                      onChange={(e) =>
                        handleFormChange(form.detachmentId, 'amount', e.target.value)
                      }
                      title="Amount in Support Points"
                      readOnly={form.chargeType !== 'Freeform Entry'}
                    />
                  </div>
                </td>
                <td>
                  <div className="status-bar theme-blue" style={{ padding: '0 5px' }}>
                    <input
                      type="text"
                      className="table-input"
                      style={{ border: 'none' }}
                      value={
                        form.chargeType === 'Freeform Entry'
                          ? form.description
                          : (computedFormValues[form.detachmentId]?.description ?? form.description)
                      }
                      onChange={(e) =>
                        handleFormChange(form.detachmentId, 'description', e.target.value)
                      }
                      placeholder="Custom description"
                      title="Transaction description"
                      disabled={form.chargeType !== 'Freeform Entry'}
                    />
                  </div>
                </td>
                <td className="text-center">
                  {notices[form.detachmentId] && (
                    <div
                      className="restricted-text theme-green xs-text blink-slow mb-5"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {notices[form.detachmentId]}
                    </div>
                  )}
                  <button
                    className="mode-btn"
                    onClick={() => handleCommit(form.detachmentId)}
                    disabled={
                      form.isSubmitting ||
                      !form.description.trim() ||
                      isInputInvalid(form.amount) ||
                      form.amount === '' ||
                      form.amount === '-'
                    }
                    title="Commit transaction"
                  >
                    {form.isSubmitting ? '...' : 'COMMIT'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {detachmentForms.some((f) => f.error) && (
          <div className="error-message mt-10">
            {detachmentForms.map(
              (f) =>
                f.error && (
                  <p key={f.detachmentId}>
                    {f.detachmentName}: {f.error}
                  </p>
                ),
            )}
          </div>
        )}
      </div>
      <style>{`
                /* Custom Scrollbar Styles for Monthly Expenses (Blue Theme) */
                .ledger-entry-table::-webkit-scrollbar { width: 8px; }
                .ledger-entry-table::-webkit-scrollbar-track { 
                    background: var(--terminal-bg, #050705);
                    border-radius: 10px;
                }
                .ledger-entry-table::-webkit-scrollbar-thumb {
                    background-color: var(--terminal-blue);
                    border-radius: 10px;
                    border: 2px solid var(--terminal-bg, #050705);
                }
                .ledger-entry-table {
                    scrollbar-width: thin;
                    scrollbar-color: var(--terminal-blue) var(--terminal-bg, #050705);
                }

                .xs-text { font-size: 0.65rem; }
                .theme-green { color: var(--terminal-green); }
            `}</style>
    </TerminalOverlay>
  )
}
