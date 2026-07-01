package com.hotspotscamp.service;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hotspotscamp.dto.LedgerEntryInput;
import com.hotspotscamp.entity.Campaign;
import com.hotspotscamp.entity.LedgerEntry;
import com.hotspotscamp.entity.MercenaryCommand;
import com.hotspotscamp.repository.CampaignRepository;
import com.hotspotscamp.repository.DetachmentRepository;
import com.hotspotscamp.repository.LedgerEntryRepository;
import com.hotspotscamp.repository.MercenaryCommandRepository;
import com.hotspotscamp.util.SqlUtils;

import lombok.NonNull;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;

@Service

public class LedgerService {

    private static final Logger log = LoggerFactory.getLogger(LedgerService.class);
    private final LedgerEntryRepository ledgerEntryRepository;
    private final MercenaryCommandRepository commandRepository;
    private final DetachmentRepository detachmentRepository;
    private final UserService userService;
    private final DatabaseClient databaseClient;
    private final CampaignRepository campaignRepository;
    private final Sinks.Many<MercenaryCommand> commandSink = Sinks.many().multicast().directBestEffort();

    public LedgerService(
            LedgerEntryRepository ledgerEntryRepository,
            MercenaryCommandRepository commandRepository,
            DetachmentRepository detachmentRepository,
            UserService userService,
            DatabaseClient databaseClient,
            CampaignRepository campaignRepository) {
        this.ledgerEntryRepository = ledgerEntryRepository;
        this.commandRepository = commandRepository;
        this.detachmentRepository = detachmentRepository;
        this.userService = userService;
        this.databaseClient = databaseClient;
        this.campaignRepository = campaignRepository;
    }

    /**
     * * Creates and saves a ledger entry.
     */
    public Mono<LedgerEntry> createEntry(@NonNull UUID commandId, UUID detachmentId, UUID campaignId, String campaignName, LedgerEntryInput input) {
        LedgerEntry entry = LedgerEntry.builder()
                .id(UUID.randomUUID())
                .commandId(commandId)
                .detachmentId(detachmentId)
                .amount(input.amount())
                .description(input.description())
                .reputationChange(input.reputationChange())
                .campaignId(campaignId)
                .campaignName(campaignName)
                .monthIndex(input.monthIndex())
                .timestamp(LocalDateTime.now())
                .isNew(true)
                .build();
        return ledgerEntryRepository.save(entry);
    }

    public Flux<LedgerEntry> getLedgerEntriesByCommandId(UUID commandId) {
        return ledgerEntryRepository.findAllByCommandId(commandId);
    }

    @Transactional
    public Mono<LedgerEntry> addLedgerEntry(@NonNull UUID commandId, UUID detachmentId, LedgerEntryInput input, String userId) {
        log.trace("[TRACE] Starting addLedgerEntry: cmdId={}, detId={}", commandId, detachmentId);
        return userService.resolveOrCreateUser(userId).flatMap(user -> {
            // Resolve campaign ID and name if missing but detachment is provided to ensure rating attribution
            Mono<UUID> campaignIdMono = Mono.justOrEmpty(input.campaignId());
            if (input.campaignId() == null && detachmentId != null) {
                campaignIdMono = detachmentRepository.findById(detachmentId)
                        .map(det -> det.getCampaignId())
                        .filter(Objects::nonNull);
            }

            return campaignIdMono.flatMap(resolvedCampaignId -> {
                Mono<String> campaignNameMono = Mono.justOrEmpty(input.campaignName());
                if (input.campaignName() == null || input.campaignName().isBlank()) {
                    campaignNameMono = getCampaignName(resolvedCampaignId);
                }

                return campaignNameMono.defaultIfEmpty("").flatMap(resolvedCampaignName -> {
                    LedgerEntry entry = LedgerEntry.builder()
                            .id(UUID.randomUUID()).commandId(commandId).detachmentId(detachmentId)
                            .amount(input.amount()).description(input.description()).reputationChange(input.reputationChange())
                            .campaignId(resolvedCampaignId)
                            .campaignName(resolvedCampaignName.isBlank() ? null : resolvedCampaignName)
                            .monthIndex(input.monthIndex()).timestamp(LocalDateTime.now())
                            .isNew(true).build();
                    return ledgerEntryRepository.save(Objects.requireNonNull(entry))
                            .flatMap(saved -> syncTotalSupportPoints(commandId)
                            .then(syncReputation(commandId))
                            .thenReturn(saved));
                });
            }).switchIfEmpty(Mono.defer(() -> {
                // Fallback if no campaign ID can be resolved (e.g. general command entry)
                LedgerEntry entry = LedgerEntry.builder()
                        .id(UUID.randomUUID()).commandId(commandId).detachmentId(detachmentId)
                        .amount(input.amount()).description(input.description()).reputationChange(input.reputationChange())
                        .campaignName(input.campaignName())
                        .monthIndex(input.monthIndex()).timestamp(LocalDateTime.now())
                        .isNew(true).build();
                return ledgerEntryRepository.save(Objects.requireNonNull(entry))
                        .flatMap(saved -> syncTotalSupportPoints(commandId)
                        .then(syncReputation(commandId))
                        .thenReturn(saved));
            }));
        })
                .doOnTerminate(() -> log.trace("[TRACE] Finished addLedgerEntry"));
    }

    @Transactional
    public Mono<MercenaryCommand> syncTotalSupportPoints(@NonNull UUID commandId) {
        log.trace("[TRACE] Starting syncTotalSupportPoints: commandId={}", commandId);
        String sql = "SELECT COALESCE(SUM(amount), 0) as total FROM ledger_entries "
                + "WHERE command_id = :id";

        return SqlUtils.bindUuid(databaseClient.sql(sql), "id", commandId)
                .map((row, metadata) -> row.get(
                "total", Number.class))
                .one()
                .map(total -> total != null ? total.intValue() : 0)
                .flatMap(totalSp -> commandRepository.findById(commandId)
                .flatMap(command -> {
                    command.setTotalSupportPoints(totalSp);
                    command.setNew(false);
                    return commandRepository.save(command)
                            .onErrorResume(DuplicateKeyException.class, e -> commandRepository.findById(commandId))
                            .switchIfEmpty(Mono.error(new RuntimeException(
                                    "Failed to sync SP: Command state lost.")))
                            .doOnNext(commandSink::tryEmitNext);
                }))
                .doOnTerminate(() -> log.trace("[TRACE] Finished syncTotalSupportPoints"));
    }

    @Transactional
    public Mono<MercenaryCommand> syncReputation(@NonNull UUID commandId) {
        log.trace(
                "[TRACE] Starting syncReputation: id={}", commandId);
        String sql = "SELECT COALESCE(SUM(reputation_change), 0) as total FROM ledger_entries "
                + "WHERE command_id = :id";

        return SqlUtils.bindUuid(databaseClient.sql(sql), "id", commandId)
                .map((row, metadata) -> row.get(
                "total", Number.class))
                .one()
                .map(total -> Math.max(0, total != null ? total.intValue() : 0))
                .flatMap(totalRep -> commandRepository.findById(commandId)
                .flatMap(command -> {
                    command.setReputation(totalRep);
                    command.setNew(false);
                    return commandRepository.save(command)
                            .onErrorResume(DuplicateKeyException.class, e -> commandRepository.findById(commandId))
                            .doOnNext(commandSink::tryEmitNext);
                }))
                .doOnTerminate(() -> log.trace(
                "[TRACE] Finished syncReputation"));
    }

    public Mono<String> getCampaignName(@NonNull UUID campaignId) {
        log.trace(
                "[TRACE] Starting getCampaignName: id={}", campaignId);
        return campaignRepository.findById(campaignId).map(Campaign::getName)
                .doOnTerminate(() -> log.trace(
                "[TRACE] Finished getCampaignName"));
    }

    public Mono<Integer> getDetachmentRating(@NonNull UUID detachmentId, UUID campaignId) {
        log.trace(
                "[TRACE] Starting getDetachmentRating: id={}, campaignId={}", detachmentId, campaignId);
        if (campaignId == null) {
            return Mono.just(0); // Return 0 rating if no campaign is associated
        }

        String sql = "SELECT COALESCE(SUM(amount), 0) as total FROM ledger_entries "
                + "WHERE detachment_id = :id AND campaign_id = :campaignId";
        var spec = SqlUtils.bindUuid(databaseClient.sql(sql), "id", detachmentId);
        spec = SqlUtils.bindUuid(spec, "campaignId", campaignId);
        return spec.map((row, metadata) -> row.get(
                "total", Number.class))
                .one()
                .map(total -> total != null ? total.intValue() : 0);
    }

    public Flux<MercenaryCommand> getCommandUpdates(@NonNull UUID commandId) {
        log.trace(
                "[TRACE] Starting getCommandUpdates: commandId={}", commandId);
        return commandSink.asFlux()
                .filter(cmd -> cmd.getId().equals(commandId))
                .doOnTerminate(() -> log.trace(
                "[TRACE] Finished getCommandUpdates: commandId={}", commandId));
    }
}
