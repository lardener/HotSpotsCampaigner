package com.hotspotscamp.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents the ledger entries in the "MERCENARY CONTRACT RECORD SHEET".
 * Tracks individual SP transactions (Repairs, Mission Rewards, etc).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("ledger_entries")
public class LedgerEntry implements Persistable<UUID> {

    @Id
    private UUID id;
    @Column("detachment_id")
    private UUID detachmentId; // Links to the specific contract deployment
    @Column("timestamp")
    private LocalDateTime timestamp;
    @Column("short_description")
    private String description; // e.g. "Repairing Warhammer WHM-6R", "Mission Reward"
    @Column("amount")
    private Integer amount; // Can be negative for costs
    @Column("cover_amount")
    private Integer coverAmount;
    @Column("paid_amount")
    private Integer paidAmount;
    @Column("reputation_change")
    private Integer reputationChange;
    @Column("campaign_id")
    private UUID campaignId;
    @Column("campaign_name")
    private String campaignName;
    @Column("contract_month")
    private String contractMonth;

    @Column("running_total") // SP total after this transaction
    private Integer runningTotal;

    @Transient
    @Builder.Default
    private boolean isNew = true;

    @Override
    public boolean isNew() {
        return isNew || id == null;
    }
}
