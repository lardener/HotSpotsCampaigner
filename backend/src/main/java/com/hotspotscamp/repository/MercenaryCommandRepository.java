package com.hotspotscamp.repository;

import com.hotspotscamp.entity.MercenaryCommand;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

import java.util.UUID;

public interface MercenaryCommandRepository extends ReactiveCrudRepository<MercenaryCommand, UUID> {

    Flux<MercenaryCommand> findAllByOwnerId(String ownerId);
}
