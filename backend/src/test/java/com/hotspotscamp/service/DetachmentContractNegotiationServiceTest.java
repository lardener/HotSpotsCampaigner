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

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.hotspotscamp.entity.Contract;
import com.hotspotscamp.entity.Detachment;
import com.hotspotscamp.entity.DetachmentContractOverride;
import com.hotspotscamp.repository.DetachmentContractOverrideRepository;
import com.hotspotscamp.repository.DetachmentRepository;

import reactor.core.publisher.Mono;

@ExtendWith(MockitoExtension.class)
class DetachmentContractNegotiationServiceTest {

    @Mock
    private DetachmentContractOverrideRepository overrideRepository;

    @Mock
    private DetachmentRepository detachmentRepository;

    @InjectMocks
    private DetachmentContractNegotiationService negotiationService;

    private UUID testCampaignId;
    private UUID testDetachmentId;
    private UUID testEmployerFactionId;
    private UUID testOwnerId;

    @BeforeEach
    void setUp() {
        testCampaignId = UUID.randomUUID();
        testDetachmentId = UUID.randomUUID();
        testEmployerFactionId = UUID.randomUUID();
        testOwnerId = UUID.randomUUID();
    }

    @Nested
    @DisplayName("saveNegotiation")
    class SaveNegotiationTests {

        @Test
        @DisplayName("Should save a new negotiation override")
        void shouldSaveNewNegotiation() {
            // Given
            DetachmentContractOverride override = createTestOverride();
            DetachmentContractOverride savedOverride = DetachmentContractOverride.builder()
                    .id(UUID.randomUUID())
                    .campaignId(override.getCampaignId())
                    .detachmentId(override.getDetachmentId())
                    .employerFactionId(override.getEmployerFactionId())
                    .ownerId(override.getOwnerId())
                    .payStepAdjustment(override.getPayStepAdjustment())
                    .salvageStepAdjustment(override.getSalvageStepAdjustment())
                    .supportStepAdjustment(override.getSupportStepAdjustment())
                    .transportStepAdjustment(override.getTransportStepAdjustment())
                    .commandStepAdjustment(override.getCommandStepAdjustment())
                    .salvageTerms(override.getSalvageTerms())
                    .supportTerms(override.getSupportTerms())
                    .transportTerms(override.getTransportTerms())
                    .commandRights(override.getCommandRights())
                    .isNew(false)
                    .build();

            when(overrideRepository.save(any(DetachmentContractOverride.class)))
                    .thenReturn(Mono.just(savedOverride));

            // When
            DetachmentContractOverride result = negotiationService.saveNegotiation(override).block();

            // Then
            assertNotNull(result);
            assertNotNull(result.getId());
            verify(overrideRepository).save(override);
        }

        @Test
        @DisplayName("Should validate override before saving")
        void shouldValidateOverrideBeforeSaving() {
            // Given
            DetachmentContractOverride override = createTestOverride();
            override.setPayStepAdjustment(null);

            when(overrideRepository.save(any(DetachmentContractOverride.class)))
                    .thenReturn(Mono.just(override));

            // When
            DetachmentContractOverride result = negotiationService.saveNegotiation(override).block();

            // Then
            assertNotNull(result);
            verify(overrideRepository).save(override);
        }
    }

    @Nested
    @DisplayName("findByDetachmentAndEmployer")
    class FindByDetachmentAndEmployerTests {

        @Test
        @DisplayName("Should return override when found")
        void shouldReturnOverrideWhenFound() {
            // Given
            DetachmentContractOverride expected = createTestOverride();
            when(overrideRepository.findByDetachmentIdAndCampaignIdAndEmployerFactionId(
                    testDetachmentId, testCampaignId, testEmployerFactionId))
                    .thenReturn(Mono.just(expected));

            // When
            DetachmentContractOverride result = negotiationService.findByDetachmentAndEmployer(
                    testDetachmentId, testCampaignId, testEmployerFactionId).block();

            // Then
            assertNotNull(result);
            assertEquals(testDetachmentId, result.getDetachmentId());
        }

        @Test
        @DisplayName("Should return null when not found")
        void shouldReturnNullWhenNotFound() {
            // Given
            when(overrideRepository.findByDetachmentIdAndCampaignIdAndEmployerFactionId(
                    testDetachmentId, testCampaignId, testEmployerFactionId))
                    .thenReturn(Mono.empty());

            // When
            DetachmentContractOverride result = negotiationService.findByDetachmentAndEmployer(
                    testDetachmentId, testCampaignId, testEmployerFactionId).block();

            // Then
            assertNull(result);
        }
    }

    @Nested
    @DisplayName("calculateWithOverrides")
    class CalculateWithOverridesTests {

        @Test
        @DisplayName("Should apply step adjustments from override")
        void shouldApplyStepAdjustmentsFromOverride() {
            // Given
            Contract contract = createTestContract();
            Detachment detachment = createTestDetachment();
            DetachmentContractOverride override = createTestOverride();
            override.setPayStepAdjustment(2);
            override.setSalvageStepAdjustment(-1);

            when(overrideRepository.findByDetachmentIdAndCampaignIdAndEmployerFactionId(
                    testDetachmentId, testCampaignId, testEmployerFactionId))
                    .thenReturn(Mono.just(override));

            // When
            DetachmentContractNegotiationService.DetachmentContractCalculation result
                    = negotiationService.calculateWithOverrides(
                            contract, detachment, testCampaignId).block();

            // Then
            assertNotNull(result);
            assertTrue(result.hasOverrides());
            assertNotNull(result.overriddenTerms());
            assertEquals(7, result.overriddenTerms().payStep());
            assertEquals(2, result.overriddenTerms().salvageStep());
        }

        @Test
        @DisplayName("Should use baseline when no override exists")
        void shouldUseBaselineWhenNoOverrideExists() {
            // Given
            Contract contract = createTestContract();
            Detachment detachment = createTestDetachment();

            when(overrideRepository.findByDetachmentIdAndCampaignIdAndEmployerFactionId(
                    testDetachmentId, testCampaignId, testEmployerFactionId))
                    .thenReturn(Mono.empty());

            // When
            DetachmentContractNegotiationService.DetachmentContractCalculation result
                    = negotiationService.calculateWithOverrides(
                            contract, detachment, testCampaignId).block();

            // Then
            assertNotNull(result);
            assertFalse(result.hasOverrides());
        }
    }

    @Nested
    @DisplayName("deleteByDetachment")
    class DeleteByDetachmentTests {

        @Test
        @DisplayName("Should delete existing negotiation")
        void shouldDeleteExistingNegotiation() {
            // Given
            DetachmentContractOverride override = createTestOverride();
            when(overrideRepository.findByDetachmentIdAndCampaignIdAndEmployerFactionId(
                    testDetachmentId, null, null))
                    .thenReturn(Mono.just(override));
            when(overrideRepository.delete(override))
                    .thenReturn(Mono.empty());

            // When
            negotiationService.deleteByDetachment(testDetachmentId).block();

            // Then
            verify(overrideRepository).delete(override);
        }

        @Test
        @DisplayName("Should do nothing when no negotiation exists")
        void shouldDoNothingWhenNoNegotiationExists() {
            // Given
            when(overrideRepository.findByDetachmentIdAndCampaignIdAndEmployerFactionId(
                    testDetachmentId, null, null))
                    .thenReturn(Mono.empty());

            // When
            negotiationService.deleteByDetachment(testDetachmentId).block();

            // Then
            verify(overrideRepository, never()).delete(any());
        }
    }

    // Helper methods
    private DetachmentContractOverride createTestOverride() {
        return DetachmentContractOverride.builder()
                .campaignId(testCampaignId)
                .detachmentId(testDetachmentId)
                .employerFactionId(testEmployerFactionId)
                .ownerId(testOwnerId)
                .payStepAdjustment(0)
                .salvageStepAdjustment(0)
                .supportStepAdjustment(0)
                .transportStepAdjustment(0)
                .commandStepAdjustment(0)
                .negotiatedPayStep(5)
                .negotiatedSalvageStep(3)
                .negotiatedSupportStep(4)
                .negotiatedTransportStep(2)
                .negotiatedCommandStep(1)
                .resultingPayTerms("80%")
                .resultingSalvageTerms("20%")
                .resultingSupportTerms("Straight/70%")
                .resultingTransportTerms("0%")
                .resultingCommandRights("House")
                .isNew(false)
                .build();
    }

    private Contract createTestContract() {
        Contract contract = new Contract();
        contract.setPayStep(5);
        contract.setSalvageStep(3);
        contract.setSupportStep(4);
        contract.setTransportStep(2);
        contract.setCommandStep(1);
        contract.setSalvageTerms("Full");
        contract.setSupportTerms("Shared");
        contract.setTransportTerms("Free");
        contract.setCommandRights("Independent");
        contract.setEmployerFactionId(testEmployerFactionId);
        contract.setId(UUID.randomUUID());
        contract.setCampaignId(testCampaignId);
        return contract;
    }

    private Detachment createTestDetachment() {
        Detachment detachment = new Detachment();
        detachment.setId(testDetachmentId);
        detachment.setName("Test Detachment");
        return detachment;
    }
}
