package com.hotspotscamp.api;

import java.util.Map;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @GetMapping("/profile")
    public Mono<Map<String, String>> getProfile(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return Mono.empty();
        }

        // Google OAuth2 users typically provide 'name' and 'email' attributes
        return Mono.just(Map.of(
                "name", principal.getAttribute("name") != null ? principal.getAttribute("name") : "Mercenary Commander",
                "email", principal.getAttribute("email") != null ? principal.getAttribute("email") : "unknown@merc.net"
        ));
    }
}
