package com.hotspotscamp.repository;

import java.util.UUID;

import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;

import com.hotspotscamp.entity.Campaign;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface CampaignRepository extends ReactiveCrudRepository<Campaign, UUID> {

    @Query("SELECT * FROM campaigns WHERE `status` = :status LIMIT :limit OFFSET :offset")
    Flux<Campaign> findAllByStatus(String status, int limit, int offset);

    @Query("SELECT COUNT(*) FROM campaigns WHERE `status` = :status")
    Mono<Long> countByStatus(String status);

    Flux<Campaign> findAllByManagerId(String managerId);
}
