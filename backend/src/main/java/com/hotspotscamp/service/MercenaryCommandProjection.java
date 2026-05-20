package com.hotspotscamp.service;

import com.hotspotscamp.domain.events.CombatUnitPurchased;
import com.hotspotscamp.domain.events.CommandEstablished;
import com.hotspotscamp.domain.events.LedgerEntryCreated;
import com.hotspotscamp.domain.events.PilotHired;
import com.hotspotscamp.entity.*;
import com.hotspotscamp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import java.util.Objects;

import java.util.UUID;

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
