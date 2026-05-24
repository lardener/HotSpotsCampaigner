package com.hotspotscamp.entity;

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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("combat_units")
public class CombatUnit implements Persistable<UUID> {

    @Id
    private UUID id;

    @Column("command_id")
    private UUID commandId;

    @Column("detachment_id")
    private UUID detachmentId;

    private String model;
    private String type;      // BM, CV, PM, IM, BA, CI
    private String variant;

    @Column("tech_base")
    private String techBase;  // Inner Sphere, Clan, Mixed

    private Integer tonnage;

    @Column("as_size")
    private Integer asSize;

    private Integer bv;
    private Integer pv;
    @Column("available_from_month")
    private Integer availableFromMonth;
    private String status;

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
