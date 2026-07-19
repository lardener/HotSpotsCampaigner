/*
 * HotSpots Campaigner - Battletech Mercenaries campaign management SaaS.
 * Copyright (C) 2026 Jose Ferrer
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
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

    Flux<Campaign> findAllByManagerIdAndStatus(String managerId, String status);

}
