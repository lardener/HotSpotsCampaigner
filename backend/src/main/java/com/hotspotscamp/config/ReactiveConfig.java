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
package com.hotspotscamp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.hotspotscamp.entity.MercenaryCommand;

import reactor.core.publisher.Sinks;

@Configuration
public class ReactiveConfig {

    /**
     * Multicast sink for broadcasting MercenaryCommand updates to
     * WebSocket/GraphQL subscribers. Defined as a standalone bean to avoid
     * circular dependencies between services.
     */
    @Bean
    public Sinks.Many<MercenaryCommand> commandSink() {
        return Sinks.many().multicast().directBestEffort();
    }
}
