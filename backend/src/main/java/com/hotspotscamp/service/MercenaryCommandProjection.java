package com.hotspotscamp.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.hotspotscamp.domain.events.CombatUnitPurchased;
import com.hotspotscamp.domain.events.CommandEstablished;
import com.hotspotscamp.domain.events.LedgerEntryCreated;
import com.hotspotscamp.domain.events.PilotHired;
import com.hotspotscamp.entity.CombatUnit;
import com.hotspotscamp.entity.LedgerEntry;
import com.hotspotscamp.entity.MercenaryCommand;
import com.hotspotscamp.entity.Pilot;
import com.hotspotscamp.repository.CombatUnitRepository;
import com.hotspotscamp.repository.LedgerEntryRepository;
import com.hotspotscamp.repository.MercenaryCommandRepository;
import com.hotspotscamp.repository.PilotRepository;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class MercenaryCommandProjection {

    private final MercenaryCommandRepository commandRepository;
    private final CombatUnitRepository unitRepository;
    private final PilotRepository pilotRepository;
    private final LedgerEntryRepository ledgerRepository;
    private final MercenaryCommandService commandService; // For syncTotalSupportPoints logic

    public Mono<Void> apply(Object event, String userId) {
        if (event instanceof CommandEstablished e) {
            MercenaryCommand cmd = MercenaryCommand.builder()
                    .id(e.commandId())
                    .name(e.name())
                    .commandingOfficer(e.commandingOfficer())
                    .totalSupportPoints(e.startingSp())
                    .ownerId(userId)
                    .isNew(true)
                    .build();
            return commandRepository.save(cmd).then();
        }

        if (event instanceof CombatUnitPurchased e) {
            CombatUnit unit = CombatUnit.builder()
                    .id(e.unitId())
                    .commandId(e.commandId())
                    .model(e.model())
                    .type(e.type())
                    .tonnage(e.tonnage())
                    .status("OPERATIONAL")
                    .isNew(true)
                    .build();
            return unitRepository.save(unit).then();
        }

        if (event instanceof PilotHired e) {
            Pilot pilot = Pilot.builder()
                    .id(e.pilotId())
                    .commandId(e.commandId())
                    .name(e.name())
                    .gunnery(e.gunnery())
                    .piloting(e.piloting())
                    .status("ACTIVE")
                    .isNew(true)
                    .build();
            return pilotRepository.save(pilot).then();
        }

        if (event instanceof LedgerEntryCreated e) {
            LedgerEntry entry = LedgerEntry.builder()
                    .id(e.entryId())
                    .commandId(e.commandId())
                    .detachmentId(e.detachmentId())
                    .amount(e.amount())
                    .description(e.description())
                    .timestamp(LocalDateTime.now())
                    .isNew(true)
                    .build();
            return ledgerRepository.save(entry)
                    .then(commandService.syncTotalSupportPoints(e.commandId()))
                    .then();
        }

        return Mono.empty();
    }

    public Mono<Void> replay(UUID commandId) {
        // Implementation for rebuilding state from the full event stream
        return Mono.empty();
    }
}
