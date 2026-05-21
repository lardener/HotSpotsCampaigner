package com.hotspotscamp.api;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;

import com.hotspotscamp.service.UserService;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@Controller
@RequiredArgsConstructor
public class UserGraphQLController {

    private final UserService userService;

    @QueryMapping
    public Mono<UserProfile> userProfile(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return Mono.empty();
        }

        // Resolve the user to get the internal DB UUID
        return userService.resolveOrCreateUser(principal.getName())
                .map(user -> new UserProfile(
                user.getId().toString(),
                principal.getAttribute("name") != null ? principal.getAttribute("name").toString() : "Mercenary Commander",
                principal.getAttribute("email") != null ? principal.getAttribute("email").toString() : "unknown@merc.net",
                user.getDisplayName()
        ));
    }

    @MutationMapping
    public Mono<UserProfile> updateUserProfile(@Argument String displayName, @AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return Mono.empty();
        }
        return userService.updateDisplayName(principal.getName(), displayName)
                .map(user -> new UserProfile(
                user.getId().toString(),
                principal.getAttribute("name") != null ? principal.getAttribute("name").toString() : "Mercenary Commander",
                principal.getAttribute("email") != null ? principal.getAttribute("email").toString() : "unknown@merc.net",
                user.getDisplayName()
        ));
    }

    public record UserProfile(String id, String name, String email, String displayName) {

    }
}
