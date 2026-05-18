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
 * Tracks standing with specific factions (e.g., Vesper Marches, Alyina Consent,
 * Clan Wolf-in-Exile).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("faction_reputations")
public class FactionReputation implements Persistable<UUID> {

    @Id
    private UUID id;
    @Column("campaign_faction_id")
    private UUID campaignFactionId; // Links to the specific faction in this campaign
    @Column("mercenary_command_id")
    private UUID mercenaryCommandId; // Whose reputation is this?
    @Column("score")
    private Integer score; // Reputation points
    @Column("standing")
    private String standing; // e.g., Liked, Hated, Neutral

    @Transient
    @Builder.Default
    private boolean isNew = true;

    @Override
    public boolean isNew() {
        return isNew || id == null;
    }
}
