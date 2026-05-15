package com.hotspotscamp.api;

import java.security.Principal;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hotspotscamp.entity.MercenaryCommand;
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
            @AuthenticationPrincipal OAuth2User principal) {
        String userId = principal.getName(); // OAuth2 Subject IDs are strings, not necessarily UUIDs
        return mercenaryCommandService.createCommand(command, userId)
                .map(newCommand -> new ResponseEntity<>(newCommand, HttpStatus.CREATED));
    }
}
