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

/**
 * Represents a subset of a MercenaryUnit operating under a specific Contract.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("detachments")
public class Detachment implements Persistable<UUID> {

    @Id
    private UUID id;
    @Column("mercenary_command_id")
    private UUID mercenaryCommandId;
    @Column("campaign_id")
    private UUID campaignId;
    @Column("name")
    private String name;
    private String callsign;

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
