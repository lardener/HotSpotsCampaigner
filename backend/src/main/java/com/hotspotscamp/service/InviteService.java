package com.hotspotscamp.service;

import java.time.LocalDateTime;
import java.util.Collections;
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

    public Mono<CampaignInvite> generateInvite(UUID campaignId) {
        String token = RandomStringUtils.secure().nextAlphanumeric(12).toUpperCase();
        return inviteRepository.save(CampaignInvite.builder()
                .id(UUID.randomUUID())
                .campaignId(campaignId)
                .token(token)
                .expiresAt(LocalDateTime.now().plusDays(7))
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
        log.info("[AUTH] Attempting login with token: {}", normalizedToken);

        return inviteRepository.findByToken(normalizedToken)
                .flatMap(invite -> {
                    if (invite.getExpiresAt() != null && invite.getExpiresAt().isBefore(LocalDateTime.now())) {
                        log.warn("[AUTH] Token {} expired at {}", normalizedToken, invite.getExpiresAt());
                        return Mono.error(new RuntimeException("INVALID OR EXPIRED INVITATION KEY"));
                    }
                    return Mono.just(invite);
                })
                .switchIfEmpty(Mono.defer(() -> {
                    log.warn("[AUTH] Token not found in database: {}", normalizedToken);
                    return Mono.error(new RuntimeException("INVALID OR EXPIRED INVITATION KEY"));
                }))
                .flatMap(invite -> {
                    return userRepository.findByExternalId(normalizedToken)
                            .switchIfEmpty(Mono.defer(() -> userRepository.save(User.builder()
                            .id(UUID.randomUUID())
                            .externalId(normalizedToken)
                            .displayName("Mercenary Commander")
                            .role("ROLE_INVITED")
                            .isNew(true)
                            .build())))
                            .flatMap(user -> {
                                var authorities = Collections.singletonList(new SimpleGrantedAuthority(user.getRole()));
                                var auth = new UsernamePasswordAuthenticationToken(user.getExternalId(), null, authorities);
                                var securityContext = new SecurityContextImpl(auth);

                                session.getAttributes().put("SPRING_SECURITY_CONTEXT", securityContext);
                                return session.changeSessionId().thenReturn(true);
                            });
                });
    }
}
