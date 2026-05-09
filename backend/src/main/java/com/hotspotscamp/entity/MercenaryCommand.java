package com.hotspotscamp.entity;

import java.util.UUID;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import lombok.Builder;
import lombok.Data;

/**
 * Represents the "MERCENARY FORCE RECORD SHEET". High-level state of the entire
 * mercenary command.
 */
@Data
@Builder
@Table("mercenary_commands")
public class MercenaryCommand {

    @Id
    private UUID id;
    private String name;
    private UUID ownerId; // Belongs to a user
    private UUID campaignId; // Participates in 0-1 campaigns
    private Integer totalSupportPoints; // Derived from ledger entries

    /**
     * Reputation starts at 1 per Hinterlands rules.
     */
    @Builder.Default
    private Integer reputation = 1;
}
