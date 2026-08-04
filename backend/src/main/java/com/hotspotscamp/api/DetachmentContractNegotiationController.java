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
 * MERCHANTABILITY or FITNESS OR PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
package com.hotspotscamp.api;

import java.security.Principal;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import com.hotspotscamp.entity.DetachmentContractOverride;
import com.hotspotscamp.service.DetachmentContractNegotiationService;
import com.hotspotscamp.service.UserService;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * GraphQL controller for detachment contract negotiation operations. Handles
 * saving, retrieving, and deleting per-detachment contract term negotiations.
 */
@Controller
@RequiredArgsConstructor
public class DetachmentContractNegotiationController {

    private static final Logger log = LoggerFactory.getLogger(DetachmentContractNegotiationController.class);
    private static final DateTimeFormatter ISO_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private final DetachmentContractNegotiationService negotiationService;
    private final UserService userService;

    /**
     * Query: Get all detachment contract negotiations for a campaign.
     */
    @QueryMapping
    public Flux<DetachmentContractNegotiation> getDetachmentContractNegotiations(
            @Argument UUID campaignId, Principal principal) {

        if (isAnonymous(principal)) {
            return Flux.empty();
        }

        String userId = principal.getName();
        return userService.resolveOrCreateUser(userId)
                .flatMapMany(user -> {
                    return negotiationService.findAllByCampaign(campaignId)
                            .map(this::toNegotiationResponse);
                });
    }

    /**
     * Mutation: Negotiate and save contract terms for a detachment.
     */
    @MutationMapping
    public Mono<DetachmentContractNegotiation> negotiateDetachmentContract(
            @Argument NegotiateContractInput input, Principal principal) {

        if (isAnonymous(principal)) {
            return Mono.error(new RuntimeException("Authentication required"));
        }

        String userId = principal.getName();
        return userService.resolveOrCreateUser(userId)
                .flatMapMany(user -> {
                    UUID userIdObj = user.getId();
                    DetachmentContractOverride override = DetachmentContractOverride.builder()
                            .id(UUID.randomUUID())
                            .campaignId(input.campaignId())
                            .detachmentId(input.detachmentId())
                            .employerFactionId(input.employerFactionId())
                            .ownerId(userIdObj)
                            .payStepAdjustment(input.payStepAdjustment())
                            .salvageStepAdjustment(input.salvageStepAdjustment())
                            .supportStepAdjustment(input.supportStepAdjustment())
                            .transportStepAdjustment(input.transportStepAdjustment())
                            .commandStepAdjustment(input.commandStepAdjustment())
                            .negotiatedPayStep(input.negotiatedPayStep())
                            .negotiatedSalvageStep(input.negotiatedSalvageStep())
                            .negotiatedSupportStep(input.negotiatedSupportStep())
                            .negotiatedTransportStep(input.negotiatedTransportStep())
                            .negotiatedCommandStep(input.negotiatedCommandStep())
                            .resultingPayTerms(input.resultingPayTerms())
                            .resultingSalvageTerms(input.resultingSalvageTerms())
                            .resultingSupportTerms(input.resultingSupportTerms())
                            .resultingTransportTerms(input.resultingTransportTerms())
                            .resultingCommandRights(input.resultingCommandRights())
                            .salvageTerms(input.salvageTerms())
                            .supportTerms(input.supportTerms())
                            .transportTerms(input.transportTerms())
                            .commandRights(input.commandRights())
                            .build();

                    return negotiationService.saveNegotiation(override)
                            .map(this::toNegotiationResponse);
                })
                .next()
                .switchIfEmpty(Mono.error(new RuntimeException("Failed to save negotiation")));
    }

    /**
     * Mutation: Delete all negotiations for a detachment.
     */
    @MutationMapping
    public Mono<Boolean> deleteDetachmentContractNegotiation(
            @Argument UUID campaignId,
            @Argument UUID detachmentId,
            Principal principal) {

        if (isAnonymous(principal)) {
            return Mono.just(false);
        }

        String userId = principal.getName();
        return userService.resolveOrCreateUser(userId)
                .flatMap(user -> {
                    UUID userIdObj = user.getId();
                    return negotiationService.findByCampaignAndOwner(campaignId, userIdObj)
                            .flatMap(override -> {
                                if (override.getDetachmentId().equals(detachmentId)) {
                                    return negotiationService.deleteByDetachment(detachmentId)
                                            .thenReturn(true);
                                }
                                return Mono.just(false);
                            })
                            .switchIfEmpty(Mono.just(false));
                });
    }

    private DetachmentContractNegotiation toNegotiationResponse(DetachmentContractOverride override) {
        return new DetachmentContractNegotiation(
                override.getId().toString(),
                override.getCampaignId().toString(),
                override.getDetachmentId().toString(),
                override.getEmployerFactionId().toString(),
                override.getPayStepAdjustment(),
                override.getSalvageStepAdjustment(),
                override.getSupportStepAdjustment(),
                override.getTransportStepAdjustment(),
                override.getCommandStepAdjustment(),
                override.getNegotiatedPayStep(),
                override.getNegotiatedSalvageStep(),
                override.getNegotiatedSupportStep(),
                override.getNegotiatedTransportStep(),
                override.getNegotiatedCommandStep(),
                override.getResultingPayTerms(),
                override.getResultingSalvageTerms(),
                override.getResultingSupportTerms(),
                override.getResultingTransportTerms(),
                override.getResultingCommandRights(),
                override.getSalvageTerms(),
                override.getSupportTerms(),
                override.getTransportTerms(),
                override.getCommandRights()
        );
    }

    private boolean isAnonymous(Principal principal) {
        return principal == null || "anonymousUser".equals(principal.getName());
    }

    /**
     * GraphQL response type for negotiation data.
     */
    public record DetachmentContractNegotiation(
            String id,
            String campaignId,
            String detachmentId,
            String employerFactionId,
            Integer payStepAdjustment,
            Integer salvageStepAdjustment,
            Integer supportStepAdjustment,
            Integer transportStepAdjustment,
            Integer commandStepAdjustment,
            Integer negotiatedPayStep,
            Integer negotiatedSalvageStep,
            Integer negotiatedSupportStep,
            Integer negotiatedTransportStep,
            Integer negotiatedCommandStep,
            String resultingPayTerms,
            String resultingSalvageTerms,
            String resultingSupportTerms,
            String resultingTransportTerms,
            String resultingCommandRights,
            String salvageTerms,
            String supportTerms,
            String transportTerms,
            String commandRights
            ) {

    }

    /**
     * GraphQL input type for negotiation mutations.
     */
    public record NegotiateContractInput(
            UUID campaignId,
            UUID detachmentId,
            UUID employerFactionId,
            Integer payStepAdjustment,
            Integer salvageStepAdjustment,
            Integer supportStepAdjustment,
            Integer transportStepAdjustment,
            Integer commandStepAdjustment,
            Integer negotiatedPayStep,
            Integer negotiatedSalvageStep,
            Integer negotiatedSupportStep,
            Integer negotiatedTransportStep,
            Integer negotiatedCommandStep,
            String resultingPayTerms,
            String resultingSalvageTerms,
            String resultingSupportTerms,
            String resultingTransportTerms,
            String resultingCommandRights,
            String salvageTerms,
            String supportTerms,
            String transportTerms,
            String commandRights
            ) {

    }
}
