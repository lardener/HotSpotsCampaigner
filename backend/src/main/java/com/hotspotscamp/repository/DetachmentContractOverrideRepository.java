package com.hotspotscamp.repository;

import java.util.UUID;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;

import com.hotspotscamp.entity.DetachmentContractOverride;

import reactor.core.publisher.Mono;

@Repository
public interface DetachmentContractOverrideRepository
        extends ReactiveCrudRepository<DetachmentContractOverride, UUID> {

    Mono<DetachmentContractOverride> findByDetachmentIdAndCampaignIdAndEmployerFactionId(
            UUID detachmentId, UUID campaignId, UUID employerFactionId
    );

    Mono<DetachmentContractOverride> findByCampaignIdAndOwnerId(
            UUID campaignId, UUID ownerId
    );

    Mono<DetachmentContractOverride> findByCampaignIdAndDetachmentId(
            UUID campaignId, UUID detachmentId
    );

    Mono<DetachmentContractOverride> findByCampaignIdAndEmployerFactionId(
            UUID campaignId, UUID employerFactionId
    );
}
