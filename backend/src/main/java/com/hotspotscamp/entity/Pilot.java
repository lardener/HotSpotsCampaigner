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
@Table("pilots")
public class Pilot implements Persistable<UUID> {

    @Id
    private UUID id;

    @Column("command_id")
    private UUID commandId;

    @Column("detachment_id")
    private UUID detachmentId;

    private String name;
    private Integer gunnery;
    private Integer piloting;

    @Column("as_skill")
    private Integer asSkill;

    @Column("unit_type")
    private String unitType;

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
