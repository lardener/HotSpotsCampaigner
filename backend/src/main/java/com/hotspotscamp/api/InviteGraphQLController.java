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
