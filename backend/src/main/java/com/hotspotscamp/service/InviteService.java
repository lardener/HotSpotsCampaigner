package com.hotspotscamp.service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.UUID;

import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.security.web.server.context.WebSessionServerSecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ServerWebExchange;

import com.hotspotscamp.entity.CampaignInvite;
import com.hotspotscamp.entity.User;
import com.hotspotscamp.repository.CampaignInviteRepository;
import com.hotspotscamp.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class InviteService {

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
    public Mono<Boolean> authenticateViaToken(String token, ServerWebExchange exchange) {
        return inviteRepository.findByToken(token)
                .filter(invite -> invite.getExpiresAt().isAfter(LocalDateTime.now()))
                .switchIfEmpty(Mono.error(new RuntimeException("INVALID OR EXPIRED INVITATION KEY")))
                .flatMap(invite -> {
                    return userRepository.findByExternalId(token)
                            .switchIfEmpty(Mono.defer(() -> userRepository.save(User.builder()
                            .id(UUID.randomUUID())
                            .externalId(token)
                            .displayName("Mercenary Commander")
                            .role("ROLE_INVITED")
                            .isNew(true)
                            .build())))
                            .flatMap(user -> {
                                var authorities = Collections.singletonList(new SimpleGrantedAuthority(user.getRole()));
                                var auth = new UsernamePasswordAuthenticationToken(user.getExternalId(), null, authorities);
                                var securityContext = new SecurityContextImpl(auth);

                                WebSessionServerSecurityContextRepository repo = new WebSessionServerSecurityContextRepository();
                                return repo.save(exchange, securityContext).thenReturn(true);
                            });
                });
    }
}
