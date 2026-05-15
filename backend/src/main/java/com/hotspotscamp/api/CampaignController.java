package com.hotspotscamp.api;

import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hotspotscamp.entity.Campaign;
import com.hotspotscamp.service.CampaignService;
import com.hotspotscamp.service.CampaignService.ActiveCampaignPage;
import com.hotspotscamp.service.CampaignService.ActiveCampaignSummary;
import com.hotspotscamp.service.CampaignService.CampaignProposal;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/campaigns")
@RequiredArgsConstructor
public class CampaignController {

    private final CampaignService campaignService;

    @GetMapping("/active")
    public Mono<ActiveCampaignPage> getActiveCampaigns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        return campaignService.getActiveCampaigns(page, size);
    }

    @GetMapping("/metadata/employer-types")
    public Mono<List<String>> getEmployerTypes() {
        return Mono.just(campaignService.getEmployerTypes());
    }

    @GetMapping("/metadata/factions")
    public Mono<List<String>> getFactions() {
        return Mono.just(campaignService.getAvailableFactions());
    }

    @GetMapping("/metadata/missions")
    public Mono<Map<String, List<String>>> getMissions() {
        return Mono.just(campaignService.getAvailableMissions());
    }

    @GetMapping("/metadata/track-types")
    public Mono<List<String>> getTrackTypes() {
        return Mono.just(campaignService.getAvailableTrackTypes());
    }

    @GetMapping("/metadata/resolved-steps")
    public Mono<Map<Integer, Map<String, String>>> getResolvedSteps() {
        return Mono.just(campaignService.getResolvedStepsTable());
    }

    @GetMapping("/metadata/pay-rates")
    public Mono<List<String>> getPayRates() {
        return Mono.just(campaignService.getAvailablePayRates());
    }

    @GetMapping("/metadata/salvage")
    public Mono<List<String>> getSalvage() {
        return Mono.just(campaignService.getAvailableSalvage());
    }

    @GetMapping("/metadata/support")
    public Mono<List<String>> getSupport() {
        return Mono.just(campaignService.getAvailableSupport());
    }

    @GetMapping("/metadata/transport")
    public Mono<List<String>> getTransport() {
        return Mono.just(campaignService.getAvailableTransport());
    }

    @GetMapping("/metadata/command")
    public Mono<List<String>> getCommand() {
        return Mono.just(campaignService.getAvailableCommand());
    }

    @GetMapping("/metadata/generate-tracks")
    public Mono<List<String>> generateTracks(
            @RequestParam String mission,
            @RequestParam String commandRights,
            @RequestParam Integer count) {
        return Mono.just(campaignService.generateTracks(mission, commandRights, count));
    }

    @GetMapping("/dobless/preview")
    public Mono<CampaignProposal> previewCampaign(
            @RequestParam(required = false) String employer,
            @RequestParam(required = false) String opponent,
            @RequestParam(required = false) String mission,
            @RequestParam(required = false) String employerCategory,
            @RequestParam(required = false) String systemName,
            @RequestParam(required = false) Double payRate,
            @RequestParam(required = false) String salvageTerms,
            @RequestParam(required = false) String supportTerms,
            @RequestParam(required = false) String transportTerms,
            @RequestParam(required = false) String commandRights,
            @RequestParam(required = false) Integer payStep,
            @RequestParam(required = false) Integer salvageStep,
            @RequestParam(required = false) Integer supportStep,
            @RequestParam(required = false) Integer transportStep,
            @RequestParam(required = false) Integer commandStep,
            @RequestParam(required = false) Integer trackCount) {
        return Mono.just(campaignService.generateProposal(employer, opponent, mission,
                employerCategory, systemName, payRate, salvageTerms,
                supportTerms, transportTerms, commandRights,
                payStep, salvageStep, supportStep, transportStep, commandStep,
                trackCount));
    }

    @PostMapping("/dobless")
    public Mono<Campaign> generateCampaign(
            @RequestParam(required = false) String employer,
            @RequestParam(required = false) String opponent,
            @RequestParam(required = false) String mission,
            @RequestParam(required = false) String employerCategory,
            @RequestParam(required = false) String systemName,
            @RequestParam(required = false) Double payRate,
            @RequestParam(required = false) String salvageTerms,
            @RequestParam(required = false) String supportTerms,
            @RequestParam(required = false) String transportTerms,
            @RequestParam(required = false) String commandRights,
            @RequestParam(required = false) Integer payStep,
            @RequestParam(required = false) Integer salvageStep,
            @RequestParam(required = false) Integer supportStep,
            @RequestParam(required = false) Integer transportStep,
            @RequestParam(required = false) Integer commandStep,
            @RequestParam(required = false) Integer trackCount,
            @AuthenticationPrincipal OAuth2User principal) {

        if (principal == null) {
            return Mono.error(new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Authentication required"));
        }

        // Google OAuth 'sub' is a numeric string, not a UUID. 
        // We generate a deterministic UUID based on the subject string.
        UUID managerId = UUID.nameUUIDFromBytes(principal.getAttribute("sub").toString().getBytes(StandardCharsets.UTF_8));
        return campaignService.generateDoblessCampaign(managerId, employer, opponent, mission,
                employerCategory, systemName, payRate, salvageTerms,
                supportTerms, transportTerms, commandRights,
                payStep, salvageStep, supportStep, transportStep, commandStep,
                trackCount);
    }

    @GetMapping("/managed")
    public reactor.core.publisher.Flux<ActiveCampaignSummary> getManagedCampaigns(Principal principal) {
        if (principal == null) {
            return reactor.core.publisher.Flux.empty();
        }
        // Deterministic UUID based on the Google 'sub' string (Principal name)
        UUID managerId = UUID.nameUUIDFromBytes(principal.getName().getBytes(StandardCharsets.UTF_8));
        return campaignService.getManagedCampaigns(managerId);
    }

    @GetMapping("/participating/{commandId}")
    public reactor.core.publisher.Flux<ActiveCampaignSummary> getParticipatingCampaigns(@PathVariable UUID commandId) {
        return campaignService.getParticipatingCampaigns(commandId);
    }
}
