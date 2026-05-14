package com.hotspotscamp.repository;

import java.util.UUID;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;

import com.hotspotscamp.entity.Contract;

import reactor.core.publisher.Flux;

@Repository
public interface ContractRepository extends ReactiveCrudRepository<Contract, UUID> {
    Flux<Contract> findAllByCampaignId(UUID campaignId);
}
