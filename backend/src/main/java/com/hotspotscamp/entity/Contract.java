package com.hotspotscamp.entity;

import java.util.UUID;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents the "CONTRACT OF MERCENARY EMPLOYMENT". Defines terms offered by a
 * Faction within a Campaign.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("contracts")
public class Contract implements Persistable<UUID> {

    @Id
    private UUID id;
    @Column("campaign_id")
    private UUID campaignId;
    @Column("employer_faction_id")
    private UUID employerFactionId; // Links to CampaignFaction
    @Column("employer_category")
    private String employerCategory; // pg. 131: Major Power, Minor Power, Corporate, Noble, etc.
    @Column("primary_contract")
    private Boolean primaryContract; // True for primary, False for opposition
    @Column("mission_type")
    private String missionType; // e.g., Planetary Assault, Garrison Duty

    // Chaos Campaign Specific Multipliers
    @Column("pay_rate")
    private Double payRate;
    @Column("pay_step")
    private Integer payStep;
    @Column("salvage_terms")
    private String salvageTerms; // e.g., Full, None, Shared
    @Column("salvage_step")
    private Integer salvageStep;
    @Column("support_terms")
    private String supportTerms; // How SP costs are shared
    @Column("support_step")
    private Integer supportStep;
    @Column("transport_terms")
    private String transportTerms; // pg. 132
    @Column("transport_step")
    private Integer transportStep;
    @Column("command_rights")
    private String commandRights; // pg. 133: Independent, Liaison, House
    @Column("command_step")
    private Integer commandStep;

    @Column("track_count")
    private Integer trackCount; // pg. 134

    @Transient
    @Builder.Default
    private boolean isNew = true;

    @Override
    public boolean isNew() {
        return isNew || id == null;
    }
}
