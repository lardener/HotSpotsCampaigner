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
 * Represents the "CONTRACT OF MERCENARY EMPLOYMENT". Defines terms offered by a
 * Faction within a Campaign.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("contracts")
public class Contract implements Persistable<UUID> {

    @Id
    private UUID id;
    @Column("campaign_id")
    private UUID campaignId;
    @Column("employer_faction_id")
    private UUID employerFactionId; // Links to CampaignFaction
    @Column("employer_category")
    private String employerCategory; // pg. 131: Major Power, Minor Power, Corporate, Noble, etc.
    @Column("primary_contract")
    private Boolean primaryContract; // True for primary, False for opposition
    @Column("mission_type")
    private String missionType; // e.g., Planetary Assault, Garrison Duty

    // Chaos Campaign Specific Multipliers
    @Column("pay_rate")
    private Double payRate;
    @Column("pay_step")
    private Integer payStep;
    @Column("salvage_terms")
    private String salvageTerms; // e.g., Full, None, Shared
    @Column("salvage_step")
    private Integer salvageStep;
    @Column("support_terms")
    private String supportTerms; // How SP costs are shared
    @Column("support_step")
    private Integer supportStep;
    @Column("transport_terms")
    private String transportTerms; // pg. 132
    @Column("transport_step")
    private Integer transportStep;
    @Column("command_rights")
    private String commandRights; // pg. 133: Independent, Liaison, House
    @Column("command_step")
    private Integer commandStep;

    @Column("track_count")
    private Integer trackCount; // pg. 134

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
