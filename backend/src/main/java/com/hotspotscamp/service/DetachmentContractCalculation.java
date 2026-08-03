package com.hotspotscamp.service;

import com.hotspotscamp.entity.Contract;

import lombok.Builder;
import lombok.Data;

/**
 * Result of calculating contract terms for a detachment, including any
 * overrides that were applied during negotiation.
 */
@Data
@Builder
public class DetachmentContractCalculation {

    private Contract baselineContract;
    private OverriddenTerms overriddenTerms;
    private boolean hasOverrides;

    /**
     * Contains the final negotiated values for each contract step.
     */
    @Data
    @Builder
    public static class OverriddenTerms {

        private Integer payStep;
        private Integer salvageStep;
        private Integer supportStep;
        private Integer transportStep;
        private Integer commandStep;
        private String salvageTerms;
        private String supportTerms;
        private String transportTerms;
        private String commandRights;
    }
}
