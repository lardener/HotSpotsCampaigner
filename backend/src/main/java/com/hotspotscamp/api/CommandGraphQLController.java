package com.hotspotscamp.api;

import java.security.Principal;
import java.util.UUID;
import java.util.Map;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.graphql.data.method.annotation.SubscriptionMapping;
import org.springframework.stereotype.Controller;

import com.hotspotscamp.entity.CombatUnit;
import com.hotspotscamp.entity.Detachment;
import com.hotspotscamp.entity.LedgerEntry;
import com.hotspotscamp.entity.MercenaryCommand;
import com.hotspotscamp.entity.Pilot;
import com.hotspotscamp.service.MercenaryCommandService;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Controller
@RequiredArgsConstructor
public class CommandGraphQLController {

    private final MercenaryCommandService commandService;

    @QueryMapping
    public Flux<MercenaryCommand> myCommands(Principal principal) {
        if (principal == null) {
            // Log warning: GraphQL query attempted without valid session
            return Flux.empty();
        }
        // getName() returns the 'sub' for OAuth2 and the unique username for invited players
        return commandService.getCommandsByUser(principal.getName());
    }

    @QueryMapping
    public Mono<MercenaryCommand> getCommand(@Argument UUID id, Principal principal) {
        if (principal == null) {
            return Mono.empty();
        }
        String userId = principal.getName();
        return commandService.getCommandsByUser(userId)
                .filter(cmd -> cmd.getId().equals(id))
                .next();
    }

    @QueryMapping
    public Mono<Object> commandAssets(@Argument UUID commandId, Principal principal) {
        return commandService.getAssetsByCommandId(commandId).cast(Object.class);
    }

    @SubscriptionMapping
    public Flux<MercenaryCommand> ledgerUpdated(@Argument UUID commandId) {
        return commandService.getCommandUpdates(commandId);
    }

    @SchemaMapping(typeName = "MercenaryCommand", field = "units")
    public Flux<CombatUnit> getUnits(MercenaryCommand command) {
        return commandService.getAssetsByCommandId(command.getId())
                .flatMapMany(assets -> Flux.fromIterable(assets.units()));
    }

    @SchemaMapping(typeName = "MercenaryCommand", field = "pilots")
    public Flux<Pilot> getPilots(MercenaryCommand command) {
        return commandService.getAssetsByCommandId(command.getId())
                .flatMapMany(assets -> Flux.fromIterable(assets.pilots()));
    }

    @SchemaMapping(typeName = "MercenaryCommand", field = "detachments")
    public Flux<Detachment> getDetachments(MercenaryCommand command) {
        return commandService.getDetachmentsByCommandId(command.getId());
    }

    @SchemaMapping(typeName = "MercenaryCommand", field = "allLedgerEntries")
    public Flux<LedgerEntry> getAllLedgerEntries(MercenaryCommand command) {
        return commandService.getDetachmentsByCommandId(command.getId())
                .flatMap(det -> commandService.getLedgerEntriesByDetachmentId(det.getId()))
                .sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));
    }

    @MutationMapping
    public Mono<Boolean> deleteCommand(@Argument UUID commandId, @Argument Boolean force, Principal principal) {
        String userId = principal.getName();
        return commandService.deleteCommand(commandId, userId, Boolean.TRUE.equals(force)).thenReturn(true);
    }

    @MutationMapping
    public Mono<MercenaryCommand> establishCommand(@Argument String name,
            @Argument String commandingOfficer,
            Principal principal) {
        String userId = principal.getName();
        MercenaryCommand command = new MercenaryCommand();
        command.setName(name);
        command.setCommandingOfficer(commandingOfficer);
        return commandService.createCommand(command, userId);
    }

    @MutationMapping
    public Mono<Boolean> deleteUnit(@Argument UUID unitId, Principal principal) {
        return commandService.deleteCombatUnit(unitId, principal.getName()).thenReturn(true);
    }

    @MutationMapping
    public Mono<Pilot> hirePilot(@Argument UUID commandId, @Argument Map<String, Object> input, Principal principal) {
        Pilot pilot = Pilot.builder()
                .name((String) input.get("name"))
                .gunnery((Integer) input.get("gunnery"))
                .piloting((Integer) input.get("piloting"))
                .build();
        return commandService.hirePilot(commandId, pilot, principal.getName());
    }

    @MutationMapping
    public Mono<Boolean> deletePilot(@Argument UUID pilotId, Principal principal) {
        return commandService.deletePilot(pilotId, principal.getName()).thenReturn(true);
    }

    @MutationMapping
    public Mono<Detachment> createDetachment(@Argument UUID commandId, @Argument UUID contractId, @Argument String name, Principal principal) {
        return commandService.createDetachment(commandId, contractId, name, principal.getName());
    }

    @MutationMapping
    public Mono<Boolean> deleteDetachment(@Argument UUID detachmentId, Principal principal) {
        return commandService.deleteDetachment(detachmentId, principal.getName()).thenReturn(true);
    }

    @MutationMapping
    public Mono<LedgerEntry> addLedgerEntry(@Argument UUID detachmentId, @Argument Integer amount, @Argument String description, Principal principal) {
        LedgerEntry entry = LedgerEntry.builder().amount(amount).description(description).build();
        return commandService.addLedgerEntry(detachmentId, entry, principal.getName());
    }

    @MutationMapping
    public Mono<CombatUnit> addCombatUnit(@Argument UUID commandId, @Argument Map<String, Object> input, Principal principal) {
        CombatUnit unit = CombatUnit.builder()
                .model((String) input.get("model"))
                .tonnage((Integer) input.get("tonnage"))
                .type(input.get("type") != null ? (String) input.get("type") : "MECH")
                .build();
        return commandService.addCombatUnit(commandId, unit, principal.getName());
    }

    @MutationMapping
    public Mono<Boolean> assignAsset(@Argument String assetType, @Argument UUID assetId, @Argument UUID detachmentId, Principal principal) {
        return commandService.assignAssetToDetachment(assetType, assetId, detachmentId, principal.getName()).thenReturn(true);
    }
}
