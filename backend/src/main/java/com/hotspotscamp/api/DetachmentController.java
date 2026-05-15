package com.hotspotscamp.api;

import java.security.Principal;
import java.util.UUID;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hotspotscamp.service.MercenaryCommandService;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/detachments")
@RequiredArgsConstructor
public class DetachmentController {

    private final MercenaryCommandService mercenaryCommandService;

    @DeleteMapping("/{detachmentId}")
    public Mono<Void> deleteDetachment(@PathVariable UUID detachmentId, Principal principal) {
        String userId = principal.getName();
        return mercenaryCommandService.deleteDetachment(detachmentId, userId);
    }
}
