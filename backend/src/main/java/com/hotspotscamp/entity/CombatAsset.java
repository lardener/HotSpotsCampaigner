package com.hotspotscamp.entity;

import java.util.UUID;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents individual 'Mechs, Vehicles, or AeroSpace Fighters within a
 * mercenary unit.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("combat_assets")
public class CombatAsset implements Persistable<UUID> {

    @Id
    private UUID id;
    @Column("`mercenary_command_id`")
    private UUID mercenaryCommandId; // Owner command (Force Record)
    @Column("`detachment_id`")
    private UUID detachmentId; // Optional: Current deployment (Contract Record)
    @Column("`chassis`")
    private String chassis; //e.g. Timber Wolf
    @Column("`model`")
    private String model; // Prime, C, D, etc.
    @Column("`tonnage`")
    private Integer tonnage; // 20-100 tons
    @Column("`battle_value`")
    private Integer battleValue; // BV
    @Column("`point_value`")
    private Integer pointValue; // PV
    @Column("`size`")
    private Integer size; // 1-4 (Light, Medium, Heavy, Assault)
    @Column("`tech_base`")
    private String techBase; // Clan or Inner Sphere or Mixed
    @Column("`status`")
    private String status; // Nominal, Armor Damaged, Internal Damaged, Crippled, Destroyed (Repairable), Destroyed (Total Loss)

    @Transient
    @Builder.Default
    private boolean isNew = true;

    @Override
    public boolean isNew() {
        return isNew || id == null;
    }
}
