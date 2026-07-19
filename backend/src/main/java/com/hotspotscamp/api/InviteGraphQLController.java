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
package com.hotspotscamp.api;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.server.ServerWebExchange;

import com.hotspotscamp.service.InviteService;

import graphql.GraphQLContext;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@Controller
@RequiredArgsConstructor
public class InviteGraphQLController {

    private static final Logger log = LoggerFactory.getLogger(InviteGraphQLController.class);

    private final InviteService inviteService;

    @MutationMapping
    public Mono<Boolean> loginWithToken(@Argument String token, GraphQLContext context) {
        log.trace("[TRACE] Entering loginWithToken");
        ServerWebExchange exchange = context.get(ServerWebExchange.class);
        return exchange.getSession()
                .flatMap(session -> inviteService.authenticateViaToken(token, session))
                .doOnTerminate(() -> log.trace("[TRACE] Exiting loginWithToken"));
    }
}
