package com.hotspotscamp.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
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
    private final ObjectMapper objectMapper;
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
            ObjectMapper objectMapper,
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
        this.objectMapper = objectMapper;
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
     * Fetches all mercenary commands belonging to the current user.
     */
    public Flux<MercenaryCommand> getCommandsByUser(String userId) {
        return userService.resolveOrCreateUser(userId)
                .flatMapMany(user -> commandRepository.findAllByOwnerId(user.getId().toString()));
    }

    /**
     * Deletes a mercenary command. If it has active campaign participations
     * (detachments), requires the force flag.
     */
    @Transactional
    public Mono<Void> deleteCommand(@NonNull UUID commandId, String userId, boolean force) {
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
                }));
    }

    @Transactional
    public Mono<MercenaryCommand> updateCommandDetails(@NonNull UUID commandId, String name, String co, Integer sp, Integer rep, String userId) {
        return commandRepository.findById(commandId)
                .switchIfEmpty(Mono.<MercenaryCommand>error(new RuntimeException("Command not found: " + commandId))) // Explicitly type Mono.error
                .flatMap(cmd -> userService.resolveOrCreateUser(userId).<MercenaryCommand>flatMap(user -> { // Explicitly type flatMap
            if (!cmd.getOwnerId().equals(user.getId().toString())) {
                return Mono.<MercenaryCommand>error(new RuntimeException("Access Denied")); // Explicitly type Mono.error
            }

            if (name != null) {
                cmd.setName(name);
            }
            if (co != null) {
                cmd.setCommandingOfficer(co);
            }
            if (sp != null) {
                cmd.setTotalSupportPoints(sp);
            }
            if (rep != null) {
                cmd.setReputation(rep);
            }
            cmd.setNew(false);
            return commandRepository.save(cmd)
                    .doOnNext(commandSink::tryEmitNext)
                    .onErrorResume(DuplicateKeyException.class, e -> {
                        return Mono.<MercenaryCommand>error(new RuntimeException("Registry update failed: Persistence conflict.")); // Explicitly type Mono.error
                    });
        }));
    }

    /**
     * Establishes a new mercenary command. Modeled on the initial setup of the
     * Mercenary Force Record Sheet.
     */
    @Transactional
    public Mono<MercenaryCommand> createCommand(MercenaryCommand command, String userId) {
        return userService.resolveOrCreateUser(userId)
                .flatMap(user -> {
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

                    return commandRepository.save(command)
                            .flatMap(savedCmd -> {
                                LedgerEntry initialEntry = LedgerEntry.builder()
                                        .commandId(commandId)
                                        .amount(startingSp)
                                        .reputationChange(startingRep)
                                        .description("INITIAL COMMAND ESTABLISHMENT")
                                        .timestamp(LocalDateTime.now())
                                        .isNew(true)
                                        .build();
                                return addLedgerEntry(commandId, null, initialEntry, userId)
                                        .thenReturn(savedCmd);
                            });
                });
    }

    /**
     * Creates a new detachment for a command assigned to a specific campaign
     * theater.
     */
    @Transactional
    public Mono<Detachment> createDetachment(@NonNull UUID commandId, UUID campaignId, String name, String userId) {
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
        }));
    }

    /**
     * Removes a combat unit from the command entirely.
     */
    @Transactional
    public Mono<Void> deleteCombatUnit(@NonNull UUID unitId, String userId) {
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
                });
    }

    /**
     * Removes a pilot from the command entirely.
     */
    @Transactional
    public Mono<Void> deletePilot(@NonNull UUID pilotId, String userId) {
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
                });
    }

    /**
     * Recalculates and updates the Command's total Support Points (SP) by
     * summing all ledger entries across all its detachments. This ensures the
     * Command state matches the "MERCENARY CONTRACT RECORD SHEET" history.
     */
    @Transactional
    public Mono<MercenaryCommand> syncTotalSupportPoints(@NonNull UUID commandId) {
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
                }));
    }

    /**
     * Returns a stream of updates for a specific command.
     */
    public Flux<MercenaryCommand> getCommandUpdates(@NonNull UUID commandId) {
        return commandSink.asFlux()
                .filter(cmd -> cmd.getId().equals(commandId));
    }

    /**
     * Assigns a unit or pilot to a detachment. Ensures the asset is not already
     * assigned elsewhere.
     */
    @Transactional
    public Mono<Void> assignAssetToDetachment(String assetType, @NonNull UUID assetId, UUID detachmentId, String userId) {
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
                })));
    }

    /**
     * Deletes a detachment and returns all assets to the command pool.
     */
    @Transactional
    public Mono<Void> deleteDetachment(@NonNull UUID detachmentId, String userId) {
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
                });
    }

    public Flux<CombatUnit> getUnitsByDetachmentId(@NonNull UUID detachmentId) {
        return combatUnitRepository.findAllByDetachmentId(detachmentId);
    }

    public Flux<Pilot> getPilotsByDetachmentId(@NonNull UUID detachmentId) {
        return pilotRepository.findAllByDetachmentId(detachmentId);
    }

    /**
     * Fetches all units and pilots for a given command.
     */
    public Mono<CommandAssetsResponse> getAssetsByCommandId(@NonNull UUID commandId) {
        return Mono.zip(
                combatUnitRepository.findAllByCommandId(commandId).collectList(),
                pilotRepository.findAllByCommandId(commandId).collectList()
        ).map(tuple -> new CommandAssetsResponse(tuple.getT1(), tuple.getT2()));
    }

    @Transactional
    public Mono<CombatUnit> updateCombatUnit(@NonNull UUID unitId, CombatUnit updatedData, String userId) {
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
                        if (updatedData.getType() != null) {
                            unit.setType(updatedData.getType());
                        }
                        if (updatedData.getModel() != null) {
                            unit.setModel(updatedData.getModel());
                        }
                        if (updatedData.getVariant() != null) {
                            unit.setVariant(updatedData.getVariant());
                        }
                        if (updatedData.getTechBase() != null) {
                            unit.setTechBase(updatedData.getTechBase());
                        }
                        if (updatedData.getTonnage() != null) {
                            unit.setTonnage(updatedData.getTonnage());
                        }
                        if (updatedData.getAsSize() != null) {
                            unit.setAsSize(updatedData.getAsSize());
                        }
                        if (updatedData.getBv() != null) {
                            unit.setBv(updatedData.getBv());
                        }
                        if (updatedData.getPv() != null) {
                            unit.setPv(updatedData.getPv());
                        }
                        if (updatedData.getAvailableFromMonth() != null) {
                            // This field was added earlier, but was not part of the initial diff provided in the problem description. Adding it here for completeness with the entity.
                            unit.setAvailableFromMonth(updatedData.getAvailableFromMonth());
                        }
                        return combatUnitRepository.save(unit)
                                .onErrorResume(DuplicateKeyException.class, e -> combatUnitRepository.findById(unitId));
                    }));
                });
    }

    @Transactional
    public Mono<Pilot> updatePilot(@NonNull UUID pilotId, Pilot updatedData, String userId) {
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
                        if (updatedData.getName() != null) {
                            pilot.setName(updatedData.getName());
                        }
                        if (updatedData.getGunnery() != null) {
                            pilot.setGunnery(updatedData.getGunnery());
                        }
                        if (updatedData.getPiloting() != null) {
                            pilot.setPiloting(updatedData.getPiloting());
                        }
                        if (updatedData.getAsSkill() != null) {
                            pilot.setAsSkill(updatedData.getAsSkill());
                        }
                        if (updatedData.getUnitType() != null) {
                            pilot.setUnitType(updatedData.getUnitType());
                        }
                        if (updatedData.getWounds() != null) {
                            pilot.setWounds(updatedData.getWounds());
                        }
                        if (updatedData.getHandicap() != null) {
                            pilot.setHandicap(updatedData.getHandicap());
                        }
                        if (updatedData.getTotalSpEarned() != null) {
                            pilot.setTotalSpEarned(updatedData.getTotalSpEarned());
                        }
                        if (updatedData.getGunnerySpEarned() != null) {
                            pilot.setGunnerySpEarned(updatedData.getGunnerySpEarned());
                        }
                        if (updatedData.getPilotingSpEarned() != null) {
                            pilot.setPilotingSpEarned(updatedData.getPilotingSpEarned());
                        }
                        if (updatedData.getEdgeTokensSpEarned() != null) {
                            pilot.setEdgeTokensSpEarned(updatedData.getEdgeTokensSpEarned());
                        }
                        if (updatedData.getEdgeAbilitySpEarned() != null) {
                            pilot.setEdgeAbilitySpEarned(updatedData.getEdgeAbilitySpEarned());
                        }
                        if (updatedData.getEdgeTokensSkill() != null) {
                            pilot.setEdgeTokensSkill(updatedData.getEdgeTokensSkill());
                        }
                        if (updatedData.getEdgeAbilitySkill() != null) {
                            pilot.setEdgeAbilitySkill(updatedData.getEdgeAbilitySkill());
                        }
                        if (updatedData.getEdgeAbilities() != null) {
                            pilot.setEdgeAbilities(updatedData.getEdgeAbilities());
                        }
                        return pilotRepository.save(pilot)
                                .onErrorResume(DuplicateKeyException.class, e -> pilotRepository.findById(pilotId));
                    }));
                });
    }

    /**
     * Fetches all detachments belonging to a specific mercenary command.
     */
    public Flux<Detachment> getDetachmentsByCommandId(@NonNull UUID commandId) {
        return detachmentRepository.findAllByMercenaryCommandId(commandId);
    }

    /**
     * Fetches all ledger entries for a specific detachment.
     */
    public Flux<LedgerEntry> getLedgerEntriesByDetachmentId(@NonNull UUID detachmentId) {
        return ledgerEntryRepository.findAllByDetachmentId(detachmentId);
    }

    /**
     * Fetches all ledger entries for a specific command.
     */
    public Flux<LedgerEntry> getLedgerEntriesByCommandId(@NonNull UUID commandId) {
        return ledgerEntryRepository.findAllByCommandId(commandId);
    }

    /**
     * Fetches a command by ID without owner filtering.
     */
    public Mono<MercenaryCommand> getCommandById(@NonNull UUID commandId) {
        return commandRepository.findById(commandId);
    }

    /**
     * Adds a new combat unit to the command's reserve pool.
     */
    @Transactional
    public Mono<CombatUnit> addCombatUnit(@NonNull UUID commandId, CombatUnit unit, String userId) {
        return userService.resolveOrCreateUser(userId).flatMap(user
                -> commandRepository.findById(commandId).switchIfEmpty(Mono.<MercenaryCommand>error(new RuntimeException("Command not found"))).<CombatUnit>flatMap(cmd -> { // Explicitly type flatMap
                    if (!cmd.getOwnerId().equals(user.getId().toString())) {
                        return Mono.<CombatUnit>error(new RuntimeException("Access Denied")); // Explicitly type Mono.error
                    }
                    unit.setId(UUID.randomUUID());
                    unit.setCommandId(commandId);
                    unit.setStatus("OPERATIONAL");
                    unit.setNew(true);
                    return combatUnitRepository.save(unit)
                            .flatMap(u -> commandRepository.findById(commandId)
                            .doOnNext(commandSink::tryEmitNext)
                            .thenReturn(u));
                })
        );
    }

    /**
     * Hires a new pilot into the command's reserve pool.
     */
    @Transactional
    public Mono<Pilot> hirePilot(@NonNull UUID commandId, Pilot pilot, String userId) {
        return userService.resolveOrCreateUser(userId).flatMap(user
                -> commandRepository.findById(commandId).switchIfEmpty(Mono.<MercenaryCommand>error(new RuntimeException("Command not found"))).<Pilot>flatMap(cmd -> { // Explicitly type flatMap
                    if (!cmd.getOwnerId().equals(user.getId().toString())) {
                        return Mono.<Pilot>error(new RuntimeException("Access Denied")); // Explicitly type Mono.error
                    }
                    pilot.setId(UUID.randomUUID());
                    pilot.setCommandId(commandId);
                    pilot.setNew(true);
                    return pilotRepository.save(pilot)
                            .flatMap(p -> commandRepository.findById(commandId)
                            .doOnNext(commandSink::tryEmitNext)
                            .thenReturn(p));
                })
        );
    }

    /**
     * Reputation logic: success/failure updates the parent command.
     */
    public Mono<Void> updateReputation(@NonNull UUID commandId, int modifier) {
        return commandRepository.findById(commandId)
                .flatMap(cmd -> {
                    cmd.setReputation(Math.max(0, cmd.getReputation() + modifier));
                    return commandRepository.save(cmd);
                }).then();
    }

    /**
     * Adds a new ledger entry after validating that the user is either the
     * command owner or the campaign manager.
     */
    @Transactional // Assuming LedgerEntry entity is updated with new fields
    public Mono<LedgerEntry> addLedgerEntry(@NonNull UUID commandId, UUID detachmentId, LedgerEntry entry, String userId) {
        return userService.resolveOrCreateUser(userId).flatMap(user
                -> isAuthorizedForCommand(commandId, userId).<LedgerEntry>flatMap(isAuthorized -> {
                    if (!isAuthorized) {
                        return Mono.<LedgerEntry>error(new RuntimeException("Access Denied: You are not the owner or the campaign manager.")); // Explicitly type Mono.error
                    }
                    entry.setId(UUID.randomUUID());
                    entry.setCommandId(commandId);
                    entry.setDetachmentId(detachmentId);
                    entry.setTimestamp(LocalDateTime.now());
                    entry.setNew(true);
                    return ledgerEntryRepository.save(entry)
                            .flatMap(saved -> syncTotalSupportPoints(commandId)
                            .then(syncReputation(commandId))
                            .thenReturn(saved));
                })
        );
    }

    /**
     * Recalculates and updates the Command's total Reputation by summing all
     * ledger entries.
     */
    @Transactional
    public Mono<MercenaryCommand> syncReputation(@NonNull UUID commandId) {
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
                }));
    }

    /**
     * Performs a monthly financial closeout for a detachment. Calculates upkeep
     * and payroll based on the current roster.
     */
    @Transactional
    public Mono<Void> processMonthlyUpkeep(@NonNull UUID commandId, @NonNull UUID detachmentId, int monthIndex, String userId) {
        return getAssetsByCommandId(commandId).flatMap(assets -> {
            // Filter assets assigned to this detachment
            long unitCount = assets.units().stream().filter(u -> detachmentId.equals(u.getDetachmentId())).count();
            long pilotCount = assets.pilots().stream().filter(p -> detachmentId.equals(p.getDetachmentId())).count();

            int totalCost = (int) ((unitCount * RulesConstants.BASE_UNIT_UPKEEP) + (pilotCount * RulesConstants.BASE_PILOT_UPKEEP)) * -1;

            LedgerEntry upkeep = LedgerEntry.builder()
                    .description("AUTOMATED MONTHLY UPKEEP: MO " + monthIndex)
                    .amount(totalCost)
                    .monthIndex(monthIndex)
                    .build();

            return addLedgerEntry(commandId, detachmentId, upkeep, userId).then();
        });
    }

    /**
     * Resolves a campaign name by its ID.
     */
    public Mono<String> getCampaignName(@NonNull UUID campaignId) {
        return campaignRepository.findById(campaignId).map(Campaign::getName);
    }

    @Transactional
    public Mono<Campaign> updateCampaignDetails(@NonNull UUID campaignId, Map<String, Object> input, String userId) {
        return userService.resolveOrCreateUser(userId).<Campaign>flatMap(user
                -> campaignRepository.findById(campaignId)
                        .<Campaign>flatMap(camp -> {
                            if (!camp.getManagerId().equals(user.getId().toString())) {
                                return Mono.<Campaign>error(new RuntimeException("Access Denied: Not the theater manager."));
                            }

                            camp.setNew(false);
                            if (input.containsKey("systemName")) {
                                camp.setSystemName((String) input.get("systemName"));
                            }
                            if (input.containsKey("description")) {
                                camp.setDescription((String) input.get("description"));
                            }
                            if (input.containsKey("monthlyPay")) {
                                camp.setMonthlyPay(TypeUtils.asInt(input.get("monthlyPay")));
                            }
                            if (input.containsKey("monthlyMaintenance")) {
                                camp.setMonthlyMaintenance(TypeUtils.asInt(input.get("monthlyMaintenance")));
                            }
                            if (input.containsKey("transportationCost")) {
                                camp.setTransportationCost(TypeUtils.asInt(input.get("transportationCost")));
                            }
                            if (input.containsKey("combatPay")) {
                                camp.setCombatPay(TypeUtils.asInt(input.get("combatPay")));
                            }

                            Integer newMonthsInput = TypeUtils.asInt(input.get("lengthInMonths"));
                            Integer newTrackCountInput = TypeUtils.asInt(input.get("trackCount"));

                            Mono<Campaign> chain = Mono.just(camp);

                            if (newMonthsInput != null) {
                                int targetMonths = Math.max(1, newMonthsInput);
                                int currentMonths = Objects.requireNonNullElse(camp.getLengthInMonths(), 1);

                                if (targetMonths < currentMonths) {
                                    // Move tracks from removed months to the highest remaining month
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
                                } else {
                                    camp.setLengthInMonths(targetMonths);
                                }
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
        );
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
        return detachmentRepository.findById(detachmentId)
                .flatMap(det -> {
                    // If setting a campaign, check manager permissions or owner permissions
                    // For now, allow owner to clear or join via invite, and manager to eject
                    det.setNew(false);
                    det.setCampaignId(campaignId);
                    return detachmentRepository.save(det)
                            .then(commandRepository.findById(Objects.requireNonNull(det.getMercenaryCommandId())))
                            .doOnNext(commandSink::tryEmitNext);
                }).then();
    }

    /**
     * Checks if a user is authorized to view or interact with a command.
     * Authorized if: 1. User is the owner of the command. 2. User is the
     * manager of a campaign where the command has at least one detachment.
     */
    public Mono<Boolean> isAuthorizedForCommand(@NonNull UUID commandId, String userId) {
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
                    .defaultIfEmpty(false);
        });
    }

    /**
     * Scrapes an external link to import mechs. Currently supports: Master Unit
     * List (MUL).
     */
    @Transactional
    public Flux<CombatUnit> importAssetsFromLink(@NonNull UUID commandId, UUID detachmentId, String link, String userId) {
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
                            })
                            .flatMap(combatUnitRepository::save);
                })
        );
    }
}
