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
@Table("pilots")
public class Pilot implements Persistable<UUID> {

    @Id
    private UUID id;
    private UUID commandId;
    private UUID detachmentId; // Nullable
    private String name;
    private Integer gunnery;
    private Integer piloting;
    private String status;     // ACTIVE, INJURED, KIA

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
