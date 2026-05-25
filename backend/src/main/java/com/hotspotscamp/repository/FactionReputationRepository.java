package com.hotspotscamp.repository;

import java.util.UUID;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;

import com.hotspotscamp.entity.FactionReputation;
import reactor.core.publisher.Flux;

@Repository
public interface FactionReputationRepository extends ReactiveCrudRepository<FactionReputation, UUID> {

    Flux<FactionReputation> findAllByMercenaryCommandId(UUID mercenaryCommandId);

    Flux<FactionReputation> findAllByCampaignFactionId(UUID campaignFactionId);
}
