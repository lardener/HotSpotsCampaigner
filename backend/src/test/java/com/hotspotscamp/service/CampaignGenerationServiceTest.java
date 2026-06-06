package com.hotspotscamp.service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Random;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.hotspotscamp.dto.CampaignCreateInput;
import com.hotspotscamp.dto.CampaignProposal;

@ExtendWith(MockitoExtension.class)
class CampaignGenerationServiceTest {

    @InjectMocks
    private CampaignGenerationService generationService;

    @Mock
    private RuleConfigurationService configService;

    @Test
    void generateProposal_WithValidInput_ShouldCreateProposal() {
        // Arrange
        CampaignCreateInput input = new CampaignCreateInput(
                "Op Test", "Davion", "Kurita", "Raid", null, null, null, "Terra", null, "ACTIVE",
                null, null, null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, null, null, null,
                5, 5, null, null, null, null,
                null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
                Collections.emptyList()
        );

        RuleConfigurationService.ContractTableConfigV2 mockTable = new RuleConfigurationService.ContractTableConfigV2(
                2, 6, List.of(new RuleConfigurationService.RollToStepEntry(2, 12, 7)),
                Collections.emptyMap(), Collections.emptyMap());

        // Mock all necessary config service calls for generateProposal
        when(configService.getMissionTableData()).thenReturn(new RuleConfigurationService.MissionTableConfig(
                2, 6, List.of(new RuleConfigurationService.MissionEntry(2, 12,
                        new RuleConfigurationService.SubTable(1, 6, List.of(new RuleConfigurationService.RollEntry(1, 6, "Raid"))),
                        new RuleConfigurationService.SubTable(1, 6, List.of(new RuleConfigurationService.RollEntry(1, 6, "Garrison")))))));

        when(configService.getTrackTableData()).thenReturn(new RuleConfigurationService.TrackTableConfig(
                2, 6, List.of(new RuleConfigurationService.TrackGroup(List.of("Default"),
                        List.of(new RuleConfigurationService.RollEntry(2, 12, "Assault"))))));

        when(configService.getComplicationsTableConfig()).thenReturn(new RuleConfigurationService.ComplicationsTableConfig(
                Map.of("Independent", new RuleConfigurationService.ComplicationRule(2, 6, 0)),
                List.of(new RuleConfigurationService.RollEntry(2, 12, "None"))));

        // Existing mocks for contract tables
        when(configService.getContractTables()).thenReturn(Map.of(
                "payRateTable", mockTable, "salvageTable", mockTable, "supportTable", mockTable,
                "transportationTable", mockTable, "commandRightsTable", mockTable));

        when(configService.getContractStepsTableConfig()).thenReturn(new RuleConfigurationService.ContractStepsTableConfig(2, 6,
                List.of(new RuleConfigurationService.ContractStepEntry(7, "100%", "None", "None", "None", "House"))));

        // Act
        CampaignProposal proposal = generationService.generateProposal(input);

        // Assert
        assertNotNull(proposal);
        assertEquals("Op Test", proposal.campaign().getName());
        assertEquals(5, proposal.campaign().getTrackCount());
    }

    @Test
    void rollDice_ShouldProduceCorrectRange() {
        int roll = generationService.rollDice(2, 6, new Random());
        assertTrue(roll >= 2 && roll <= 12);
    }
}
