package com.hotspotscamp.entity;

import java.util.UUID;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Table;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Table("combat_units")
public class CombatUnit implements Persistable<UUID> {

    @Id
    private UUID id;
    private UUID commandId;
    private UUID detachmentId; // Nullable: if null, it's in the pool
    private String model;      // e.g. "Timber Wolf (Mad Cat) Prime"
    private String type;       // MECH, VEHICLE, AEROSPACE
    private Integer tonnage;
    private String status;     // OPERATIONAL, DAMAGED, DESTROYED
    

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
