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
