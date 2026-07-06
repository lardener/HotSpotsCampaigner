package com.hotspotscamp.service;

import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Stream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hotspotscamp.dto.CampaignUpdateInput;
import com.hotspotscamp.dto.CommandUpdateInput;
import com.hotspotscamp.dto.LedgerEntryInput;
import com.hotspotscamp.dto.TrackUpdateInput;
import com.hotspotscamp.entity.Campaign;
import com.hotspotscamp.entity.CampaignTrack;
import com.hotspotscamp.entity.CombatUnit;
import com.hotspotscamp.entity.Contract;
import com.hotspotscamp.entity.Detachment;
import com.hotspotscamp.entity.MercenaryCommand;
import com.hotspotscamp.entity.Pilot;
import com.hotspotscamp.mapper.CampaignMapper;
import com.hotspotscamp.mapper.CommandMapper;
import com.hotspotscamp.mapper.TrackMapper;
import com.hotspotscamp.repository.CampaignFactionRepository;
import com.hotspotscamp.repository.CampaignRepository;
import com.hotspotscamp.repository.CampaignTrackRepository;
import com.hotspotscamp.repository.CombatUnitRepository;
import com.hotspotscamp.repository.ContractRepository;
import com.hotspotscamp.repository.DetachmentRepository;
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

    /**
     * Reactive sink for broadcasting command updates to subscribers.
     */
    private final Sinks.Many<MercenaryCommand> commandSink;

    private final MercenaryCommandRepository commandRepository;
    private final DetachmentRepository detachmentRepository;
    private final CampaignFactionRepository campaignFactionRepository;
    private final CampaignTrackRepository campaignTrackRepository;
    private final CampaignRepository campaignRepository;
    private final ContractRepository contractRepository;
    private final CombatUnitRepository combatUnitRepository;
    private final PilotRepository pilotRepository;
    private final UserService userService;
    private final DatabaseClient databaseClient;
    private final ScraperFactory scraperFactory;
    private final CampaignService campaignService;
    private final RuleConfigurationService configService;
    private final LedgerService ledgerService;
    private final CommandMapper commandMapper;
    private final CampaignMapper campaignMapper;
    private final TrackMapper trackMapper;

    public MercenaryCommandService(
            Sinks.Many<MercenaryCommand> commandSink,
            MercenaryCommandRepository commandRepository,
            DetachmentRepository detachmentRepository,
            CampaignFactionRepository campaignFactionRepository,
            CampaignTrackRepository campaignTrackRepository,
            CampaignRepository campaignRepository,
            ContractRepository contractRepository,
            CombatUnitRepository combatUnitRepository,
            PilotRepository pilotRepository,
            UserService userService,
            DatabaseClient databaseClient,
            ScraperFactory scraperFactory,
            @Lazy CampaignService campaignService,
            RuleConfigurationService configService,
            LedgerService ledgerService,
            CommandMapper commandMapper,
            CampaignMapper campaignMapper,
            TrackMapper trackMapper) {
        this.commandSink = commandSink;
        this.commandRepository = commandRepository;
        this.detachmentRepository = detachmentRepository;
        this.campaignFactionRepository = campaignFactionRepository;
        this.campaignTrackRepository = campaignTrackRepository;
        this.campaignRepository = campaignRepository;
        this.contractRepository = contractRepository;
        this.combatUnitRepository = combatUnitRepository;
        this.pilotRepository = pilotRepository;
        this.userService = userService;
        this.databaseClient = databaseClient;
        this.scraperFactory = scraperFactory;
        this.campaignService = campaignService;
        this.configService = configService;
        this.ledgerService = ledgerService;
        this.commandMapper = commandMapper;
        this.campaignMapper = campaignMapper;
        this.trackMapper = trackMapper;
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

            commandMapper.updateCommandFromDto(input, cmd);
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
            int startingSp = Objects.requireNonNullElse(command.getTotalSupportPoints(), configService.getCommandDefault("startingSP"));
            int startingRep = Objects.requireNonNullElse(command.getReputation(), configService.getCommandDefault("startingRep"));

            command.setTotalSupportPoints(0);
            command.setReputation(0);
            command.setNew(true);

            return commandRepository.save(command).<MercenaryCommand>flatMap(savedCmd -> {
                LedgerEntryInput input = new LedgerEntryInput(
                        startingSp,
                        "INITIAL COMMAND ESTABLISHMENT",
                        startingRep,
                        null,
                        null,
                        null
                );
                return ledgerService.addLedgerEntry(commandId, null, input, userId)
                        .thenReturn(savedCmd);
            });
        })
                .doOnTerminate(() -> log.trace("[TRACE] Finished createCommand"));
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
                .map(total -> total != null ? total.intValue() : 0);
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

    /**
     * Fetches a command by ID without owner filtering.
     */
    public Mono<MercenaryCommand> getCommandById(@NonNull UUID commandId) {
        log.trace("[TRACE] Starting getCommandById: id={}", commandId);
        return commandRepository.findById(commandId)
                .doOnTerminate(() -> log.trace("[TRACE] Finished getCommandById"));
    }

    @Transactional
    public Mono<Campaign> updateCampaignDetails(@NonNull UUID campaignId, CampaignUpdateInput input, String userId) {
        log.trace("[TRACE] Starting updateCampaignDetails: id={}", campaignId);
        return userService.resolveOrCreateUser(userId).<Campaign>flatMap(user
                -> campaignRepository.findById(campaignId)
                        .<Campaign>flatMap(camp -> {
                            log.trace("[TRACE] Fetched campaign for update: id={}, managerId={}", camp.getId(), camp.getManagerId());
                            if (!camp.getManagerId().equals(user.getId().toString())) {
                                return Mono.<Campaign>error(new RuntimeException("Access Denied: Not the theater manager."));
                            }

                            camp.setNew(false);
                            log.trace("[TRACE] setIsNew(false) called for campaign: id={}", camp.getId());
                            log.trace("[TRACE] Updating campaign details for campaign: id={}", camp.getId());

                            String oldStatus = camp.getStatus();
                            Integer oldLengthInMonths = camp.getLengthInMonths();
                            campaignMapper.updateCampaignFromDto(input, camp);
                            log.trace("[TRACE] Updated campaign details for campaign: id={}", camp.getId());

                            return contractRepository.findAllByCampaignId(camp.getId()).collectList()
                                    .flatMap(contracts -> {
                                        Contract primary = contracts.stream()
                                                .filter(c -> Boolean.TRUE.equals(c.getPrimaryContract()))
                                                .findFirst().orElse(null);
                                        Contract opposition = contracts.stream()
                                                .filter(c -> Boolean.FALSE.equals(c.getPrimaryContract()))
                                                .findFirst().orElse(null);

                                        Mono<Void> factionUpdate = campaignFactionRepository.findAllByCampaignId(camp.getId()).collectList()
                                                .flatMap(factions -> {
                                                    Mono<Void> innerChain = Mono.empty();
                                                    if (input.employer() != null) {
                                                        com.hotspotscamp.entity.CampaignFaction f = factions.stream()
                                                                .filter(fac -> primary != null && fac.getId().equals(primary.getEmployerFactionId()))
                                                                .findFirst().orElse(null);
                                                        if (f != null) {
                                                            f.setNew(false);
                                                            f.setFactionName(input.employer());
                                                            innerChain = innerChain.then(campaignFactionRepository.save(f)).then();
                                                        }
                                                    }
                                                    if (input.opponent() != null) {
                                                        com.hotspotscamp.entity.CampaignFaction f = factions.stream()
                                                                .filter(fac -> opposition != null && fac.getId().equals(opposition.getEmployerFactionId()))
                                                                .findFirst().orElse(null);
                                                        if (f != null) {
                                                            f.setNew(false);
                                                            f.setFactionName(input.opponent());
                                                            innerChain = innerChain.then(campaignFactionRepository.save(f)).then();
                                                        }
                                                    }
                                                    return innerChain;
                                                });

                                        if (primary != null) {
                                            primary.setNew(false);
                                            if (input.employerCategory() != null) {
                                                primary.setEmployerCategory(input.employerCategory());
                                            }
                                            if (input.mission() != null) {
                                                primary.setMissionType(input.mission());
                                            }
                                            if (input.payRate() != null) {
                                                primary.setPayRate(input.payRate());
                                            }
                                            if (input.payStep() != null) {
                                                primary.setPayStep(input.payStep());
                                            }
                                            if (input.salvageTerms() != null) {
                                                primary.setSalvageTerms(input.salvageTerms());
                                            }
                                            if (input.salvageStep() != null) {
                                                primary.setSalvageStep(input.salvageStep());
                                            }
                                            if (input.supportTerms() != null) {
                                                primary.setSupportTerms(input.supportTerms());
                                            }
                                            if (input.supportStep() != null) {
                                                primary.setSupportStep(input.supportStep());
                                            }
                                            if (input.transportTerms() != null) {
                                                primary.setTransportTerms(input.transportTerms());
                                            }
                                            if (input.transportStep() != null) {
                                                primary.setTransportStep(input.transportStep());
                                            }
                                            if (input.commandRights() != null) {
                                                primary.setCommandRights(input.commandRights());
                                            }
                                            if (input.commandStep() != null) {
                                                primary.setCommandStep(input.commandStep());
                                            }
                                        }

                                        if (opposition != null) {
                                            opposition.setNew(false);
                                            if (input.opponentCategory() != null) {
                                                opposition.setEmployerCategory(input.opponentCategory());
                                            }
                                            if (input.oppMission() != null) {
                                                opposition.setMissionType(input.oppMission());
                                            }
                                            if (input.oppPayRate() != null) {
                                                opposition.setPayRate(input.oppPayRate());
                                            }
                                            if (input.oppPayStep() != null) {
                                                opposition.setPayStep(input.oppPayStep());
                                            }
                                            if (input.oppSalvageTerms() != null) {
                                                opposition.setSalvageTerms(input.oppSalvageTerms());
                                            }
                                            if (input.oppSalvageStep() != null) {
                                                opposition.setSalvageStep(input.oppSalvageStep());
                                            }
                                            if (input.oppSupportTerms() != null) {
                                                opposition.setSupportTerms(input.oppSupportTerms());
                                            }
                                            if (input.oppSupportStep() != null) {
                                                opposition.setSupportStep(input.oppSupportStep());
                                            }
                                            if (input.oppTransportTerms() != null) {
                                                opposition.setTransportTerms(input.oppTransportTerms());
                                            }
                                            if (input.oppTransportStep() != null) {
                                                opposition.setTransportStep(input.oppTransportStep());
                                            }
                                            if (input.oppCommandRights() != null) {
                                                opposition.setCommandRights(input.oppCommandRights());
                                            }
                                            if (input.oppCommandStep() != null) {
                                                opposition.setCommandStep(input.oppCommandStep());
                                            }
                                        }

                                        Mono<Void> contractUpdate = (primary != null || opposition != null)
                                                ? contractRepository.saveAll(Objects.requireNonNull(Stream.of(primary, opposition).filter(Objects::nonNull).toList())).then()
                                                : Mono.empty();

                                        Mono<Campaign> chain = Mono.just(camp);

                                        if (input.status() != null) {
                                            String newStatus = camp.getStatus();
                                            if ("INACTIVE".equalsIgnoreCase(newStatus) && !"INACTIVE".equalsIgnoreCase(oldStatus)) {
                                                chain = SqlUtils.bindUuid(databaseClient.sql("UPDATE detachments SET campaign_id = NULL WHERE campaign_id = :id"), "id", campaignId)
                                                        .fetch().rowsUpdated().then(chain);
                                            }
                                        }

                                        if (input.lengthInMonths() != null) {
                                            int targetMonths = Math.max(1, input.lengthInMonths());
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

                                        return factionUpdate.then(contractUpdate).then(chain).flatMap(c -> {
                                            if (input.trackCount() != null) {
                                                int targetTracks = Math.max(1, input.trackCount());
                                                if (targetTracks != Objects.requireNonNullElse(c.getTrackCount(), 0)) {
                                                    return campaignService.reconcileTracks(c, targetTracks);
                                                }
                                            }
                                            return Mono.just(c);
                                        })
                                                .flatMap(c -> {
                                                    c.setNew(false);
                                                    return campaignRepository.save(Objects.requireNonNull(c));
                                                });
                                    });
                        })
        )
                .doOnTerminate(() -> log.trace("[TRACE] Finished updateCampaignDetails"))
                .doOnError(Exception.class, e -> log.error("[ERROR] Error occurred while updating campaign details for {}", campaignId, e));
    }

    /**
     * Administrative update for an individual track. Enforces that only the
     * theater manager can modify track assignments or details.
     */
    @Transactional
    public Mono<CampaignTrack> updateTrack(@NonNull UUID trackId, TrackUpdateInput input, String userId) {
        log.trace("[TRACE] Starting updateTrack: trackId={}", trackId);
        return campaignTrackRepository.findById(trackId)
                .switchIfEmpty(Mono.error(new RuntimeException("Track not found: " + trackId)))
                .flatMap(track -> campaignRepository.findById(Objects.requireNonNull(track.getCampaignId()))
                .flatMap(camp -> userService.resolveOrCreateUser(userId).flatMap(user -> {
            String internalId = user.getId().toString();
            boolean isManager = camp.getManagerId().equals(internalId);

            return (isManager ? Mono.just(true) : isParticipantInCampaign(camp.getId(), internalId, userId))
                    .flatMap(authorized -> {
                        if (Boolean.FALSE.equals(authorized)) {
                            return Mono.error(new RuntimeException("Access Denied: Only the theater manager or participants can update tracks."));
                        }

                        // Participants who are not managers can ONLY update the narrative
                        if (!isManager && (input.trackName() != null || input.sequenceOrder() != null
                                || input.location() != null || input.nextSession() != null
                                || input.attackerFactionId() != null || input.monthIndex() != null
                                || input.complications() != null || input.oppositionComplications() != null)) {
                            return Mono.error(new RuntimeException("Access Denied: Participants can only update the After Action Narrative."));
                        }

                        track.setNew(false);
                        if (isManager) {
                            trackMapper.updateTrackFromDto(input, track);
                        } else if (input.afterActionNarrative() != null) {
                            track.setAfterActionNarrative(input.afterActionNarrative());
                        }

                        return campaignTrackRepository.save(track);
                    });
        })))
                .doOnTerminate(() -> log.trace("[TRACE] Finished updateTrack"));
    }

    /**
     * Global theater reordering. Sets the logical sequence of all operations.
     * If the campaign is in "Simple Mode" (length matches track count), the
     * monthIndex is automatically synchronized to maintain a
     * 1-operation-per-month linear timeline.
     */
    @Transactional
    public Flux<CampaignTrack> reorderTracks(@NonNull UUID campaignId, List<UUID> trackIds, String userId) {
        log.trace("[TRACE] Starting reorderTracks: campaignId={}", campaignId);
        return userService.resolveOrCreateUser(userId).flatMapMany(user
                -> campaignRepository.findById(campaignId)
                        .switchIfEmpty(Mono.error(new RuntimeException("Campaign not found")))
                        .flatMapMany(camp -> {
                            if (!camp.getManagerId().equals(user.getId().toString())) {
                                return Flux.error(new RuntimeException("Access Denied: Only the theater manager can reorder tracks."));
                            }

                            boolean isSimpleMode = Objects.equals(camp.getLengthInMonths(), camp.getTrackCount());

                            return Flux.fromIterable(trackIds).index().flatMap(tuple
                                    -> campaignTrackRepository.findById(Objects.requireNonNull(tuple.getT2())).flatMap(track -> {
                                        track.setSequenceOrder(tuple.getT1().intValue());
                                        if (isSimpleMode) {
                                            track.setMonthIndex(tuple.getT1().intValue() + 1);
                                        }
                                        track.setNew(false);
                                        return campaignTrackRepository.save(track);
                                    })
                            );
                        })
        )
                .doOnTerminate(() -> log.trace("[TRACE] Finished reorderTracks"));
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
            // A user is authorized to view a command if they are the owner,
            // the campaign manager for an active deployment, or a fellow participant
            // in any campaign theater where the command has assets deployed.
            String sql = "SELECT EXISTS ("
                    + "  SELECT 1 FROM mercenary_commands mc "
                    + "  LEFT JOIN detachments d ON d.mercenary_command_id = mc.id "
                    + "  LEFT JOIN campaigns c ON d.campaign_id = c.id "
                    + "  WHERE mc.id = :cmdId "
                    + "  AND (mc.owner_id = :userId OR c.manager_id = :userId OR c.manager_id = :externalId"
                    + "       OR EXISTS (SELECT 1 FROM detachments d_self JOIN mercenary_commands mc_self ON d_self.mercenary_command_id = mc_self.id "
                    + "                  WHERE d_self.campaign_id = d.campaign_id AND (mc_self.owner_id = :userId OR mc_self.owner_id = :externalId)))"
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

    public Mono<Boolean> isParticipantInCampaign(@NonNull UUID campaignId, String internalUserId, String externalUserId) {
        log.trace("[TRACE] Checking campaign participation: campId={}, internalId={}, externalId={}", campaignId, internalUserId, externalUserId);
        String sql = "SELECT COUNT(*) "
                + "  FROM detachments d "
                + "  JOIN mercenary_commands mc ON d.mercenary_command_id = mc.id "
                + "  WHERE d.campaign_id = :campId "
                + "  AND (mc.owner_id = :userId OR mc.owner_id = :externalId)";

        var spec = SqlUtils.bindUuid(databaseClient.sql(sql), "campId", campaignId);
        spec = SqlUtils.bindString(spec, "userId", internalUserId);
        spec = SqlUtils.bindString(spec, "externalId", externalUserId);
        return spec.map((row, metadata) -> row.get(0, Number.class))
                .one()
                .map(n -> n != null && n.longValue() > 0)
                .defaultIfEmpty(false);
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

    /**
     * Calculates and applies rearm costs for a specific unit based on its
     * tonnage and the campaign's logistical rules.
     */
    @Transactional
    public Mono<Void> automatedRearmUnit(@NonNull UUID unitId, String userId) {
        log.trace("[TRACE] Starting automatedRearmUnit: unitId={}", unitId);
        return combatUnitRepository.findById(unitId)
                .switchIfEmpty(Mono.error(new RuntimeException("Unit not found: " + unitId)))
                .flatMap(unit -> {
                    // Case 1: Handle missing tonnage
                    if (unit.getTonnage() == null || unit.getTonnage() <= 0) {
                        return Mono.error(new RuntimeException("Rearm failed: Unit '" + unit.getModel() + "' has no recorded tonnage."));
                    }

                    if (unit.getDetachmentId() == null) {
                        return Mono.error(new RuntimeException("Rearm failed: Unit is not assigned to a detachment."));
                    }

                    return detachmentRepository.findById(unit.getDetachmentId())
                            .flatMap(det -> campaignRepository.findById(Objects.requireNonNull(det.getCampaignId())))
                            .flatMap(camp -> {
                                int rate = Objects.requireNonNullElse(camp.getRearmCostPerTon(), 0);

                                // Case 2: Handle zero rearm cost (Theater Perk or Free Logistics)
                                if (rate <= 0) {
                                    log.debug("Skipping rearm ledger entry for unit {}: Theater rearm cost is zero.", unitId);
                                    return Mono.empty();
                                }

                                int totalCost = unit.getTonnage() * rate;
                                LedgerEntryInput input = new LedgerEntryInput(-totalCost, "Automated Rearm: " + unit.getModel() + " (" + unit.getTonnage() + "T)", 0, camp.getId(), camp.getName(), null);
                                return ledgerService.addLedgerEntry(unit.getCommandId(), unit.getDetachmentId(), input, userId).then();
                            });
                });
    }

}
