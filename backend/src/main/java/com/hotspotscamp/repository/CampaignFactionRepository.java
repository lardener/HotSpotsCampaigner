package com.hotspotscamp.repository;

import java.util.UUID;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;

import com.hotspotscamp.entity.CampaignFaction;

@Repository
public interface CampaignFactionRepository extends ReactiveCrudRepository<CampaignFaction, UUID> {
}
