package com.hotspotscamp.entity;

import java.util.UUID;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import lombok.Builder;
import lombok.Data;

/**
 * Represents the "CONTRACT OF MERCENARY EMPLOYMENT". Defines terms offered by a
 * Faction within a Campaign.
 */
@Data
@Builder
@Table("contracts")
public class Contract {

    @Id
    private UUID id;
    private UUID campaignId;
    private UUID employerFactionId; // Links to CampaignFaction
    private String missionType; // e.g., Planetary Assault, Garrison Duty

    // Chaos Campaign Specific Multipliers
    private Double warchestMultiplier;
    private String salvageTerms; // e.g., Full, None, Shared
    private String supportTerms; // How SP costs are shared

    private Integer lengthInMonths;
    private Integer paymentSp; // Base SP reward
}
