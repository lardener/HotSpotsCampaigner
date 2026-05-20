package com.hotspotscamp.repository;

import com.hotspotscamp.entity.EventStoreEntry;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

import java.util.UUID;

@Repository
public interface EventStoreRepository extends ReactiveCrudRepository<EventStoreEntry, Long> {

    Flux<EventStoreEntry> findAllByAggregateIdOrderByVersionAsc(String aggregateId);
}
