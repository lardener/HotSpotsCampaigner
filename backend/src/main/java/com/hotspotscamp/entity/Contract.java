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
    private String employerCategory; // pg. 131: Major Power, Minor Power, Corporate, Noble, etc.
    private Boolean primaryContract; // True for primary, False for opposition
    private String missionType; // e.g., Planetary Assault, Garrison Duty

    // Chaos Campaign Specific Multipliers
    private Double payRate;
    private String salvageTerms; // e.g., Full, None, Shared
    private String supportTerms; // How SP costs are shared
    private String transportTerms; // pg. 132
    private String commandRights; // pg. 133: Independent, Liaison, House

    private Integer lengthInMonths;
    private Integer trackCount; // pg. 134
}
