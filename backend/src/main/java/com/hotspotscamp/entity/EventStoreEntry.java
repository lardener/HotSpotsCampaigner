package com.hotspotscamp.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("event_store")
public class EventStoreEntry {

    @Id
    private Long id;
    @Column("aggregate_id")
    private String aggregateId;
    @Column("event_type")
    private String eventType;
    @Column("event_data")
    private String eventData; // JSON String
    @Column("occurred_at")
    private LocalDateTime occurredAt;
    private int version;
    @Column("user_id")
    private String userId;
}
