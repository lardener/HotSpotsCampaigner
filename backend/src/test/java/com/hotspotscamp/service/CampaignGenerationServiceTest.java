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

import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.hotspotscamp.dto.CampaignCreateInput;
import com.hotspotscamp.dto.CampaignProposal;
import com.hotspotscamp.dto.ruleConfiguration.ComplicationRule;
import com.hotspotscamp.dto.ruleConfiguration.ComplicationsTableConfig;
import com.hotspotscamp.dto.ruleConfiguration.ContractStepEntry;
import com.hotspotscamp.dto.ruleConfiguration.ContractStepsTableConfig;
import com.hotspotscamp.dto.ruleConfiguration.ContractTableConfigV2;
import com.hotspotscamp.dto.ruleConfiguration.MissionEntry;
import com.hotspotscamp.dto.ruleConfiguration.MissionTableConfig;
import com.hotspotscamp.dto.ruleConfiguration.RollEntry;
import com.hotspotscamp.dto.ruleConfiguration.RollToStepEntry;
import com.hotspotscamp.dto.ruleConfiguration.SubTable;
import com.hotspotscamp.dto.ruleConfiguration.TrackGroup;
import com.hotspotscamp.dto.ruleConfiguration.TrackTableConfig;

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

        ContractTableConfigV2 mockTable = new ContractTableConfigV2(
                2, 6, List.of(new RollToStepEntry(2, 12, 7)),
                Collections.emptyMap(), Collections.emptyMap());

        // Mock all necessary config service calls for generateProposal
        when(configService.getMissionTableData()).thenReturn(new MissionTableConfig(
                2, 6, List.of(new MissionEntry(2, 12,
                        new SubTable(1, 6, List.of(new RollEntry(1, 6, "Raid"))),
                        new SubTable(1, 6, List.of(new RollEntry(1, 6, "Garrison")))))));

        when(configService.getTrackTableData()).thenReturn(new TrackTableConfig(
                2, 6, List.of(new TrackGroup(List.of("Default"),
                        List.of(new RollEntry(2, 12, "Assault"))))));

        when(configService.getComplicationsTableConfig()).thenReturn(new ComplicationsTableConfig(
                Map.of("Independent", new ComplicationRule(2, 6, 0)),
                List.of(new RollEntry(2, 12, "None"))));

        // Existing mocks for contract tables
        when(configService.getContractTables()).thenReturn(Map.of(
                "payRateTable", mockTable, "salvageTable", mockTable, "supportTable", mockTable,
                "transportationTable", mockTable, "commandRightsTable", mockTable));

        when(configService.getContractStepsTableConfig()).thenReturn(new ContractStepsTableConfig(2, 6,
                List.of(new ContractStepEntry(7, "100%", "None", "None", "None", "House"))));

        // Act
        CampaignProposal proposal = generationService.generateProposal(input);

        // Assert
        assertNotNull(proposal);
        assertEquals("Op Test", proposal.campaign().getName());
        assertEquals(5, proposal.campaign().getTrackCount());
    }

}
