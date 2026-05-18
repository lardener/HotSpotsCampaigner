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
 * Represents the "MERCENARY FORCE RECORD SHEET". High-level state of the entire
 * mercenary command.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("mercenary_commands")
public class MercenaryCommand implements Persistable<UUID> {

    @Id
    private UUID id;
    @Column("name")
    private String name;
    @Column("owner_id") // Belongs to a user
    private String ownerId;
    @Column("total_support_points")
    private Integer totalSupportPoints; // Derived from ledger entries

    @Builder.Default
    @Column("experience_level")
    private String experienceLevel = "Green";

    @Column("commanding_officer")
    private String commandingOfficer;

    /**
     * Reputation starts at 1 per Hinterlands rules.
     */
    @Builder.Default
    @Column("reputation")
    private Integer reputation = 1;

    @Transient
    @Builder.Default
    private boolean isNew = true;

    @Override
    public boolean isNew() {
        return isNew || id == null;
    }
}
