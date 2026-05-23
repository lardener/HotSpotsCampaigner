package com.hotspotscamp.api;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.server.ServerWebExchange;

import com.hotspotscamp.service.InviteService;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@Controller
@RequiredArgsConstructor
public class InviteGraphQLController {

    private final InviteService inviteService;

    @MutationMapping
    public Mono<Boolean> loginWithToken(@Argument String token, ServerWebExchange exchange) {
        return inviteService.authenticateViaToken(token, exchange);
    }
}
