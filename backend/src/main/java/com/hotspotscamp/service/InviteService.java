package com.hotspotscamp.service;

import com.hotspotscamp.entity.CampaignInvite;
import com.hotspotscamp.entity.User;
import com.hotspotscamp.repository.CampaignInviteRepository;
import com.hotspotscamp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InviteService {

    private final CampaignInviteRepository inviteRepository;
    private final UserRepository userRepository;

    public Mono<CampaignInvite> generateInvite(UUID campaignId) {
        String token = RandomStringUtils.randomAlphanumeric(12).toUpperCase();
        return inviteRepository.save(CampaignInvite.builder()
                .id(UUID.randomUUID())
                .campaignId(campaignId)
                .token(token)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .used(false)
                .build());
    }

    public Mono<User> loginWithToken(String token, String displayName) {
        return inviteRepository.findByToken(token)
                .filter(invite -> !invite.isUsed() && invite.getExpiresAt().isAfter(LocalDateTime.now()))
                .switchIfEmpty(Mono.error(new RuntimeException("Invalid or expired token")))
                .flatMap(invite -> {
                    // Identity-as-Invite: We hash the token to create a consistent user ID for this invite
                    UUID userId = UUID.nameUUIDFromBytes(token.getBytes());
                    return userRepository.findById(userId)
                            .switchIfEmpty(userRepository.save(User.builder()
                                    .id(userId)
                                    .displayName(displayName)
                                    .role("ROLE_INVITED")
                                    .isNew(true)
                                    .build()))
                            .flatMap(user -> {
                                // Mark used? Optionally allow reuse for "device switching" as per README
                                return Mono.just(user);
                            });
                });
    }
}
