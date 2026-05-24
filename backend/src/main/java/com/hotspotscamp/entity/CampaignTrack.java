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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("campaign_tracks")
public class CampaignTrack implements Persistable<UUID> {

    @Id
    private UUID id;

    @Column("campaign_id")
    private UUID campaignId;

    @Column("track_name")
    private String trackName;

    @Column("sequence_order")
    private Integer sequenceOrder;

    @Column("location")
    private String location;

    @Column("next_session")
    private LocalDateTime nextSession;

    @Column("attacker_faction_id")
    private UUID attackerFactionId;

    @Column("month_index")
    private Integer monthIndex;

    @Column("complications")
    private String complications;

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
