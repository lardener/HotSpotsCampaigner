package com.hotspotscamp.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import com.fasterxml.jackson.annotation.JsonIgnore;

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
    @Column("command_id")
    private UUID commandId;
    @Column("detachment_id")
    private UUID detachmentId; // Links to the specific contract deployment
    @Column("campaign_id")
    private UUID campaignId;
    @Column("timestamp")
    private LocalDateTime timestamp;
    @Column("short_description")
    private String description; // e.g. "Repairing Warhammer WHM-6R", "Mission Reward"
    @Column("amount")
    private Integer amount; // Can be negative for costs
    @Column("reputation_change")
    private Integer reputationChange;
    @Column("campaign_name")
    private String campaignName;
    @Column("month_index")
    private Integer monthIndex;

    @Transient
    @Builder.Default
    @JsonIgnore
    private boolean isNew = true;

    @Override
    @JsonIgnore
    public boolean isNew() {
        return isNew || id == null;
    }

    public void setNew(boolean isNew) {
        this.isNew = isNew;
    }
}
