package com.hotspotscamp.api;

import java.security.Principal;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.graphql.data.method.annotation.SubscriptionMapping;
import org.springframework.stereotype.Controller;

import com.hotspotscamp.entity.Campaign;
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

    private static final Logger log = LoggerFactory.getLogger(CommandGraphQLController.class);

    private final MercenaryCommandService commandService;

    @QueryMapping
    public Flux<MercenaryCommand> myCommands(Principal principal) {
        log.trace("[TRACE] Entering myCommands");
        if (principal == null) {
            log.trace("[TRACE] Exiting myCommands (null principal)");
            return Flux.empty();
        }
        // principal.getName() returns the 'sub' for OAuth2 and the unique username for invited players
        return commandService.getCommandsByUser(principal.getName())
                .doOnTerminate(() -> log.trace("[TRACE] Exiting myCommands"));
    }

    @QueryMapping
    public Mono<MercenaryCommand> getCommand(@Argument UUID id, Principal principal) {
        log.trace("[TRACE] Entering getCommand: id={}", id);
        if (id == null || principal == null) {
            log.trace("[TRACE] Exiting getCommand (invalid args)");
            return Mono.empty();
        }
        String userId = principal.getName();
        return commandService.isAuthorizedForCommand(id, userId)
                .flatMap(authorized -> authorized ? commandService.getCommandById(id) : Mono.empty())
                .doOnTerminate(() -> log.trace("[TRACE] Exiting getCommand"));
    }

    @QueryMapping
    public Mono<MercenaryCommandService.CommandAssetsResponse> commandAssets(@Argument UUID commandId, Principal principal) {
        log.trace("[TRACE] Entering commandAssets: id={}", commandId);
        if (commandId == null) {
            log.trace("[TRACE] Exiting commandAssets (null id)");
            return Mono.empty();
        }
        return commandService.getAssetsByCommandId(commandId)
                .doOnTerminate(() -> log.trace("[TRACE] Exiting commandAssets"));
    }

    @SubscriptionMapping
    public Flux<MercenaryCommand> ledgerUpdated(@Argument UUID commandId) {
        log.trace("[TRACE] Entering ledgerUpdated: id={}", commandId);
        if (commandId == null) {
            log.trace("[TRACE] Exiting ledgerUpdated (null id)");
            return Flux.empty();
        }
        return commandService.getCommandUpdates(commandId)
                .doOnTerminate(() -> log.trace("[TRACE] Exiting ledgerUpdated"));
    }

    @SchemaMapping(typeName = "MercenaryCommand", field = "units")
    public Flux<CombatUnit> getUnits(MercenaryCommand command) {
        log.trace("[TRACE] Entering getUnits for command: {}", command.getId());
        UUID id = command.getId();
        if (id == null) {
            log.trace("[TRACE] Exiting getUnits (null id)");
            return Flux.empty();
        }
        return commandService.getAssetsByCommandId(id)
                .flatMapMany(assets -> Flux.fromIterable(assets.units()))
                .doOnTerminate(() -> log.trace("[TRACE] Exiting getUnits"));
    }

    @SchemaMapping(typeName = "MercenaryCommand", field = "pilots")
    public Flux<Pilot> getPilots(MercenaryCommand command) {
        log.trace("[TRACE] Entering getPilots for command: {}", command.getId());
        UUID id = command.getId();
        if (id == null) {
            log.trace("[TRACE] Exiting getPilots (null id)");
            return Flux.empty();
        }
        return commandService.getAssetsByCommandId(id)
                .flatMapMany(assets -> Flux.fromIterable(assets.pilots()))
                .doOnTerminate(() -> log.trace("[TRACE] Exiting getPilots"));
    }

    @SchemaMapping(typeName = "MercenaryCommand", field = "detachments")
    public Flux<Detachment> getDetachments(MercenaryCommand command) {
        log.trace("[TRACE] Entering getDetachments for command: {}", command.getId());
        UUID id = command.getId();
        if (id == null) {
            log.trace("[TRACE] Exiting getDetachments (null id)");
            return Flux.empty();
        }
        return commandService.getDetachmentsByCommandId(id)
                .doOnTerminate(() -> log.trace("[TRACE] Exiting getDetachments"));
    }

    @SchemaMapping(typeName = "Detachment", field = "campaignName")
    public Mono<String> getCampaignName(Detachment detachment) {
        log.trace("[TRACE] Entering getCampaignName for detachment: {}", detachment.getId());
        UUID campaignId = detachment.getCampaignId();
        if (campaignId == null) {
            log.trace("[TRACE] Exiting getCampaignName (null campaignId)");
            return Mono.empty();
        }
        return commandService.getCampaignName(campaignId)
                .doOnTerminate(() -> log.trace("[TRACE] Exiting getCampaignName"));
    }

    @SchemaMapping(typeName = "Detachment", field = "mercenaryCommandName")
    public Mono<String> getDetachmentCommandName(Detachment detachment) {
        log.trace("[TRACE] Entering getDetachmentCommandName for detachment: {}", detachment.getId());
        return commandService.getCommandById(detachment.getMercenaryCommandId()).map(MercenaryCommand::getName)
                .doOnTerminate(() -> log.trace("[TRACE] Exiting getDetachmentCommandName"));
    }

    @SchemaMapping(typeName = "Detachment", field = "units")
    public Flux<CombatUnit> getDetachmentUnits(Detachment detachment) {
        log.trace("[TRACE] Entering getDetachmentUnits for detachment: {}", detachment.getId());
        return commandService.getUnitsByDetachmentId(detachment.getId())
                .doOnTerminate(() -> log.trace("[TRACE] Exiting getDetachmentUnits"));
    }

    @SchemaMapping(typeName = "Detachment", field = "pilots")
    public Flux<Pilot> getDetachmentPilots(Detachment detachment) {
        log.trace("[TRACE] Entering getDetachmentPilots for detachment: {}", detachment.getId());
        return commandService.getPilotsByDetachmentId(detachment.getId())
                .doOnTerminate(() -> log.trace("[TRACE] Exiting getDetachmentPilots"));
    }

    @SchemaMapping(typeName = "MercenaryCommand", field = "allLedgerEntries")
    public Flux<LedgerEntry> getAllLedgerEntries(MercenaryCommand command) {
        log.trace("[TRACE] Entering getAllLedgerEntries for command: {}", command.getId());
        UUID id = command.getId();
        if (id == null) {
            log.trace("[TRACE] Exiting getAllLedgerEntries (null id)");
            return Flux.empty();
        }
        return commandService.getLedgerEntriesByCommandId(id)
                .sort(Comparator.comparing(LedgerEntry::getTimestamp).reversed())
                .doOnTerminate(() -> log.trace("[TRACE] Exiting getAllLedgerEntries"));
    }

    @MutationMapping
    public Mono<Boolean> deleteCommand(@Argument UUID commandId, @Argument Boolean force, Principal principal) {
        log.trace("[TRACE] Entering deleteCommand: id={}, force={}", commandId, force);
        if (commandId == null) {
            return Mono.error(new IllegalArgumentException("Command ID is required"));
        }
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentication required to delete command"));
        }
        String userId = principal.getName();
        return commandService.deleteCommand(commandId, userId, Boolean.TRUE.equals(force)).thenReturn(true)
                .doOnTerminate(() -> log.trace("[TRACE] Exiting deleteCommand"));
    }

    @MutationMapping
    public Mono<MercenaryCommand> establishCommand(@Argument MercenaryCommandService.CommandUpdateInput input,
            Principal principal) {
        log.trace("[TRACE] Entering establishCommand");
        if (principal == null || input == null || input.name() == null) {
            return Mono.error(new RuntimeException("Authentication and Name required to establish command"));
        }
        String userId = principal.getName();
        MercenaryCommand command = new MercenaryCommand();
        command.setName(input.name());
        command.setCommandingOfficer(input.commandingOfficer());
        command.setTotalSupportPoints(input.totalSupportPoints());
        command.setReputation(input.reputation());
        return commandService.createCommand(command, userId)
                .doOnTerminate(() -> log.trace("[TRACE] Exiting establishCommand"));
    }

    @MutationMapping
    public Mono<MercenaryCommand> updateCommand(@Argument UUID id,
            @Argument MercenaryCommandService.CommandUpdateInput input,
            Principal principal) {
        log.trace("[TRACE] Entering updateCommand: id={}", id);
        if (id == null || principal == null || input == null) {
            return Mono.error(new IllegalArgumentException("Invalid arguments"));
        }
        return commandService.updateCommandDetails(id, input, principal.getName())
                .doOnTerminate(() -> log.trace("[TRACE] Exiting updateCommand"));
    }

    @MutationMapping
    public Mono<Campaign> updateCampaign(@Argument UUID id, @Argument MercenaryCommandService.CampaignUpdateInput input, Principal principal) {
        log.trace("[TRACE] Entering updateCampaign: id={}", id);
        if (id == null || principal == null) {
            return Mono.error(new IllegalArgumentException("Invalid arguments"));
        }
        return commandService.updateCampaignDetails(id, input, principal.getName())
                .doOnTerminate(() -> log.trace("[TRACE] Exiting updateCampaign"));
    }

    @MutationMapping
    public Mono<Boolean> assignDetachmentToCampaign(@Argument UUID detachmentId, @Argument UUID campaignId, Principal principal) {
        log.trace("[TRACE] Entering assignDetachmentToCampaign: detId={}, campId={}", detachmentId, campaignId);
        if (detachmentId == null || principal == null) {
            return Mono.error(new IllegalArgumentException("Invalid arguments"));
        }
        return commandService.assignDetachmentToCampaign(detachmentId, campaignId, principal.getName()).thenReturn(true)
                .doOnTerminate(() -> log.trace("[TRACE] Exiting assignDetachmentToCampaign"));
    }

    @MutationMapping
    public Mono<Boolean> deleteUnit(@Argument UUID unitId, Principal principal) {
        log.trace("[TRACE] Entering deleteUnit: id={}", unitId);
        if (unitId == null || principal == null) {
            return Mono.error(new IllegalArgumentException("Invalid arguments"));
        }
        return commandService.deleteCombatUnit(unitId, principal.getName()).thenReturn(true)
                .doOnTerminate(() -> log.trace("[TRACE] Exiting deleteUnit"));
    }

    @MutationMapping
    public Mono<Pilot> hirePilot(@Argument UUID commandId, @Argument MercenaryCommandService.PilotUpdateInput input, Principal principal) {
        log.trace("[TRACE] Entering hirePilot: commandId={}", commandId);
        if (commandId == null || principal == null) {
            return Mono.error(new IllegalArgumentException("Invalid arguments"));
        }
        return commandService.hirePilot(commandId, input, principal.getName())
                .doOnTerminate(() -> log.trace("[TRACE] Exiting hirePilot"));
    }

    @MutationMapping
    public Mono<Pilot> updatePilot(@Argument UUID id, @Argument MercenaryCommandService.PilotUpdateInput input, Principal principal) {
        log.trace("[TRACE] Entering updatePilot: id={}", id);
        if (id == null || principal == null) {
            return Mono.error(new IllegalArgumentException("Invalid arguments"));
        }
        return commandService.updatePilot(id, input, principal.getName())
                .doOnTerminate(() -> log.trace("[TRACE] Exiting updatePilot"));
    }

    @MutationMapping
    public Mono<Boolean> deletePilot(@Argument UUID pilotId, Principal principal) {
        log.trace("[TRACE] Entering deletePilot: id={}", pilotId);
        if (pilotId == null || principal == null) {
            return Mono.error(new IllegalArgumentException("Invalid arguments"));
        }
        return commandService.deletePilot(pilotId, principal.getName()).thenReturn(true)
                .doOnTerminate(() -> log.trace("[TRACE] Exiting deletePilot"));
    }

    @MutationMapping
    public Mono<Detachment> createDetachment(@Argument UUID commandId, @Argument UUID campaignId, @Argument String name, Principal principal) {
        log.trace("[TRACE] Entering createDetachment: commandId={}, campaignId={}", commandId, campaignId);
        if (commandId == null || principal == null) {
            return Mono.error(new IllegalArgumentException("Invalid arguments"));
        }
        return commandService.createDetachment(commandId, campaignId, name, principal.getName())
                .doOnTerminate(() -> log.trace("[TRACE] Exiting createDetachment"));
    }

    @MutationMapping
    public Mono<Boolean> deleteDetachment(@Argument UUID detachmentId, Principal principal) {
        log.trace("[TRACE] Entering deleteDetachment: id={}", detachmentId);
        if (detachmentId == null || principal == null) {
            return Mono.error(new IllegalArgumentException("Invalid arguments"));
        }
        return commandService.deleteDetachment(detachmentId, principal.getName()).thenReturn(true)
                .doOnTerminate(() -> log.trace("[TRACE] Exiting deleteDetachment"));
    }

    @MutationMapping
    public Mono<LedgerEntry> addLedgerEntry(@Argument UUID commandId,
            @Argument UUID detachmentId,
            @Argument MercenaryCommandService.LedgerEntryInput input,
            Principal principal) {
        log.trace("[TRACE] Entering addLedgerEntry: cmdId={}, detId={}", commandId, detachmentId);
        if (commandId == null || principal == null || input == null) {
            return Mono.error(new IllegalArgumentException("Invalid arguments"));
        }
        return commandService.addLedgerEntry(commandId, detachmentId, input, principal.getName())
                .doOnTerminate(() -> log.trace("[TRACE] Exiting addLedgerEntry"));
    }

    @MutationMapping
    public Mono<CombatUnit> addCombatUnit(@Argument UUID commandId, @Argument MercenaryCommandService.CombatUnitUpdateInput input, Principal principal) {
        log.trace("[TRACE] Entering addCombatUnit: commandId={}", commandId);
        if (commandId == null || principal == null) {
            return Mono.error(new IllegalArgumentException("Invalid arguments"));
        }
        return commandService.addCombatUnit(commandId, input, principal.getName())
                .doOnTerminate(() -> log.trace("[TRACE] Exiting addCombatUnit"));
    }

    @MutationMapping
    public Mono<CombatUnit> updateCombatUnit(@Argument UUID id, @Argument MercenaryCommandService.CombatUnitUpdateInput input, Principal principal) {
        log.trace("[TRACE] Entering updateCombatUnit: id={}", id);
        if (id == null || principal == null) {
            return Mono.error(new IllegalArgumentException("Invalid arguments"));
        }
        return commandService.updateCombatUnit(id, input, principal.getName())
                .doOnTerminate(() -> log.trace("[TRACE] Exiting updateCombatUnit"));
    }

    @MutationMapping
    public Mono<Boolean> assignAsset(@Argument String assetType, @Argument UUID assetId, @Argument UUID detachmentId, Principal principal) {
        log.trace("[TRACE] Entering assignAsset: type={}, id={}, detId={}", assetType, assetId, detachmentId);
        if (assetId == null || principal == null) {
            return Mono.error(new IllegalArgumentException("Invalid arguments"));
        }
        return commandService.assignAssetToDetachment(assetType, assetId, detachmentId, principal.getName()).thenReturn(true)
                .doOnTerminate(() -> log.trace("[TRACE] Exiting assignAsset"));
    }

    @MutationMapping
    public Mono<List<CombatUnit>> importCombatUnitsFromLink(@Argument UUID commandId,
            @Argument UUID detachmentId,
            @Argument String link,
            Principal principal) {
        log.trace("[TRACE] Entering importCombatUnitsFromLink: cmdId={}, link={}", commandId, link);
        if (principal == null) {
            return Mono.error(new RuntimeException("Unauthorized"));
        }
        return commandService.importAssetsFromLink(commandId, detachmentId, link, principal.getName())
                .collectList()
                .doOnTerminate(() -> log.trace("[TRACE] Exiting importCombatUnitsFromLink"));
    }
}
