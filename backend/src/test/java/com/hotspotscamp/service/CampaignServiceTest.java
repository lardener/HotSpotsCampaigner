package com.hotspotscamp.service;

import java.io.IOException;
import java.lang.reflect.Method;
import java.util.Random;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.hotspotscamp.entity.Contract;
import com.hotspotscamp.repository.CampaignFactionRepository;
import com.hotspotscamp.repository.CampaignRepository;
import com.hotspotscamp.repository.CampaignTrackRepository;
import com.hotspotscamp.repository.ContractRepository;

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

    private CampaignService campaignService;

    @BeforeEach
    void setUp() throws IOException {
        campaignService = new CampaignService(campaignRepository, campaignFactionRepository, campaignTrackRepository, contractRepository);
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
}
