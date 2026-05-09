package com.hotspotscamp.entity;

import java.util.UUID;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import lombok.Builder;
import lombok.Data;

/**
 * Represents a subset of a MercenaryUnit operating under a specific Contract.
 */
@Data
@Builder
@Table("detachments")
public class Detachment {

    @Id
    private UUID id;
    private UUID mercenaryCommandId;
    private UUID contractId;
    private String name; // e.g. "Alpha Lance", "Striker Force"
}
