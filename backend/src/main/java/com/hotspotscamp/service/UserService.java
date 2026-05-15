package com.hotspotscamp.service;

import com.hotspotscamp.entity.User;
import com.hotspotscamp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /**
     * Resolves an external identity (Google Sub or UUID string) to an internal
     * User entity. If the user is authenticated via Google but has no record,
     * one is created.
     */
    public Mono<User> resolveOrCreateUser(String identity) {
        return userRepository.findByExternalId(identity)
                .switchIfEmpty(Mono.defer(() -> {
                    try {
                        return userRepository.findById(UUID.fromString(identity));
                    } catch (IllegalArgumentException e) {
                        return Mono.empty();
                    }
                }))
                .switchIfEmpty(Mono.defer(() -> {
                    // Onboarding new Google users
                    return userRepository.save(User.builder()
                            .id(UUID.randomUUID())
                            .externalId(identity)
                            .role("ROLE_AUTHENTICATED")
                            .isNew(true)
                            .build());
                }));
    }

    /**
     * Upgrades an invited user to an authenticated manager.
     */
    public Mono<User> upgradeToManager(UUID userId, String externalId, String email) {
        return userRepository.findById(userId)
                .flatMap(user -> {
                    user.setExternalId(externalId);
                    user.setEmail(email);
                    user.setRole("ROLE_AUTHENTICATED");
                    return userRepository.save(user);
                });
    }
}
