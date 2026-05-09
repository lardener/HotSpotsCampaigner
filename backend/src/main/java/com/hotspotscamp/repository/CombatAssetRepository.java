package com.hotspotscamp.repository;

import java.util.UUID;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;

import com.hotspotscamp.entity.CombatAsset;

@Repository
public interface CombatAssetRepository extends ReactiveCrudRepository<CombatAsset, UUID> {
}
