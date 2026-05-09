package com.hotspotscamp.api;

import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hotspotscamp.entity.LedgerEntry;
import com.hotspotscamp.service.MercenaryCommandService;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/ledger")
@RequiredArgsConstructor
public class LedgerController {

    private final MercenaryCommandService commandService;

    @PostMapping("/{detachmentId}")
    public Mono<LedgerEntry> createEntry(
            @PathVariable UUID detachmentId,
            @RequestBody LedgerEntry entry,
            @AuthenticationPrincipal OAuth2User principal) {

        // Assuming the 'sub' or a custom attribute is the UUID of the user
        UUID userId = UUID.fromString(principal.getAttribute("sub").toString());
        return commandService.addLedgerEntry(detachmentId, entry, userId);
    }
}
