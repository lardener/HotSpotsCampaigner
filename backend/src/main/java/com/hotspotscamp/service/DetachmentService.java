package com.hotspotscamp.service;

import java.util.Objects;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hotspotscamp.entity.Detachment;
import com.hotspotscamp.entity.MercenaryCommand;
import com.hotspotscamp.repository.DetachmentRepository;
import com.hotspotscamp.repository.LedgerEntryRepository;
import com.hotspotscamp.repository.MercenaryCommandRepository;
import com.hotspotscamp.util.SqlUtils;

import lombok.NonNull;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;

@Service
public class DetachmentService {

    private static final Logger log = LoggerFactory.getLogger(DetachmentService.class);

    private final DetachmentRepository detachmentRepository;
    private final MercenaryCommandRepository commandRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final UserService userService;
    private final DatabaseClient databaseClient;
    private final Sinks.Many<MercenaryCommand> commandSink = Sinks.many().multicast().directBestEffort();

    public DetachmentService(
            DetachmentRepository detachmentRepository,
            MercenaryCommandRepository commandRepository,
            LedgerEntryRepository ledgerEntryRepository,
            UserService userService,
            DatabaseClient databaseClient) {
        this.detachmentRepository = detachmentRepository;
        this.commandRepository = commandRepository;
        this.ledgerEntryRepository = ledgerEntryRepository;
        this.userService = userService;
        this.databaseClient = databaseClient;
    }

    /**
     * Creates a new detachment for a command assigned to a specific campaign
     * theater.
     */
    @Transactional
    public Mono<Detachment> createDetachment(@NonNull UUID commandId, UUID campaignId, String name, String userId) {
        log.trace("[TRACE] Starting createDetachment: command={}, campaign={}", commandId, campaignId);
        return commandRepository.findById(commandId)
                .flatMap(cmd -> userService.resolveOrCreateUser(userId).<Detachment>flatMap(user -> {
            if (!cmd.getOwnerId().equals(user.getId().toString())) {
                return Mono.<Detachment>error(new RuntimeException("Access Denied"));
            }
            Detachment det = new Detachment();
            det.setId(UUID.randomUUID());
            det.setMercenaryCommandId(commandId);
            det.setCampaignId(campaignId);
            det.setName(name);
            return detachmentRepository.save(det)
                    .onErrorResume(DuplicateKeyException.class, e -> detachmentRepository.findById(Objects.requireNonNull(det.getId())));
        }))
                .doOnTerminate(() -> log.trace("[TRACE] Finished createDetachment"));
    }

    /**
     * Deletes a detachment and returns all assets to the command pool.
     */
    @Transactional
    public Mono<Void> deleteDetachment(@NonNull UUID detachmentId, String userId) {
        log.trace("[TRACE] Starting deleteDetachment: id={}", detachmentId);
        return detachmentRepository.findById(detachmentId)
                .switchIfEmpty(Mono.<Detachment>error(new RuntimeException("Detachment not found: " + detachmentId)))
                .<Void>flatMap(detachment -> {
                    UUID commandId = detachment.getMercenaryCommandId();
                    return isAuthorizedForCommand(commandId, userId)
                            .<Void>flatMap(isAuthorized -> {
                                if (!isAuthorized) {
                                    return Mono.<Void>error(new RuntimeException("Access Denied: You are not authorized to delete this detachment."));
                                }
                                return Mono.when(
                                        SqlUtils.bindUuid(databaseClient.sql("UPDATE combat_units SET detachment_id = NULL WHERE detachment_id = :id"), "id", detachmentId).then(),
                                        SqlUtils.bindUuid(databaseClient.sql("UPDATE pilots SET detachment_id = NULL WHERE detachment_id = :id"), "id", detachmentId).then(),
                                        SqlUtils.bindUuid(databaseClient.sql("UPDATE ledger_entries SET detachment_id = NULL WHERE detachment_id = :id"), "id", detachmentId).then(),
                                        detachmentRepository.deleteById(detachmentId)
                                ).then(syncTotalSupportPoints(commandId)).then();
                            });
                }).doOnTerminate(() -> log.trace("[TRACE] Finished deleteDetachment"));
    }

    /**
     * Calculates the campaign rating for a detachment by summing its ledger
     * entries.
     */
    public Mono<Integer> getDetachmentRating(@NonNull UUID detachmentId, UUID campaignId) {
        log.trace("[TRACE] Starting getDetachmentRating: id={}, campaignId={}", detachmentId, campaignId);
        if (campaignId == null) {
            return Mono.just(0); // Return 0 rating if no campaign is associated
        }

        String sql = "SELECT COALESCE(SUM(amount), 0) as total FROM ledger_entries "
                + "WHERE detachment_id = :id AND campaign_id = :campaignId";
        var spec = SqlUtils.bindUuid(databaseClient.sql(sql), "id", detachmentId);
        spec = SqlUtils.bindUuid(spec, "campaignId", campaignId);
        return spec.map((row, metadata) -> row.get("total", Number.class))
                .one()
                .map(total -> total != null ? total.intValue() : 0)
                .doOnTerminate(() -> log.trace("[TRACE] Finished getDetachmentRating"));
    }

    /**
     * Fetches all detachments belonging to a specific mercenary command.
     */
    public Flux<Detachment> getDetachmentsByCommandId(@NonNull UUID commandId) {
        log.trace("[TRACE] Starting getDetachmentsByCommandId: id={}", commandId);
        return detachmentRepository.findAllByMercenaryCommandId(commandId)
                .doOnTerminate(() -> log.trace("[TRACE] Finished getDetachmentsByCommandId"));
    }

    /**
     * Recalculates and updates the Command's total Support Points (SP) by
     * summing all ledger entries across all its detachments.
     */
    @Transactional
    public Mono<MercenaryCommand> syncTotalSupportPoints(@NonNull UUID commandId) {
        log.trace("[TRACE] Starting syncTotalSupportPoints: commandId={}", commandId);
        String sql = "SELECT COALESCE(SUM(amount), 0) as total FROM ledger_entries "
                + "WHERE command_id = :id";

        return SqlUtils.bindUuid(databaseClient.sql(sql), "id", commandId)
                .map((row, metadata) -> row.get("total", Number.class))
                .one()
                .map(total -> total != null ? total.intValue() : 0)
                .flatMap(totalSp -> commandRepository.findById(commandId)
                .flatMap(command -> {
                    command.setTotalSupportPoints(totalSp);
                    command.setNew(false);
                    return commandRepository.save(command)
                            .onErrorResume(DuplicateKeyException.class, e -> commandRepository.findById(commandId))
                            .switchIfEmpty(Mono.error(new RuntimeException("Failed to sync SP: Command state lost.")))
                            .doOnNext(commandSink::tryEmitNext);
                }))
                .doOnTerminate(() -> log.trace("[TRACE] Finished syncTotalSupportPoints"));
    }

    /**
     * Checks if the user is authorized to perform operations on the command.
     */
    public Mono<Boolean> isAuthorizedForCommand(@NonNull UUID commandId, String userId) {
        return userService.resolveOrCreateUser(userId)
                .flatMap(user -> commandRepository.findById(commandId)
                .map(cmd -> cmd.getOwnerId().equals(user.getId().toString()))
                .defaultIfEmpty(false));
    }
}
