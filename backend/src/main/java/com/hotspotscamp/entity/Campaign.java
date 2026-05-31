package com.hotspotscamp.entity;

import java.util.UUID;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.hotspotscamp.service.CampaignService.RepairRules;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@Table("campaigns")
public class Campaign implements Persistable<UUID> {

    @Id
    private UUID id;
    private String name;
    private String managerId;
    private String status;
    private String systemName;
    private String description;
    private Integer trackCount;
    private Integer lengthInMonths;
    private Double payRate;
    private Integer payStep;
    private String salvageTerms;
    private Integer salvageStep;
    private String supportTerms;
    private Integer supportStep;
    private String transportTerms;
    private Integer transportStep;
    private String commandRights;
    private Integer commandStep;
    private Integer monthlyPay;
    private Integer monthlyMaintenance;
    private Integer transportationCost;
    private Integer combatPay;

    // R2DBC Persisted Repair Multipliers
    @Column("armor_multiplier")
    private Double armorMultiplier;

    @Column("internal_multiplier")
    private Double internalMultiplier;

    @Column("crippled_multiplier")
    private Double crippledMultiplier;

    @Column("destroyed_multiplier")
    private Double destroyedMultiplier;

    @Column("non_mech_modifier")
    private Double nonMechModifier;

    @Column("mixed_tech_modifier")
    private Double mixedTechModifier;

    @Column("clan_tech_modifier")
    private Double clanTechModifier;

    // Transient object for business logic compatibility
    @Transient
    private RepairRules repairRules;

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
