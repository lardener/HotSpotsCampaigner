package com.hotspotscamp.service;

import java.io.IOException;
import java.lang.reflect.Method;
import java.util.Random;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import org.mockito.Mock;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.hotspotscamp.entity.Campaign;
import com.hotspotscamp.entity.Contract;
import com.hotspotscamp.entity.User;
import com.hotspotscamp.repository.CampaignFactionRepository;
import com.hotspotscamp.repository.CampaignRepository;
import com.hotspotscamp.repository.CampaignTrackRepository;
import com.hotspotscamp.repository.ContractRepository;
import com.hotspotscamp.repository.DetachmentRepository;
import com.hotspotscamp.repository.UserRepository;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

@ExtendWith(MockitoExtension.class)
public class CampaignServiceTest {

    @Mock
    private CampaignRepository campaignRepository;
    @Mock
    private CampaignFactionRepository campaignFactionRepository;
    @Mock
    private CampaignTrackRepository campaignTrackRepository;
    @Mock
    private ContractRepository contractRepository;
    @Mock
    private DetachmentRepository detachmentRepository;
    @Mock
    private UserRepository userRepository;

    private CampaignService campaignService;

    @BeforeEach
    void setUp() throws IOException {
        campaignService = new CampaignService(campaignRepository, campaignFactionRepository, campaignTrackRepository, contractRepository, detachmentRepository, userRepository);
        campaignService.init();
    }

    @Test
    void testTransportationCalculation() throws Exception {
        // Use reflection to call the private generateContract method for precision logic verification
        Method generateContractMethod = CampaignService.class.getDeclaredMethod("generateContract",
                String.class, String.class, String.class, Double.class, String.class, String.class, String.class,
                String.class, Integer.class, Integer.class, Integer.class, Integer.class, Integer.class,
                int.class, boolean.class, String.class, Random.class);
        generateContractMethod.setAccessible(true);

        // CASE 1: High Modifiers (Major Power + Invasion)
        // We need to mock Random to control the 2D6 rolls for all contract parameters
        Random mockRand1 = mock(Random.class);
        when(mockRand1.nextInt(6)).thenReturn(
                3, 3, // Pay Step roll (8)
                3, 3, // Salvage Step roll (8)
                3, 3, // Support Step roll (8)
                3, 3, // Rights Step roll (8)
                5, 5 // Trans Roll 12 -> maps to Initial Step 9 (Hinterlands Table)
        );
        when(mockRand1.nextInt(500)).thenReturn(100);

        // Calculation: Step 9 + 2 (Major Power) + 2 (Invasion) = Step 13 -> 100%
        Contract highContract = (Contract) generateContractMethod.invoke(campaignService,
                "Tamar Pact", "Invasion", "Major Power", null, null, null, null, null, null, null, null, null, null, 2, true, "Alyina", mockRand1);
        assertEquals("100%", highContract.getTransportTerms());

        // CASE 2: Low Modifiers (Corporate + Garrison)
        Random mockRand2 = mock(Random.class);
        when(mockRand2.nextInt(6)).thenReturn(
                3, 3, 3, 3, 3, 3, 3, 3, // Previous steps
                0, 0 // Trans Roll 2 -> maps to Initial Step 5 (Hinterlands Table)
        );
        when(mockRand2.nextInt(500)).thenReturn(100);

        // Calculation: Step 5 - 1 (Corp) - 2 (Garrison) = Step 2 -> resolves to Step 3 -> 0%
        Contract lowContract = (Contract) generateContractMethod.invoke(campaignService,
                "Vesper Marches", "Garrison", "Corporate (Local)", null, null, null, null, null, null, null, null, null, null, 2, true, "Vesper", mockRand2);
        assertEquals("0%", lowContract.getTransportTerms());
    }

    @Test
    void testGetActiveCampaignsPagination() {
        UUID campaignId = UUID.randomUUID();
        Campaign campaign = Campaign.builder()
                .id(campaignId)
                .name("Test Campaign")
                .status("ACTIVE")
                .systemName("Terra")
                .trackCount(5)
                .build();

        when(campaignRepository.countByStatus("ACTIVE")).thenReturn(Mono.just(1L));
        when(campaignRepository.findAllByStatus(anyString(), anyInt(), anyInt())).thenReturn(Flux.just(campaign));
        when(contractRepository.findAllByCampaignId(campaignId)).thenReturn(Flux.empty());

        StepVerifier.create(campaignService.getActiveCampaigns(0, 5))
                .assertNext(page -> {
                    assertEquals(1, page.content().size());
                    assertEquals("Test Campaign", page.content().get(0).name());
                    assertEquals(1, page.totalPages());
                })
                .verifyComplete();
    }

    @Test
    void testGenerateDoblessCampaignPersistence() {
        UUID managerUuid = UUID.randomUUID();
        String managerId = managerUuid.toString();

        User mockUser = User.builder()
                .id(managerUuid)
                .role("ROLE_AUTHENTICATED")
                .build();

        when(userRepository.findByExternalId(managerId)).thenReturn(Mono.empty());
        when(userRepository.findById(managerUuid)).thenReturn(Mono.just(mockUser));
        when(campaignRepository.save(any(Campaign.class))).thenAnswer(i -> Mono.just(i.getArgument(0)));
        when(campaignFactionRepository.saveAll(any(Iterable.class))).thenAnswer(i -> Flux.fromIterable(i.getArgument(0)));
        when(contractRepository.save(any(Contract.class))).thenAnswer(i -> Mono.just(i.getArgument(0)));
        when(campaignTrackRepository.save(any())).thenAnswer(i -> Mono.just(i.getArgument(0)));

        Mono<Campaign> result = campaignService.generateDoblessCampaign(
                managerId, "Davion", "Kurita", "Raid",
                "Major Power", "New Avalon", null,
                null, null, null, null,
                null, null, null, null, null,
                5
        );

        StepVerifier.create(result)
                .assertNext(campaign -> {
                    assertNotNull(campaign.getId());
                    assertEquals("ACTIVE", campaign.getStatus());
                    assertEquals(mockUser.getId().toString(), campaign.getManagerId());
                })
                .verifyComplete();
    }
}
