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

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.hotspotscamp.entity.LedgerEntry;
import com.hotspotscamp.repository.LedgerEntryRepository;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

/**
 * Service for managing ledger entries related to detachment contract
 * negotiations. Tracks all negotiation changes in the immutable ledger.
 */
@Service
@RequiredArgsConstructor
public class DetachmentContractLedgerService {

    private static final Logger log = LoggerFactory.getLogger(DetachmentContractLedgerService.class);

    private final LedgerEntryRepository ledgerEntryRepository;

    /**
     * Create a ledger entry for a contract negotiation action.
     *
     * @param commandId the mercenary command ID
     * @param detachmentId the detachment ID
     * @param campaignId the campaign ID
     * @param campaignName the campaign name
     * @param description the description of the negotiation action
     * @param isNegotiation whether this is a negotiation event
     * @return the created ledger entry
     */
    public Mono<LedgerEntry> createNegotiationLedgerEntry(
            UUID commandId,
            UUID detachmentId,
            UUID campaignId,
            String campaignName,
            String description,
            boolean isNegotiation) {

        LedgerEntry entry = LedgerEntry.builder()
                .id(UUID.randomUUID())
                .commandId(commandId)
                .detachmentId(detachmentId)
                .campaignId(campaignId)
                .campaignName(campaignName)
                .description(description)
                .timestamp(LocalDateTime.now())
                .isNew(true)
                .build();

        return ledgerEntryRepository.save(entry)
                .doOnNext(saved -> log.info("Created negotiation ledger entry: detachmentId={}, description={}",
                detachmentId, description));
    }

    /**
     * Create a ledger entry for contract override activation.
     *
     * @param commandId the mercenary command ID
     * @param detachmentId the detachment ID
     * @param campaignId the campaign ID
     * @param campaignName the campaign name
     * @param overrideId the override ID that was activated
     * @return the created ledger entry
     */
    public Mono<LedgerEntry> createOverrideActivationLedgerEntry(
            UUID commandId,
            UUID detachmentId,
            UUID campaignId,
            String campaignName,
            UUID overrideId) {

        String description = String.format("Contract override activated: %s", overrideId);
        return createNegotiationLedgerEntry(commandId, detachmentId, campaignId, campaignName, description, true);
    }

    /**
     * Get all ledger entries related to contract negotiations for a detachment.
     *
     * @param detachmentId the detachment ID
     * @return list of ledger entries
     */
    public Mono<List<LedgerEntry>> getNegotiationLedgerEntries(UUID detachmentId) {
        log.debug("Getting negotiation ledger entries for detachment: {}", detachmentId);
        return ledgerEntryRepository.findAllByDetachmentId(detachmentId)
                .filter(entry -> entry.getDescription() != null
                && (entry.getDescription().contains("negotiation")
                || entry.getDescription().contains("override")
                || entry.getDescription().contains("Contract")))
                .collectList();
    }

    /**
     * Get all ledger entries related to contract negotiations for a campaign.
     *
     * @param campaignId the campaign ID
     * @return list of ledger entries
     */
    public Mono<List<LedgerEntry>> getNegotiationLedgerEntriesForCampaign(UUID campaignId) {
        log.debug("Getting negotiation ledger entries for campaign: {}", campaignId);
        return ledgerEntryRepository.findAllByCampaignId(campaignId)
                .filter(entry -> entry.getDescription() != null
                && (entry.getDescription().contains("negotiation")
                || entry.getDescription().contains("override")
                || entry.getDescription().contains("Contract")))
                .collectList();
    }
}
