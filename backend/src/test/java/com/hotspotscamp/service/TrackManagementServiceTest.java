package com.hotspotscamp.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Collections;
import java.util.UUID;
import java.util.function.IntSupplier;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.hotspotscamp.entity.Campaign;
import com.hotspotscamp.entity.CampaignTrack;
import com.hotspotscamp.repository.CampaignRepository;
import com.hotspotscamp.repository.CampaignTrackRepository;
import com.hotspotscamp.repository.ContractRepository;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

@ExtendWith(MockitoExtension.class)
class TrackManagementServiceTest {

    @InjectMocks
    private TrackManagementService trackManagementService;

    @Mock
    private CampaignTrackRepository campaignTrackRepository;
    @Mock
    private CampaignRepository campaignRepository;

    @Test
    void reconcileTracks_ShouldDeleteExtraTracks() {
        // Arrange
        UUID campId = UUID.randomUUID();
        Campaign camp = Campaign.builder().id(campId).trackCount(3).build();
        CampaignTrack t1 = CampaignTrack.builder().sequenceOrder(0).build();
        CampaignTrack t2 = CampaignTrack.builder().sequenceOrder(1).build();

        when(campaignTrackRepository.findAllByCampaignId(campId)).thenReturn(Flux.just(t1, t2)); // Returns 2 tracks
        when(campaignRepository.save(any())).thenReturn(Mono.just(camp));
        when(campaignTrackRepository.delete(any(CampaignTrack.class))).thenReturn(Mono.empty()); // Mock delete operation

        // Act & Assert
        StepVerifier.create(trackManagementService.reconcileTracks(camp, 1))
                .expectNextMatches(c -> c.getTrackCount() == 1)
                .verifyComplete();

        verify(campaignTrackRepository, times(1)).delete(any(CampaignTrack.class)); // Verify delete was called once
    }

    @Test
    void getMonthSupplier_ShouldReturnLinearIfConfigMissing() {
        IntSupplier supplier = trackManagementService.getMonthSupplier(Collections.emptyList(), 6, 3);
        assertEquals(1, supplier.getAsInt());
        assertEquals(2, supplier.getAsInt());
    }
}
