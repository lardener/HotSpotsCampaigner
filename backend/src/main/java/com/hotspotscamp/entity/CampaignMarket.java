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

import java.util.Map;
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
 * Represents the curated markdown markets for a specific Campaign.
 * One row per campaign — each market is a TEXT blob of markdown with embedded hsc:// links.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("campaign_markets")
public class CampaignMarket implements Persistable<UUID> {

    @Id
    private UUID id;

    @Column("campaign_id")
    private UUID campaignId;

    @Column("free_market_markdown")
    private String freeMarketMarkdown;

    @Column("scrapper_market_markdown")
    private String scrapperMarketMarkdown;

    @Column("scrapper_pool_markdown")
    private String scrapperPoolMarkdown;

    @Column("scrapper_fee")
    @Builder.Default
    private Integer scrapperFee = 1200;

    @Column("employer_markets_json")
    private Map<String, String> employerMarkets;

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
