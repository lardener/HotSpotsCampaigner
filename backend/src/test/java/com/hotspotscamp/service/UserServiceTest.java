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

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.hotspotscamp.entity.User;
import com.hotspotscamp.repository.UserRepository;

import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
        lenient().when(userRepository.findByExternalId(any())).thenReturn(Mono.empty());
        lenient().when(userRepository.findByExternalIdIgnoreCase(any())).thenReturn(Mono.empty());
        lenient().when(userRepository.findByEmail(any())).thenReturn(Mono.empty());
        lenient().when(userRepository.findByEmailIgnoreCase(any())).thenReturn(Mono.empty());
        lenient().when(userRepository.findByDisplayName(any())).thenReturn(Mono.empty());
        lenient().when(userRepository.findByDisplayNameIgnoreCase(any())).thenReturn(Mono.empty());
        lenient().when(userRepository.findById(any(UUID.class))).thenReturn(Mono.empty());
        lenient().when(userRepository.save(any(User.class))).thenAnswer(inv -> Mono.just(inv.getArgument(0, User.class)));
    }

    private User user(UUID id, String externalId, String email, String displayName, String role) {
        return User.builder()
                .id(id)
                .externalId(externalId)
                .email(email)
                .displayName(displayName)
                .role(role)
                .isNew(false)
                .build();
    }

    @Test
    void migratesLegacyUserWhenRawSubMatches() {
        UUID legacyId = UUID.randomUUID();
        String legacySub = "105000000000000000000";
        String auth0Identity = "google-oauth2|" + legacySub;

        User legacy = user(legacyId, legacySub, null, "Commander", "ROLE_AUTHENTICATED");
        User saved = user(legacyId, auth0Identity, "commander@merc.net", "Commander", "ROLE_AUTHENTICATED");

        when(userRepository.findByExternalId(auth0Identity)).thenReturn(Mono.empty());
        when(userRepository.findByExternalId(legacySub)).thenReturn(Mono.just(legacy));
        when(userRepository.save(any(User.class))).thenReturn(Mono.just(saved));

        StepVerifier.create(userService.resolveOrCreateUser(auth0Identity, "ROLE_AUTHENTICATED", "commander@merc.net"))
                .assertNext(u -> {
                    assertEquals(legacyId, u.getId());
                    assertEquals(auth0Identity, u.getExternalId());
                    assertEquals("commander@merc.net", u.getEmail());
                })
                .verifyComplete();
    }

    @Test
    void migratesLegacyUserWhenEmailMatches() {
        UUID legacyId = UUID.randomUUID();
        String legacySub = "105000000000000000000";
        String auth0Identity = "google-oauth2|" + legacySub;

        User legacy = user(legacyId, legacySub, "commander@merc.net", "Commander", "ROLE_AUTHENTICATED");
        User saved = user(legacyId, auth0Identity, "commander@merc.net", "Commander", "ROLE_AUTHENTICATED");

        when(userRepository.findByExternalId(auth0Identity)).thenReturn(Mono.empty());
        when(userRepository.findByEmail("commander@merc.net")).thenReturn(Mono.just(legacy));
        when(userRepository.save(any(User.class))).thenReturn(Mono.just(saved));

        StepVerifier.create(userService.resolveOrCreateUser(auth0Identity, "ROLE_AUTHENTICATED", "Commander@Merc.net"))
                .assertNext(u -> {
                    assertEquals(legacyId, u.getId());
                    assertEquals(auth0Identity, u.getExternalId());
                })
                .verifyComplete();
    }

    @Test
    void migratesLegacyUserWhenEmailPrefixMatchesDisplayNameOrExternalId() {
        UUID legacyId = UUID.randomUUID();
        String auth0Identity = "auth0|65f8a9b1c2d3e4f5a6b7c8d9";
        String email = "desersharkey@gmail.com";

        User legacy = user(legacyId, "desersharkey", null, "desersharkey", "ROLE_AUTHENTICATED");
        User saved = user(legacyId, auth0Identity, email, "desersharkey", "ROLE_AUTHENTICATED");

        when(userRepository.findByExternalId(auth0Identity)).thenReturn(Mono.empty());
        when(userRepository.findByExternalId("desersharkey")).thenReturn(Mono.just(legacy));
        when(userRepository.save(any(User.class))).thenReturn(Mono.just(saved));

        StepVerifier.create(userService.resolveOrCreateUser(auth0Identity, "ROLE_AUTHENTICATED", email))
                .assertNext(u -> {
                    assertEquals(legacyId, u.getId());
                    assertEquals(auth0Identity, u.getExternalId());
                    assertEquals(email, u.getEmail());
                })
                .verifyComplete();
    }

    @Test
    void migratesLegacyUserWhenDisplayNameMatches() {
        UUID legacyId = UUID.randomUUID();
        String auth0Identity = "auth0|desersharkey";

        User legacy = user(legacyId, "old-external-id", null, "desersharkey", "ROLE_AUTHENTICATED");
        User saved = user(legacyId, auth0Identity, null, "desersharkey", "ROLE_AUTHENTICATED");

        when(userRepository.findByExternalId(auth0Identity)).thenReturn(Mono.empty());
        when(userRepository.findByDisplayName("desersharkey")).thenReturn(Mono.just(legacy));
        when(userRepository.save(any(User.class))).thenReturn(Mono.just(saved));

        StepVerifier.create(userService.resolveOrCreateUser(auth0Identity, "ROLE_AUTHENTICATED", null))
                .assertNext(u -> {
                    assertEquals(legacyId, u.getId());
                    assertEquals(auth0Identity, u.getExternalId());
                })
                .verifyComplete();
    }

    @Test
    void createsNewUserWhenNoLegacyMatch() {
        String identity = "auth0|66f1e2c3a4b5c6d7e8f9a0b1";

        when(userRepository.findByExternalId(identity)).thenReturn(Mono.empty());
        when(userRepository.save(any(User.class)))
                .thenAnswer(inv -> Mono.just(inv.getArgument(0, User.class)));

        StepVerifier.create(userService.resolveOrCreateUser(identity, "ROLE_AUTHENTICATED", "newbie@merc.net"))
                .assertNext(u -> {
                    assertNotNull(u.getId());
                    assertEquals(identity, u.getExternalId());
                    assertEquals("newbie@merc.net", u.getEmail());
                    assertEquals("ROLE_AUTHENTICATED", u.getRole());
                })
                .verifyComplete();
    }

    @Test
    void fallsBackToUuidLookupWhenNoEmailProvided() {
        UUID internalId = UUID.randomUUID();
        User invited = user(internalId, null, null, "Guest", "ROLE_INVITED");

        when(userRepository.findByExternalId(internalId.toString())).thenReturn(Mono.empty());
        when(userRepository.findById(internalId)).thenReturn(Mono.just(invited));

        StepVerifier.create(userService.resolveOrCreateUser(internalId.toString()))
                .assertNext(u -> assertEquals(internalId, u.getId()))
                .verifyComplete();
    }

    @Test
    void returnsEmptyForAnonymousIdentity() {
        StepVerifier.create(userService.resolveOrCreateUser("anonymousUser"))
                .verifyComplete();
    }
}
