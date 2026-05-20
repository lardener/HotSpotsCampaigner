package com.hotspotscamp.entity;

import java.time.LocalDateTime;
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
    @Column("description")
    private String description;
    @Column("track_count")
    private Integer trackCount;
    @Column("pay_rate")
    private Double payRate;
    @Column("pay_step")
    private Integer payStep;
    @Column("salvage_terms")
    private String salvageTerms;
    @Column("salvage_step")
    private Integer salvageStep;
    @Column("support_terms")
    private String supportTerms;
    @Column("support_step")
    private Integer supportStep;
    @Column("transport_terms")
    private String transportTerms;
    @Column("transport_step")
    private Integer transportStep;
    @Column("command_rights")
    private String commandRights;
    @Column("command_step")
    private Integer commandStep;

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
