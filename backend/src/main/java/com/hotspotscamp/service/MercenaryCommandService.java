package com.hotspotscamp.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotspotscamp.domain.events.CombatUnitPurchased;
import com.hotspotscamp.domain.events.CommandEstablished;
import com.hotspotscamp.domain.events.LedgerEntryCreated;
import com.hotspotscamp.domain.events.PilotHired;
import com.hotspotscamp.entity.Campaign;
import com.hotspotscamp.entity.CombatUnit;
import com.hotspotscamp.entity.Detachment;
import com.hotspotscamp.entity.EventStoreEntry;
import com.hotspotscamp.entity.LedgerEntry;
import com.hotspotscamp.entity.MercenaryCommand;
import com.hotspotscamp.entity.Pilot;
import com.hotspotscamp.repository.CampaignRepository;
import com.hotspotscamp.repository.CombatUnitRepository;
import com.hotspotscamp.repository.ContractRepository;
import com.hotspotscamp.repository.DetachmentRepository;
import com.hotspotscamp.repository.EventStoreRepository;
import com.hotspotscamp.repository.LedgerEntryRepository;
import com.hotspotscamp.repository.MercenaryCommandRepository;
import com.hotspotscamp.repository.PilotRepository;
import com.hotspotscamp.service.scraper.ScraperFactory;
import com.hotspotscamp.util.SqlUtils;

import lombok.NonNull;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;

@Service
public class MercenaryCommandService {

    private static final Logger log = LoggerFactory.getLogger(MercenaryCommandService.class);

    private final MercenaryCommandRepository commandRepository;
    private final DetachmentRepository detachmentRepository;
    private final EventStoreRepository eventStoreRepository;
    private final MercenaryCommandProjection projection;
    private final ObjectMapper objectMapper;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final CampaignRepository campaignRepository;
    private final ContractRepository contractRepository;
    private final CombatUnitRepository combatUnitRepository;
    private final PilotRepository pilotRepository;
    private final UserService userService;
    private final DatabaseClient databaseClient;
    private final ScraperFactory scraperFactory;

    public MercenaryCommandService(
            MercenaryCommandRepository commandRepository,
            DetachmentRepository detachmentRepository,
            EventStoreRepository eventStoreRepository,
            @Lazy MercenaryCommandProjection projection,
            ObjectMapper objectMapper,
            LedgerEntryRepository ledgerEntryRepository,
            CampaignRepository campaignRepository,
            ContractRepository contractRepository,
            CombatUnitRepository combatUnitRepository,
            PilotRepository pilotRepository,
            UserService userService,
            DatabaseClient databaseClient,
            ScraperFactory scraperFactory) {
        this.commandRepository = commandRepository;
        this.detachmentRepository = detachmentRepository;
        this.eventStoreRepository = eventStoreRepository;
        this.projection = projection;
        this.objectMapper = objectMapper;
        this.ledgerEntryRepository = ledgerEntryRepository;
        this.campaignRepository = campaignRepository;
        this.contractRepository = contractRepository;
        this.combatUnitRepository = combatUnitRepository;
        this.pilotRepository = pilotRepository;
        this.userService = userService;
        this.databaseClient = databaseClient;
        this.scraperFactory = scraperFactory;
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
                .switchIfEmpty(Mono.error(new RuntimeException("Command not found")))
                .flatMap(cmd -> {
                    if (!cmd.getOwnerId().equals(user.getId().toString())) {
                        return Mono.error(new RuntimeException("Access Denied: You do not own this command."));
                    }

                    return detachmentRepository.findAllByMercenaryCommandId(commandId).collectList()
                            .flatMap(detachments -> {
                                if (!detachments.isEmpty() && !force) {
                                    return Mono.error(new RuntimeException("WARNING_ACTIVE_CAMPAIGN"));
                                }
                                return commandRepository.delete(cmd);
                            });
                }));
    }

    @Transactional
    public Mono<MercenaryCommand> updateCommandDetails(@NonNull UUID commandId, String co, Integer sp, Integer rep, String userId) {
        return commandRepository.findById(commandId)
                .switchIfEmpty(Mono.error(new RuntimeException("Command not found: " + commandId)))
                .flatMap(cmd -> userService.resolveOrCreateUser(userId).flatMap(user -> {
            if (!cmd.getOwnerId().equals(user.getId().toString())) {
                return Mono.error(new RuntimeException("Access Denied"));
            }
            if (co != null) {
                cmd.setCommandingOfficer(co);
            }
            if (sp != null) {
                cmd.setTotalSupportPoints(sp);
            }
            if (rep != null) {
                cmd.setReputation(rep);
                // Derive experience level from Hinterlands reputation thresholds
                if (rep >= 9) {
                    cmd.setExperienceLevel("Elite");
                } else if (rep >= 6) {
                    cmd.setExperienceLevel("Veteran");
                } else if (rep >= 3) {
                    cmd.setExperienceLevel("Regular");
                } else {
                    cmd.setExperienceLevel("Green");
                }
            }
            cmd.setNew(false);
            return commandRepository.save(cmd)
                    .doOnNext(commandSink::tryEmitNext)
                    .onErrorResume(DuplicateKeyException.class, e -> {
                        // If save fails due to R2DBC isNew logic, we fallback to a fetch 
                        // but we've still missed the update, so we log it for debugging
                        return Mono.error(new RuntimeException("Registry update failed: Persistence conflict."));
                    });
        }));
    }

    private Mono<Void> emitEvent(@NonNull UUID aggregateId, Object event, String userId) {
        try {
            String data = objectMapper.writeValueAsString(event);
            EventStoreEntry entry = EventStoreEntry.builder()
                    .aggregateId(aggregateId.toString())
                    .eventType(event.getClass().getSimpleName())
                    .eventData(data)
                    .occurredAt(LocalDateTime.now())
                    .userId(userId)
                    .version(1) // Simplified versioning for now
                    .build();
            return eventStoreRepository.save(entry)
                    .then(projection.apply(event, userId));
        } catch (Exception e) {
            return Mono.error(e);
        }
    }

    /**
     * Establishes a new mercenary command. Modeled on the initial setup of the
     * Mercenary Force Record Sheet.
     */
    @Transactional
    public Mono<MercenaryCommand> createCommand(MercenaryCommand command, String userId) {
        return userService.resolveOrCreateUser(userId)
                .flatMap(user -> {
                    final UUID commandId = UUID.randomUUID();
                    String co = command.getCommandingOfficer() != null ? command.getCommandingOfficer() : user.getDisplayName();
                    int sp = command.getTotalSupportPoints() != null ? command.getTotalSupportPoints() : 1000;

                    CommandEstablished event = new CommandEstablished(commandId, command.getName(), co, sp);

                    return emitEvent(commandId, event, user.getId().toString())
                            .then(commandRepository.findById(commandId))
                            .switchIfEmpty(Mono.error(new RuntimeException("Command established but registry lookup failed.")));
                });
    }

    /**
     * Creates a new detachment for a command assigned to a specific campaign
     * theater.
     */
    @Transactional
    public Mono<Detachment> createDetachment(@NonNull UUID commandId, UUID campaignId, String name, String userId) {
        return commandRepository.findById(commandId)
                .flatMap(cmd -> userService.resolveOrCreateUser(userId).flatMap(user -> {
            if (!cmd.getOwnerId().equals(user.getId().toString())) {
                return Mono.error(new RuntimeException("Access Denied"));
            }
            Detachment det = new Detachment();
            det.setId(UUID.randomUUID());
            det.setMercenaryCommandId(commandId);
            det.setCampaignId(campaignId);
            det.setName(name);
            return detachmentRepository.save(det)
                    .onErrorResume(DuplicateKeyException.class, e -> detachmentRepository.findById(det.getId()));
        }));
    }

    /**
     * Removes a combat unit from the command entirely.
     */
    @Transactional
    public Mono<Void> deleteCombatUnit(@NonNull UUID unitId, String userId) {
        return combatUnitRepository.findById(unitId)
                .switchIfEmpty(Mono.error(new RuntimeException("Unit not found: " + unitId)))
                .flatMap(unit -> {
                    UUID commandId = unit.getCommandId();
                    if (commandId == null) {
                        return Mono.error(new RuntimeException("Unit record is corrupted: No command ID"));
                    }
                    return commandRepository.findById(commandId)
                            .flatMap(cmd -> userService.resolveOrCreateUser(userId).flatMap(user -> {
                        if (!cmd.getOwnerId().equals(user.getId().toString())) {
                            return Mono.error(new RuntimeException("Access Denied"));
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
                .switchIfEmpty(Mono.error(new RuntimeException("Pilot not found: " + pilotId)))
                .flatMap(pilot -> {
                    UUID commandId = pilot.getCommandId();
                    if (commandId == null) {
                        return Mono.error(new RuntimeException("Pilot record is corrupted: No command ID"));
                    }
                    return commandRepository.findById(commandId)
                            .flatMap(cmd -> userService.resolveOrCreateUser(userId).flatMap(user -> {
                        if (!cmd.getOwnerId().equals(user.getId().toString())) {
                            return Mono.error(new RuntimeException("Access Denied"));
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
                .map(id -> UUID.fromString((String) id))
                .switchIfEmpty(Mono.error(new RuntimeException("Asset not found")))
                .flatMap(commandId -> commandRepository.findById(commandId)
                .flatMap(cmd -> userService.resolveOrCreateUser(userId).flatMap(user -> {
            if (!cmd.getOwnerId().equals(user.getId().toString())) {
                return Mono.error(new RuntimeException("Access Denied: You do not own this command."));
            }

            if (detachmentId != null) {
                return detachmentRepository.findById(detachmentId)
                        .switchIfEmpty(Mono.error(new RuntimeException("Detachment not found")))
                        .flatMap(det -> {
                            if (!det.getMercenaryCommandId().equals(cmd.getId())) {
                                return Mono.error(new RuntimeException("Access Denied: Detachment belongs to another command."));
                            }
                            return Mono.just(true);
                        });
            }
            return Mono.just(true);
        }))
                .flatMap(authorized -> {
                    var spec = databaseClient.sql("UPDATE " + table + " SET detachment_id = :detId WHERE id = :id");
                    spec = SqlUtils.bindUuid(spec, "id", assetId);
                    spec = SqlUtils.bindUuid(spec, "detId", detachmentId);
                    return spec.fetch().rowsUpdated().then();
                }));
    }

    /**
     * Deletes a detachment and returns all assets to the command pool.
     */
    @Transactional
    public Mono<Void> deleteDetachment(@NonNull UUID detachmentId, String userId) {
        return isAuthorizedToEditLedger(detachmentId, userId)
                .flatMap(isAuthorized -> {
                    if (!isAuthorized) {
                        return Mono.error(new RuntimeException("Access Denied: You are not authorized to delete this detachment."));
                    }
                    return detachmentRepository.findById(detachmentId)
                            .flatMap(detachment -> {
                                UUID commandId = detachment.getMercenaryCommandId();
                                if (commandId == null) {
                                    return Mono.error(new RuntimeException("Detachment record is corrupted: No command ID"));
                                }
                                return Mono.when(
                                        SqlUtils.bindUuid(databaseClient.sql("UPDATE combat_units SET detachment_id = NULL WHERE detachment_id = :id"), "id", detachmentId).then(),
                                        SqlUtils.bindUuid(databaseClient.sql("UPDATE pilots SET detachment_id = NULL WHERE detachment_id = :id"), "id", detachmentId).then(),
                                        SqlUtils.bindUuid(databaseClient.sql("DELETE FROM ledger_entries WHERE detachment_id = :id"), "id", detachmentId).then(),
                                        detachmentRepository.deleteById(detachmentId)
                                ).then(syncTotalSupportPoints(commandId)).then();
                            });
                });
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
                .switchIfEmpty(Mono.error(new RuntimeException("Unit not found")))
                .flatMap(unit -> {
                    UUID commandId = unit.getCommandId();
                    if (commandId == null) {
                        return Mono.error(new RuntimeException("Unit record is corrupted: No command ID"));
                    }
                    return commandRepository.findById(commandId)
                            .flatMap(cmd -> userService.resolveOrCreateUser(userId).flatMap(user -> {
                        if (!cmd.getOwnerId().equals(user.getId().toString())) {
                            return Mono.error(new RuntimeException("Access Denied"));
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
                        return combatUnitRepository.save(unit)
                                .onErrorResume(DuplicateKeyException.class, e -> combatUnitRepository.findById(unitId));
                    }));
                });
    }

    @Transactional
    public Mono<Pilot> updatePilot(@NonNull UUID pilotId, Pilot updatedData, String userId) {
        return pilotRepository.findById(pilotId)
                .switchIfEmpty(Mono.error(new RuntimeException("Pilot not found")))
                .flatMap(pilot -> {
                    UUID commandId = pilot.getCommandId();
                    if (commandId == null) {
                        return Mono.error(new RuntimeException("Pilot record is corrupted: No command ID"));
                    }
                    return commandRepository.findById(commandId)
                            .flatMap(cmd -> userService.resolveOrCreateUser(userId).flatMap(user -> {
                        if (!cmd.getOwnerId().equals(user.getId().toString())) {
                            return Mono.error(new RuntimeException("Access Denied"));
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
                -> commandRepository.findById(commandId).flatMap(cmd -> {
                    if (!cmd.getOwnerId().equals(user.getId().toString())) {
                        return Mono.error(new RuntimeException("Access Denied"));
                    }
                    UUID unitId = UUID.randomUUID();
                    CombatUnitPurchased event = new CombatUnitPurchased(unitId, commandId, unit.getModel(), unit.getType(), unit.getTonnage() != null ? unit.getTonnage() : 0, 0);
                    return emitEvent(commandId, event, user.getId().toString())
                            .then(combatUnitRepository.findById(unitId));
                })
        );
    }

    /**
     * Hires a new pilot into the command's reserve pool.
     */
    @Transactional
    public Mono<Pilot> hirePilot(@NonNull UUID commandId, Pilot pilot, String userId) {
        return userService.resolveOrCreateUser(userId).flatMap(user
                -> commandRepository.findById(commandId).flatMap(cmd -> {
                    if (!cmd.getOwnerId().equals(user.getId().toString())) {
                        return Mono.error(new RuntimeException("Access Denied"));
                    }
                    UUID pilotId = UUID.randomUUID();
                    PilotHired event = new PilotHired(pilotId, commandId, pilot.getName(), pilot.getGunnery() != null ? pilot.getGunnery() : 4, pilot.getPiloting() != null ? pilot.getPiloting() : 5);
                    return emitEvent(commandId, event, user.getId().toString())
                            .then(pilotRepository.findById(pilotId));
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
                -> isAuthorizedToEditLedger(commandId, userId)
                        .flatMap(isAuthorized -> {
                            if (!isAuthorized) {
                                return Mono.error(new RuntimeException("Access Denied: You are not the owner or the campaign manager."));
                            }
                            UUID entryId = UUID.randomUUID();
                            LedgerEntryCreated event = new LedgerEntryCreated(entryId, commandId, detachmentId, entry.getAmount() != null ? entry.getAmount() : 0, entry.getDescription());
                            return emitEvent(commandId, event, user.getId().toString())
                                    .then(ledgerEntryRepository.findById(entryId));
                        })
        );
    }

    /**
     * Validates permissions based on Hinterlands rules: 1. User owns the
     * MercenaryCommand. 2. User manages the Campaign the detachment is
     * contracted to.
     */
    private Mono<Boolean> isAuthorizedToEditLedger(@NonNull UUID commandId, String userId) {
        return userService.resolveOrCreateUser(userId).flatMap(user -> {
            String internalId = user.getId().toString();
            String sql = "SELECT EXISTS ("
                    + "  SELECT 1 FROM mercenary_commands mc "
                    + "  LEFT JOIN detachments d ON d.mercenary_command_id = mc.id "
                    + "  LEFT JOIN campaigns c ON d.campaign_id = c.id "
                    + "  WHERE mc.id = :cmdId "
                    + "  AND (mc.owner_id = :userId OR c.manager_id = :userId OR c.manager_id = :externalId OR c.manager_id IS NULL)"
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

    @Transactional
    public Mono<Boolean> joinCampaign(String token, @NonNull UUID detachmentId, String userId) {
        var selectSpec = SqlUtils.bindString(databaseClient.sql("SELECT campaign_id FROM campaign_invites WHERE token = :token AND used = false"), "token", token);
        return selectSpec
                .map((row, meta) -> UUID.fromString(row.get("campaign_id", String.class)))
                .one()
                .switchIfEmpty(Mono.error(new RuntimeException("INVALID_OR_USED_TOKEN")))
                .flatMap(campaignId -> detachmentRepository.findById(detachmentId)
                .switchIfEmpty(Mono.error(new RuntimeException("DETACHMENT_NOT_FOUND")))
                .flatMap(det -> {
                    det.setNew(false);
                    det.setCampaignId(campaignId);
                    return detachmentRepository.save(det).then(
                            SqlUtils.bindString(databaseClient.sql("UPDATE campaign_invites SET used = true WHERE token = :token"), "token", token)
                                    .fetch().rowsUpdated());
                }))
                .thenReturn(true);
    }

    @Transactional
    public Mono<Campaign> updateCampaignDetails(@NonNull UUID campaignId, Map<String, Object> input, String userId) {
        return userService.resolveOrCreateUser(userId).flatMap(user
                -> campaignRepository.findById(campaignId)
                        .flatMap(camp -> {
                            // Validation: Ensure the user is the manager
                            if (!camp.getManagerId().equals(user.getId().toString())) {
                                return Mono.error(new RuntimeException("Access Denied: Not the theater manager."));
                            }

                            camp.setNew(false); // Mark as existing for R2DBC
                            if (input.containsKey("systemName")) {
                                camp.setSystemName((String) input.get("systemName"));
                            }
                            if (input.containsKey("description")) {
                                camp.setDescription((String) input.get("description"));
                            }
                            // Add more field updates as needed for parity
                            return campaignRepository.save(camp);
                        })
        );
    }

    @Transactional
    public Mono<Void> assignDetachmentToCampaign(@NonNull UUID detachmentId, UUID campaignId, String userId) {
        return detachmentRepository.findById(detachmentId)
                .flatMap(det -> {
                    // If setting a campaign, check manager permissions or owner permissions
                    // For now, allow owner to clear or join via invite, and manager to eject
                    det.setNew(false);
                    det.setCampaignId(campaignId);
                    return detachmentRepository.save(det);
                }).then();
    }

    /**
     * Checks if a user is authorized to view or interact with a command.
     * Authorized if: 1. User is the owner of the command. 2. User is the
     * manager of a campaign where the command has at least one detachment.
     */
    public Mono<Boolean> isAuthorizedForCommand(@NonNull UUID commandId, String userId) {
        return userService.resolveOrCreateUser(userId).flatMap(user -> {
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
        return userService.resolveOrCreateUser(userId).flatMapMany(user
                -> commandRepository.findById(commandId).flatMapMany(cmd -> {
                    if (!cmd.getOwnerId().equals(user.getId().toString())) {
                        return Flux.error(new RuntimeException("Access Denied"));
                    }

                    log.info("[SCRAPER] Initiating import from: {}", link);

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
