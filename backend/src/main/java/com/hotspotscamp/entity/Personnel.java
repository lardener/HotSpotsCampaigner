package com.hotspotscamp.entity;

import java.util.UUID;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Table("personnel")
public class Personnel {

    @Id
    private UUID id;
    private UUID mercenaryCommandId; // Parent command (Force Record)
    private UUID detachmentId; // Optional: Assigned to a specific detachment
    private String name;
    private String specialization; // e.g., "MECH", "VEHICLE", "AERO"
    private Integer gunnery;
    private Integer piloting;
}
