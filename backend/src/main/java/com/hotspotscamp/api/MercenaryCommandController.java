package com.hotspotscamp.api;

import java.security.Principal;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hotspotscamp.entity.MercenaryCommand;
import com.hotspotscamp.entity.Detachment;
import com.hotspotscamp.entity.LedgerEntry;
import com.hotspotscamp.service.MercenaryCommandService;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/commands")
@RequiredArgsConstructor
public class MercenaryCommandController {

    private final MercenaryCommandService mercenaryCommandService;

    @GetMapping
    public Flux<MercenaryCommand> getMyCommands(Principal principal) {
        return mercenaryCommandService.getCommandsByUser(principal.getName());
    }

    @PostMapping
    public Mono<ResponseEntity<MercenaryCommand>> createCommand(
            @RequestBody MercenaryCommand command,
            Principal principal) {
        String userId = principal.getName();
        return mercenaryCommandService.createCommand(command, userId)
                .map(newCommand -> new ResponseEntity<>(newCommand, HttpStatus.CREATED));
    }

    @DeleteMapping("/{commandId}")
    public Mono<ResponseEntity<Void>> deleteCommand(
            @PathVariable UUID commandId,
            @RequestParam(defaultValue = "false") boolean force,
            Principal principal) {
        return mercenaryCommandService.deleteCommand(commandId, principal.getName(), force)
                .then(Mono.just(ResponseEntity.noContent().<Void>build()))
                .onErrorResume(e -> {
                    if ("WARNING_ACTIVE_CAMPAIGN".equals(e.getMessage())) {
                        return Mono.just(ResponseEntity.status(HttpStatus.CONFLICT).build());
                    }
                    if (e.getMessage() != null && e.getMessage().contains("Access Denied")) {
                        return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
                    }
                    return Mono.error(e);
                });
    }

    @DeleteMapping("/detachments/{detachmentId}")
    public Mono<ResponseEntity<Void>> deleteDetachment(
            @PathVariable UUID detachmentId,
            Principal principal) {
        return mercenaryCommandService.deleteDetachment(detachmentId, principal.getName())
                .then(Mono.just(ResponseEntity.noContent().<Void>build()))
                .onErrorResume(e -> {
                    if (e.getMessage() != null && e.getMessage().contains("Access Denied")) {
                        return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
                    }
                    return Mono.error(e);
                });
    }

    @PostMapping("/{commandId}/detachments")
    public Mono<Detachment> createDetachment(
            @PathVariable UUID commandId,
            @RequestParam UUID contractId,
            @RequestParam String name,
            Principal principal) {
        return mercenaryCommandService.createDetachment(commandId, contractId, name, principal.getName());
    }

    @DeleteMapping("/units/{unitId}")
    public Mono<Void> deleteUnit(@PathVariable UUID unitId, Principal principal) {
        return mercenaryCommandService.deleteCombatUnit(unitId, principal.getName());
    }

    @DeleteMapping("/pilots/{pilotId}")
    public Mono<Void> deletePilot(@PathVariable UUID pilotId, Principal principal) {
        return mercenaryCommandService.deletePilot(pilotId, principal.getName());
    }

    @PostMapping("/ledger/{detachmentId}")
    public Mono<ResponseEntity<LedgerEntry>> addLedgerEntry(
            @PathVariable UUID detachmentId,
            @RequestBody LedgerEntry entry,
            Principal principal) {
        return mercenaryCommandService.addLedgerEntry(detachmentId, entry, principal.getName())
                .map(saved -> new ResponseEntity<>(saved, HttpStatus.CREATED))
                .onErrorResume(e -> {
                    if (e.getMessage() != null && e.getMessage().contains("Access Denied")) {
                        return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
                    }
                    return Mono.error(e);
                });
    }
}
