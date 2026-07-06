package com.hotspotscamp.service;

import java.util.Objects;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hotspotscamp.dto.CombatUnitUpdateInput;
import com.hotspotscamp.dto.PilotUpdateInput;
import com.hotspotscamp.entity.CombatUnit;
import com.hotspotscamp.entity.MercenaryCommand;
import com.hotspotscamp.entity.Pilot;
import com.hotspotscamp.mapper.CombatUnitMapper;
import com.hotspotscamp.mapper.PilotMapper;
import com.hotspotscamp.repository.CombatUnitRepository;
import com.hotspotscamp.repository.MercenaryCommandRepository;
import com.hotspotscamp.repository.PilotRepository;

import lombok.NonNull;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;

@Service
public class AssetService {

    private static final Logger log = LoggerFactory.getLogger(AssetService.class);

    private final CombatUnitRepository combatUnitRepository;
    private final PilotRepository pilotRepository;
    private final MercenaryCommandRepository commandRepository;
    private final UserService userService;
    private final Sinks.Many<MercenaryCommand> commandSink;
    private final CombatUnitMapper combatUnitMapper;
    private final PilotMapper pilotMapper;

    public AssetService(
            CombatUnitRepository combatUnitRepository,
            PilotRepository pilotRepository,
            MercenaryCommandRepository commandRepository,
            UserService userService,
            Sinks.Many<MercenaryCommand> commandSink,
            CombatUnitMapper combatUnitMapper,
            PilotMapper pilotMapper) {
        this.combatUnitRepository = combatUnitRepository;
        this.pilotRepository = pilotRepository;
        this.commandRepository = commandRepository;
        this.userService = userService;
        this.commandSink = commandSink;
        this.combatUnitMapper = combatUnitMapper;
        this.pilotMapper = pilotMapper;
    }

    /**
     * Deletes a combat unit.
     */
    @Transactional
    public Mono<Void> deleteCombatUnit(@NonNull UUID unitId, String userId) {
        log.trace("[TRACE] Starting deleteCombatUnit: unitId={}", unitId);
        return combatUnitRepository.findById(unitId)
                .switchIfEmpty(Mono.<CombatUnit>error(new RuntimeException("Unit not found: " + unitId)))
                .<Void>flatMap(unit -> {
                    UUID commandId = unit.getCommandId();
                    if (commandId == null) {
                        return Mono.<Void>error(new RuntimeException("Unit record is corrupted: No command ID"));
                    }
                    return commandRepository.findById(commandId)
                            .switchIfEmpty(Mono.<MercenaryCommand>error(new RuntimeException("Command not found")))
                            .<Void>flatMap(cmd -> userService.resolveOrCreateUser(userId).<Void>flatMap(user -> {
                        if (!cmd.getOwnerId().equals(user.getId().toString())) {
                            return Mono.<Void>error(new RuntimeException("Access Denied"));
                        }
                        return combatUnitRepository.delete(unit);
                    }));
                })
                .doOnTerminate(() -> log.trace("[TRACE] Finished deleteCombatUnit"));
    }

    /**
     * Deletes a pilot.
     */
    @Transactional
    public Mono<Void> deletePilot(@NonNull UUID pilotId, String userId) {
        log.trace("[TRACE] Starting deletePilot: pilotId={}", pilotId);
        return pilotRepository.findById(pilotId)
                .switchIfEmpty(Mono.<Pilot>error(new RuntimeException("Pilot not found: " + pilotId)))
                .<Void>flatMap(pilot -> {
                    UUID commandId = pilot.getCommandId();
                    if (commandId == null) {
                        return Mono.<Void>error(new RuntimeException("Pilot record is corrupted: No command ID"));
                    }
                    return commandRepository.findById(commandId)
                            .switchIfEmpty(Mono.<MercenaryCommand>error(new RuntimeException("Command not found")))
                            .<Void>flatMap(cmd -> userService.resolveOrCreateUser(userId).<Void>flatMap(user -> {
                        if (!cmd.getOwnerId().equals(user.getId().toString())) {
                            return Mono.<Void>error(new RuntimeException("Access Denied"));
                        }
                        return pilotRepository.delete(pilot);
                    }));
                })
                .doOnTerminate(() -> log.trace("[TRACE] Finished deletePilot"));
    }

    /**
     * Updates a combat unit.
     */
    @Transactional
    public Mono<CombatUnit> updateCombatUnit(@NonNull UUID unitId, CombatUnitUpdateInput input, String userId) {
        log.trace("[TRACE] Starting updateCombatUnit: id={}", unitId);
        return combatUnitRepository.findById(unitId)
                .switchIfEmpty(Mono.<CombatUnit>error(new RuntimeException("Unit not found")))
                .<CombatUnit>flatMap(unit -> {
                    UUID commandId = unit.getCommandId();
                    if (commandId == null) {
                        return Mono.<CombatUnit>error(new RuntimeException("Unit record is corrupted: No command ID"));
                    }
                    return commandRepository.findById(commandId)
                            .switchIfEmpty(Mono.<MercenaryCommand>error(new RuntimeException("Command not found")))
                            .<CombatUnit>flatMap(cmd -> userService.resolveOrCreateUser(userId).<CombatUnit>flatMap(user -> {
                        if (!cmd.getOwnerId().equals(user.getId().toString())) {
                            return Mono.<CombatUnit>error(new RuntimeException("Access Denied"));
                        }
                        unit.setNew(false);
                        combatUnitMapper.updateCombatUnitFromDto(input, unit);
                        return combatUnitRepository.save(unit)
                                .flatMap(u -> commandRepository.findById(commandId)
                                .doOnNext(commandSink::tryEmitNext)
                                .thenReturn(u))
                                .onErrorResume(DuplicateKeyException.class, e -> combatUnitRepository.findById(unitId));
                    }));
                })
                .doOnTerminate(() -> log.trace("[TRACE] Finished updateCombatUnit"));
    }

    /**
     * Updates a pilot.
     */
    @Transactional
    public Mono<Pilot> updatePilot(@NonNull UUID pilotId, PilotUpdateInput input, String userId) {
        log.trace("[TRACE] Starting updatePilot: id={}", pilotId);
        return pilotRepository.findById(pilotId)
                .switchIfEmpty(Mono.<Pilot>error(new RuntimeException("Pilot not found")))
                .<Pilot>flatMap(pilot -> {
                    UUID commandId = pilot.getCommandId();
                    if (commandId == null) {
                        return Mono.<Pilot>error(new RuntimeException("Pilot record is corrupted: No command ID"));
                    }
                    return commandRepository.findById(commandId)
                            .switchIfEmpty(Mono.<MercenaryCommand>error(new RuntimeException("Command not found")))
                            .<Pilot>flatMap(cmd -> userService.resolveOrCreateUser(userId).<Pilot>flatMap(user -> {
                        if (!cmd.getOwnerId().equals(user.getId().toString())) {
                            return Mono.<Pilot>error(new RuntimeException("Access Denied"));
                        }
                        pilot.setNew(false);
                        pilotMapper.updatePilotFromDto(input, pilot);
                        return pilotRepository.save(pilot)
                                .flatMap(p -> commandRepository.findById(commandId)
                                .doOnNext(commandSink::tryEmitNext)
                                .thenReturn(p))
                                .onErrorResume(DuplicateKeyException.class, e -> pilotRepository.findById(pilotId));
                    }));
                })
                .doOnTerminate(() -> log.trace("[TRACE] Finished updatePilot"));
    }

    /**
     * Adds a combat unit to a command.
     */
    @Transactional
    public Mono<CombatUnit> addCombatUnit(@NonNull UUID commandId, CombatUnitUpdateInput input, String userId) {
        log.trace("[TRACE] Starting addCombatUnit: commandId={}", commandId);
        return userService.resolveOrCreateUser(userId).flatMap(user
                -> commandRepository.findById(commandId)
                        .switchIfEmpty(Mono.<MercenaryCommand>error(new RuntimeException("Command not found")))
                        .<CombatUnit>flatMap(cmd -> {
                            if (!cmd.getOwnerId().equals(user.getId().toString())) {
                                return Mono.<CombatUnit>error(new RuntimeException("Access Denied"));
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
     * Hires a pilot.
     */
    @Transactional
    public Mono<Pilot> hirePilot(@NonNull UUID commandId, PilotUpdateInput input, String userId) {
        log.trace("[TRACE] Starting hirePilot: commandId={}", commandId);
        return userService.resolveOrCreateUser(userId).flatMap(user
                -> commandRepository.findById(commandId)
                        .switchIfEmpty(Mono.<MercenaryCommand>error(new RuntimeException("Command not found")))
                        .<Pilot>flatMap(cmd -> {
                            if (!cmd.getOwnerId().equals(user.getId().toString())) {
                                return Mono.<Pilot>error(new RuntimeException("Access Denied"));
                            }
                            Pilot pilot = Pilot.builder()
                                    .id(UUID.randomUUID())
                                    .commandId(commandId)
                                    .name(input.name())
                                    .gunnery(input.gunnery())
                                    .piloting(input.piloting())
                                    .asSkill(input.asSkill())
                                    .unitType(input.unitType())
                                    .wounds(com.hotspotscamp.util.TypeUtils.asInt(input.wounds(), 0))
                                    .handicap(com.hotspotscamp.util.TypeUtils.asInt(input.handicap(), 0))
                                    .totalSpEarned(com.hotspotscamp.util.TypeUtils.asInt(input.totalSpEarned(), 0))
                                    .gunnerySpEarned(com.hotspotscamp.util.TypeUtils.asInt(input.gunnerySpEarned(), 0))
                                    .pilotingSpEarned(com.hotspotscamp.util.TypeUtils.asInt(input.pilotingSpEarned(), 0))
                                    .edgeTokensSpEarned(com.hotspotscamp.util.TypeUtils.asInt(input.edgeTokensSpEarned(), 0))
                                    .edgeAbilitySpEarned(com.hotspotscamp.util.TypeUtils.asInt(input.edgeAbilitySpEarned(), 0))
                                    .edgeTokensSkill(com.hotspotscamp.util.TypeUtils.asInt(input.edgeTokensSkill(), 0))
                                    .edgeAbilitySkill(com.hotspotscamp.util.TypeUtils.asInt(input.edgeAbilitySkill(), 0))
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
}
