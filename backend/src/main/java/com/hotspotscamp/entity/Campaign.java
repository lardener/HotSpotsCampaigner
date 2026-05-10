package com.hotspotscamp.entity;

import java.util.UUID;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import lombok.Builder;
import lombok.Data;

/**
 * Represents a theater of operations (e.g., The Hinterlands).
 */
@Data
@Builder
@Table("campaigns")
public class Campaign {

    @Id
    private UUID id;
    private String name;
    private UUID managerId; // The user managing this campaign
    private String status; // e.g., "ACTIVE", "COMPLETED"
    private String systemName;
    private Integer lengthInMonths;
    private Integer trackCount;
}
