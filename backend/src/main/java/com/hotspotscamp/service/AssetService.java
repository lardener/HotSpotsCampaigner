package com.hotspotscamp.service;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hotspotscamp.dto.CombatUnitUpdateInput;
import com.hotspotscamp.dto.PilotUpdateInput;
import com.hotspotscamp.entity.CombatUnit;
import com.hotspotscamp.entity.Pilot;
import com.hotspotscamp.repository.CombatUnitRepository;
import com.hotspotscamp.repository.PilotRepository;

import lombok.NonNull;
import reactor.core.publisher.Mono;

@Service
public class AssetService {

    private static final Logger log = LoggerFactory.getLogger(AssetService.class);

    private final CombatUnitRepository combatUnitRepository;
    private final PilotRepository pilotRepository;
    private final MercenaryCommandService commandService;

    public AssetService(
            CombatUnitRepository combatUnitRepository,
            PilotRepository pilotRepository,
            MercenaryCommandService commandService) {
        this.combatUnitRepository = combatUnitRepository;
        this.pilotRepository = pilotRepository;
        this.commandService = commandService;
    }

    /**
     * Deletes a combat unit.
     */
    @Transactional
    public Mono<Void> deleteCombatUnit(@NonNull UUID unitId, String userId) {
        log.trace("[TRACE] Starting deleteCombatUnit: unitId={}", unitId);
        return combatUnitRepository.findById(unitId)
                .switchIfEmpty(Mono.error(new RuntimeException("Unit not found: " + unitId)))
                .flatMap(unit -> {
                    UUID commandId = unit.getCommandId();
                    if (commandId == null) {
                        return Mono.error(new RuntimeException("Unit record is corrupted: No command ID"));
                    }
                    return commandService.getCommandById(commandId)
                            .flatMap(cmd -> userServiceResolve(userId).flatMap(user -> commandService.getCommandById(commandId).then(combatUnitRepository.delete(unit))))
                            .switchIfEmpty(Mono.error(new RuntimeException("Command not found")));
                });
    }

    private Mono<Void> userServiceResolve(String userId) {
        // Placeholder for user resolution logic
        return Mono.empty();
    }

    /**
     * Updates a combat unit.
     */
    @Transactional
    public Mono<CombatUnit> updateCombatUnit(@NonNull UUID unitId, CombatUnitUpdateInput input, String userId) {
        log.trace("[TRACE] Starting updateCombatUnit: id={}", unitId);
        return combatUnitRepository.findById(unitId)
                .switchIfEmpty(Mono.error(new RuntimeException("Unit not found: " + unitId)))
                .flatMap(unit -> {
                    unit.setType(input.type());
                    unit.setModel(input.model());
                    unit.setVariant(input.variant());
                    unit.setTechBase(input.techBase());
                    unit.setTonnage(input.tonnage());
                    unit.setAsSize(input.asSize());
                    unit.setBv(input.bv());
                    unit.setPv(input.pv());
                    unit.setStatus(input.status());
                    return combatUnitRepository.save(unit);
                });
    }

    /**
     * Adds a combat unit to a command.
     */
    @Transactional
    public Mono<CombatUnit> addCombatUnit(@NonNull UUID commandId, CombatUnitUpdateInput input, String userId) {
        log.trace("[TRACE] Starting addCombatUnit: commandId={}", commandId);
        return combatUnitRepository.save(new CombatUnit()) // Simplified for now
                .doOnTerminate(() -> log.trace("[TRACE] Finished addCombatUnit"));
    }

    /**
     * Hires a pilot.
     */
    @Transactional
    public Mono<Pilot> hirePilot(@NonNull UUID commandId, PilotUpdateInput input, String userId) {
        log.trace("[TRACE] Starting hirePilot: commandId={}", commandId);
        return pilotRepository.save(new Pilot()) // Simplified for now
                .doOnTerminate(() -> log.trace("[TRACE] Finished hirePilot"));
    }

    /**
     * Automated rearm of a unit.
     */
    @Transactional
    public Mono<Void> automatedRearmUnit(@NonNull UUID unitId, String userId) {
        log.trace("[TRACE] Starting automatedRearmUnit: unitId={}", unitId);
        return Mono.empty(); // Implementation pending
    }
}