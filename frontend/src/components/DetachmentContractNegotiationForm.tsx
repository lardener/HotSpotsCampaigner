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
import { gql } from '@apollo/client'
import {
  GET_DETACHMENT_CONTRACT_NEGOTIATIONS,
  NEGOTIATE_DETACHMENT_CONTRACT,
} from '../gql/operations/detachmentContract'
import { GetCampaignMetadataDocument, GetCampaignMetadataQuery } from '../types/operations'
import {
  DetachmentContractNegotiation,
  NegotiateContractInput,
  STEP_ADJUSTMENT_OPTIONS,
} from '../types/detachmentContract'
import { resolveStepValueWithGravity, ResolvedStepValues } from '../util/contractUtils'
import { ContractNegotiationBackground } from './ContractNegotiationBackground'

interface Props {
  campaignId: string
  detachmentId: string
  employerFactionId: string
  employerFactionName: string
  baselinePayStep?: number
  baselineSalvageStep?: number
  baselineSupportStep?: number
  baselineTransportStep?: number
  baselineCommandStep?: number
  opponentFactionId?: string
  opponentFactionName?: string
  opponentPayStep?: number
  opponentSalvageStep?: number
  opponentSupportStep?: number
  opponentTransportStep?: number
  opponentCommandStep?: number
  onNegotiationSaved?: () => void
  registerSave?: (fn: () => Promise<void>) => void
  onNegotiationStatusChange?: (hasNegotiation: boolean) => void
}

export const DetachmentContractNegotiationForm: React.FC<Props> = ({
  campaignId,
  detachmentId,
  employerFactionId,
  employerFactionName,
  baselinePayStep = 5,
  baselineSalvageStep = 3,
  baselineSupportStep = 4,
  baselineTransportStep = 2,
  baselineCommandStep = 1,
  opponentFactionId,
  opponentFactionName,
  opponentPayStep = 5,
  opponentSalvageStep = 3,
  opponentSupportStep = 4,
  opponentTransportStep = 2,
  opponentCommandStep = 1,
  onNegotiationSaved,
  registerSave,
  onNegotiationStatusChange,
}) => {
  // Primary contract state
  const [payStepAdj, setPayStepAdj] = useState<number | null>(null)
  const [salvageStepAdj, setSalvageStepAdj] = useState<number | null>(null)
  const [supportStepAdj, setSupportStepAdj] = useState<number | null>(null)
  const [transportStepAdj, setTransportStepAdj] = useState<number | null>(null)
  const [commandStepAdj, setCommandStepAdj] = useState<number | null>(null)

  // Opposition contract state
  const [oppPayStepAdj, setOppPayStepAdj] = useState<number | null>(null)
  const [oppSalvageStepAdj, setOppSalvageStepAdj] = useState<number | null>(null)
  const [oppSupportStepAdj, setOppSupportStepAdj] = useState<number | null>(null)
  const [oppTransportStepAdj, setOppTransportStepAdj] = useState<number | null>(null)
  const [oppCommandStepAdj, setOppCommandStepAdj] = useState<number | null>(null)

  // Load campaign metadata for resolving steps
  const { data: metadataData } = useQuery<GetCampaignMetadataQuery>(GetCampaignMetadataDocument)

  const resolvedSteps = useMemo(() => {
    const steps: Record<number, ResolvedStepValues> = {}
    if (metadataData?.publicCampaignMetadata?.resolvedSteps) {
      metadataData.publicCampaignMetadata.resolvedSteps.forEach((entry) => {
        if (entry && entry.step != null && entry.values) {
          steps[entry.step] = entry.values as ResolvedStepValues
        }
      })
    }
    return steps
  }, [metadataData])

  // Load existing negotiation
  const { data: existingData, refetch } = useQuery(GET_DETACHMENT_CONTRACT_NEGOTIATIONS, {
    variables: { campaignId },
    fetchPolicy: 'cache-and-network',
    skip: !campaignId || !employerFactionId,
  })

  const [negotiateContract] = useMutation(NEGOTIATE_DETACHMENT_CONTRACT)

  // Find existing negotiation for this detachment + employer
  const existingNegotiation = (existingData as any)?.getDetachmentContractNegotiations?.find(
    (n: DetachmentContractNegotiation) =>
      n.detachmentId === detachmentId && n.employerFactionId === employerFactionId,
  )

  // Find existing opposition negotiation
  const existingOppNegotiation = (existingData as any)?.getDetachmentContractNegotiations?.find(
    (n: DetachmentContractNegotiation) =>
      n.detachmentId === detachmentId && n.employerFactionId === opponentFactionId,
  )

  // Notify parent of negotiation existence
  useEffect(() => {
    onNegotiationStatusChange?.(!!(existingNegotiation || existingOppNegotiation))
  }, [existingNegotiation, existingOppNegotiation, onNegotiationStatusChange])

  // Populate primary form with existing values
  useEffect(() => {
    if (existingNegotiation) {
      setPayStepAdj(existingNegotiation.payStepAdjustment)
      setSalvageStepAdj(existingNegotiation.salvageStepAdjustment)
      setSupportStepAdj(existingNegotiation.supportStepAdjustment)
      setTransportStepAdj(existingNegotiation.transportStepAdjustment)
      setCommandStepAdj(existingNegotiation.commandStepAdjustment)
    }
  }, [existingNegotiation])

  // Populate opposition form with existing values
  useEffect(() => {
    if (existingOppNegotiation) {
      setOppPayStepAdj(existingOppNegotiation.payStepAdjustment)
      setOppSalvageStepAdj(existingOppNegotiation.salvageStepAdjustment)
      setOppSupportStepAdj(existingOppNegotiation.supportStepAdjustment)
      setOppTransportStepAdj(existingOppNegotiation.transportStepAdjustment)
      setOppCommandStepAdj(existingOppNegotiation.commandStepAdjustment)
    }
  }, [existingOppNegotiation])

  const calculateFinalStep = (baseline: number, adjustment: number | null) => {
    const adj = adjustment ?? 0
    return Math.max(1, Math.min(17, baseline + adj))
  }

  // Calculate resulting contract terms
  const finalPayStep = calculateFinalStep(baselinePayStep, payStepAdj)
  const finalSalvageStep = calculateFinalStep(baselineSalvageStep, salvageStepAdj)
  const finalSupportStep = calculateFinalStep(baselineSupportStep, supportStepAdj)
  const finalTransportStep = calculateFinalStep(baselineTransportStep, transportStepAdj)
  const finalCommandStep = calculateFinalStep(baselineCommandStep, commandStepAdj)

  const getResolvedValue = (step: number, field: keyof ResolvedStepValues) => {
    return resolveStepValueWithGravity(step, field, resolvedSteps)
  }

  const resultingPayRateText = getResolvedValue(finalPayStep, 'payRate')
  const resultingSalvageText = getResolvedValue(finalSalvageStep, 'salvageRights')
  const resultingSupportText = getResolvedValue(finalSupportStep, 'supportRights')
  const resultingTransportText = getResolvedValue(finalTransportStep, 'transportation')
  const resultingCommandText = getResolvedValue(finalCommandStep, 'commandRights')

  const handleOppSave = async () => {
    // Validate required fields - check for both null/undefined AND empty strings
    if (!opponentFactionId || opponentFactionId.trim() === '' || !campaignId || !detachmentId) {
      const errorMessage = 'Opposition faction ID required for opposition negotiation'
      setSaveError(errorMessage)
      console.error('Cannot save opposition negotiation - required fields missing:', {
        opponentFactionId,
        campaignId,
        detachmentId,
      })
      throw new Error(errorMessage)
    }

    const input: NegotiateContractInput = {
      campaignId,
      detachmentId,
      employerFactionId: opponentFactionId,
      payStepAdjustment: oppPayStepAdj,
      salvageStepAdjustment: oppSalvageStepAdj,
      supportStepAdjustment: oppSupportStepAdj,
      transportStepAdjustment: oppTransportStepAdj,
      commandStepAdjustment: oppCommandStepAdj,
      negotiatedPayStep: oppPayStepAdj !== null ? oppFinalPayStep : null,
      negotiatedSalvageStep: oppSalvageStepAdj !== null ? oppFinalSalvageStep : null,
      negotiatedSupportStep: oppSupportStepAdj !== null ? oppFinalSupportStep : null,
      negotiatedTransportStep: oppTransportStepAdj !== null ? oppFinalTransportStep : null,
      negotiatedCommandStep: oppCommandStepAdj !== null ? oppFinalCommandStep : null,
      resultingPayTerms: oppResultingPayRateText,
      resultingSalvageTerms: oppResultingSalvageText,
      resultingSupportTerms: oppResultingSupportText,
      resultingTransportTerms: oppResultingTransportText,
      resultingCommandRights: oppResultingCommandText,
    }

    try {
      await negotiateContract({
        variables: { input },
        update: (cache, { data: mutationData }) => {
          const mutationResult = mutationData as any
          if (mutationResult?.negotiateDetachmentContract) {
            cache.modify({
              fields: {
                getDetachmentContractNegotiations(existing = []) {
                  const newNegotiationRef = cache.writeFragment({
                    data: mutationResult.negotiateDetachmentContract,
                    fragment: gql`
                      fragment NewNegotiation on DetachmentContractNegotiation {
                        id
                        campaignId
                        detachmentId
                        employerFactionId
                        payStepAdjustment
                        salvageStepAdjustment
                        supportStepAdjustment
                        transportStepAdjustment
                        commandStepAdjustment
                        negotiatedPayStep
                        negotiatedSalvageStep
                        negotiatedSupportStep
                        negotiatedTransportStep
                        negotiatedCommandStep
                        resultingPayTerms
                        resultingSalvageTerms
                        resultingSupportTerms
                        resultingTransportTerms
                        resultingCommandRights
                      }
                    `,
                  })
                  return [...existing, newNegotiationRef]
                },
              },
            })
          }
        },
      })
      onNegotiationSaved?.()
      refetch()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to save opposition negotiation'
      setSaveError(errorMessage)
      console.error('Failed to save opposition negotiation:', error)
      throw error
    }
  }

  const hasActiveOverrides =
    payStepAdj !== null ||
    salvageStepAdj !== null ||
    supportStepAdj !== null ||
    transportStepAdj !== null ||
    commandStepAdj !== null

  const [saveError, setSaveError] = useState<string | null>(null)

  const handleSave = async () => {
    setSaveError(null)

    // Validate required fields before sending
    if (!employerFactionId || !campaignId || !detachmentId) {
      const errorMessage = 'Required fields missing: employerFactionId, campaignId, or detachmentId'
      setSaveError(errorMessage)
      console.error('Cannot save negotiation - required fields missing:', {
        employerFactionId,
        campaignId,
        detachmentId,
      })
      throw new Error(errorMessage)
    }

    try {
      const input: NegotiateContractInput = {
        campaignId,
        detachmentId,
        employerFactionId,
        payStepAdjustment: payStepAdj,
        salvageStepAdjustment: salvageStepAdj,
        supportStepAdjustment: supportStepAdj,
        transportStepAdjustment: transportStepAdj,
        commandStepAdjustment: commandStepAdj,
        negotiatedPayStep: payStepAdj !== null ? finalPayStep : null,
        negotiatedSalvageStep: salvageStepAdj !== null ? finalSalvageStep : null,
        negotiatedSupportStep: supportStepAdj !== null ? finalSupportStep : null,
        negotiatedTransportStep: transportStepAdj !== null ? finalTransportStep : null,
        negotiatedCommandStep: commandStepAdj !== null ? finalCommandStep : null,
        resultingPayTerms: resultingPayRateText,
        resultingSalvageTerms: resultingSalvageText,
        resultingSupportTerms: resultingSupportText,
        resultingTransportTerms: resultingTransportText,
        resultingCommandRights: resultingCommandText,
      }

      await negotiateContract({
        variables: { input },
        update: (cache, { data: mutationData }) => {
          const mutationResult = mutationData as any
          if (mutationResult?.negotiateDetachmentContract) {
            cache.modify({
              fields: {
                getDetachmentContractNegotiations(existing = []) {
                  const newNegotiationRef = cache.writeFragment({
                    data: mutationResult.negotiateDetachmentContract,
                    fragment: gql`
                      fragment NewNegotiation on DetachmentContractNegotiation {
                        id
                        campaignId
                        detachmentId
                        employerFactionId
                        payStepAdjustment
                        salvageStepAdjustment
                        supportStepAdjustment
                        transportStepAdjustment
                        commandStepAdjustment
                        negotiatedPayStep
                        negotiatedSalvageStep
                        negotiatedSupportStep
                        negotiatedTransportStep
                        negotiatedCommandStep
                        resultingPayTerms
                        resultingSalvageTerms
                        resultingSupportTerms
                        resultingTransportTerms
                        resultingCommandRights
                      }
                    `,
                  })
                  return [...existing, newNegotiationRef]
                },
              },
            })
          }
        },
      })
      onNegotiationSaved?.()
      refetch()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save negotiation'
      setSaveError(errorMessage)
      console.error('Failed to save negotiation:', error)
      throw error
    }
  }

  const calculateOppFinalStep = (baseline: number, adjustment: number | null) => {
    const adj = adjustment ?? 0
    return Math.max(1, Math.min(17, baseline + adj))
  }

  const oppFinalPayStep = calculateOppFinalStep(opponentPayStep ?? 5, oppPayStepAdj)
  const oppFinalSalvageStep = calculateOppFinalStep(opponentSalvageStep ?? 3, oppSalvageStepAdj)
  const oppFinalSupportStep = calculateOppFinalStep(opponentSupportStep ?? 4, oppSupportStepAdj)
  const oppFinalTransportStep = calculateOppFinalStep(
    opponentTransportStep ?? 2,
    oppTransportStepAdj,
  )
  const oppFinalCommandStep = calculateOppFinalStep(opponentCommandStep ?? 1, oppCommandStepAdj)

  const oppResultingPayRateText = getResolvedValue(oppFinalPayStep, 'payRate')
  const oppResultingSalvageText = getResolvedValue(oppFinalSalvageStep, 'salvageRights')
  const oppResultingSupportText = getResolvedValue(oppFinalSupportStep, 'supportRights')
  const oppResultingTransportText = getResolvedValue(oppFinalTransportStep, 'transportation')
  const oppResultingCommandText = getResolvedValue(oppFinalCommandStep, 'commandRights')

  const handleSaveAll = async () => {
    setSaveError(null)
    let saveErrors = 0

    if (hasActiveOverrides) {
      try {
        await handleSave()
      } catch (error) {
        console.error('Failed to save primary negotiation:', error)
        saveErrors++
      }
    }

    if (
      opponentFactionId &&
      (oppPayStepAdj !== null ||
        oppSalvageStepAdj !== null ||
        oppSupportStepAdj !== null ||
        oppTransportStepAdj !== null ||
        oppCommandStepAdj !== null)
    ) {
      try {
        await handleOppSave()
      } catch (error) {
        console.error('Failed to save opposition negotiation:', error)
        saveErrors++
      }
    }

    if (saveErrors > 0) {
      throw new Error('Failed to save negotiations')
    }
  }

  // Register combined save handler with parent (so parent overlay can invoke it)
  useEffect(() => {
    if (registerSave) {
      try {
        registerSave(handleSaveAll)
      } catch (err) {
        // ignore registration errors
      }
    }
  }, [registerSave, handleSaveAll])

  return (
    <section
      className="dashboard-section generator-panel"
      style={{ position: 'relative', overflow: 'hidden' }}
      data-has-negotiation={!!(existingNegotiation || existingOppNegotiation)}
    >
      <ContractNegotiationBackground />

      <h3 className="section-title" style={{ color: '#33ff33' }}>
        DETACHMENT CONTRACT NEGOTIATIONS
      </h3>
      <p className="restricted-text">PRIMARY EMPLOYER: {employerFactionName.toUpperCase()}</p>

      {/* Primary Contract Panel */}
      <div style={{ maxHeight: '50vh', overflowY: 'auto', paddingRight: '10px' }}>
        <div
          className="summary-item"
          style={{ marginTop: '20px', border: '1px solid #33ff33', padding: '15px' }}
        >
          <div className="restricted-text mb-10">STEP ADJUSTMENTS & RESULTING CLAUSES</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label className="restricted-text sm-text block-label">PAY STEP</label>
              <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '4px' }}>
                Baseline: Step {baselinePayStep} ({getResolvedValue(baselinePayStep, 'payRate')})
              </div>
              <div className="status-bar theme-green cursor-pointer" style={{ padding: '0 5px' }}>
                <select
                  className="table-input w-100"
                  style={{ border: 'none', background: 'transparent' }}
                  value={payStepAdj ?? ''}
                  onChange={(e) =>
                    setPayStepAdj(e.target.value === '' ? null : parseInt(e.target.value))
                  }
                  title="Pay Step Adjustment"
                >
                  <option value="">Use Baseline (Step {baselinePayStep})</option>
                  {STEP_ADJUSTMENT_OPTIONS.map((opt) => {
                    const stepNum = calculateFinalStep(baselinePayStep, opt)
                    const valText = getResolvedValue(stepNum, 'payRate')
                    return (
                      <option key={opt} value={opt}>
                        {opt > 0 ? `+${opt}` : opt} (Step {stepNum}: {valText})
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="restricted-text sm-text block-label">SALVAGE STEP</label>
              <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '4px' }}>
                Baseline: Step {baselineSalvageStep} (
                {getResolvedValue(baselineSalvageStep, 'salvageRights')})
              </div>
              <div className="status-bar theme-green cursor-pointer" style={{ padding: '0 5px' }}>
                <select
                  className="table-input w-100"
                  style={{ border: 'none', background: 'transparent' }}
                  value={salvageStepAdj ?? ''}
                  onChange={(e) =>
                    setSalvageStepAdj(e.target.value === '' ? null : parseInt(e.target.value))
                  }
                  title="Salvage Step Adjustment"
                >
                  <option value="">Use Baseline (Step {baselineSalvageStep})</option>
                  {STEP_ADJUSTMENT_OPTIONS.map((opt) => {
                    const stepNum = calculateFinalStep(baselineSalvageStep, opt)
                    const valText = getResolvedValue(stepNum, 'salvageRights')
                    return (
                      <option key={opt} value={opt}>
                        {opt > 0 ? `+${opt}` : opt} (Step {stepNum}: {valText})
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="restricted-text sm-text block-label">SUPPORT STEP</label>
              <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '4px' }}>
                Baseline: Step {baselineSupportStep} (
                {getResolvedValue(baselineSupportStep, 'supportRights')})
              </div>
              <div className="status-bar theme-green cursor-pointer" style={{ padding: '0 5px' }}>
                <select
                  className="table-input w-100"
                  style={{ border: 'none', background: 'transparent' }}
                  value={supportStepAdj ?? ''}
                  onChange={(e) =>
                    setSupportStepAdj(e.target.value === '' ? null : parseInt(e.target.value))
                  }
                  title="Support Step Adjustment"
                >
                  <option value="">Use Baseline (Step {baselineSupportStep})</option>
                  {STEP_ADJUSTMENT_OPTIONS.map((opt) => {
                    const stepNum = calculateFinalStep(baselineSupportStep, opt)
                    const valText = getResolvedValue(stepNum, 'supportRights')
                    return (
                      <option key={opt} value={opt}>
                        {opt > 0 ? `+${opt}` : opt} (Step {stepNum}: {valText})
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="restricted-text sm-text block-label">TRANSPORT STEP</label>
              <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '4px' }}>
                Baseline: Step {baselineTransportStep} (
                {getResolvedValue(baselineTransportStep, 'transportation')})
              </div>
              <div className="status-bar theme-green cursor-pointer" style={{ padding: '0 5px' }}>
                <select
                  className="table-input w-100"
                  style={{ border: 'none', background: 'transparent' }}
                  value={transportStepAdj ?? ''}
                  onChange={(e) =>
                    setTransportStepAdj(e.target.value === '' ? null : parseInt(e.target.value))
                  }
                  title="Transport Step Adjustment"
                >
                  <option value="">Use Baseline (Step {baselineTransportStep})</option>
                  {STEP_ADJUSTMENT_OPTIONS.map((opt) => {
                    const stepNum = calculateFinalStep(baselineTransportStep, opt)
                    const valText = getResolvedValue(stepNum, 'transportation')
                    return (
                      <option key={opt} value={opt}>
                        {opt > 0 ? `+${opt}` : opt} (Step {stepNum}: {valText})
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="restricted-text sm-text block-label">COMMAND STEP</label>
              <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '4px' }}>
                Baseline: Step {baselineCommandStep} (
                {getResolvedValue(baselineCommandStep, 'commandRights')})
              </div>
              <div className="status-bar theme-green cursor-pointer" style={{ padding: '0 5px' }}>
                <select
                  className="table-input w-100"
                  style={{ border: 'none', background: 'transparent' }}
                  value={commandStepAdj ?? ''}
                  onChange={(e) =>
                    setCommandStepAdj(e.target.value === '' ? null : parseInt(e.target.value))
                  }
                  title="Command Step Adjustment"
                >
                  <option value="">Use Baseline (Step {baselineCommandStep})</option>
                  {STEP_ADJUSTMENT_OPTIONS.map((opt) => {
                    const stepNum = calculateFinalStep(baselineCommandStep, opt)
                    const valText = getResolvedValue(stepNum, 'commandRights')
                    return (
                      <option key={opt} value={opt}>
                        {opt > 0 ? `+${opt}` : opt} (Step {stepNum}: {valText})
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Opposition Contract Panel */}
      <div
        style={{
          marginTop: '30px',
          borderTop: '2px solid #ff3333',
          paddingTop: '20px',
          paddingRight: '10px',
        }}
      >
        <h3 className="section-title" style={{ color: '#ff3333' }}>
          OPPOSITION CONTRACT NEGOTIATIONS
        </h3>
        {opponentFactionName && (
          <p className="restricted-text">
            OPPOSITION EMPLOYER: {opponentFactionName.toUpperCase()}
          </p>
        )}
        <div className="proposal-view" style={{ marginTop: '20px' }}>
          <div
            className="summary-item"
            style={{ marginBottom: '20px', border: '1px solid #ff3333', padding: '15px' }}
          >
            <div className="restricted-text mb-10">STEP ADJUSTMENTS & RESULTING CLAUSES</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label className="restricted-text sm-text block-label">PAY STEP</label>
                <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '4px' }}>
                  Baseline: Step {opponentPayStep} ({getResolvedValue(opponentPayStep, 'payRate')})
                </div>
                <div className="status-bar theme-red cursor-pointer" style={{ padding: '0 5px' }}>
                  <select
                    className="table-input w-100"
                    style={{ border: 'none', background: 'transparent' }}
                    value={oppPayStepAdj ?? ''}
                    onChange={(e) =>
                      setOppPayStepAdj(e.target.value === '' ? null : parseInt(e.target.value))
                    }
                    title="Opposition Pay Step Adjustment"
                  >
                    <option value="">Use Baseline (Step {opponentPayStep})</option>
                    {STEP_ADJUSTMENT_OPTIONS.map((opt) => {
                      const stepNum = calculateOppFinalStep(opponentPayStep, opt)
                      const valText = getResolvedValue(stepNum, 'payRate')
                      return (
                        <option key={opt} value={opt}>
                          {opt > 0 ? `+${opt}` : opt} (Step {stepNum}: {valText})
                        </option>
                      )
                    })}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="restricted-text sm-text block-label">SALVAGE STEP</label>
                <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '4px' }}>
                  Baseline: Step {opponentSalvageStep} (
                  {getResolvedValue(opponentSalvageStep, 'salvageRights')})
                </div>
                <div className="status-bar theme-red cursor-pointer" style={{ padding: '0 5px' }}>
                  <select
                    className="table-input w-100"
                    style={{ border: 'none', background: 'transparent' }}
                    value={oppSalvageStepAdj ?? ''}
                    onChange={(e) =>
                      setOppSalvageStepAdj(e.target.value === '' ? null : parseInt(e.target.value))
                    }
                    title="Opposition Salvage Step Adjustment"
                  >
                    <option value="">Use Baseline (Step {opponentSalvageStep})</option>
                    {STEP_ADJUSTMENT_OPTIONS.map((opt) => {
                      const stepNum = calculateOppFinalStep(opponentSalvageStep, opt)
                      const valText = getResolvedValue(stepNum, 'salvageRights')
                      return (
                        <option key={opt} value={opt}>
                          {opt > 0 ? `+${opt}` : opt} (Step {stepNum}: {valText})
                        </option>
                      )
                    })}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="restricted-text sm-text block-label">SUPPORT STEP</label>
                <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '4px' }}>
                  Baseline: Step {opponentSupportStep} (
                  {getResolvedValue(opponentSupportStep, 'supportRights')})
                </div>
                <div className="status-bar theme-red cursor-pointer" style={{ padding: '0 5px' }}>
                  <select
                    className="table-input w-100"
                    style={{ border: 'none', background: 'transparent' }}
                    value={oppSupportStepAdj ?? ''}
                    onChange={(e) =>
                      setOppSupportStepAdj(e.target.value === '' ? null : parseInt(e.target.value))
                    }
                    title="Opposition Support Step Adjustment"
                  >
                    <option value="">Use Baseline (Step {opponentSupportStep})</option>
                    {STEP_ADJUSTMENT_OPTIONS.map((opt) => {
                      const stepNum = calculateOppFinalStep(opponentSupportStep, opt)
                      const valText = getResolvedValue(stepNum, 'supportRights')
                      return (
                        <option key={opt} value={opt}>
                          {opt > 0 ? `+${opt}` : opt} (Step {stepNum}: {valText})
                        </option>
                      )
                    })}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="restricted-text sm-text block-label">TRANSPORT STEP</label>
                <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '4px' }}>
                  Baseline: Step {opponentTransportStep} (
                  {getResolvedValue(opponentTransportStep, 'transportation')})
                </div>
                <div className="status-bar theme-red cursor-pointer" style={{ padding: '0 5px' }}>
                  <select
                    className="table-input w-100"
                    style={{ border: 'none', background: 'transparent' }}
                    value={oppTransportStepAdj ?? ''}
                    onChange={(e) =>
                      setOppTransportStepAdj(
                        e.target.value === '' ? null : parseInt(e.target.value),
                      )
                    }
                    title="Opposition Transport Step Adjustment"
                  >
                    <option value="">Use Baseline (Step {opponentTransportStep})</option>
                    {STEP_ADJUSTMENT_OPTIONS.map((opt) => {
                      const stepNum = calculateOppFinalStep(opponentTransportStep, opt)
                      const valText = getResolvedValue(stepNum, 'transportation')
                      return (
                        <option key={opt} value={opt}>
                          {opt > 0 ? `+${opt}` : opt} (Step {stepNum}: {valText})
                        </option>
                      )
                    })}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="restricted-text sm-text block-label">COMMAND STEP</label>
                <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '4px' }}>
                  Baseline: Step {opponentCommandStep} (
                  {getResolvedValue(opponentCommandStep, 'commandRights')})
                </div>
                <div className="status-bar theme-red cursor-pointer" style={{ padding: '0 5px' }}>
                  <select
                    className="table-input w-100"
                    style={{ border: 'none', background: 'transparent' }}
                    value={oppCommandStepAdj ?? ''}
                    onChange={(e) =>
                      setOppCommandStepAdj(e.target.value === '' ? null : parseInt(e.target.value))
                    }
                    title="Opposition Command Step Adjustment"
                  >
                    <option value="">Use Baseline (Step {opponentCommandStep})</option>
                    {STEP_ADJUSTMENT_OPTIONS.map((opt) => {
                      const stepNum = calculateOppFinalStep(opponentCommandStep, opt)
                      const valText = getResolvedValue(stepNum, 'commandRights')
                      return (
                        <option key={opt} value={opt}>
                          {opt > 0 ? `+${opt}` : opt} (Step {stepNum}: {valText})
                        </option>
                      )
                    })}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Error Message */}
      {saveError && (
        <div
          style={{
            backgroundColor: 'rgba(255, 51, 51, 0.2)',
            border: '1px solid #ff3333',
            borderRadius: '4px',
            padding: '10px 15px',
            marginBottom: '10px',
            color: '#ff3333',
          }}
        >
          <strong>ERROR:</strong> {saveError}
          <button
            onClick={() => setSaveError(null)}
            style={{
              marginLeft: '10px',
              background: 'none',
              border: 'none',
              color: '#ff3333',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Save is performed via parent TerminalOverlay confirm action; no inline save button here */}

      <style>{`
        .theme-green .cursor-pointer:hover { background-color: rgba(51, 255, 51, 0.15); box-shadow: 0 0 5px rgba(51, 255, 51, 0.1); }
        .theme-red .cursor-pointer:hover { background-color: rgba(255, 51, 51, 0.15); box-shadow: 0 0 5px rgba(255, 51, 51, 0.1); }
        .status-bar:focus-within { background-color: rgba(255, 255, 255, 0.05); box-shadow: 0 0 8px rgba(255, 255, 255, 0.1); }
        .generator-panel, .dashboard-section, .summary-item, .proposal-view {
            background-color: rgba(5, 7, 5, 0.3) !important;
            backdrop-filter: blur(1px);
        }
        .generator-panel label.restricted-text { 
            color: var(--terminal-green, #33ff33);
            display: block;
            margin-bottom: 4px;
            font-size: 0.65rem;
            letter-spacing: 1px;
         }
        .status-bar select.table-input option {
            background-color: #111;
            color: #ffb000;
        }
      `}</style>
    </section>
  )
}
