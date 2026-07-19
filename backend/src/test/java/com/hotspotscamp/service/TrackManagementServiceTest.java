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
import java.util.UUID;
import java.util.function.IntSupplier;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.hotspotscamp.entity.Campaign;
import com.hotspotscamp.entity.CampaignTrack;
import com.hotspotscamp.repository.CampaignRepository;
import com.hotspotscamp.repository.CampaignTrackRepository;

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
