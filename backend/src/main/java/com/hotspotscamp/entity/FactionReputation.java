package com.hotspotscamp.entity;

import java.util.UUID;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import lombok.Builder;
import lombok.Data;

/**
 * Tracks standing with specific factions (e.g., Vesper Marches, Alyina Consent,
 * Clan Wolf-in-Exile).
 */
@Data
@Builder
@Table("faction_reputations")
public class FactionReputation {

    @Id
    private UUID id;
    private UUID campaignFactionId; // Links to the specific faction in this campaign
    private UUID mercenaryCommandId; // Whose reputation is this?
    private Integer score; // Reputation points
    private String standing; // e.g., Liked, Hated, Neutral
}
