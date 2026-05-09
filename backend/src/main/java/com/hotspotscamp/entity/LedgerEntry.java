package com.hotspotscamp.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import lombok.Builder;
import lombok.Data;

/**
 * Represents the ledger entries in the "MERCENARY CONTRACT RECORD SHEET".
 * Tracks individual SP transactions (Repairs, Mission Rewards, etc).
 */
@Data
@Builder
@Table("ledger_entries")
public class LedgerEntry {

    @Id
    private UUID id;
    private UUID detachmentId; // Links to the specific contract deployment
    private LocalDateTime timestamp;
    private String description; // e.g. "Repairing Warhammer WHM-6R", "Mission Reward"
    private Integer amount; // Can be negative for costs
    private Integer runningTotal; // SP total after this transaction
}
