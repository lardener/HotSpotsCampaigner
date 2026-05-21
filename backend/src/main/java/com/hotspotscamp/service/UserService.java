package com.hotspotscamp.service;

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
        log.info("[AUTH] Attempting to resolve identity: {}", identity);
        return userRepository.findByExternalId(identity)
                .doOnNext(u -> log.info("[AUTH] Found User via External ID: {} (UUID: {})", identity, u.getId()))
                .switchIfEmpty(Mono.defer(() -> {
                    log.info("[AUTH] Identity not found in external_id, checking internal UUIDs for: {}", identity);
                    try {
                        return userRepository.findById(UUID.fromString(identity));
                    } catch (IllegalArgumentException e) {
                        log.warn("[AUTH] Identity '{}' is not a valid UUID format.", identity);
                        return Mono.empty();
                    }
                }))
                .switchIfEmpty(Mono.defer(() -> {
                    // Onboarding new Google users
                    User newUser = User.builder()
                            .id(UUID.randomUUID())
                            .externalId(identity)
                            .role("ROLE_AUTHENTICATED")
                            .isNew(true)
                            .build();

                    return userRepository.save(newUser)
                            .onErrorResume(DuplicateKeyException.class, e -> {
                                log.info("[AUTH] Concurrent registration detected for {}. Falling back to lookup.", identity);
                                return userRepository.findByExternalId(identity);
                            });
                }));
    }

    public Mono<User> updateDisplayName(String identity, String displayName) {
        return resolveOrCreateUser(identity)
                .flatMap(user -> {
                    user.setDisplayName(displayName);
                    user.setNew(false);
                    return userRepository.save(user);
                });
    }

    /**
     * Upgrades an invited user to an authenticated manager.
     */
    public Mono<User> upgradeToManager(UUID userId, String externalId, String email) {
        return userRepository.findById(userId)
                .flatMap(user -> {
                    user.setNew(false);
                    user.setExternalId(externalId);
                    user.setEmail(email);
                    user.setRole("ROLE_AUTHENTICATED");
                    return userRepository.save(user)
                            .onErrorResume(DuplicateKeyException.class, e -> userRepository.findById(userId));
                });
    }
}
