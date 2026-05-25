package com.hotspotscamp.entity;

import java.util.UUID;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Tracks a Mercenary Command's standing with a specific theater faction.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("faction_reputations")
public class FactionReputation implements Persistable<UUID> {

    @Id
    private UUID id;

    @Column("campaign_faction_id")
    private UUID campaignFactionId;

    @Column("mercenary_command_id")
    private UUID mercenaryCommandId;

    private Integer score;
    private String standing;

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
