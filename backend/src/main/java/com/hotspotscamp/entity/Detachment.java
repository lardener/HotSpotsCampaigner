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
    @Column("`mercenary_command_id`")
    private UUID mercenaryCommandId;
    @Column("`contract_id`")
    private UUID contractId;
    @Column("`name`")
    private String name; // e.g. "Alpha Lance", "Striker Force"

    @Transient
    @Builder.Default
    private boolean isNew = true;

    @Override
    public boolean isNew() {
        return isNew || id == null;
    }
}
