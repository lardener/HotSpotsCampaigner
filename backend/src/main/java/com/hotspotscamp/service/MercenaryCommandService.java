package com.hotspotscamp.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hotspotscamp.entity.Campaign;
import com.hotspotscamp.entity.CampaignTrack;
import com.hotspotscamp.entity.CombatUnit;
import com.hotspotscamp.entity.Detachment;
import com.hotspotscamp.entity.LedgerEntry;
import com.hotspotscamp.entity.MercenaryCommand;
import com.hotspotscamp.entity.Pilot;
import com.hotspotscamp.repository.CampaignRepository;
import com.hotspotscamp.repository.CampaignTrackRepository;
import com.hotspotscamp.repository.CombatUnitRepository;
import com.hotspotscamp.repository.ContractRepository;
import com.hotspotscamp.repository.DetachmentRepository;
import com.hotspotscamp.repository.LedgerEntryRepository;
import com.hotspotscamp.repository.MercenaryCommandRepository;
import com.hotspotscamp.repository.PilotRepository;
import com.hotspotscamp.service.scraper.ScraperFactory;
import com.hotspotscamp.util.RulesConstants;
import com.hotspotscamp.util.SqlUtils;
import com.hotspotscamp.util.TypeUtils;

import lombok.NonNull;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;

@Service
public class MercenaryCommandService {

    private static final Logger log = LoggerFactory.getLogger(MercenaryCommandService.class);

    private final MercenaryCommandRepository commandRepository;
    private final DetachmentRepository detachmentRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final CampaignTrackRepository campaignTrackRepository;
    private final CampaignRepository campaignRepository;
    private final ContractRepository contractRepository;
    private final CombatUnitRepository combatUnitRepository;
    private final PilotRepository pilotRepository;
    private final UserService userService;
    private final DatabaseClient databaseClient;
    private final ScraperFactory scraperFactory;
    private final CampaignService campaignService;

    public MercenaryCommandService(
            MercenaryCommandRepository commandRepository,
            DetachmentRepository detachmentRepository,
            LedgerEntryRepository ledgerEntryRepository,
            CampaignTrackRepository campaignTrackRepository,
            CampaignRepository campaignRepository,
            ContractRepository contractRepository,
            CombatUnitRepository combatUnitRepository,
            PilotRepository pilotRepository,
            UserService userService,
            DatabaseClient databaseClient,
            ScraperFactory scraperFactory,
            @Lazy CampaignService campaignService) {
        this.commandRepository = commandRepository;
        this.detachmentRepository = detachmentRepository;
        this.ledgerEntryRepository = ledgerEntryRepository;
        this.campaignTrackRepository = campaignTrackRepository;
        this.campaignRepository = campaignRepository;
        this.contractRepository = contractRepository;
        this.combatUnitRepository = combatUnitRepository;
        this.pilotRepository = pilotRepository;
        this.userService = userService;
        this.databaseClient = databaseClient;
        this.scraperFactory = scraperFactory;
        this.campaignService = campaignService;
    }

    /**
     * Reactive sink for broadcasting command updates to subscribers.
     */
    private final Sinks.Many<MercenaryCommand> commandSink = Sinks.many().multicast().directBestEffort();

    /**
     * DTO for returning all assets belonging to a command.
     */
    public record CommandAssetsResponse(List<CombatUnit> units, List<Pilot> pilots) {

    }

    /**
     * DTO for updating campaign details via GraphQL.
     */
    public record CampaignUpdateInput(
            String name,
            String status,
            String systemName,
            String description,
            Integer monthlyPay,
            Integer monthlyMaintenance,
            Integer transportationCost,
            Integer combatPay,
            CampaignService.RepairRules repairRules,
            Integer lengthInMonths,
            Integer trackCount,
            Double payRate,
            Integer payStep,
            String salvageTerms,
            Integer salvageStep,
            String supportTerms,
            Integer supportStep,
            String transportTerms,
            Integer transportStep,
            String commandRights,
            Integer commandStep
            ) {

    }

    public record CombatUnitUpdateInput(
            String type,
            String model,
            String variant,
            String techBase,
            Integer tonnage,
            Integer asSize,
            Integer bv,
            Integer pv,
            String status,
            UUID detachmentId
            ) {

    }

    public record PilotUpdateInput(
            String name,
            Integer gunnery,
            Integer piloting,
            Integer asSkill,
            Integer edgeTokensSkill,
            Integer edgeAbilitySkill,
            String edgeAbilities,
            String unitType,
            Integer wounds,
            Integer handicap,
            Integer totalSpEarned,
            Integer gunnerySpEarned,
            Integer pilotingSpEarned,
            Integer edgeTokensSpEarned,
            Integer edgeAbilitySpEarned,
            UUID detachmentId
            ) {

    }

    /**
     * DTO for updating command details via GraphQL.
     */
    public record CommandUpdateInput(
            String name,
            String commandingOfficer,
            Integer totalSupportPoints,
            Integer reputation
            ) {

    }

    public record LedgerEntryInput(
            Integer amount,
            String description,
            Integer reputationChange,
            String campaignName,
            Integer monthIndex
            ) {

    }

    /**
     * Fetches all mercenary commands belonging to the current user.
     */
    public Flux<MercenaryCommand> getCommandsByUser(String userId) {
        log.trace("[TRACE] Starting getCommandsByUser for user: {}", userId);
        return userService.resolveOrCreateUser(userId)
                .flatMapMany(user -> commandRepository.findAllByOwnerId(user.getId().toString()))
                .doOnTerminate(() -> log.trace("[TRACE] Finished getCommandsByUser for user: {}", userId));
    }

    /**
     * Deletes a mercenary command. If it has active campaign participations
     * (detachments), requires the force flag.
     */
    @Transactional
    public Mono<Void> deleteCommand(@NonNull UUID commandId, String userId, boolean force) {
        log.trace("[TRACE] Starting deleteCommand: id={}, user={}, force={}", commandId, userId, force);
        return userService.resolveOrCreateUser(userId)
                .flatMap(user -> commandRepository.findById(commandId)
                .switchIfEmpty(Mono.<MercenaryCommand>error(new RuntimeException("Command not found"))) // Explicitly type Mono.error
                .<Void>flatMap(cmd -> { // Explicitly type flatMap
                    if (!cmd.getOwnerId().equals(user.getId().toString())) {
                        return Mono.<Void>error(new RuntimeException("Access Denied: You do not own this command.")); // Explicitly type Mono.error
                    }

                    return detachmentRepository.findAllByMercenaryCommandId(commandId).collectList()
                            .<Void>flatMap(detachments -> { // Explicitly type flatMap
                                if (!detachments.isEmpty() && !force) {
                                    return Mono.<Void>error(new RuntimeException("WARNING_ACTIVE_CAMPAIGN")); // Explicitly type Mono.error
                                }
                                return commandRepository.delete(cmd);
                            });
                }))
                .doOnTerminate(() -> log.trace("[TRACE] Finished deleteCommand: id={}", commandId));
    }

    @Transactional
    public Mono<MercenaryCommand> updateCommandDetails(@NonNull UUID commandId, CommandUpdateInput input, String userId) {
        log.trace("[TRACE] Starting updateCommandDetails: id={}", commandId);
        return commandRepository.findById(commandId)
                .switchIfEmpty(Mono.<MercenaryCommand>error(new RuntimeException("Command not found: " + commandId))) // Explicitly type Mono.error
                .flatMap(cmd -> userService.resolveOrCreateUser(userId).<MercenaryCommand>flatMap(user -> { // Explicitly type flatMap
            if (!cmd.getOwnerId().equals(user.getId().toString())) {
                return Mono.<MercenaryCommand>error(new RuntimeException("Access Denied")); // Explicitly type Mono.error
            }

            if (input.name() != null) {
                cmd.setName(input.name());
            }
            if (input.commandingOfficer() != null) {
                cmd.setCommandingOfficer(input.commandingOfficer());
            }
            if (input.totalSupportPoints() != null) {
                cmd.setTotalSupportPoints(input.totalSupportPoints());
            }
            if (input.reputation() != null) {
                cmd.setReputation(input.reputation());
            }
            cmd.setNew(false);
            return commandRepository.save(cmd)
                    .doOnNext(commandSink::tryEmitNext)
                    .onErrorResume(DuplicateKeyException.class, e -> {
                        return Mono.<MercenaryCommand>error(new RuntimeException("Registry update failed: Persistence conflict.")); // Explicitly type Mono.error
                    });
        }))
                .doOnTerminate(() -> log.trace("[TRACE] Finished updateCommandDetails: id={}", commandId));
    }

    /**
     * Establishes a new mercenary command. Modeled on the initial setup of the
     * Mercenary Force Record Sheet.
     */
    @Transactional
    public Mono<MercenaryCommand> createCommand(MercenaryCommand command, String userId) {
        log.trace("[TRACE] Starting createCommand for user: {}", userId);
        return userService.resolveOrCreateUser(userId).<MercenaryCommand>flatMap(user -> {
            UUID commandId = UUID.randomUUID();
            command.setId(commandId);
            command.setOwnerId(user.getId().toString());
            if (command.getCommandingOfficer() == null) {
                command.setCommandingOfficer(user.getDisplayName());
            }

            // Initial values are handled via ledger entry
            int startingSp = Objects.requireNonNullElse(command.getTotalSupportPoints(), RulesConstants.STARTING_SUPPORT_POINTS);
            int startingRep = Objects.requireNonNullElse(command.getReputation(), RulesConstants.STARTING_REPUTATION);

            command.setTotalSupportPoints(0);
            command.setReputation(0);
            command.setNew(true);

            return commandRepository.save(command).<MercenaryCommand>flatMap(savedCmd -> {
                LedgerEntryInput input = new LedgerEntryInput(
                        startingSp,
                        "INITIAL COMMAND ESTABLISHMENT",
                        startingRep,
                        null,
                        null
                );
                return addLedgerEntry(commandId, null, input, userId)
                        .thenReturn(savedCmd);
            });
        })
                .doOnTerminate(() -> log.trace("[TRACE] Finished createCommand"));
    }

    /**
     * Creates a new detachment for a command assigned to a specific campaign
     * theater.
     */
    @Transactional
    public Mono<Detachment> createDetachment(@NonNull UUID commandId, UUID campaignId, String name, String userId) {
        log.trace("[TRACE] Starting createDetachment: command={}, campaign={}", commandId, campaignId);
        return commandRepository.findById(commandId)
                .flatMap(cmd -> userService.resolveOrCreateUser(userId).<Detachment>flatMap(user -> { // Explicitly type flatMap
            if (!cmd.getOwnerId().equals(user.getId().toString())) {
                return Mono.<Detachment>error(new RuntimeException("Access Denied")); // Explicitly type Mono.error
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
     * Removes a combat unit from the command entirely.
     */
    @Transactional
    public Mono<Void> deleteCombatUnit(@NonNull UUID unitId, String userId) {
        log.trace("[TRACE] Starting deleteCombatUnit: unitId={}", unitId);
        return combatUnitRepository.findById(unitId)
                .switchIfEmpty(Mono.<CombatUnit>error(new RuntimeException("Unit not found: " + unitId))) // Explicitly type Mono.error
                .<Void>flatMap(unit -> { // Explicitly type flatMap
                    UUID commandId = unit.getCommandId();
                    if (commandId == null) {
                        return Mono.<Void>error(new RuntimeException("Unit record is corrupted: No command ID")); // Explicitly type Mono.error
                    }
                    return commandRepository.findById(commandId)
                            .switchIfEmpty(Mono.<MercenaryCommand>error(new RuntimeException("Command not found"))) // Added for robustness
                            .<Void>flatMap(cmd -> userService.resolveOrCreateUser(userId).<Void>flatMap(user -> { // Explicitly type flatMap
                        if (!cmd.getOwnerId().equals(user.getId().toString())) {
                            return Mono.<Void>error(new RuntimeException("Access Denied")); // Explicitly type Mono.error
                        }
                        return combatUnitRepository.delete(unit);
                    }));
                })
                .doOnTerminate(() -> log.trace("[TRACE] Finished deleteCombatUnit"));
    }

    /**
     * Removes a pilot from the command entirely.
     */
    @Transactional
    public Mono<Void> deletePilot(@NonNull UUID pilotId, String userId) {
        log.trace("[TRACE] Starting deletePilot: pilotId={}", pilotId);
        return pilotRepository.findById(pilotId)
                .switchIfEmpty(Mono.<Pilot>error(new RuntimeException("Pilot not found: " + pilotId))) // Explicitly type Mono.error
                .<Void>flatMap(pilot -> { // Explicitly type flatMap
                    UUID commandId = pilot.getCommandId();
                    if (commandId == null) {
                        return Mono.<Void>error(new RuntimeException("Pilot record is corrupted: No command ID")); // Explicitly type Mono.error
                    }
                    return commandRepository.findById(commandId)
                            .switchIfEmpty(Mono.<MercenaryCommand>error(new RuntimeException("Command not found"))) // Added for robustness
                            .<Void>flatMap(cmd -> userService.resolveOrCreateUser(userId).<Void>flatMap(user -> { // Explicitly type flatMap
                        if (!cmd.getOwnerId().equals(user.getId().toString())) {
                            return Mono.<Void>error(new RuntimeException("Access Denied")); // Explicitly type Mono.error
                        }
                        return pilotRepository.delete(pilot);
                    }));
                })
                .doOnTerminate(() -> log.trace("[TRACE] Finished deletePilot"));
    }

    /**
     * Recalculates and updates the Command's total Support Points (SP) by
     * summing all ledger entries across all its detachments. This ensures the
     * Command state matches the "MERCENARY CONTRACT RECORD SHEET" history.
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
     * Returns a stream of updates for a specific command.
     */
    public Flux<MercenaryCommand> getCommandUpdates(@NonNull UUID commandId) {
        log.trace("[TRACE] Starting getCommandUpdates: commandId={}", commandId);
        return commandSink.asFlux()
                .filter(cmd -> cmd.getId().equals(commandId))
                .doOnTerminate(() -> log.trace("[TRACE] Finished getCommandUpdates: commandId={}", commandId));
    }

    /**
     * Assigns a unit or pilot to a detachment. Ensures the asset is not already
     * assigned elsewhere.
     */
    @Transactional
    public Mono<Void> assignAssetToDetachment(String assetType, @NonNull UUID assetId, UUID detachmentId, String userId) {
        log.trace("[TRACE] Starting assignAssetToDetachment: type={}, assetId={}, detId={}", assetType, assetId, detachmentId);
        String table = assetType.equalsIgnoreCase("UNIT") ? "combat_units" : "pilots";

        var selectSpec = databaseClient.sql("SELECT command_id FROM " + table + " WHERE id = :id");
        return SqlUtils.bindUuid(selectSpec, "id", assetId)
                .map((row, metadata) -> row.get("command_id", String.class))
                .one()
                .map(id -> UUID.fromString(id))
                .switchIfEmpty(Mono.<UUID>error(new RuntimeException("Asset not found")))
                .<Void>flatMap(commandId -> commandRepository.findById(Objects.requireNonNull(commandId))
                .switchIfEmpty(Mono.<MercenaryCommand>error(new RuntimeException("Command not found"))) // Added for robustness
                .<Void>flatMap(cmd -> userService.resolveOrCreateUser(userId).<Void>flatMap(user -> { // Explicitly type flatMap
            if (!cmd.getOwnerId().equals(user.getId().toString())) {
                return Mono.<Void>error(new RuntimeException("Access Denied: You do not own this command.")); // Explicitly type Mono.error
            }

            if (detachmentId != null) {
                return detachmentRepository.findById(detachmentId)
                        .switchIfEmpty(Mono.<Detachment>error(new RuntimeException("Detachment not found"))) // Explicitly type Mono.error
                        .<Void>flatMap(det -> { // Explicitly type flatMap
                            if (!det.getMercenaryCommandId().equals(cmd.getId())) {
                                return Mono.<Void>error(new RuntimeException("Access Denied: Detachment belongs to another command.")); // Explicitly type Mono.error
                            }
                            return Mono.empty();
                        });
            }
            return Mono.empty();
        }))
                .then(Mono.defer(() -> { // This then() is correctly typed by the preceding flatMap
                    var spec = databaseClient.sql("UPDATE " + table + " SET detachment_id = :detId WHERE id = :id");
                    spec = SqlUtils.bindUuid(spec, "id", assetId);
                    spec = SqlUtils.bindUuid(spec, "detId", detachmentId);
                    return spec.fetch().rowsUpdated().then();
                })))
                .doOnTerminate(() -> log.trace("[TRACE] Finished assignAssetToDetachment"));
    }

    /**
     * Deletes a detachment and returns all assets to the command pool.
     */
    @Transactional
    public Mono<Void> deleteDetachment(@NonNull UUID detachmentId, String userId) {
        log.trace("[TRACE] Starting deleteDetachment: id={}", detachmentId);
        return detachmentRepository.findById(detachmentId)
                .switchIfEmpty(Mono.<Detachment>error(new RuntimeException("Detachment not found: " + detachmentId))) // Explicitly type Mono.error
                .<Void>flatMap(detachment -> { // Explicitly type flatMap
                    UUID commandId = detachment.getMercenaryCommandId();
                    return isAuthorizedForCommand(commandId, userId)
                            .<Void>flatMap(isAuthorized -> { // Explicitly type flatMap
                                if (!isAuthorized) {
                                    return Mono.<Void>error(new RuntimeException("Access Denied: You are not authorized to delete this detachment.")); // Explicitly type Mono.error
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

    public Flux<CombatUnit> getUnitsByDetachmentId(@NonNull UUID detachmentId) {
        log.trace("[TRACE] Starting getUnitsByDetachmentId: id={}", detachmentId);
        return combatUnitRepository.findAllByDetachmentId(detachmentId)
                .doOnTerminate(() -> log.trace("[TRACE] Finished getUnitsByDetachmentId"));
    }

    public Flux<Pilot> getPilotsByDetachmentId(@NonNull UUID detachmentId) {
        log.trace("[TRACE] Starting getPilotsByDetachmentId: id={}", detachmentId);
        return pilotRepository.findAllByDetachmentId(detachmentId)
                .doOnTerminate(() -> log.trace("[TRACE] Finished getPilotsByDetachmentId"));
    }

    /**
     * Fetches all units and pilots for a given command.
     */
    public Mono<CommandAssetsResponse> getAssetsByCommandId(@NonNull UUID commandId) {
        log.trace("[TRACE] Starting getAssetsByCommandId: id={}", commandId);
        return Mono.zip(
                combatUnitRepository.findAllByCommandId(commandId).collectList(),
                pilotRepository.findAllByCommandId(commandId).collectList()
        ).map(tuple -> new CommandAssetsResponse(tuple.getT1(), tuple.getT2()))
                .doOnTerminate(() -> log.trace("[TRACE] Finished getAssetsByCommandId"));
    }

    @Transactional
    public Mono<CombatUnit> updateCombatUnit(@NonNull UUID unitId, CombatUnitUpdateInput input, String userId) {
        log.trace("[TRACE] Starting updateCombatUnit: id={}", unitId);
        return combatUnitRepository.findById(unitId)
                .switchIfEmpty(Mono.<CombatUnit>error(new RuntimeException("Unit not found"))) // Explicitly type Mono.error
                .<CombatUnit>flatMap(unit -> { // Explicitly type flatMap
                    UUID commandId = unit.getCommandId();
                    if (commandId == null) {
                        return Mono.<CombatUnit>error(new RuntimeException("Unit record is corrupted: No command ID")); // Explicitly type Mono.error
                    }
                    return commandRepository.findById(commandId)
                            .switchIfEmpty(Mono.<MercenaryCommand>error(new RuntimeException("Command not found"))) // Added for robustness
                            .<CombatUnit>flatMap(cmd -> userService.resolveOrCreateUser(userId).<CombatUnit>flatMap(user -> { // Explicitly type flatMap
                        if (!cmd.getOwnerId().equals(user.getId().toString())) {
                            return Mono.<CombatUnit>error(new RuntimeException("Access Denied")); // Explicitly type Mono.error
                        }
                        unit.setNew(false);
                        if (input.type() != null) {
                            unit.setType(input.type());
                        }
                        if (input.model() != null) {
                            unit.setModel(input.model());
                        }
                        if (input.variant() != null) {
                            unit.setVariant(input.variant());
                        }
                        if (input.techBase() != null) {
                            unit.setTechBase(input.techBase());
                        }
                        if (input.tonnage() != null) {
                            unit.setTonnage(input.tonnage());
                        }
                        if (input.asSize() != null) {
                            unit.setAsSize(input.asSize());
                        }
                        if (input.bv() != null) {
                            unit.setBv(input.bv());
                        }
                        if (input.pv() != null) {
                            unit.setPv(input.pv());
                        }
                        if (input.status() != null) {
                            unit.setStatus(input.status());
                        }
                        if (input.detachmentId() != null) {
                            unit.setDetachmentId(input.detachmentId());
                        }
                        return combatUnitRepository.save(unit)
                                .onErrorResume(DuplicateKeyException.class, e -> combatUnitRepository.findById(unitId));
                    }));
                })
                .doOnTerminate(() -> log.trace("[TRACE] Finished updateCombatUnit"));
    }

    @Transactional
    public Mono<Pilot> updatePilot(@NonNull UUID pilotId, PilotUpdateInput input, String userId) {
        log.trace("[TRACE] Starting updatePilot: id={}", pilotId);
        return pilotRepository.findById(pilotId)
                .switchIfEmpty(Mono.<Pilot>error(new RuntimeException("Pilot not found"))) // Explicitly type Mono.error
                .<Pilot>flatMap(pilot -> { // Explicitly type flatMap
                    UUID commandId = pilot.getCommandId();
                    if (commandId == null) {
                        return Mono.<Pilot>error(new RuntimeException("Pilot record is corrupted: No command ID")); // Explicitly type Mono.error
                    }
                    return commandRepository.findById(commandId)
                            .switchIfEmpty(Mono.<MercenaryCommand>error(new RuntimeException("Command not found"))) // Added for robustness
                            .<Pilot>flatMap(cmd -> userService.resolveOrCreateUser(userId).<Pilot>flatMap(user -> { // Explicitly type flatMap
                        if (!cmd.getOwnerId().equals(user.getId().toString())) {
                            return Mono.<Pilot>error(new RuntimeException("Access Denied")); // Explicitly type Mono.error
                        }
                        pilot.setNew(false);
                        if (input.name() != null) {
                            pilot.setName(input.name());
                        }
                        if (input.gunnery() != null) {
                            pilot.setGunnery(input.gunnery());
                        }
                        if (input.piloting() != null) {
                            pilot.setPiloting(input.piloting());
                        }
                        if (input.asSkill() != null) {
                            pilot.setAsSkill(input.asSkill());
                        }
                        if (input.unitType() != null) {
                            pilot.setUnitType(input.unitType());
                        }
                        if (input.wounds() != null) {
                            pilot.setWounds(input.wounds());
                        }
                        if (input.handicap() != null) {
                            pilot.setHandicap(input.handicap());
                        }
                        if (input.totalSpEarned() != null) {
                            pilot.setTotalSpEarned(input.totalSpEarned());
                        }
                        if (input.gunnerySpEarned() != null) {
                            pilot.setGunnerySpEarned(input.gunnerySpEarned());
                        }
                        if (input.pilotingSpEarned() != null) {
                            pilot.setPilotingSpEarned(input.pilotingSpEarned());
                        }
                        if (input.edgeTokensSpEarned() != null) {
                            pilot.setEdgeTokensSpEarned(input.edgeTokensSpEarned());
                        }
                        if (input.edgeAbilitySpEarned() != null) {
                            pilot.setEdgeAbilitySpEarned(input.edgeAbilitySpEarned());
                        }
                        if (input.edgeTokensSkill() != null) {
                            pilot.setEdgeTokensSkill(input.edgeTokensSkill());
                        }
                        if (input.edgeAbilitySkill() != null) {
                            pilot.setEdgeAbilitySkill(input.edgeAbilitySkill());
                        }
                        if (input.edgeAbilities() != null) {
                            pilot.setEdgeAbilities(input.edgeAbilities());
                        }
                        return pilotRepository.save(pilot)
                                .onErrorResume(DuplicateKeyException.class, e -> pilotRepository.findById(pilotId));
                    }));
                })
                .doOnTerminate(() -> log.trace("[TRACE] Finished updatePilot"));
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
     * Fetches all ledger entries for a specific detachment.
     */
    public Flux<LedgerEntry> getLedgerEntriesByDetachmentId(@NonNull UUID detachmentId) {
        log.trace("[TRACE] Starting getLedgerEntriesByDetachmentId: id={}", detachmentId);
        return ledgerEntryRepository.findAllByDetachmentId(detachmentId)
                .doOnTerminate(() -> log.trace("[TRACE] Finished getLedgerEntriesByDetachmentId"));
    }

    /**
     * Fetches all ledger entries for a specific command.
     */
    public Flux<LedgerEntry> getLedgerEntriesByCommandId(@NonNull UUID commandId) {
        log.trace("[TRACE] Starting getLedgerEntriesByCommandId: id={}", commandId);
        return ledgerEntryRepository.findAllByCommandId(commandId)
                .doOnTerminate(() -> log.trace("[TRACE] Finished getLedgerEntriesByCommandId"));
    }

    /**
     * Fetches a command by ID without owner filtering.
     */
    public Mono<MercenaryCommand> getCommandById(@NonNull UUID commandId) {
        log.trace("[TRACE] Starting getCommandById: id={}", commandId);
        return commandRepository.findById(commandId)
                .doOnTerminate(() -> log.trace("[TRACE] Finished getCommandById"));
    }

    /**
     * Adds a new combat unit to the command's reserve pool.
     */
    @Transactional
    public Mono<CombatUnit> addCombatUnit(@NonNull UUID commandId, CombatUnitUpdateInput input, String userId) {
        log.trace("[TRACE] Starting addCombatUnit: commandId={}", commandId);
        return userService.resolveOrCreateUser(userId).flatMap(user
                -> commandRepository.findById(commandId).switchIfEmpty(Mono.<MercenaryCommand>error(new RuntimeException("Command not found"))).<CombatUnit>flatMap(cmd -> { // Explicitly type flatMap
                    if (!cmd.getOwnerId().equals(user.getId().toString())) {
                        return Mono.<CombatUnit>error(new RuntimeException("Access Denied")); // Explicitly type Mono.error
                    }
                    CombatUnit unit = CombatUnit.builder()
                            .id(UUID.randomUUID())
                            .commandId(commandId)
                            .type(input.type())
                            .model(input.model())
                            .variant(input.variant())
                            .techBase(input.techBase())
                            .tonnage(input.tonnage())
                            .asSize(input.asSize())
                            .bv(input.bv())
                            .pv(input.pv())
                            .status(input.status() != null ? input.status() : "OPERATIONAL")
                            .detachmentId(input.detachmentId())
                            .isNew(true)
                            .build();

                    return combatUnitRepository.save(Objects.requireNonNull(unit))
                            .flatMap(u -> commandRepository.findById(commandId)
                            .doOnNext(commandSink::tryEmitNext)
                            .thenReturn(u));
                })
        )
                .doOnTerminate(() -> log.trace("[TRACE] Finished addCombatUnit"));
    }

    /**
     * Hires a new pilot into the command's reserve pool.
     */
    @Transactional
    public Mono<Pilot> hirePilot(@NonNull UUID commandId, PilotUpdateInput input, String userId) {
        log.trace("[TRACE] Starting hirePilot: commandId={}", commandId);
        return userService.resolveOrCreateUser(userId).flatMap(user
                -> commandRepository.findById(commandId).switchIfEmpty(Mono.<MercenaryCommand>error(new RuntimeException("Command not found"))).<Pilot>flatMap(cmd -> { // Explicitly type flatMap
                    if (!cmd.getOwnerId().equals(user.getId().toString())) {
                        return Mono.<Pilot>error(new RuntimeException("Access Denied")); // Explicitly type Mono.error
                    }
                    Pilot pilot = Pilot.builder()
                            .id(UUID.randomUUID())
                            .commandId(commandId)
                            .name(input.name())
                            .gunnery(input.gunnery())
                            .piloting(input.piloting())
                            .asSkill(input.asSkill())
                            .unitType(input.unitType())
                            .wounds(TypeUtils.asInt(input.wounds(), 0))
                            .handicap(TypeUtils.asInt(input.handicap(), 0))
                            .totalSpEarned(TypeUtils.asInt(input.totalSpEarned(), 0))
                            .gunnerySpEarned(TypeUtils.asInt(input.gunnerySpEarned(), 0))
                            .pilotingSpEarned(TypeUtils.asInt(input.pilotingSpEarned(), 0))
                            .edgeTokensSpEarned(TypeUtils.asInt(input.edgeTokensSpEarned(), 0))
                            .edgeAbilitySpEarned(TypeUtils.asInt(input.edgeAbilitySpEarned(), 0))
                            .edgeTokensSkill(TypeUtils.asInt(input.edgeTokensSkill(), 0))
                            .edgeAbilitySkill(TypeUtils.asInt(input.edgeAbilitySkill(), 0))
                            .edgeAbilities(input.edgeAbilities())
                            .detachmentId(input.detachmentId())
                            .isNew(true)
                            .build();

                    return pilotRepository.save(Objects.requireNonNull(pilot))
                            .flatMap(p -> commandRepository.findById(commandId)
                            .doOnNext(commandSink::tryEmitNext)
                            .thenReturn(p));
                })
        )
                .doOnTerminate(() -> log.trace("[TRACE] Finished hirePilot"));
    }

    /**
     * Adds a new ledger entry after validating that the user is either the
     * command owner or the campaign manager.
     */
    @Transactional
    public Mono<LedgerEntry> addLedgerEntry(@NonNull UUID commandId, UUID detachmentId, LedgerEntryInput input, String userId) {
        log.trace("[TRACE] Starting addLedgerEntry: cmdId={}, detId={}", commandId, detachmentId);
        return userService.resolveOrCreateUser(userId).flatMap(user
                -> isAuthorizedForCommand(commandId, userId).<LedgerEntry>flatMap(isAuthorized -> {
                    if (!isAuthorized) {
                        return Mono.<LedgerEntry>error(new RuntimeException("Access Denied: You are not the owner or the campaign manager.")); // Explicitly type Mono.error
                    }
                    LedgerEntry entry = LedgerEntry.builder()
                            .id(UUID.randomUUID()).commandId(commandId).detachmentId(detachmentId)
                            .amount(input.amount()).description(input.description()).reputationChange(input.reputationChange())
                            .campaignName(input.campaignName()).monthIndex(input.monthIndex()).timestamp(LocalDateTime.now())
                            .isNew(true).build();
                    return ledgerEntryRepository.save(Objects.requireNonNull(entry))
                            .flatMap(saved -> syncTotalSupportPoints(commandId)
                            .then(syncReputation(commandId))
                            .thenReturn(saved));
                })
        )
                .doOnTerminate(() -> log.trace("[TRACE] Finished addLedgerEntry"));
    }

    /**
     * Recalculates and updates the Command's total Reputation by summing all
     * ledger entries.
     */
    @Transactional
    public Mono<MercenaryCommand> syncReputation(@NonNull UUID commandId) {
        log.trace("[TRACE] Starting syncReputation: id={}", commandId);
        String sql = "SELECT COALESCE(SUM(reputation_change), 0) as total FROM ledger_entries "
                + "WHERE command_id = :id";

        return SqlUtils.bindUuid(databaseClient.sql(sql), "id", commandId)
                .map((row, metadata) -> row.get("total", Number.class))
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
                .doOnTerminate(() -> log.trace("[TRACE] Finished syncReputation"));
    }

    /**
     * Resolves a campaign name by its ID.
     */
    public Mono<String> getCampaignName(@NonNull UUID campaignId) {
        log.trace("[TRACE] Starting getCampaignName: id={}", campaignId);
        return campaignRepository.findById(campaignId).map(Campaign::getName)
                .doOnTerminate(() -> log.trace("[TRACE] Finished getCampaignName"));
    }

    @Transactional
    public Mono<Campaign> updateCampaignDetails(@NonNull UUID campaignId, CampaignUpdateInput input, String userId) {
        log.trace("[TRACE] Starting updateCampaignDetails: id={}", campaignId);
        return userService.resolveOrCreateUser(userId).<Campaign>flatMap(user
                -> campaignRepository.findById(campaignId)
                        .<Campaign>flatMap(camp -> {
                            if (!camp.getManagerId().equals(user.getId().toString())) {
                                return Mono.<Campaign>error(new RuntimeException("Access Denied: Not the theater manager."));
                            }

                            camp.setNew(false);
                            if (input.name() != null) {
                                camp.setName(input.name());
                            }
                            if (input.systemName() != null) {
                                camp.setSystemName(input.systemName());
                            }
                            if (input.description() != null) {
                                camp.setDescription(input.description());
                            }
                            if (input.payRate() != null) {
                                camp.setPayRate(input.payRate());
                            }
                            if (input.payStep() != null) {
                                camp.setPayStep(input.payStep());
                            }
                            if (input.salvageTerms() != null) {
                                camp.setSalvageTerms(input.salvageTerms());
                            }
                            if (input.salvageStep() != null) {
                                camp.setSalvageStep(input.salvageStep());
                            }
                            if (input.supportTerms() != null) {
                                camp.setSupportTerms(input.supportTerms());
                            }
                            if (input.supportStep() != null) {
                                camp.setSupportStep(input.supportStep());
                            }
                            if (input.transportTerms() != null) {
                                camp.setTransportTerms(input.transportTerms());
                            }
                            if (input.transportStep() != null) {
                                camp.setTransportStep(input.transportStep());
                            }
                            if (input.commandRights() != null) {
                                camp.setCommandRights(input.commandRights());
                            }
                            if (input.commandStep() != null) {
                                camp.setCommandStep(input.commandStep());
                            }
                            if (input.monthlyPay() != null) {
                                camp.setMonthlyPay(input.monthlyPay());
                            }
                            if (input.monthlyMaintenance() != null) {
                                camp.setMonthlyMaintenance(input.monthlyMaintenance());
                            }
                            if (input.transportationCost() != null) {
                                camp.setTransportationCost(input.transportationCost());
                            }
                            if (input.combatPay() != null) {
                                camp.setCombatPay(input.combatPay());
                            }
                            if (input.repairRules() != null) {
                                CampaignService.RepairRules rules = input.repairRules();
                                camp.setRepairRules(rules);
                                if (rules.armorMultiplier() != null) {
                                    camp.setArmorMultiplier(rules.armorMultiplier());
                                }
                                if (rules.internalMultiplier() != null) {
                                    camp.setInternalMultiplier(rules.internalMultiplier());
                                }
                                if (rules.crippledMultiplier() != null) {
                                    camp.setCrippledMultiplier(rules.crippledMultiplier());
                                }
                                if (rules.destroyedMultiplier() != null) {
                                    camp.setDestroyedMultiplier(rules.destroyedMultiplier());
                                }
                                if (rules.nonMechModifier() != null) {
                                    camp.setNonMechModifier(rules.nonMechModifier());
                                }
                                if (rules.mixedTechModifier() != null) {
                                    camp.setMixedTechModifier(rules.mixedTechModifier());
                                }
                                if (rules.clanTechModifier() != null) {
                                    camp.setClanTechModifier(rules.clanTechModifier());
                                }
                            }

                            Integer newMonthsInput = input.lengthInMonths();
                            Integer newTrackCountInput = input.trackCount();

                            Mono<Campaign> chain = Mono.just(camp);

                            if (input.status() != null) {
                                String oldStatus = camp.getStatus();
                                String newStatus = input.status();
                                camp.setStatus(newStatus);
                                if ("INACTIVE".equalsIgnoreCase(newStatus) && !"INACTIVE".equalsIgnoreCase(oldStatus)) {
                                    chain = SqlUtils.bindUuid(databaseClient.sql("UPDATE detachments SET campaign_id = NULL WHERE campaign_id = :id"), "id", campaignId)
                                            .fetch().rowsUpdated().then(chain);
                                }
                            }

                            if (newMonthsInput != null) {
                                int targetMonths = Math.max(1, newMonthsInput);
                                // Ensure all tracks are within the updated theater duration.
                                // If duration is reduced, orphaned tracks are moved to the final month.
                                chain = campaignTrackRepository.findAllByCampaignId(camp.getId())
                                        .filter(t -> (Objects.requireNonNullElse(t.getMonthIndex(), 1)) > targetMonths)
                                        .flatMap(t -> {
                                            t.setMonthIndex(targetMonths);
                                            t.setNew(false);
                                            return campaignTrackRepository.save(t);
                                        })
                                        .then(Mono.fromCallable(() -> {
                                            camp.setLengthInMonths(targetMonths);
                                            return camp;
                                        }));
                            }
                            return chain.flatMap(c -> {
                                if (newTrackCountInput != null) {
                                    int targetTracks = Math.max(1, newTrackCountInput);
                                    if (targetTracks != Objects.requireNonNullElse(c.getTrackCount(), 0)) {
                                        return reconcileTracks(c, targetTracks);
                                    }
                                }
                                return campaignRepository.save(Objects.requireNonNull(c));
                            });
                        })
        )
                .doOnTerminate(() -> log.trace("[TRACE] Finished updateCampaignDetails"));
    }

    private Mono<Campaign> reconcileTracks(Campaign camp, int newCount) {
        return campaignTrackRepository.findAllByCampaignId(camp.getId()).collectList()
                .flatMap(existing -> {
                    int targetCount = Math.max(1, newCount);
                    int actualCount = existing.size();
                    camp.setTrackCount(targetCount);

                    if (targetCount > actualCount) {
                        int numToAdd = targetCount - actualCount;
                        int lastMonth = Objects.requireNonNullElse(camp.getLengthInMonths(), 1);

                        return contractRepository.findAllByCampaignId(camp.getId())
                                .filter(c -> Boolean.TRUE.equals(c.getPrimaryContract()))
                                .next()
                                .flatMap(primary -> {
                                    List<CampaignService.GeneratedTrack> generated = campaignService.generateTracks(
                                            primary.getMissionType(),
                                            primary.getCommandRights(),
                                            numToAdd);
                                    return Flux.fromIterable(generated)
                                            .index()
                                            .flatMap(tuple -> campaignTrackRepository.save(Objects.requireNonNull(
                                            CampaignTrack.builder()
                                                    .id(UUID.randomUUID())
                                                    .campaignId(camp.getId())
                                                    .trackName(tuple.getT2().name())
                                                    .complications(tuple.getT2().complication())
                                                    .sequenceOrder(actualCount + tuple.getT1().intValue())
                                                    .monthIndex(lastMonth)
                                                    .isNew(true)
                                                    .build())))
                                            .then(campaignRepository.save(camp));
                                })
                                .switchIfEmpty(Mono.defer(() -> Flux.range(actualCount, numToAdd)
                                .flatMap(i -> campaignTrackRepository.save(Objects.requireNonNull(
                                CampaignTrack.builder()
                                        .id(UUID.randomUUID())
                                        .campaignId(camp.getId())
                                        .trackName("NEW OPERATIONAL TRACK")
                                        .sequenceOrder(i)
                                        .monthIndex(lastMonth)
                                        .isNew(true)
                                        .build())))
                                .then(campaignRepository.save(camp))));
                    } else if (targetCount < actualCount) {
                        // Requirement: Reducing number of tracks deletes tracks with higher sequence numbers
                        List<CampaignTrack> toDelete = existing.stream()
                                .sorted((a, b) -> b.getSequenceOrder().compareTo(a.getSequenceOrder()))
                                .limit(actualCount - targetCount)
                                .toList();
                        return Flux.fromIterable(toDelete)
                                .flatMap(campaignTrackRepository::delete)
                                .then(campaignRepository.save(camp));
                    }
                    return campaignRepository.save(camp);
                });
    }

    @Transactional
    public Mono<Void> assignDetachmentToCampaign(@NonNull UUID detachmentId, UUID campaignId, String userId) {
        log.trace("[TRACE] Starting assignDetachmentToCampaign: detId={}, campId={}", detachmentId, campaignId);
        return detachmentRepository.findById(detachmentId)
                .flatMap(det -> {
                    // If setting a campaign, check manager permissions or owner permissions
                    // For now, allow owner to clear or join via invite, and manager to eject
                    det.setNew(false);
                    det.setCampaignId(campaignId);
                    return detachmentRepository.save(det)
                            .then(commandRepository.findById(Objects.requireNonNull(det.getMercenaryCommandId())))
                            .doOnNext(commandSink::tryEmitNext);
                }).then()
                .doOnTerminate(() -> log.trace("[TRACE] Finished assignDetachmentToCampaign"));
    }

    /**
     * Checks if a user is authorized to view or interact with a command.
     * Authorized if: 1. User is the owner of the command. 2. User is the
     * manager of a campaign where the command has at least one detachment.
     */
    public Mono<Boolean> isAuthorizedForCommand(@NonNull UUID commandId, String userId) {
        log.trace("[TRACE] Starting isAuthorizedForCommand: cmdId={}, user={}", commandId, userId);
        return userService.resolveOrCreateUser(userId).<Boolean>flatMap(user -> {
            String internalId = user.getId().toString();
            String sql = "SELECT EXISTS ("
                    + "  SELECT 1 FROM mercenary_commands mc "
                    + "  LEFT JOIN detachments d ON d.mercenary_command_id = mc.id "
                    + "  LEFT JOIN campaigns c ON d.campaign_id = c.id "
                    + "  WHERE mc.id = :cmdId "
                    + "  AND (mc.owner_id = :userId OR c.manager_id = :userId OR c.manager_id = :externalId)"
                    + ")";

            var spec = SqlUtils.bindUuid(databaseClient.sql(sql), "cmdId", commandId);
            spec = SqlUtils.bindString(spec, "userId", internalId);
            spec = SqlUtils.bindString(spec, "externalId", userId);
            return spec.map((row, metadata) -> row.get(0, Number.class))
                    .one()
                    .map(n -> n != null && n.longValue() > 0)
                    .defaultIfEmpty(false)
                    .doOnTerminate(() -> log.trace("[TRACE] Finished isAuthorizedForCommand"));
        });
    }

    /**
     * Scrapes an external link to import mechs. Currently supports: Master Unit
     * List (MUL).
     */
    @Transactional
    public Flux<CombatUnit> importAssetsFromLink(@NonNull UUID commandId, UUID detachmentId, String link, String userId) {
        log.trace("[TRACE] Starting importAssetsFromLink: cmdId={}, link={}", commandId, link);
        return userService.resolveOrCreateUser(userId).<CombatUnit>flatMapMany(user
                -> commandRepository.findById(commandId).<CombatUnit>flatMapMany(cmd -> {
                    if (!cmd.getOwnerId().equals(user.getId().toString())) {
                        return Flux.error(new RuntimeException("Access Denied"));
                    }

                    return scraperFactory.getScraper(link)
                            .flatMapMany(scraper -> scraper.scrape(link))
                            .map(unit -> {
                                unit.setId(UUID.randomUUID());
                                unit.setCommandId(commandId);
                                unit.setDetachmentId(detachmentId);
                                unit.setStatus("OPERATIONAL");
                                unit.setNew(true);
                                return unit;
                            });
                })
        )
                .doOnTerminate(() -> log.trace("[TRACE] Finished importAssetsFromLink"));
    }
}
