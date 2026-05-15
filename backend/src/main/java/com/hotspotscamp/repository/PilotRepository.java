package com.hotspotscamp.repository;

import java.util.UUID;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;

import com.hotspotscamp.entity.Pilot;

import reactor.core.publisher.Flux;

public interface PilotRepository extends ReactiveCrudRepository<Pilot, UUID> {

    Flux<Pilot> findAllByCommandId(UUID commandId);

    Flux<Pilot> findAllByDetachmentId(UUID detachmentId);
}
