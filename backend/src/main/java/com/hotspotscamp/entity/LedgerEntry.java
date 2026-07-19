/*
 * HotSpots Campaigner - Battletech Mercenaries campaign management SaaS.
 * Copyright (C) 2026 Jose Ferrer
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
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
