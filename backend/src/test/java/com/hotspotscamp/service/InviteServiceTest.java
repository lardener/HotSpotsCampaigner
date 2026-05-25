package com.hotspotscamp.service;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.server.MockWebSession;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.web.server.WebSession;

import com.hotspotscamp.entity.CampaignInvite;
import com.hotspotscamp.entity.User;
import com.hotspotscamp.repository.CampaignInviteRepository;
import com.hotspotscamp.repository.UserRepository;

import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

@ExtendWith(MockitoExtension.class)
public class InviteServiceTest {

    @Mock
    private CampaignInviteRepository inviteRepository;

    @Mock
    private UserRepository userRepository;

    private InviteService inviteService;

    @BeforeEach
    void setUp() {
        inviteService = new InviteService(inviteRepository, userRepository);
    }

    @Test
    void testGenerateInvite_ShouldSaveHashedTokenAndReturnRaw() {
        UUID campaignId = UUID.randomUUID();
        when(inviteRepository.save(any(CampaignInvite.class))).thenAnswer(i -> Mono.just(i.getArgument(0)));

        StepVerifier.create(inviteService.generateInvite(campaignId, "Test Pilot"))
                .assertNext(invite -> {
                    // The returned invite object should contain the raw 12-char token for the user
                    assertNotNull(invite.getToken());
                    assertEquals(12, invite.getToken().length());

                    // Capture what was sent to the repository to verify it was hashed
                    ArgumentCaptor<CampaignInvite> captor = ArgumentCaptor.forClass(CampaignInvite.class);
                    verify(inviteRepository).save(captor.capture());

                    CampaignInvite saved = captor.getValue();
                    assertEquals(64, saved.getToken().length()); // SHA-256 hash in hex is 64 characters
                    assertEquals("Test Pilot", saved.getRecipientName());
                    assertNotEquals(invite.getToken(), saved.getToken());
                })
                .verifyComplete();
    }

    @Test
    void testAuthenticateViaToken_Success() {
        String rawToken = "ABC123XYZ789";
        WebSession session = new MockWebSession();

        when(inviteRepository.findByToken(anyString())).thenReturn(Mono.just(
                CampaignInvite.builder()
                        .id(UUID.randomUUID())
                        .token("HASHED_VERSION_OF_TOKEN")
                        .expiresAt(LocalDateTime.now().plusDays(1))
                        .build()
        ));
        when(userRepository.findByExternalId(anyString())).thenReturn(Mono.empty());
        when(userRepository.save(any(User.class))).thenAnswer(i -> Mono.just(i.getArgument(0)));

        StepVerifier.create(inviteService.authenticateViaToken(rawToken, session))
                .expectNext(true)
                .verifyComplete();

        // Verify the Spring Security context was injected into the session
        SecurityContext context = session.getAttribute("SPRING_SECURITY_CONTEXT");
        assertNotNull(context);
        assertEquals("ROLE_INVITED", context.getAuthentication().getAuthorities().iterator().next().getAuthority());
    }

    @Test
    void testAuthenticateViaToken_Expired() {
        when(inviteRepository.findByToken(anyString())).thenReturn(Mono.just(
                CampaignInvite.builder().expiresAt(LocalDateTime.now().minusDays(1)).build()
        ));

        StepVerifier.create(inviteService.authenticateViaToken("OLDTOKEN", new MockWebSession()))
                .expectErrorMatches(t -> t.getMessage().contains("INVALID OR EXPIRED"))
                .verify();
    }
}
