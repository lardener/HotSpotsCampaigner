package com.hotspotscamp.api;

import java.util.Map;

import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;

import reactor.core.publisher.Mono;

@Controller
public class UserGraphQLController {

    @QueryMapping
    public Mono<Map<String, String>> userProfile(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return Mono.empty();
        }

        // Mirroring logic from legacy UserController
        return Mono.just(Map.of(
                "name", principal.getAttribute("name") != null
                ? principal.getAttribute("name").toString()
                : "Mercenary Commander",
                "email", principal.getAttribute("email") != null
                ? principal.getAttribute("email").toString()
                : "unknown@merc.net"
        ));
    }
}
