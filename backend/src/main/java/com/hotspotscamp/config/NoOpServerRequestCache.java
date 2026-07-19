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

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.web.server.savedrequest.ServerRequestCache;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.URI;

public class NoOpServerRequestCache implements ServerRequestCache {

    private static final NoOpServerRequestCache INSTANCE = new NoOpServerRequestCache();

    public static NoOpServerRequestCache getInstance() {
        return INSTANCE;
    }

    @Override
    public Mono<Void> saveRequest(ServerWebExchange exchange) {
        return Mono.empty();
    }

    @Override
    public Mono<URI> getRedirectUri(ServerWebExchange exchange) {
        return Mono.empty();
    }

    @Override
    public Mono<ServerHttpRequest> removeMatchingRequest(ServerWebExchange exchange) {
        return Mono.empty();
    }
}
