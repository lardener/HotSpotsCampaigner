package com.hotspotscamp.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import lombok.Data;
import lombok.Builder;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Represents a Mercenary Campaign, specifically tailored for the Chaos Campaign
 * rules found in Hotspots: Hinterlands.
 */
@Data
@Builder
@Table("campaigns")
public class Campaign {

    @Id
    private UUID id;
    private String name;
    private String theater; // e.g., "Hinterlands"
    private LocalDate currentDate;
    private Integer warchestPoints; // Used for tracks and repairs in Chaos Campaigns
    private UUID managerId;
}
