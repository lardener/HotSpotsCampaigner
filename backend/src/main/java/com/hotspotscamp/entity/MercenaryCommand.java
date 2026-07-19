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
 * Represents the "MERCENARY FORCE RECORD SHEET". High-level state of the entire
 * mercenary command.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("mercenary_commands")
public class MercenaryCommand implements Persistable<UUID> {

    @Id
    private UUID id;
    @Column("name")
    private String name;
    @Column("owner_id") // Belongs to a user
    private String ownerId;
    @Column("total_support_points")
    private Integer totalSupportPoints; // Derived from ledger entries

    @Column("commanding_officer")
    private String commandingOfficer;

    /**
     * Reputation starts at 1 per Hinterlands rules.
     */
    @Builder.Default
    @Column("reputation")
    private Integer reputation = 1;

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
