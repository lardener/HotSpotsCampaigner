package com.hotspotscamp.repository;

import java.util.UUID;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;

import com.hotspotscamp.entity.CampaignTrack;

public interface CampaignTrackRepository extends ReactiveCrudRepository<CampaignTrack, UUID> {
}
