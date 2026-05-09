package com.hotspotscamp.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hotspotscamp.entity.LedgerEntry;
import com.hotspotscamp.entity.MercenaryCommand;
import com.hotspotscamp.repository.CampaignRepository;
import com.hotspotscamp.repository.ContractRepository;
import com.hotspotscamp.repository.DetachmentRepository;
import com.hotspotscamp.repository.LedgerEntryRepository;
import com.hotspotscamp.repository.MercenaryCommandRepository;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class MercenaryCommandService {

    private final MercenaryCommandRepository commandRepository;
    private final DetachmentRepository detachmentRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final CampaignRepository campaignRepository;
    private final ContractRepository contractRepository;

    /**
     * Recalculates and updates the Command's total Support Points (SP) by
     * summing all ledger entries across all its detachments. This ensures the
     * Command state matches the "MERCENARY CONTRACT RECORD SHEET" history.
     */
    @Transactional
    public Mono<MercenaryCommand> syncTotalSupportPoints(UUID commandId) {
        return detachmentRepository.findAllByMercenaryCommandId(commandId)
                .flatMap(detachment -> ledgerEntryRepository.findAllByDetachmentId(detachment.getId()))
                .map(LedgerEntry::getAmount)
                .reduce(0, Integer::sum)
                .flatMap(totalSp -> commandRepository.findById(commandId)
                .flatMap(command -> {
                    command.setTotalSupportPoints(totalSp);
                    return commandRepository.save(command);
                }));
    }

    /**
     * Adds a new ledger entry after validating that the user is either the
     * command owner or the campaign manager.
     */
    @Transactional
    public Mono<LedgerEntry> addLedgerEntry(UUID detachmentId, LedgerEntry entry, UUID userId) {
        return isAuthorizedToEditLedger(detachmentId, userId)
                .flatMap(isAuthorized -> {
                    if (!isAuthorized) {
                        return Mono.error(new RuntimeException("Access Denied: You are not the owner or the campaign manager."));
                    }
                    entry.setDetachmentId(detachmentId);
                    entry.setTimestamp(LocalDateTime.now());

                    return ledgerEntryRepository.save(entry)
                            .flatMap(savedEntry -> detachmentRepository.findById(detachmentId)
                            .flatMap(d -> syncTotalSupportPoints(d.getMercenaryCommandId()))
                            .thenReturn(savedEntry));
                });
    }

    /**
     * Validates permissions based on Hinterlands rules: 1. User owns the
     * MercenaryCommand. 2. User manages the Campaign the detachment is
     * contracted to.
     */
    private Mono<Boolean> isAuthorizedToEditLedger(UUID detachmentId, UUID userId) {
        return detachmentRepository.findById(detachmentId)
                .flatMap(detachment -> {
                    // Check if user is Command Owner
                    Mono<Boolean> isOwner = commandRepository.findById(detachment.getMercenaryCommandId())
                            .map(cmd -> cmd.getOwnerId().equals(userId))
                            .defaultIfEmpty(false);

                    // Check if user is Campaign Manager
                    Mono<Boolean> isManager = contractRepository.findById(detachment.getContractId())
                            .flatMap(contract -> campaignRepository.findById(contract.getCampaignId()))
                            .map(campaign -> campaign.getManagerId().equals(userId))
                            .defaultIfEmpty(false);

                    return Mono.zip(isOwner, isManager).map(tuple -> tuple.getT1() || tuple.getT2());
                })
                .defaultIfEmpty(false);
    }
}
