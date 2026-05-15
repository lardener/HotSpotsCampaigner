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
 * Represents a theater of operations (e.g., The Hinterlands).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("campaigns")
public class Campaign implements Persistable<UUID> {

    @Id
    private UUID id;
    @Column("name")
    private String name;
    @Column("manager_id") // The user managing this campaign
    private String managerId;
    @Column("status")
    private String status; // e.g., "ACTIVE", "COMPLETED"
    @Column("system_name")
    private String systemName;
    @Column("track_count")
    private Integer trackCount;

    @Transient
    @Builder.Default
    private boolean isNew = true;

    @Override
    public boolean isNew() {
        return isNew || id == null;
    }
}
