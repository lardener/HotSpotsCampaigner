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
        return resolveOrCreateUser(identity, role, null);
    }

    /**
     * Resolves an external identity to a User, using a multi-tier lazy migration
     * strategy for legacy users (keyed by raw Google sub, username, display name,
     * or email). When a legacy record is found, its external_id is rewritten to the
     * current identity so the same internal UUID is preserved.
     */
    public Mono<User> resolveOrCreateUser(String identity, String role, String email) {
        log.trace("[TRACE] Starting resolveOrCreateUser: identity={}, role={}, email={}", identity, role, email);
        if (identity == null || identity.isBlank() || identity.equals("anonymousUser")) {
            log.trace("[TRACE] Finished resolveOrCreateUser (anonymous or null)");
            return Mono.empty();
        }

        log.debug("[AUTH] Attempting to resolve identity: {}", identity);
        return userRepository.findByExternalId(identity)
                .doOnNext(u -> {
                    u.setNew(false);
                    log.debug("[AUTH] Found User via External ID: {} (UUID: {})", identity, u.getId());
                })
                .switchIfEmpty(Mono.defer(() -> migrateLegacyUserByIdentity(identity, role, email)))
                .flatMap(user -> {
                    boolean changed = false;
                    if ((user.getRole() == null || user.getRole().isBlank()) && role != null) {
                        log.info("[AUTH] Repairing missing role for user: {}", user.getId());
                        user.setRole(role);
                        changed = true;
                    }
                    if ((user.getEmail() == null || user.getEmail().isBlank()) && email != null && !email.isBlank()) {
                        log.info("[AUTH] Updating missing email for user: {}", user.getId());
                        user.setEmail(email.trim().toLowerCase());
                        changed = true;
                    }
                    if (changed) {
                        user.setNew(false);
                        return userRepository.save(user);
                    }
                    return Mono.just(user);
                })
                .doOnTerminate(() -> log.trace("[TRACE] Finished resolveOrCreateUser: identity={}", identity))
                .switchIfEmpty(Mono.defer(() -> {
                    // Onboarding new users
                    User newUser = User.builder()
                            .id(UUID.randomUUID())
                            .externalId(identity)
                            .email(email != null && !email.isBlank() ? email.trim().toLowerCase() : null)
                            .role(role)
                            .isNew(true)
                            .build();

                    return userRepository.save(Objects.requireNonNull(newUser))
                            .onErrorResume(DuplicateKeyException.class, e -> {
                                log.info("[AUTH] Concurrent registration detected for {}. Falling back to lookup.",
                                        identity);
                                return userRepository.findByExternalId(identity);
                            });
                }));
    }

    /**
     * Legacy migration path: searches for an existing legacy user record using
     * provider-sub stripping, exact/case-insensitive email matching, email
     * prefix matching, display-name matching, and UUID fallback.
     */
    private Mono<User> migrateLegacyUserByIdentity(String identity, String role, String email) {
        return findLegacyCandidate(identity, email)
                .flatMap(user -> {
                    log.info("[AUTH] Migrated legacy user {} (display_name='{}', old_external_id='{}') to identity '{}'",
                            user.getId(), user.getDisplayName(), user.getExternalId(), identity);
                    user.setExternalId(identity);
                    if (email != null && !email.isBlank()) {
                        user.setEmail(email.trim().toLowerCase());
                    }
                    if (user.getRole() == null || user.getRole().isBlank()) {
                        user.setRole(role != null ? role : "ROLE_AUTHENTICATED");
                    }
                    user.setNew(false);
                    return userRepository.save(user);
                });
    }

    private Mono<User> findLegacyCandidate(String identity, String email) {
        Mono<User> lookup = Mono.empty();

        // 1. Raw provider sub match (e.g. google-oauth2|1050000000000 -> 1050000000000)
        if (identity.contains("|")) {
            String rawSub = identity.substring(identity.indexOf('|') + 1).trim();
            if (!rawSub.isBlank()) {
                lookup = lookup.switchIfEmpty(Mono.defer(() -> userRepository.findByExternalId(rawSub)))
                               .switchIfEmpty(Mono.defer(() -> userRepository.findByExternalIdIgnoreCase(rawSub)));
            }
        }

        // 2. Email match (exact and case-insensitive against email and external_id)
        if (email != null && !email.isBlank()) {
            String normalizedEmail = email.trim().toLowerCase();
            lookup = lookup.switchIfEmpty(Mono.defer(() -> userRepository.findByEmail(normalizedEmail)))
                           .switchIfEmpty(Mono.defer(() -> userRepository.findByEmailIgnoreCase(normalizedEmail)))
                           .switchIfEmpty(Mono.defer(() -> userRepository.findByExternalId(normalizedEmail)))
                           .switchIfEmpty(Mono.defer(() -> userRepository.findByExternalIdIgnoreCase(normalizedEmail)));

            // 3. Email username prefix match (e.g. desersharkey@gmail.com -> desersharkey)
            if (normalizedEmail.contains("@")) {
                String prefix = normalizedEmail.substring(0, normalizedEmail.indexOf('@')).trim();
                if (!prefix.isBlank()) {
                    lookup = lookup.switchIfEmpty(Mono.defer(() -> userRepository.findByExternalId(prefix)))
                                   .switchIfEmpty(Mono.defer(() -> userRepository.findByExternalIdIgnoreCase(prefix)))
                                   .switchIfEmpty(Mono.defer(() -> userRepository.findByDisplayName(prefix)))
                                   .switchIfEmpty(Mono.defer(() -> userRepository.findByDisplayNameIgnoreCase(prefix)));
                }
            }
        }

        // 4. Suffix / Identity match against display name and external ID
        if (identity.contains("|")) {
            String suffix = identity.substring(identity.indexOf('|') + 1).trim();
            if (!suffix.isBlank()) {
                lookup = lookup.switchIfEmpty(Mono.defer(() -> userRepository.findByDisplayName(suffix)))
                               .switchIfEmpty(Mono.defer(() -> userRepository.findByDisplayNameIgnoreCase(suffix)))
                               .switchIfEmpty(Mono.defer(() -> userRepository.findByExternalIdIgnoreCase(suffix)));
            }
        }

        lookup = lookup.switchIfEmpty(Mono.defer(() -> userRepository.findByDisplayName(identity)))
                       .switchIfEmpty(Mono.defer(() -> userRepository.findByDisplayNameIgnoreCase(identity)))
                       .switchIfEmpty(Mono.defer(() -> userRepository.findByExternalIdIgnoreCase(identity)))
                       .switchIfEmpty(Mono.defer(() -> findByUuidIfApplicable(identity)));

        return lookup.doOnNext(u -> u.setNew(false));
    }

    private Mono<User> findByUuidIfApplicable(String identity) {
        if (!identity.contains("-") || identity.length() != 36) {
            return Mono.empty();
        }
        log.debug("[AUTH] Identity not found in external_id, checking internal UUIDs for: {}", identity);
        try {
            return userRepository.findById(Objects.requireNonNull(UUID.fromString(identity)))
                    .doOnNext(u -> u.setNew(false));
        } catch (IllegalArgumentException e) {
            return Mono.empty();
        }
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
