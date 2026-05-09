package com.hotspotscamp.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import lombok.Data;
import java.util.UUID;

/**
 * Represents individual 'Mechs, Vehicles, or AeroSpace Fighters within a
 * mercenary unit.
 */
@Data
@Table("combat_assets")
public class CombatAsset {

    @Id
    private UUID id;
    private UUID unitId;
    private String model; // e.g., "Timber Wolf (Mad Cat) Prime"
    private Integer tonnage;
    private String techBase; // Clan or Inner Sphere
    private String status; // Operational, Damaged, Destroyed
    private Integer maintenanceCost;
}
