package com.hotspotscamp.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hotspotscamp.entity.CombatUnit;
import com.hotspotscamp.entity.Detachment;
import com.hotspotscamp.entity.LedgerEntry;
import com.hotspotscamp.entity.MercenaryCommand;
import com.hotspotscamp.entity.Pilot;
import com.hotspotscamp.repository.CampaignRepository;
import com.hotspotscamp.repository.CombatUnitRepository;
import com.hotspotscamp.repository.ContractRepository;
import com.hotspotscamp.repository.DetachmentRepository;
import com.hotspotscamp.repository.LedgerEntryRepository;
import com.hotspotscamp.repository.MercenaryCommandRepository;
import com.hotspotscamp.repository.PilotRepository;
import com.hotspotscamp.util.SqlUtils;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;

@Service
@RequiredArgsConstructor
public class MercenaryCommandService {

    private final MercenaryCommandRepository commandRepository;
    private final DetachmentRepository detachmentRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final CampaignRepository campaignRepository;
    private final ContractRepository contractRepository;
    private final CombatUnitRepository combatUnitRepository;
    private final PilotRepository pilotRepository;
    private final UserService userService;
    private final DatabaseClient databaseClient;

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
    public Mono<Void> deleteCommand(UUID commandId, String userId, boolean force) {
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
    public Mono<MercenaryCommand> updateCommandDetails(UUID commandId, String co, Integer sp, Integer rep, String userId) {
        return commandRepository.findById(commandId)
                .flatMap(cmd -> userService.resolveOrCreateUser(userId).flatMap(user -> {
            if (!cmd.getOwnerId().equals(user.getId().toString())) {
                return Mono.error(new RuntimeException("Access Denied"));
            }
            cmd.setNew(false);
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
            return commandRepository.save(cmd)
                    .doOnNext(saved -> commandSink.tryEmitNext(saved))
                    .onErrorResume(DuplicateKeyException.class, e -> {
                        // If save fails due to R2DBC isNew logic, we fallback to a fetch 
                        // but we've still missed the update, so we log it for debugging
                        return Mono.error(new RuntimeException("Registry update failed: Persistence conflict."));
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
                    command.setId(UUID.randomUUID());
                    command.setOwnerId(user.getId().toString());

                    // Set Commanding Officer from user profile if not provided
                    if (command.getCommandingOfficer() == null || command.getCommandingOfficer().isEmpty()) {
                        String fallback = user.getDisplayName() != null ? user.getDisplayName() : "Senior Commander";
                        command.setCommandingOfficer(fallback);
                    }

                    // Initial SP setup (Hinterlands default is often 1000 for a starting force)
                    if (command.getTotalSupportPoints() == null) {
                        command.setTotalSupportPoints(1000);
                    }

                    // Initial Reputation and Experience setup
                    if (command.getReputation() == null) {
                        command.setReputation(1);
                    }
                    if (command.getExperienceLevel() == null) {
                        command.setExperienceLevel("Green");
                    }

                    return commandRepository.save(command)
                            .onErrorResume(DuplicateKeyException.class, e -> commandRepository.findById(command.getId()));
                });
    }

    /**
     * Creates a new detachment for a command assigned to a specific campaign
     * theater.
     */
    @Transactional
    public Mono<Detachment> createDetachment(UUID commandId, UUID campaignId, String name, String userId) {
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
    public Mono<Void> deleteCombatUnit(UUID unitId, String userId) {
        return combatUnitRepository.findById(unitId)
                .flatMap(unit -> commandRepository.findById(unit.getCommandId())
                .flatMap(cmd -> userService.resolveOrCreateUser(userId).flatMap(user -> {
            if (!cmd.getOwnerId().equals(user.getId().toString())) {
                return Mono.error(new RuntimeException("Access Denied"));
            }
            return combatUnitRepository.delete(unit);
        })));
    }

    /**
     * Removes a pilot from the command entirely.
     */
    @Transactional
    public Mono<Void> deletePilot(UUID pilotId, String userId) {
        return pilotRepository.findById(pilotId)
                .flatMap(pilot -> commandRepository.findById(pilot.getCommandId())
                .flatMap(cmd -> userService.resolveOrCreateUser(userId).flatMap(user -> {
            if (!cmd.getOwnerId().equals(user.getId().toString())) {
                return Mono.error(new RuntimeException("Access Denied"));
            }
            return pilotRepository.delete(pilot);
        })));
    }

    /**
     * Recalculates and updates the Command's total Support Points (SP) by
     * summing all ledger entries across all its detachments. This ensures the
     * Command state matches the "MERCENARY CONTRACT RECORD SHEET" history.
     */
    @Transactional
    public Mono<MercenaryCommand> syncTotalSupportPoints(UUID commandId) {
        String sql = "SELECT COALESCE(SUM(amount), 0) as total FROM ledger_entries le "
                + "JOIN detachments d ON le.detachment_id = d.id "
                + "WHERE d.mercenary_command_id = :id";

        return SqlUtils.bindUuid(databaseClient.sql(sql), "id", commandId)
                .map((row, metadata) -> row.get("total", Number.class))
                .one()
                .map(total -> total != null ? total.intValue() : 0)
                .flatMap(totalSp -> commandRepository.findById(commandId)
                .flatMap(command -> {
                    command.setNew(false);
                    command.setTotalSupportPoints(totalSp);
                    return commandRepository.save(command)
                            .onErrorResume(DuplicateKeyException.class, e -> commandRepository.findById(commandId))
                            .doOnNext(saved -> commandSink.tryEmitNext(saved));
                }));
    }

    /**
     * Returns a stream of updates for a specific command.
     */
    public Flux<MercenaryCommand> getCommandUpdates(UUID commandId) {
        return commandSink.asFlux()
                .filter(cmd -> cmd.getId().equals(commandId));
    }

    /**
     * Assigns a unit or pilot to a detachment. Ensures the asset is not already
     * assigned elsewhere.
     */
    @Transactional
    public Mono<Void> assignAssetToDetachment(String assetType, UUID assetId, UUID detachmentId, String userId) {
        String table = assetType.equalsIgnoreCase("UNIT") ? "combat_units" : "pilots";

        var selectSpec = databaseClient.sql("SELECT command_id FROM " + table + " WHERE id = :id");
        return SqlUtils.bindUuid(selectSpec, "id", assetId)
                .map((row, metadata) -> row.get("command_id", String.class))
                .one()
                .map(UUID::fromString)
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
    public Mono<Void> deleteDetachment(UUID detachmentId, String userId) {
        return isAuthorizedToEditLedger(detachmentId, userId)
                .flatMap(isAuthorized -> {
                    if (!isAuthorized) {
                        return Mono.error(new RuntimeException("Access Denied: You are not authorized to delete this detachment."));
                    }
                    return detachmentRepository.findById(detachmentId)
                            .flatMap(detachment -> {
                                UUID commandId = detachment.getMercenaryCommandId();
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
    public Mono<CommandAssetsResponse> getAssetsByCommandId(UUID commandId) {
        return Mono.zip(
                combatUnitRepository.findAllByCommandId(commandId).collectList(),
                pilotRepository.findAllByCommandId(commandId).collectList()
        ).map(tuple -> new CommandAssetsResponse(tuple.getT1(), tuple.getT2()));
    }

    @Transactional
    public Mono<CombatUnit> updateCombatUnit(UUID unitId, CombatUnit updatedData, String userId) {
        return combatUnitRepository.findById(unitId)
                .flatMap(unit -> commandRepository.findById(unit.getCommandId())
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
        })));
    }

    @Transactional
    public Mono<Pilot> updatePilot(UUID pilotId, Pilot updatedData, String userId) {
        return pilotRepository.findById(pilotId)
                .flatMap(pilot -> commandRepository.findById(pilot.getCommandId())
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
        })));
    }

    /**
     * Fetches all detachments belonging to a specific mercenary command.
     */
    public Flux<Detachment> getDetachmentsByCommandId(UUID commandId) {
        return detachmentRepository.findAllByMercenaryCommandId(commandId);
    }

    /**
     * Fetches all ledger entries for a specific detachment.
     */
    public Flux<LedgerEntry> getLedgerEntriesByDetachmentId(UUID detachmentId) {
        return ledgerEntryRepository.findAllByDetachmentId(detachmentId);
    }

    /**
     * Adds a new combat unit to the command's reserve pool.
     */
    @Transactional
    public Mono<CombatUnit> addCombatUnit(UUID commandId, CombatUnit unit, String userId) {
        return commandRepository.findById(commandId)
                .flatMap(cmd -> userService.resolveOrCreateUser(userId).flatMap(user -> {
            if (!cmd.getOwnerId().equals(user.getId().toString())) {
                return Mono.error(new RuntimeException("Access Denied: You do not own this command."));
            }
            unit.setId(UUID.randomUUID());
            unit.setCommandId(commandId);
            unit.setDetachmentId(null); // Ensure it starts in the pool
            if (unit.getStatus() == null) {
                unit.setStatus("OPERATIONAL");
            }

            return combatUnitRepository.save(unit)
                    .onErrorResume(DuplicateKeyException.class, e -> combatUnitRepository.findById(unit.getId()));
        }));
    }

    /**
     * Hires a new pilot into the command's reserve pool.
     */
    @Transactional
    public Mono<Pilot> hirePilot(UUID commandId, Pilot pilot, String userId) {
        return commandRepository.findById(commandId)
                .flatMap(cmd -> userService.resolveOrCreateUser(userId).flatMap(user -> {
            if (!cmd.getOwnerId().equals(user.getId().toString())) {
                return Mono.error(new RuntimeException("Access Denied: You do not own this command."));
            }
            pilot.setId(UUID.randomUUID());
            pilot.setCommandId(commandId);
            pilot.setDetachmentId(null); // Ensure they start in the barracks
            if (pilot.getStatus() == null) {
                pilot.setStatus("ACTIVE");
            }

            return pilotRepository.save(pilot)
                    .onErrorResume(DuplicateKeyException.class, e -> pilotRepository.findById(pilot.getId()));
        }));
    }

    /**
     * Reputation logic: success/failure updates the parent command.
     */
    public Mono<Void> updateReputation(UUID commandId, int modifier) {
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
    @Transactional
    public Mono<LedgerEntry> addLedgerEntry(UUID detachmentId, LedgerEntry entry, String userId) {
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
    private Mono<Boolean> isAuthorizedToEditLedger(UUID detachmentId, String userId) {
        return userService.resolveOrCreateUser(userId).flatMap(user -> {
            String internalId = user.getId().toString();
            String sql = "SELECT EXISTS ("
                    + "  SELECT 1 FROM detachments d "
                    + "  JOIN mercenary_commands mc ON d.mercenary_command_id = mc.id "
                    + "  JOIN campaigns c ON d.campaign_id = c.id "
                    + "  WHERE d.id = :detId "
                    + "  AND (mc.owner_id = :userId OR c.manager_id = :userId OR c.manager_id = :externalId)"
                    + ")";

            return SqlUtils.bindUuid(databaseClient.sql(sql), "detId", detachmentId)
                    .bind("userId", internalId)
                    .bind("externalId", userId)
                    .map((row, metadata) -> row.get(0, Number.class))
                    .one()
                    .map(n -> n != null && n.longValue() > 0)
                    .defaultIfEmpty(false);
        });
    }
}
