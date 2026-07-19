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
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import com.hotspotscamp.entity.ContractAssignment;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Reactive repository for managing detachment contract assignments per month.
 */
@Repository
public interface ContractAssignmentRepository extends ReactiveCrudRepository<ContractAssignment, UUID> {

    Flux<ContractAssignment> findAllByDetachmentId(UUID detachmentId);

    Flux<ContractAssignment> findAllByContractId(UUID contractId);

    Mono<ContractAssignment> findByDetachmentIdAndMonthIndex(UUID detachmentId, Integer monthIndex);
}
