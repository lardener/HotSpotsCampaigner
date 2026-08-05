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

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HexFormat;
import java.util.Objects;
import java.util.UUID;

import org.apache.commons.lang3.RandomStringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.stereotype.Service;
import org.springframework.web.server.WebSession;

import com.hotspotscamp.entity.CampaignInvite;
import com.hotspotscamp.entity.User;
import com.hotspotscamp.repository.CampaignInviteRepository;
import com.hotspotscamp.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class InviteService {

    private static final Logger log = LoggerFactory.getLogger(InviteService.class);

    public static final String AUTO_JOIN_RECIPIENT_PREFIX = "AUTO:";

    private final CampaignInviteRepository inviteRepository;
    private final UserRepository userRepository;

    public Mono<CampaignInvite> generateInvite(UUID campaignId, String recipientName) {
        log.trace("[TRACE] Starting generateInvite: campaignId={}, recipient={}", campaignId, recipientName);
        String rawToken = RandomStringUtils.secure().nextAlphanumeric(12).toUpperCase();
        String hashedToken = hashToken(rawToken);
        LocalDateTime expiry = LocalDateTime.now().plusDays(7);

        return inviteRepository.save(Objects.requireNonNull(CampaignInvite.builder()
                .id(UUID.randomUUID())
                .campaignId(campaignId)
                .token(hashedToken)
                .recipientName(recipientName)
                .expiresAt(expiry)
                .used(false)
                .build()))
                .map(saved -> CampaignInvite.builder()
                .id(saved.getId())
                .campaignId(campaignId)
                .token(rawToken)
                .recipientName(recipientName)
                .expiresAt(expiry)
                .used(false)
                .build())
                .doOnNext(invite -> log.debug("[INVITE] Generated invite for campaign {}: recipient='{}', tokenHash={}, expiresAt={}",
                campaignId, recipientName, hashedToken.substring(0, 8) + "...", expiry))
                .doOnTerminate(() -> log.trace("[TRACE] Finished generateInvite"));
    }

    /**
     * Authenticates a user based on an invitation token and establishes a
     * session. The token serves as the external identity for the user.
     */
    public Mono<Boolean> authenticateViaToken(String token, WebSession session) {
        log.trace("[TRACE] Starting authenticateViaToken");
        if (token == null || token.isBlank()) {
            return Mono.error(new RuntimeException("INVITATION KEY IS REQUIRED"));
        }

        String normalizedToken = token.trim().toUpperCase();
        String hashedToken = hashToken(normalizedToken);
        log.info("[AUTH] Attempting login with invitation token hash: {}", hashedToken.substring(0, 8) + "...");

        return inviteRepository.findByToken(hashedToken)
                .flatMap(invite -> {
                    // Security check: ensure token isn't expired (with 5-min buffer for clock drift)
                    if (invite.getExpiresAt() != null && invite.getExpiresAt().isBefore(LocalDateTime.now().minusMinutes(5))) {
                        log.warn("[AUTH] Token hash {} expired at {}", hashedToken.substring(0, 8), invite.getExpiresAt());
                        return Mono.error(new RuntimeException("INVALID OR EXPIRED INVITATION KEY"));
                    }
                    return Mono.just(invite);
                })
                .switchIfEmpty(Mono.defer(() -> {
                    log.error("[AUTH] Token hash not found in DB: {}. Check if column 'token' is VARCHAR(64).", hashedToken.substring(0, 8));
                    return Mono.error(new RuntimeException("INVALID OR EXPIRED INVITATION KEY"));
                }))
                .flatMap(invite -> {
                    // Identity resolution: link token hash to a persistent user
                    return userRepository.findByExternalId(invite.getToken())
                            .switchIfEmpty(Mono.defer(() -> {
                                User newUser = java.util.Objects.requireNonNull(User.builder()
                                        .id(UUID.randomUUID())
                                        .externalId(invite.getToken())
                                        .displayName("Mercenary Commander")
                                        .role("ROLE_INVITED")
                                        .isNew(true)
                                        .build());
                                return userRepository.save(newUser);
                            }))
                            .flatMap(u -> {
                                var authorities = Collections.singletonList(new SimpleGrantedAuthority(u.getRole()));
                                var auth = new UsernamePasswordAuthenticationToken(u.getExternalId(), null, authorities);
                                var securityContext = new SecurityContextImpl(auth);

                                session.getAttributes().put("SPRING_SECURITY_CONTEXT", securityContext);
                                return session.changeSessionId().thenReturn(true);
                            });
                })
                .doOnTerminate(() -> log.trace("[TRACE] Finished authenticateViaToken"));
    }

    public Mono<CampaignInvite> validateAndConsumeInvite(String token) {
        log.trace("[TRACE] Starting validateAndConsumeInvite");
        String normalizedToken = token.trim().toUpperCase();
        String hashedToken = hashToken(normalizedToken);

        return inviteRepository.findByToken(hashedToken)
                .flatMap(invite -> {
                    if (Boolean.TRUE.equals(invite.getUsed())) {
                        return Mono.error(new RuntimeException("INVITATION KEY HAS ALREADY BEEN USED"));
                    }
                    if (invite.getExpiresAt() != null && invite.getExpiresAt().isBefore(LocalDateTime.now())) {
                        return Mono.error(new RuntimeException("INVITATION KEY HAS EXPIRED"));
                    }
                    return inviteRepository.save(Objects.requireNonNull(invite.toBuilder()
                            .used(true)
                            .expiresAt(LocalDateTime.now().plusYears(1))
                            .isNew(false)
                            .build()));
                })
                .switchIfEmpty(Mono.error(new RuntimeException("INVALID INVITATION KEY")))
                .doOnTerminate(() -> log.trace("[TRACE] Finished validateAndConsumeInvite"));
    }

    /**
     * Generates an automated join token for a campaign. These tokens are
     * short-lived (5 minutes) and tied to an authenticated user. The recipient
     * name is prefixed with "AUTO:" to distinguish from manual invites.
     *
     * @param campaignId the campaign to generate a join token for
     * @param userId the authenticated user generating the token
     * @return a Mono emitting the generated CampaignInvite with the raw token
     */
    public Mono<CampaignInvite> autoGenerateJoinToken(UUID campaignId, String userId) {
        log.trace("[TRACE] Starting autoGenerateJoinToken: campaignId={}, userId={}", campaignId, userId);
        if (campaignId == null) {
            return Mono.error(new IllegalArgumentException("Campaign ID is required"));
        }
        if (userId == null || userId.isBlank()) {
            return Mono.error(new IllegalArgumentException("User ID is required"));
        }

        String rawToken = RandomStringUtils.secure().nextAlphanumeric(12).toUpperCase();
        String hashedToken = hashToken(rawToken);
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(5); // 5 minutes validity
        String autoRecipient = AUTO_JOIN_RECIPIENT_PREFIX + userId;

        return inviteRepository.save(Objects.requireNonNull(CampaignInvite.builder()
                .id(UUID.randomUUID())
                .campaignId(campaignId)
                .token(hashedToken)
                .recipientName(autoRecipient)
                .expiresAt(expiry)
                .used(false)
                .build()))
                .map(saved -> CampaignInvite.builder()
                .id(saved.getId())
                .campaignId(campaignId)
                .token(rawToken)
                .recipientName(autoRecipient)
                .expiresAt(expiry)
                .used(false)
                .build())
                .doOnNext(invite -> log.debug("[AUTO-JOIN] Generated auto-join token for campaign {}: recipient='{}', tokenHash={}, expiresAt={}",
                campaignId, autoRecipient, hashedToken.substring(0, 8) + "...", expiry))
                .doOnTerminate(() -> log.trace("[TRACE] Finished autoGenerateJoinToken"));
    }

    /**
     * Finds and deletes an auto-generated join token by its raw value. Used
     * when a user cancels before joining.
     *
     * @param token the raw token to cancel
     * @return true if the token was found and deleted, false otherwise
     */
    public Mono<Boolean> cancelAutoJoinToken(String token) {
        log.trace("[TRACE] Starting cancelAutoJoinToken");
        if (token == null || token.isBlank()) {
            return Mono.just(false);
        }

        String normalizedToken = token.trim().toUpperCase();
        String hashedToken = hashToken(normalizedToken);

        return inviteRepository.findByToken(hashedToken)
                .flatMap(invite -> {
                    // Only cancel tokens that are auto-generated and unused
                    if (invite.getRecipientName() != null
                            && invite.getRecipientName().startsWith(AUTO_JOIN_RECIPIENT_PREFIX)
                            && !Boolean.TRUE.equals(invite.getUsed())) {
                        log.info("[AUTO-JOIN] Canceling auto-join token for campaign {}", invite.getCampaignId());
                        return inviteRepository.delete(invite).then(Mono.just(true));
                    }
                    log.warn("[AUTO-JOIN] Attempted to cancel non-auto or already-used token");
                    return Mono.just(false);
                })
                .switchIfEmpty(Mono.defer(() -> {
                    log.debug("[AUTO-JOIN] Token not found in DB, nothing to cancel");
                    return Mono.just(false);
                }))
                .doOnTerminate(() -> log.trace("[TRACE] Finished cancelAutoJoinToken"));
    }

    private String hashToken(String token) {
        log.trace("[TRACE] Starting hashToken");
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedHash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            String result = HexFormat.of().withUpperCase().formatHex(encodedHash);
            log.trace("[TRACE] Finished hashToken");
            return result;
        } catch (NoSuchAlgorithmException e) {

            log.error("SHA-256 algorithm not found", e);
            log.trace("[TRACE] Finished hashToken (Error)");
            throw new RuntimeException("CRITICAL: SECURITY CONFIGURATION ERROR");
        }
    }
}
