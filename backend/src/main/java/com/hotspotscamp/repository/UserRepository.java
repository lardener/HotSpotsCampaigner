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

import com.hotspotscamp.entity.User;

import reactor.core.publisher.Mono;

@Repository
public interface UserRepository extends ReactiveCrudRepository<User, UUID> {

    Mono<User> findByExternalId(String externalId);

    Mono<User> findByEmail(String email);

    @Query("SELECT * FROM app_users WHERE LOWER(external_id) = LOWER(:externalId) LIMIT 1")
    Mono<User> findByExternalIdIgnoreCase(String externalId);

    @Query("SELECT * FROM app_users WHERE LOWER(email) = LOWER(:email) LIMIT 1")
    Mono<User> findByEmailIgnoreCase(String email);

    @Query("SELECT * FROM app_users WHERE display_name = :displayName LIMIT 1")
    Mono<User> findByDisplayName(String displayName);

    @Query("SELECT * FROM app_users WHERE LOWER(display_name) = LOWER(:displayName) LIMIT 1")
    Mono<User> findByDisplayNameIgnoreCase(String displayName);
}

