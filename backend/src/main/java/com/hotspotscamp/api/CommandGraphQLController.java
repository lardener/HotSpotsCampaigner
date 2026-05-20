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
        if (id == null) {
            return Mono.empty();
        }
        if (principal == null) {
            return Mono.empty();
        }
        String userId = principal.getName();
        return commandService.isAuthorizedForCommand(id, userId)
                .flatMap(authorized -> authorized ? commandService.getCommandById(id) : Mono.empty());
    }

    @QueryMapping
    public Mono<Object> commandAssets(@Argument UUID commandId, Principal principal) {
        if (commandId == null) {
            return Mono.empty();
        }
        return commandService.getAssetsByCommandId(commandId).cast(Object.class);
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

    @SchemaMapping(typeName = "MercenaryCommand", field = "allLedgerEntries")
    public Flux<LedgerEntry> getAllLedgerEntries(MercenaryCommand command) {
        UUID id = command.getId();
        if (id == null) {
            return Flux.empty();
        }
        return commandService.getLedgerEntriesByCommandId(id)
                .sort(Comparator.comparing(LedgerEntry::getTimestamp, Comparator.nullsLast(Comparator.reverseOrder())));
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
            Principal principal) {
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentication required to establish command"));
        }
        String userId = principal.getName();
        MercenaryCommand command = new MercenaryCommand();
        command.setName(name);
        command.setCommandingOfficer(commandingOfficer);
        return commandService.createCommand(command, userId);
    }

    @MutationMapping
    public Mono<MercenaryCommand> updateCommand(@Argument UUID id,
            @Argument String commandingOfficer,
            @Argument Integer totalSupportPoints,
            @Argument Integer reputation,
            Principal principal) {
        if (id == null) {
            return Mono.error(new IllegalArgumentException("Command ID is required"));
        }
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentication required to update command"));
        }
        return commandService.updateCommandDetails(id, commandingOfficer, totalSupportPoints, reputation, principal.getName());
    }

    @MutationMapping
    public Mono<Campaign> updateCampaign(@Argument UUID id, @Argument Map<String, Object> input, Principal principal) {
        // Note: Reusing Command service for campaign management as per current architecture
        if (id == null) {
            return Mono.error(new IllegalArgumentException("Campaign ID is required"));
        }
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentication required to update campaign"));
        }
        return commandService.updateCampaignDetails(id, input, principal.getName());
    }

    @MutationMapping
    public Mono<Boolean> assignDetachmentToCampaign(@Argument UUID detachmentId, @Argument UUID campaignId, Principal principal) {
        if (detachmentId == null) {
            return Mono.error(new IllegalArgumentException("Detachment ID is required"));
        }
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentication required to assign detachment"));
        }
        return commandService.assignDetachmentToCampaign(detachmentId, campaignId, principal.getName()).thenReturn(true);
    }

    @MutationMapping
    public Mono<Boolean> deleteUnit(@Argument UUID unitId, Principal principal) {
        if (unitId == null) {
            return Mono.error(new IllegalArgumentException("Unit ID is required"));
        }
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentication required to delete unit"));
        }
        return commandService.deleteCombatUnit(unitId, principal.getName()).thenReturn(true);
    }

    @MutationMapping
    public Mono<Pilot> hirePilot(@Argument UUID commandId, @Argument Map<String, Object> input, Principal principal) {
        if (commandId == null) {
            return Mono.error(new IllegalArgumentException("Command ID is required"));
        }
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentication required to hire pilot"));
        }
        Pilot pilot = Pilot.builder()
                .name((String) input.get("name"))
                .gunnery((Integer) input.get("gunnery"))
                .piloting((Integer) input.get("piloting"))
                .asSkill(input.get("asSkill") != null ? (Integer) input.get("asSkill") : null)
                .unitType((String) input.get("unitType"))
                .status((String) input.get("status"))
                .detachmentId(input.get("detachmentId") != null ? UUID.fromString((String) input.get("detachmentId")) : null)
                .build();
        return commandService.hirePilot(commandId, pilot, principal.getName());
    }

    @MutationMapping
    public Mono<Pilot> updatePilot(@Argument UUID id, @Argument Map<String, Object> input, Principal principal) {
        if (id == null) {
            return Mono.error(new IllegalArgumentException("Pilot ID is required"));
        }
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentication required to update pilot"));
        }
        Pilot pilot = Pilot.builder()
                .name((String) input.get("name"))
                .gunnery((Integer) input.get("gunnery"))
                .piloting((Integer) input.get("piloting"))
                .asSkill(input.get("asSkill") != null ? (Integer) input.get("asSkill") : null)
                .unitType((String) input.get("unitType"))
                .status((String) input.get("status"))
                .build();
        return commandService.updatePilot(id, pilot, principal.getName());
    }

    @MutationMapping
    public Mono<Boolean> deletePilot(@Argument UUID pilotId, Principal principal) {
        if (pilotId == null) {
            return Mono.error(new IllegalArgumentException("Pilot ID is required"));
        }
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentication required to delete pilot"));
        }
        return commandService.deletePilot(pilotId, principal.getName()).thenReturn(true);
    }

    @MutationMapping
    public Mono<Detachment> createDetachment(@Argument UUID commandId, @Argument UUID campaignId, @Argument String name, Principal principal) {
        if (commandId == null) {
            return Mono.error(new IllegalArgumentException("Command ID is required"));
        }
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentication required to create detachment"));
        }
        return commandService.createDetachment(commandId, campaignId, name, principal.getName());
    }

    @MutationMapping
    public Mono<Boolean> deleteDetachment(@Argument UUID detachmentId, Principal principal) {
        if (detachmentId == null) {
            return Mono.error(new IllegalArgumentException("Detachment ID is required"));
        }
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentication required to delete detachment"));
        }
        return commandService.deleteDetachment(detachmentId, principal.getName()).thenReturn(true);
    }

    @MutationMapping
    public Mono<LedgerEntry> addLedgerEntry(@Argument UUID commandId,
            @Argument UUID detachmentId,
            @Argument Integer amount,
            @Argument String description,
            @Argument Integer coverAmount,
            @Argument Integer paidAmount,
            @Argument Integer reputationChange,
            @Argument UUID campaignId,
            @Argument String campaignName,
            @Argument String contractMonth,
            Principal principal) {
        if (commandId == null) {
            return Mono.error(new IllegalArgumentException("Command ID is required"));
        }
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentication required to add ledger entry"));
        }
        LedgerEntry entry = LedgerEntry.builder().amount(amount).description(description)
                .coverAmount(coverAmount).paidAmount(paidAmount).reputationChange(reputationChange)
                .campaignId(campaignId).campaignName(campaignName).contractMonth(contractMonth).build();
        return commandService.addLedgerEntry(commandId, detachmentId, entry, principal.getName());
    }

    @MutationMapping
    public Mono<CombatUnit> addCombatUnit(@Argument UUID commandId, @Argument Map<String, Object> input, Principal principal) {
        if (commandId == null) {
            return Mono.error(new IllegalArgumentException("Command ID is required"));
        }
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentication required to add combat unit"));
        }
        CombatUnit unit = CombatUnit.builder()
                .type(input.get("type") != null ? (String) input.get("type") : "MECH")
                .model((String) input.get("model"))
                .variant((String) input.get("variant"))
                .techBase((String) input.get("techBase"))
                .tonnage(input.get("tonnage") != null ? (Integer) input.get("tonnage") : 0)
                .asSize(input.get("asSize") != null ? (Integer) input.get("asSize") : 0)
                .bv(input.get("bv") != null ? (Integer) input.get("bv") : 0)
                .pv(input.get("pv") != null ? (Integer) input.get("pv") : 0)
                .status((String) input.get("status"))
                .detachmentId(input.get("detachmentId") != null ? UUID.fromString((String) input.get("detachmentId")) : null)
                .build();
        return commandService.addCombatUnit(commandId, unit, principal.getName());
    }

    @MutationMapping
    public Mono<CombatUnit> updateCombatUnit(@Argument UUID id, @Argument Map<String, Object> input, Principal principal) {
        if (id == null) {
            return Mono.error(new IllegalArgumentException("Unit ID is required"));
        }
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentication required to update combat unit"));
        }
        CombatUnit unit = CombatUnit.builder()
                .type((String) input.get("type"))
                .model((String) input.get("model"))
                .variant((String) input.get("variant"))
                .techBase((String) input.get("techBase"))
                .tonnage(input.get("tonnage") != null ? (Integer) input.get("tonnage") : null)
                .asSize(input.get("asSize") != null ? (Integer) input.get("asSize") : null)
                .bv(input.get("bv") != null ? (Integer) input.get("bv") : null)
                .pv(input.get("pv") != null ? (Integer) input.get("pv") : null)
                .status((String) input.get("status"))
                .build();
        return commandService.updateCombatUnit(id, unit, principal.getName());
    }

    @MutationMapping
    public Mono<Boolean> assignAsset(@Argument String assetType, @Argument UUID assetId, @Argument UUID detachmentId, Principal principal) {
        if (assetId == null) {
            return Mono.error(new IllegalArgumentException("Asset ID is required"));
        }
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentication required to assign asset"));
        }
        return commandService.assignAssetToDetachment(assetType, assetId, detachmentId, principal.getName()).thenReturn(true);
    }

    @MutationMapping
    public Mono<Boolean> joinCampaign(@Argument String token, @Argument UUID detachmentId, Principal principal) {
        if (detachmentId == null) {
            return Mono.error(new IllegalArgumentException("Detachment ID is required"));
        }
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentication required to join campaign"));
        }
        return commandService.joinCampaign(token, detachmentId, principal.getName());
    }

    @MutationMapping
    public Mono<List<CombatUnit>> importCombatUnitsFromLink(@Argument UUID commandId, 
                                                          @Argument UUID detachmentId, 
                                                          @Argument String link, 
                                                          Principal principal) {
        if (principal == null) return Mono.error(new RuntimeException("Unauthorized"));
        return commandService.importAssetsFromLink(commandId, detachmentId, link, principal.getName())
                .collectList();
    }
}
