package com.hotspotscamp.api;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

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

@ Controller 

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
        public Mono<MercenaryCommand> updateCommand(@Argument UUID id,
                @Argument String commandingOfficer,
                @Argument Integer totalSupportPoints,
                @Argument Integer reputation,
                Principal principal) {
            return commandService.updateCommandDetails(id, commandingOfficer, totalSupportPoints, reputation, principal.getName());
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
                    .asSkill(input.get("asSkill") != null ? (Integer) input.get("asSkill") : null)
                    .unitType((String) input.get("unitType"))
                    .status((String) input.get("status"))
                    .detachmentId(input.get("detachmentId") != null ? UUID.fromString((String) input.get("detachmentId")) : null)
                    .build();
            return commandService.hirePilot(commandId, pilot, principal.getName());
        }

        @MutationMapping
        public Mono<Pilot> updatePilot(@Argument UUID id, @Argument Map<String, Object> input, Principal principal) {
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
            return commandService.deletePilot(pilotId, principal.getName()).thenReturn(true);
        }

        @MutationMapping
        public Mono<Detachment> createDetachment(@Argument UUID commandId, @Argument UUID campaignId, @Argument String name, Principal principal) {
            return commandService.createDetachment(commandId, campaignId, name, principal.getName());
        }

        @MutationMapping
        public Mono<Boolean> deleteDetachment(@Argument UUID detachmentId, Principal principal) {
            return commandService.deleteDetachment(detachmentId, principal.getName()).thenReturn(true);
        }

        @MutationMapping
        public Mono<LedgerEntry> addLedgerEntry(@Argument UUID detachmentId,
                @Argument Integer amount,
                @Argument String description,
                @Argument Integer coverAmount,
                @Argument Integer paidAmount,
                @Argument Integer reputationChange,
                @Argument UUID campaignId,
                @Argument String campaignName,
                @Argument String contractMonth,
                Principal principal) {
            LedgerEntry entry = LedgerEntry.builder().amount(amount).description(description)
                    .coverAmount(coverAmount).paidAmount(paidAmount).reputationChange(reputationChange)
                    .campaignId(campaignId).campaignName(campaignName).contractMonth(contractMonth).build();
            return commandService.addLedgerEntry(detachmentId, entry, principal.getName());
        }

        @MutationMapping
        public Mono<CombatUnit> addCombatUnit(@Argument UUID commandId, @Argument Map<String, Object> input, Principal principal) {
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
            return commandService.assignAssetToDetachment(assetType, assetId, detachmentId, principal.getName()).thenReturn(true);
        }
    }

    