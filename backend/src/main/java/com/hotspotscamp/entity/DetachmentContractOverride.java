package com.hotspotscamp.entity;

import java.util.UUID;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Stores per-detachment contract term negotiations. Each row represents a
 * negotiated contract for a specific detachment + employer faction combination.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("detachment_contract_overrides")
public class DetachmentContractOverride implements Persistable<UUID> {

    @Id
    private UUID id;

    @Column("campaign_id")
    private UUID campaignId;

    @Column("employer_faction_id")
    private UUID employerFactionId;

    @Column("detachment_id")
    private UUID detachmentId;

    @Column("owner_user_id")
    private UUID ownerId;

    // --- Step adjustments (what the user negotiated, relative to baseline) ---
    @Column("pay_step_adjustment")
    private Integer payStepAdjustment;

    @Column("salvage_step_adjustment")
    private Integer salvageStepAdjustment;

    @Column("support_step_adjustment")
    private Integer supportStepAdjustment;

    @Column("transport_step_adjustment")
    private Integer transportStepAdjustment;

    @Column("command_step_adjustment")
    private Integer commandStepAdjustment;

    // --- Negotiated step values (absolute step numbers after adjustment) ---
    @Column("negotiated_pay_step")
    private Integer negotiatedPayStep;

    @Column("negotiated_salvage_step")
    private Integer negotiatedSalvageStep;

    @Column("negotiated_support_step")
    private Integer negotiatedSupportStep;

    @Column("negotiated_transport_step")
    private Integer negotiatedTransportStep;

    @Column("negotiated_command_step")
    private Integer negotiatedCommandStep;

    // --- Resulting terms values (resolved contract terms text) ---
    @Column("resulting_pay_terms")
    private String resultingPayTerms;

    @Column("resulting_salvage_terms")
    private String resultingSalvageTerms;

    @Column("resulting_support_terms")
    private String resultingSupportTerms;

    @Column("resulting_transport_terms")
    private String resultingTransportTerms;

    @Column("resulting_command_rights")
    private String resultingCommandRights;

    @Column("salvage_terms")
    private String salvageTerms;

    @Column("support_terms")
    private String supportTerms;

    @Column("transport_terms")
    private String transportTerms;

    @Column("command_rights")
    private String commandRights;

    @Transient
    @Builder.Default
    @JsonIgnore
    private boolean isNew = true;

    @Override
    @JsonIgnore
    public boolean isNew() {
        return isNew || id == null;
    }

    public void setNew(boolean isNew) {
        this.isNew = isNew;
    }
}
