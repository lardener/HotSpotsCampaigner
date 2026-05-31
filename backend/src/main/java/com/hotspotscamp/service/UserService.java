package com.hotspotscamp.service;

import java.util.Objects;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import com.hotspotscamp.entity.User;
import com.hotspotscamp.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;

    /**
     * Resolves an external identity (Google Sub or UUID string) to an internal
     * User entity. If the user is authenticated via Google but has no record,
     * one is created.
     */
    public Mono<User> resolveOrCreateUser(String identity) {
        log.trace("[TRACE] Starting resolveOrCreateUser: identity={}", identity);
        return resolveOrCreateUser(identity, "ROLE_AUTHENTICATED")
                .doOnTerminate(() -> log.trace("[TRACE] Finished resolveOrCreateUser: identity={}", identity));
    }

    /**
     * Overloaded to allow specifying the initial role for new users.
     */
    public Mono<User> resolveOrCreateUser(String identity, String role) {
        log.trace("[TRACE] Starting resolveOrCreateUser: identity={}, role={}", identity, role);
        if (identity == null || identity.isBlank() || identity.equals("anonymousUser")) {
            log.trace("[TRACE] Finished resolveOrCreateUser (anonymous or null)");
            return Mono.empty();
        }

        log.info("[AUTH] Attempting to resolve identity: {}", identity);
        return userRepository.findByExternalId(identity)
                .doOnNext(u -> log.info("[AUTH] Found User via External ID: {} (UUID: {})", identity, u.getId()))
                .switchIfEmpty(Mono.defer(() -> {
                    if (!identity.contains("-") || identity.length() != 36) {
                        return Mono.empty();
                    }
                    log.info("[AUTH] Identity not found in external_id, checking internal UUIDs for: {}", identity);
                    try {
                        return userRepository.findById(Objects.requireNonNull(UUID.fromString(identity)));
                    } catch (IllegalArgumentException e) {
                        return Mono.empty();
                    }
                }))
                .flatMap(user -> {
                    if (user.getRole() == null || user.getRole().isBlank()) {
                        log.info("[AUTH] Repairing missing role for user: {}", user.getId());
                        user.setRole(role);
                        return userRepository.save(user);
                    }
                    return Mono.just(user);
                })
                .doOnTerminate(() -> log.trace("[TRACE] Finished resolveOrCreateUser: identity={}", identity))
                .switchIfEmpty(Mono.defer(() -> {
                    // Onboarding new Google users
                    User newUser = User.builder()
                            .id(UUID.randomUUID())
                            .externalId(identity)
                            .role(role)
                            .isNew(true)
                            .build();

                    return userRepository.save(Objects.requireNonNull(newUser))
                            .onErrorResume(DuplicateKeyException.class, e -> {
                                log.info("[AUTH] Concurrent registration detected for {}. Falling back to lookup.", identity);
                                return userRepository.findByExternalId(identity);
                            });
                }));
    }

    public Mono<User> updateDisplayName(String identity, String displayName) {
        log.trace("[TRACE] Starting updateDisplayName: identity={}, displayName={}", identity, displayName);
        return resolveOrCreateUser(identity)
                .flatMap(user -> {
                    user.setDisplayName(displayName);
                    user.setNew(false);
                    return userRepository.save(user);
                })
                .doOnTerminate(() -> log.trace("[TRACE] Finished updateDisplayName: identity={}", identity));
    }

    /**
     * Upgrades an invited user to an authenticated manager.
     */
    public Mono<User> upgradeToManager(UUID userId, String externalId, String email) {
        log.trace("[TRACE] Starting upgradeToManager: userId={}, externalId={}", userId, externalId);
        return userRepository.findById(Objects.requireNonNull(userId))
                .flatMap(user -> {
                    user.setNew(false);
                    user.setExternalId(externalId);
                    user.setEmail(email);
                    user.setRole("ROLE_AUTHENTICATED");
                    return userRepository.save(user)
                            .onErrorResume(DuplicateKeyException.class, e -> userRepository.findById(userId));
                })
                .doOnTerminate(() -> log.trace("[TRACE] Finished upgradeToManager: userId={}", userId));
    }
}
