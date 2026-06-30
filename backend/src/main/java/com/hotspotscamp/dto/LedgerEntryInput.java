package com.hotspotscamp.dto;

import java.util.UUID;

/**
 * DTO for a new ledger entry.
 */
public record LedgerEntryInput(
        Integer amount,
        String description,
        Integer reputationChange,
        UUID campaignId,
        String campaignName,
        Integer monthIndex
        ) {

}
