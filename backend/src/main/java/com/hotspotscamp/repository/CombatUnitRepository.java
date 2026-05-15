package com.hotspotscamp.repository;

import java.util.UUID;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;

import com.hotspotscamp.entity.CombatUnit;

import reactor.core.publisher.Flux;

public interface CombatUnitRepository extends ReactiveCrudRepository<CombatUnit, UUID> {

    Flux<CombatUnit> findAllByCommandId(UUID commandId);

    Flux<CombatUnit> findAllByDetachmentId(UUID detachmentId);
}
