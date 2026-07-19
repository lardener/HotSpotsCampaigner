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
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.transaction.reactive.TransactionalOperator;

import com.hotspotscamp.dto.CampaignCreateInput;
import com.hotspotscamp.dto.CampaignMetadata;
import com.hotspotscamp.dto.CampaignProposal;
import com.hotspotscamp.dto.GeneratedTrack;
import com.hotspotscamp.dto.ruleConfiguration.EmployerEntry;
import com.hotspotscamp.dto.ruleConfiguration.EmployerTableConfig;
import com.hotspotscamp.entity.Campaign;

import reactor.core.publisher.Mono;

@ExtendWith(MockitoExtension.class)
class CampaignServiceTest {

    @InjectMocks
    private CampaignService campaignService;
    @Mock
    private TransactionalOperator transactionalOperator;
    @Mock
    private UserService userService;
    @Mock
    private RuleConfigurationService configService;
    @Mock
    private CampaignGenerationService generationService;
    @Mock
    private TrackManagementService trackManagementService;

    @Test
    void getCampaignMetadata_ShouldReturnMetadataFromConfig() {
        when(configService.getAvailablePrimaryMissions()).thenReturn(List.of("Raid"));
        when(configService.getAvailableOpponentMissions()).thenReturn(List.of("Garrison"));
        when(configService.getAvailableTrackTypes()).thenReturn(List.of("Assault"));
        when(configService.getAvailableFactions()).thenReturn(List.of("Davion"));

        EmployerTableConfig empConfig = mock(EmployerTableConfig.class);
        when(empConfig.entries()).thenReturn(List.of(new EmployerEntry(2, "Major Power")));
        when(configService.getEmployerTableConfig()).thenReturn(empConfig);

        when(configService.getResolvedStepsTable()).thenReturn(Map.of(7, Map.of("payRate", "100%")));

        CampaignMetadata metadata = campaignService.getCampaignMetadata();

        assertNotNull(metadata);
        assertEquals(List.of("Raid"), metadata.missions().primary());
        assertEquals(List.of("Major Power"), metadata.employerTypes());
    }

    @Test
    void generateProposal_ShouldDelegateToGenerationService() {
        CampaignCreateInput input = mock(CampaignCreateInput.class);
        CampaignProposal expected = mock(CampaignProposal.class);
        when(generationService.generateProposal(input)).thenReturn(expected);

        CampaignProposal actual = campaignService.generateProposal(input);

        assertEquals(expected, actual);
        verify(generationService).generateProposal(input);
    }

    @Test
    void generateTracks_ShouldDelegateToGenerationService() {
        List<GeneratedTrack> existing = Collections.emptyList();
        List<GeneratedTrack> expected = List.of(new GeneratedTrack("Assault", "None", "None"));
        when(generationService.generateTracks("Raid", "House", "Independent", 1, existing)).thenReturn(expected);

        List<GeneratedTrack> actual = campaignService.generateTracks("Raid", "House", "Independent", 1, existing);

        assertEquals(expected, actual);
        verify(generationService).generateTracks("Raid", "House", "Independent", 1, existing);
    }

    @Test
    void reconcileTracks_ShouldDelegateToTrackManagementService() {
        Campaign camp = new Campaign();
        Mono<Campaign> expected = Mono.just(camp);
        when(trackManagementService.reconcileTracks(camp, 5)).thenReturn(expected);
        org.mockito.Mockito.lenient().when(transactionalOperator.transactional(ArgumentMatchers.<Mono<Campaign>>any())).thenAnswer(i -> i.getArgument(0));

        Mono<Campaign> actual = campaignService.reconcileTracks(camp, 5);

        verify(trackManagementService).reconcileTracks(camp, 5);
    }

    @Test
    void rerollTrack_ShouldDelegateToTrackManagementService() {
        UUID trackId = UUID.randomUUID();
        String managerId = "manager-123";
        when(trackManagementService.rerollTrack(trackId, managerId, userService)).thenReturn(Mono.empty());
        org.mockito.Mockito.lenient().when(transactionalOperator.transactional(ArgumentMatchers.<Mono<Object>>any())).thenAnswer(i -> i.getArgument(0));

        campaignService.rerollTrack(trackId, managerId);
        verify(trackManagementService).rerollTrack(trackId, managerId, userService);
    }
}
