package com.hotspotscamp.repository;

import java.util.UUID;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;

import com.hotspotscamp.entity.CampaignTrack;
import reactor.core.publisher.Flux;

public interface CampaignTrackRepository extends ReactiveCrudRepository<CampaignTrack, UUID> {
    Flux<CampaignTrack> findAllByCampaignId(UUID campaignId);
}
