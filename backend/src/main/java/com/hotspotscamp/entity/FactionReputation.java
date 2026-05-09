package com.hotspotscamp.entity;

import org.springframework.data.relational.core.mapping.Table;
import lombok.Data;
import java.util.UUID;

/**
 * Tracks standing with specific factions (e.g., Vesper Marches, Alyina Consent,
 * Clan Wolf-in-Exile).
 */
@Data
@Table("faction_reputations")
public class FactionReputation {

    private UUID campaignId;
    private String factionName;
    private Integer score; // Reputation points
    private String standing; // e.g., Liked, Hated, Neutral
}
