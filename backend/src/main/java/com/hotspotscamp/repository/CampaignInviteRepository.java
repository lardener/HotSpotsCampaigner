package com.hotspotscamp.repository;

import java.util.UUID;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;

import com.hotspotscamp.entity.CampaignInvite;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface CampaignInviteRepository extends ReactiveCrudRepository<CampaignInvite, UUID> {

    Mono<CampaignInvite> findByToken(String token);

    Flux<CampaignInvite> findAllByCampaignId(UUID campaignId);
}
