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

    private final CampaignInviteRepository inviteRepository;
    private final UserRepository userRepository;

    public Mono<CampaignInvite> generateInvite(UUID campaignId, String recipientName) {
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
                .build());
    }

    /**
     * Authenticates a user based on an invitation token and establishes a
     * session. The token serves as the external identity for the user.
     */
    public Mono<Boolean> authenticateViaToken(String token, WebSession session) {
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
                });
    }

    public Mono<CampaignInvite> validateAndConsumeInvite(String token) {
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
                    return inviteRepository.save(Objects.requireNonNull(invite.toBuilder().used(true).isNew(false).build()));
                })
                .switchIfEmpty(Mono.error(new RuntimeException("INVALID INVITATION KEY")));
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedHash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().withUpperCase().formatHex(encodedHash);
        } catch (NoSuchAlgorithmException e) {

            log.error("SHA-256 algorithm not found", e);
            throw new RuntimeException("CRITICAL: SECURITY CONFIGURATION ERROR");
        }
    }
}
