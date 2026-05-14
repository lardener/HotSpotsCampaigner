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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("personnel")
public class Personnel implements Persistable<UUID> {

    @Id
    private UUID id;
    @Column("`mercenary_command_id`")
    private UUID mercenaryCommandId; // Parent command (Force Record)
    @Column("`detachment_id`")
    private UUID detachmentId; // Optional: Assigned to a specific detachment
    @Column("`name`")
    private String name;
    @Column("`specialization`")
    private String specialization; // e.g., "MECH", "VEHICLE", "AERO"
    @Column("`gunnery`")
    private Integer gunnery;
    @Column("`piloting`")
    private Integer piloting;

    @Transient
    @Builder.Default
    private boolean isNew = true;

    @Override
    public boolean isNew() {
        return isNew || id == null;
    }
}
