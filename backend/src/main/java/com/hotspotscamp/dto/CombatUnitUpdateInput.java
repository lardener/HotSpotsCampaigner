package com.hotspotscamp.dto;

import java.util.UUID;

/**
 * DTO for updating a combat unit.
 */
public record CombatUnitUpdateInput(
        String type,
        String model,
        String variant,
        String techBase,
        Integer tonnage,
        Integer asSize,
        Integer bv,
        Integer pv,
        String status,
        UUID detachmentId
        ) {}