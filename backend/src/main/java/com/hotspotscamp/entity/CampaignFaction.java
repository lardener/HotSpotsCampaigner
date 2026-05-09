package com.hotspotscamp.entity;

import java.util.UUID;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import lombok.Builder;
import lombok.Data;

/**
 * Represents a Faction's participation in a specific Campaign. Each campaign
 * should have at least 2 of these.
 */
@Data
@Builder
@Table("campaign_factions")
public class CampaignFaction {

    @Id
    private UUID id;
    private UUID campaignId;
    private String factionName; // e.g., "Vesper Marches"
    private Boolean offersContracts; // Can mercs work for them?
    private String shortDescription;
}
