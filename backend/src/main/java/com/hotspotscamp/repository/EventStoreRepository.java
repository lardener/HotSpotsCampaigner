package com.hotspotscamp.repository;

import com.hotspotscamp.entity.EventStoreEntry;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;

/**
 * DEPRECATED: Event Sourcing model abandoned.
 */
@Repository
public interface EventStoreRepository extends ReactiveCrudRepository<EventStoreEntry, Long> {
}
