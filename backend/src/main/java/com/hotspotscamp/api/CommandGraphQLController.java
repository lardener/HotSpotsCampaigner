package com.hotspotscamp.api;

import java.security.Principal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

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
import com.hotspotscamp.util.TypeUtils;

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
            return Flux.empty();
        }
        // principal.getName() returns the 'sub' for OAuth2 and the unique username for invited players
        return commandService.getCommandsByUser(principal.getName());
    }

    @QueryMapping
    public Mono<MercenaryCommand> getCommand(@Argument UUID id, Principal principal) {
        if (id == null || principal == null) {
            return Mono.empty();
        }
        String userId = principal.getName();
        return commandService.isAuthorizedForCommand(id, userId)
                .flatMap(authorized -> authorized ? commandService.getCommandById(id) : Mono.empty());
    }

    @QueryMapping
    public Mono<MercenaryCommandService.CommandAssetsResponse> commandAssets(@Argument UUID commandId, Principal principal) {
        if (commandId == null) {
            return Mono.empty();
        }
        return commandService.getAssetsByCommandId(commandId);
    }

    @SubscriptionMapping
    public Flux<MercenaryCommand> ledgerUpdated(@Argument UUID commandId) {
        if (commandId == null) {
            return Flux.empty();
        }
        return commandService.getCommandUpdates(commandId);
    }

    @SchemaMapping(typeName = "MercenaryCommand", field = "units")
    public Flux<CombatUnit> getUnits(MercenaryCommand command) {
        UUID id = command.getId();
        if (id == null) {
            return Flux.empty();
        }
        return commandService.getAssetsByCommandId(id)
                .flatMapMany(assets -> Flux.fromIterable(assets.units()));
    }

    @SchemaMapping(typeName = "MercenaryCommand", field = "pilots")
    public Flux<Pilot> getPilots(MercenaryCommand command) {
        UUID id = command.getId();
        if (id == null) {
            return Flux.empty();
        }
        return commandService.getAssetsByCommandId(id)
                .flatMapMany(assets -> Flux.fromIterable(assets.pilots()));
    }

    @SchemaMapping(typeName = "MercenaryCommand", field = "detachments")
    public Flux<Detachment> getDetachments(MercenaryCommand command) {
        UUID id = command.getId();
        if (id == null) {
            return Flux.empty();
        }
        return commandService.getDetachmentsByCommandId(id);
    }

    @SchemaMapping(typeName = "Detachment", field = "campaignName")
    public Mono<String> getCampaignName(Detachment detachment) {
        UUID campaignId = detachment.getCampaignId();
        if (campaignId == null) {
            return Mono.empty();
        }
        return commandService.getCampaignName(campaignId);
    }

    @SchemaMapping(typeName = "Detachment", field = "mercenaryCommandName")
    public Mono<String> getDetachmentCommandName(Detachment detachment) {
        return commandService.getCommandById(detachment.getMercenaryCommandId()).map(MercenaryCommand::getName);
    }

    @SchemaMapping(typeName = "Detachment", field = "units")
    public Flux<CombatUnit> getDetachmentUnits(Detachment detachment) {
        return commandService.getUnitsByDetachmentId(detachment.getId());
    }

    @SchemaMapping(typeName = "Detachment", field = "pilots")
    public Flux<Pilot> getDetachmentPilots(Detachment detachment) {
        return commandService.getPilotsByDetachmentId(detachment.getId());
    }

    @SchemaMapping(typeName = "MercenaryCommand", field = "allLedgerEntries")
    public Flux<LedgerEntry> getAllLedgerEntries(MercenaryCommand command) {
        UUID id = command.getId();
        if (id == null) {
            return Flux.empty();
        }
        return commandService.getLedgerEntriesByCommandId(id)
                .sort(Comparator.comparing(LedgerEntry::getTimestamp).reversed());
    }

    @MutationMapping
    public Mono<Boolean> deleteCommand(@Argument UUID commandId, @Argument Boolean force, Principal principal) {
        if (commandId == null) {
            return Mono.error(new IllegalArgumentException("Command ID is required"));
        }
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentication required to delete command"));
        }
        String userId = principal.getName();
        return commandService.deleteCommand(commandId, userId, Boolean.TRUE.equals(force)).thenReturn(true);
    }

    @MutationMapping
    public Mono<MercenaryCommand> establishCommand(@Argument String name,
            @Argument String commandingOfficer,
            @Argument Integer totalSupportPoints,
            Principal principal) {
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentication required to establish command"));
        }
        String userId = principal.getName();
        MercenaryCommand command = new MercenaryCommand();
        command.setName(name);
        command.setCommandingOfficer(commandingOfficer);
        command.setTotalSupportPoints(totalSupportPoints);
        return commandService.createCommand(command, userId);
    }

    @MutationMapping
    public Mono<MercenaryCommand> updateCommand(@Argument UUID id,
            @Argument String name,
            @Argument String commandingOfficer,
            @Argument Integer totalSupportPoints,
            @Argument Integer reputation,
            Principal principal) {
        if (id == null || principal == null) {
            return Mono.error(new IllegalArgumentException("Invalid arguments"));
        }
        return commandService.updateCommandDetails(id, name, commandingOfficer, totalSupportPoints, reputation, principal.getName());
    }

    @MutationMapping
    public Mono<Campaign> updateCampaign(@Argument UUID id, @Argument Map<String, Object> input, Principal principal) {
        if (id == null || principal == null) {
            return Mono.error(new IllegalArgumentException("Invalid arguments"));
        }
        return commandService.updateCampaignDetails(id, input, principal.getName());
    }

    @MutationMapping
    public Mono<Boolean> assignDetachmentToCampaign(@Argument UUID detachmentId, @Argument UUID campaignId, Principal principal) {
        if (detachmentId == null || principal == null) {
            return Mono.error(new IllegalArgumentException("Invalid arguments"));
        }
        return commandService.assignDetachmentToCampaign(detachmentId, campaignId, principal.getName()).thenReturn(true);
    }

    @MutationMapping
    public Mono<Boolean> deleteUnit(@Argument UUID unitId, Principal principal) {
        if (unitId == null || principal == null) {
            return Mono.error(new IllegalArgumentException("Invalid arguments"));
        }
        return commandService.deleteCombatUnit(unitId, principal.getName()).thenReturn(true);
    }

    @MutationMapping
    public Mono<Pilot> hirePilot(@Argument UUID commandId, @Argument Map<String, Object> input, Principal principal) {
        if (commandId == null || principal == null) {
            return Mono.error(new IllegalArgumentException("Invalid arguments"));
        }
        Pilot pilot = Pilot.builder()
                .name((String) input.get("name"))
                .gunnery(TypeUtils.asInt(input.get("gunnery")))
                .piloting(TypeUtils.asInt(input.get("piloting")))
                .asSkill(TypeUtils.asInt(input.get("asSkill")))
                .unitType((String) input.get("unitType"))
                .wounds(TypeUtils.asInt(input.get("wounds")))
                .handicap((String) input.get("handicap"))
                .totalSpEarned(TypeUtils.asInt(input.get("totalSpEarned")))
                .gunnerySpEarned(TypeUtils.asInt(input.get("gunnerySpEarned")))
                .pilotingSpEarned(TypeUtils.asInt(input.get("pilotingSpEarned")))
                .edgeTokensSpEarned(TypeUtils.asInt(input.get("edgeTokensSpEarned")))
                .edgeAbilitySpEarned(TypeUtils.asInt(input.get("edgeAbilitySpEarned")))
                .edgeTokensSkill(TypeUtils.asInt(input.get("edgeTokensSkill")))
                .edgeAbilitySkill(TypeUtils.asInt(input.get("edgeAbilitySkill")))
                .edgeAbilities((String) input.get("edgeAbilities"))
                .detachmentId(input.get("detachmentId") != null ? UUID.fromString((String) input.get("detachmentId")) : null)
                .build();
        return commandService.hirePilot(commandId, pilot, principal.getName());
    }

    @MutationMapping
    public Mono<Pilot> updatePilot(@Argument UUID id, @Argument Map<String, Object> input, Principal principal) {
        if (id == null || principal == null) {
            return Mono.error(new IllegalArgumentException("Invalid arguments"));
        }
        Pilot pilot = Pilot.builder()
                .name((String) input.get("name"))
                .gunnery(TypeUtils.asInt(input.get("gunnery")))
                .piloting(TypeUtils.asInt(input.get("piloting")))
                .asSkill(TypeUtils.asInt(input.get("asSkill")))
                .unitType((String) input.get("unitType"))
                .wounds(TypeUtils.asInt(input.get("wounds")))
                .handicap((String) input.get("handicap"))
                .totalSpEarned(TypeUtils.asInt(input.get("totalSpEarned")))
                .gunnerySpEarned(TypeUtils.asInt(input.get("gunnerySpEarned")))
                .pilotingSpEarned(TypeUtils.asInt(input.get("pilotingSpEarned")))
                .edgeTokensSpEarned(TypeUtils.asInt(input.get("edgeTokensSpEarned")))
                .edgeAbilitySpEarned(TypeUtils.asInt(input.get("edgeAbilitySpEarned")))
                .edgeTokensSkill(TypeUtils.asInt(input.get("edgeTokensSkill")))
                .edgeAbilitySkill(TypeUtils.asInt(input.get("edgeAbilitySkill")))
                .edgeAbilities((String) input.get("edgeAbilities"))
                .build();
        return commandService.updatePilot(id, pilot, principal.getName());
    }

    @MutationMapping
    public Mono<Boolean> deletePilot(@Argument UUID pilotId, Principal principal) {
        if (pilotId == null || principal == null) {
            return Mono.error(new IllegalArgumentException("Invalid arguments"));
        }
        return commandService.deletePilot(pilotId, principal.getName()).thenReturn(true);
    }

    @MutationMapping
    public Mono<Detachment> createDetachment(@Argument UUID commandId, @Argument UUID campaignId, @Argument String name, Principal principal) {
        if (commandId == null || principal == null) {
            return Mono.error(new IllegalArgumentException("Invalid arguments"));
        }
        return commandService.createDetachment(commandId, campaignId, name, principal.getName());
    }

    @MutationMapping
    public Mono<Boolean> deleteDetachment(@Argument UUID detachmentId, Principal principal) {
        if (detachmentId == null || principal == null) {
            return Mono.error(new IllegalArgumentException("Invalid arguments"));
        }
        return commandService.deleteDetachment(detachmentId, principal.getName()).thenReturn(true);
    }

    @MutationMapping
    public Mono<LedgerEntry> addLedgerEntry(@Argument UUID commandId,
            @Argument UUID detachmentId,
            @Argument Integer amount,
            @Argument String description,
            @Argument Integer reputationChange,
            @Argument String campaignName,
            @Argument Integer monthIndex,
            Principal principal) {
        if (commandId == null || principal == null) {
            return Mono.error(new IllegalArgumentException("Invalid arguments"));
        }
        LedgerEntry entry = LedgerEntry.builder()
                .amount(amount)
                .description(description)
                .reputationChange(reputationChange)
                .campaignName(campaignName)
                .monthIndex(monthIndex)
                .build();
        return commandService.addLedgerEntry(commandId, detachmentId, entry, principal.getName());
    }

    @MutationMapping
    public Mono<CombatUnit> addCombatUnit(@Argument UUID commandId, @Argument Map<String, Object> input, Principal principal) {
        if (commandId == null || principal == null) {
            return Mono.error(new IllegalArgumentException("Invalid arguments"));
        }
        CombatUnit unit = CombatUnit.builder()
                .type((String) input.get("type"))
                .model((String) input.get("model"))
                .variant((String) input.get("variant"))
                .techBase((String) input.get("techBase"))
                .tonnage(TypeUtils.asInt(input.get("tonnage")))
                .asSize(TypeUtils.asInt(input.get("asSize")))
                .bv(TypeUtils.asInt(input.get("bv")))
                .pv(TypeUtils.asInt(input.get("pv")))
                .availableFromMonth(TypeUtils.asInt(input.get("availableFromMonth")))
                .status((String) input.get("status"))
                .detachmentId(input.get("detachmentId") != null ? UUID.fromString((String) input.get("detachmentId")) : null)
                .build();
        return commandService.addCombatUnit(commandId, unit, principal.getName());
    }

    @MutationMapping
    public Mono<CombatUnit> updateCombatUnit(@Argument UUID id, @Argument Map<String, Object> input, Principal principal) {
        if (id == null || principal == null) {
            return Mono.error(new IllegalArgumentException("Invalid arguments"));
        }
        CombatUnit unit = CombatUnit.builder()
                .type((String) input.get("type"))
                .model((String) input.get("model"))
                .variant((String) input.get("variant"))
                .techBase((String) input.get("techBase"))
                .tonnage(TypeUtils.asInt(input.get("tonnage")))
                .asSize(TypeUtils.asInt(input.get("asSize")))
                .bv(TypeUtils.asInt(input.get("bv")))
                .pv(TypeUtils.asInt(input.get("pv")))
                .availableFromMonth(TypeUtils.asInt(input.get("availableFromMonth")))
                .status((String) input.get("status"))
                .build();
        return commandService.updateCombatUnit(id, unit, principal.getName());
    }

    @MutationMapping
    public Mono<Boolean> assignAsset(@Argument String assetType, @Argument UUID assetId, @Argument UUID detachmentId, Principal principal) {
        if (assetId == null || principal == null) {
            return Mono.error(new IllegalArgumentException("Invalid arguments"));
        }
        return commandService.assignAssetToDetachment(assetType, assetId, detachmentId, principal.getName()).thenReturn(true);
    }

    @MutationMapping
    public Mono<List<CombatUnit>> importCombatUnitsFromLink(@Argument UUID commandId,
            @Argument UUID detachmentId,
            @Argument String link,
            Principal principal) {
        if (principal == null) {
            return Mono.error(new RuntimeException("Unauthorized"));
        }
        return commandService.importAssetsFromLink(commandId, detachmentId, link, principal.getName())
                .collectList();
    }
}
