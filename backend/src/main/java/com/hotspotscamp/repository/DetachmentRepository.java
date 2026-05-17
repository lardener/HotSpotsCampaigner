package com.hotspotscamp.repository;

import java.util.UUID;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;

import com.hotspotscamp.entity.Detachment;

import reactor.core.publisher.Flux;

@Repository
public interface DetachmentRepository extends ReactiveCrudRepository<Detachment, UUID> {

    Flux<Detachment> findAllByMercenaryCommandId(UUID mercenaryCommandId);

    /**
     * Alias for findAllByMercenaryCommandId to maintain consistency with
     * CombatUnit and Pilot repositories.
     */
    default Flux<Detachment> findAllByCommandId(UUID commandId) {
        return findAllByMercenaryCommandId(commandId);
    }

    Flux<Detachment> findAllByContractId(UUID contractId);
}
