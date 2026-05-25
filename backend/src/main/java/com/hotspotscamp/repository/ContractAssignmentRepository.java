package com.hotspotscamp.repository;

import java.util.UUID;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import com.hotspotscamp.entity.ContractAssignment;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Reactive repository for managing detachment contract assignments per month.
 */
@Repository
public interface ContractAssignmentRepository extends ReactiveCrudRepository<ContractAssignment, UUID> {

    Flux<ContractAssignment> findAllByDetachmentId(UUID detachmentId);

    Flux<ContractAssignment> findAllByContractId(UUID contractId);

    Mono<ContractAssignment> findByDetachmentIdAndMonthIndex(UUID detachmentId, Integer monthIndex);
}
