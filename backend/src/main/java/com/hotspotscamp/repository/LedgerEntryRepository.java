package com.hotspotscamp.repository;

import java.util.UUID;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;

import com.hotspotscamp.entity.LedgerEntry;

import reactor.core.publisher.Flux;

@Repository
public interface LedgerEntryRepository extends ReactiveCrudRepository<LedgerEntry, UUID> {

    Flux<LedgerEntry> findAllByDetachmentId(UUID detachmentId);
}
