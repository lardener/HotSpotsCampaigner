package com.hotspotscamp.entity;

import java.util.UUID;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import lombok.Builder;
import lombok.Data;

/**
 * Represents individual 'Mechs, Vehicles, or AeroSpace Fighters within a
 * mercenary unit.
 */
@Data
@Builder
@Table("combat_assets")
public class CombatAsset {

    @Id
    private UUID id;
    private UUID mercenaryCommandId; // Owner command (Force Record)
    private UUID detachmentId; // Optional: Current deployment (Contract Record)
    private String chassis; //e.g. Timber Wolf
    private String model; // Prime, C, D, etc.
    private Integer tonnage; // 20-100 tons
    private Integer battleValue; // BV
    private Integer pointValue; // PV
    private Integer size; // 1-4 (Light, Medium, Heavy, Assault)
    private String techBase; // Clan or Inner Sphere or Mixed
    private String status; // Nominal, Armor Damaged, Internal Damaged, Crippled, Destroyed (Repairable), Destroyed (Total Loss)
}
