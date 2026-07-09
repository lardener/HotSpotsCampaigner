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
