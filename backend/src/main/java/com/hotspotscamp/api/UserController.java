package com.hotspotscamp.api;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.hotspotscamp.entity.UserProfile;

import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    @GetMapping("/profile")
    public Mono<UserProfile> getUserProfile() {
        return ReactiveSecurityContextHolder.getContext()
                .filter(c -> c.getAuthentication() != null)
                .map(SecurityContext::getAuthentication)
                .map(authentication -> {
                    log.info("Fetching profile for user: {}", authentication.getName());
                    Object principal = authentication.getPrincipal();

                    if (principal instanceof OAuth2User oAuth2User) {
                        String email = oAuth2User.getAttribute("email") != null ? oAuth2User.getAttribute("email").toString() : "";
                        String name = oAuth2User.getAttribute("name") != null ? oAuth2User.getAttribute("name").toString() : email;
                        log.debug("OAuth2 profile resolved: {}", email);
                        return new UserProfile(email, name);
                    } else {
                        String email = authentication.getName();
                        log.warn("Non-OAuth2 principal detected: {}. Falling back to default profile.", email);
                        return new UserProfile(email, "Guest User");
                    }
                })
                .switchIfEmpty(Mono.defer(() -> {
                    log.warn("Security context is empty - user is not authenticated.");
                    return Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User session not found"));
                }))
                .doOnError(e -> log.error("User profile retrieval failed: {}", e.getMessage()));
    }
}
