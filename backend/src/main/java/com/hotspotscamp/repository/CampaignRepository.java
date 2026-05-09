package com.hotspotscamp.repository;

import java.util.UUID;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;

import com.hotspotscamp.entity.Campaign;

@Repository
public interface CampaignRepository extends ReactiveCrudRepository<Campaign, UUID> {
}
