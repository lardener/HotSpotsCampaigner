package com.hotspotscamp.service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.hotspotscamp.dto.CampaignCreateInput;
import com.hotspotscamp.dto.CampaignMetadata;
import com.hotspotscamp.dto.CampaignProposal;
import com.hotspotscamp.dto.GeneratedTrack;
import com.hotspotscamp.dto.ruleConfiguration.EmployerEntry;
import com.hotspotscamp.dto.ruleConfiguration.EmployerTableConfig;
import com.hotspotscamp.entity.Campaign;
import com.hotspotscamp.repository.CampaignFactionRepository;
import com.hotspotscamp.repository.CampaignInviteRepository;
import com.hotspotscamp.repository.CampaignRepository;
import com.hotspotscamp.repository.CampaignTrackRepository;
import com.hotspotscamp.repository.ContractRepository;
import com.hotspotscamp.repository.DetachmentRepository;

import reactor.core.publisher.Mono;

@ExtendWith(MockitoExtension.class)
class CampaignServiceTest {

    @InjectMocks
    private CampaignService campaignService;

    @Mock
    private ContractRepository contractRepository;
    @Mock
    private CampaignTrackRepository campaignTrackRepository;
    @Mock
    private CampaignRepository campaignRepository;
    @Mock
    private CampaignFactionRepository campaignFactionRepository;
    @Mock
    private CampaignInviteRepository campaignInviteRepository;
    @Mock
    private DetachmentRepository detachmentRepository;
    @Mock
    private UserService userService;
    @Mock
    private InviteService inviteService;
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

        Mono<Campaign> actual = campaignService.reconcileTracks(camp, 5);

        assertEquals(expected, actual);
        verify(trackManagementService).reconcileTracks(camp, 5);
    }

    @Test
    void rerollTrack_ShouldDelegateToTrackManagementService() {
        UUID trackId = UUID.randomUUID();
        String managerId = "manager-123";
        campaignService.rerollTrack(trackId, managerId);
        verify(trackManagementService).rerollTrack(trackId, managerId, userService);
    }
}
