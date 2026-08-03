package com.hotspotscamp.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hotspotscamp.entity.Contract;
import com.hotspotscamp.entity.Detachment;
import com.hotspotscamp.entity.DetachmentContractOverride;
import com.hotspotscamp.repository.DetachmentContractOverrideRepository;
import com.hotspotscamp.repository.DetachmentRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

/**
 * Service for managing detachment-level contract term negotiations. Handles
 * saving, retrieving, and validating negotiation terms.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DetachmentContractNegotiationService {

    private final DetachmentContractOverrideRepository overrideRepository;
    private final DetachmentRepository detachmentRepository;

    /**
     * Save or update negotiation terms for a detachment.
     *
     * @param override the override entity with negotiated terms
     * @return saved override
     */
    @Transactional
    public Mono<DetachmentContractOverride> saveNegotiation(DetachmentContractOverride override) {
        validateOverride(override);
        return overrideRepository.save(override).doOnNext(saved
                -> log.info("Saved detachment contract negotiation: detachmentId={}, employerFactionId={}",
                        saved.getDetachmentId(), saved.getEmployerFactionId()));
    }

    /**
     * Find negotiation override for a specific detachment + employer faction.
     */
    public Mono<DetachmentContractOverride> findByDetachmentAndEmployer(
            UUID detachmentId, UUID campaignId, UUID employerFactionId) {
        return overrideRepository
                .findByDetachmentIdAndCampaignIdAndEmployerFactionId(detachmentId, campaignId, employerFactionId);
    }

    /**
     * Find all negotiations for a campaign by owner.
     */
    public Mono<DetachmentContractOverride> findByCampaignAndOwner(
            UUID campaignId, UUID ownerUserId) {
        return overrideRepository
                .findByCampaignIdAndOwnerId(campaignId, ownerUserId);
    }

    /**
     * Delete all negotiations for a detachment.
     */
    @Transactional
    public Mono<Void> deleteByDetachment(UUID detachmentId) {
        return overrideRepository
                .findByDetachmentIdAndCampaignIdAndEmployerFactionId(detachmentId, null, null)
                .flatMap(override -> overrideRepository.delete(override)
                .doOnSuccess(v -> log.info("Deleted all negotiations for detachment: {}", detachmentId))
                .onErrorResume(e -> Mono.empty()));
    }

    /**
     * Calculate final contract terms for a detachment, applying any negotiated
     * overrides.
     *
     * @param contract the baseline contract from employer faction
     * @param detachment the detachment
     * @param campaignId the campaign id
     * @return DetachmentContractCalculation with final terms
     */
    public Mono<DetachmentContractCalculation> calculateWithOverrides(
            Contract contract, Detachment detachment, UUID campaignId) {

        return findByDetachmentAndEmployer(
                detachment.getId(), campaignId, contract.getEmployerFactionId())
                .flatMap(override -> {
                    // Apply step adjustments to baseline contract
                    Integer payStep = applyAdjustment(contract.getPayStep(), override.getPayStepAdjustment());
                    Integer salvageStep = applyAdjustment(contract.getSalvageStep(), override.getSalvageStepAdjustment());
                    Integer supportStep = applyAdjustment(contract.getSupportStep(), override.getSupportStepAdjustment());
                    Integer transportStep = applyAdjustment(contract.getTransportStep(), override.getTransportStepAdjustment());
                    Integer commandStep = applyAdjustment(contract.getCommandStep(), override.getCommandStepAdjustment());

                    // Apply term overrides if present
                    String salvageTerms = override.getSalvageTerms() != null ? override.getSalvageTerms() : contract.getSalvageTerms();
                    String supportTerms = override.getSupportTerms() != null ? override.getSupportTerms() : contract.getSupportTerms();
                    String transportTerms = override.getTransportTerms() != null ? override.getTransportTerms() : contract.getTransportTerms();
                    String commandRights = override.getCommandRights() != null ? override.getCommandRights() : contract.getCommandRights();

                    return Mono.just(new DetachmentContractCalculation(
                            contract,
                            new DetachmentContractCalculation.OverriddenTerms(
                                    payStep, salvageStep, supportStep, transportStep, commandStep,
                                    salvageTerms, supportTerms, transportTerms, commandRights),
                            true));
                })
                .switchIfEmpty(Mono.just(new DetachmentContractCalculation(contract, null, false)));
    }

    /**
     * Validate that negotiation override is consistent.
     */
    private void validateOverride(DetachmentContractOverride override) {
        if (override.getDetachmentId() == null) {
            throw new IllegalArgumentException("detachmentId is required");
        }
        if (override.getCampaignId() == null) {
            throw new IllegalArgumentException("campaignId is required");
        }
        if (override.getEmployerFactionId() == null) {
            throw new IllegalArgumentException("employerFactionId is required");
        }

        // Validate step adjustments are within reasonable range
        for (Integer adjustment : new Integer[]{
            override.getPayStepAdjustment(),
            override.getSalvageStepAdjustment(),
            override.getSupportStepAdjustment(),
            override.getTransportStepAdjustment(),
            override.getCommandStepAdjustment()
        }) {
            if (adjustment != null && (adjustment < -3 || adjustment > 3)) {
                throw new IllegalArgumentException("Step adjustment must be between -3 and +3");
            }
        }
    }

    /**
     * Apply a step adjustment to a baseline value, clamping to valid range.
     */
    private Integer applyAdjustment(Integer baseline, Integer adjustment) {
        if (baseline == null) {
            return null;
        }
        if (adjustment == null) {
            return baseline;
        }
        int result = baseline + adjustment;
        return Math.max(0, Math.min(result, 20)); // Clamp to reasonable range
    }

    /**
     * Value object representing calculated contract terms for a detachment.
     */
    public record DetachmentContractCalculation(
            Contract baselineContract,
            OverriddenTerms overriddenTerms,
            boolean hasOverrides
            ) {

        public record OverriddenTerms(
                Integer payStep,
                Integer salvageStep,
                Integer supportStep,
                Integer transportStep,
                Integer commandStep,
                String salvageTerms,
                String supportTerms,
                String transportTerms,
                String commandRights
                ) {

        }
    }
}
