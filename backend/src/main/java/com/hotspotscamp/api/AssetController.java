package com.hotspotscamp.api;

import java.security.Principal;
import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hotspotscamp.entity.CombatUnit;
import com.hotspotscamp.entity.Pilot;
import com.hotspotscamp.service.MercenaryCommandService;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/commands")
@RequiredArgsConstructor
public class AssetController {

    private final MercenaryCommandService mercenaryCommandService;

    public record AssignAssetRequest(String assetType, UUID assetId, UUID detachmentId) {

    }

    @GetMapping("/{commandId}/assets")
    public Mono<MercenaryCommandService.CommandAssetsResponse> getAssets(@PathVariable UUID commandId) {
        return mercenaryCommandService.getAssetsByCommandId(commandId);
    }

    @PostMapping("/{commandId}/units")
    public Mono<CombatUnit> addCombatUnit(@PathVariable UUID commandId, @RequestBody CombatUnit unit, Principal principal) { // NOSONAR
        String userId = principal.getName();
        return mercenaryCommandService.addCombatUnit(commandId, unit, userId);
    }

    @PostMapping("/{commandId}/pilots")
    public Mono<Pilot> hirePilot(@PathVariable UUID commandId, @RequestBody Pilot pilot, Principal principal) { // NOSONAR
        String userId = principal.getName();
        return mercenaryCommandService.hirePilot(commandId, pilot, userId);
    }

    @PostMapping("/assets/assign")
    public Mono<Void> assignAsset(@RequestBody AssignAssetRequest request, Principal principal) { // NOSONAR
        String userId = principal.getName();
        return mercenaryCommandService.assignAssetToDetachment(
                request.assetType(), request.assetId(), request.detachmentId(), userId);
    }
}
