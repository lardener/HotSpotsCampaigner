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
 * Represents a Faction's participation in a specific Campaign. Each campaign
 * should have at least 2 of these.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("campaign_factions")
public class CampaignFaction implements Persistable<UUID> {

    @Id
    private UUID id;
    @Column("`campaign_id`")
    private UUID campaignId;
    @Column("`faction_name`")
    private String factionName; // e.g., "Vesper Marches"
    @Column("`offers_contracts`")
    private Boolean offersContracts; // Can mercs work for them?
    @Column("`short_description`")
    private String shortDescription;

    @Transient
    @Builder.Default
    private boolean isNew = true;

    @Override
    public boolean isNew() {
        return isNew || id == null;
    }
}
