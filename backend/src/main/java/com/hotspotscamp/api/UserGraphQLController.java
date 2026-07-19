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

import java.security.Principal;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;

import com.hotspotscamp.service.UserService;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@Controller
@RequiredArgsConstructor
public class UserGraphQLController {

    private static final Logger log = LoggerFactory.getLogger(UserGraphQLController.class);

    private final UserService userService;

    @QueryMapping
    public Mono<UserProfile> userProfile(Principal principal) {
        log.trace("[TRACE] Entering userProfile");
        String identity = resolveIdentity(principal);
        if (identity == null || identity.equals("anonymousUser")) {
            log.trace("[TRACE] Exiting userProfile (anonymous)");
            // Gracefully return empty for anonymous users to avoid triggering security exceptions
            return Mono.empty();
        }

        // Resolve the user to get the internal DB UUID
        return userService.resolveOrCreateUser(identity)
                .map(user -> {
                    String name = "Mercenary Commander";
                    String email = "unknown@merc.net";

                    // Safely extract attributes regardless of the principal wrapper
                    OAuth2User oauth2User = null;
                    if (principal instanceof OAuth2User o) {
                        oauth2User = o;
                    } else if (principal instanceof Authentication auth && auth.getPrincipal() instanceof OAuth2User o) {
                        oauth2User = o;
                    }

                    if (oauth2User != null) {
                        Map<String, Object> attrs = oauth2User.getAttributes();
                        name = attrs.getOrDefault("name", name).toString();
                        email = attrs.getOrDefault("email", email).toString();
                    }

                    return new UserProfile(
                            user.getId().toString(),
                            name,
                            email,
                            user.getDisplayName(),
                            user.getRole()
                    );
                })
                .doOnTerminate(() -> log.trace("[TRACE] Exiting userProfile"));
    }

    @MutationMapping
    public Mono<UserProfile> updateUserProfile(@Argument String displayName, Principal principal) {
        log.trace("[TRACE] Entering updateUserProfile: displayName={}", displayName);
        if (principal == null) {
            log.trace("[TRACE] Exiting updateUserProfile (null principal)");
            return Mono.empty();
        }

        return userService.updateDisplayName(resolveIdentity(principal), displayName)
                .flatMap(user -> userProfile(principal))
                .doOnTerminate(() -> log.trace("[TRACE] Exiting updateUserProfile"));
    }

    private String resolveIdentity(Object principal) {
        log.trace("[TRACE] Entering resolveIdentity");
        if (principal == null) {
            return null;
        }

        // 1. Handle OAuth2User (often injected via @AuthenticationPrincipal)
        if (principal instanceof OAuth2User o) {
            return o.getName();
        }

        // 2. Handle Authentication objects (Spring Security wrapper)
        if (principal instanceof Authentication auth) {
            if (auth instanceof AnonymousAuthenticationToken) {
                return null;
            }
            Object innerPrincipal = auth.getPrincipal();
            if (innerPrincipal instanceof OAuth2User o) {
                return o.getName();
            }
            return auth.getName();
        }

        // 3. Handle raw Principal (Standard Java Security)
        if (principal instanceof Principal p) {
            String name = p.getName();
            return "anonymousUser".equals(name) ? null : name;
        }

        // 4. Handle raw Identity Strings (Invite-as-Identity flow)
        if (principal instanceof String s) {
            return s.equals("anonymousUser") ? null : s;
        }

        log.trace("[TRACE] Exiting resolveIdentity");
        return null;
    }

    public record UserProfile(String id, String name, String email, String displayName, String role) {

    }
}
