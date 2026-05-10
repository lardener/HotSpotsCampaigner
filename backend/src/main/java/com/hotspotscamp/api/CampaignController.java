package com.hotspotscamp.api;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hotspotscamp.entity.Campaign;
import com.hotspotscamp.service.CampaignService;
import com.hotspotscamp.service.CampaignService.CampaignProposal;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/campaigns")
@RequiredArgsConstructor
public class CampaignController {

    private final CampaignService campaignService;

    @GetMapping("/metadata/employer-types")
    public Mono<List<String>> getEmployerTypes() {
        return Mono.just(campaignService.getEmployerTypes());
    }

    @GetMapping("/metadata/factions")
    public Mono<List<String>> getFactions() {
        return Mono.just(campaignService.getAvailableFactions());
    }

    @GetMapping("/metadata/missions")
    public Mono<List<String>> getMissions() {
        return Mono.just(campaignService.getAvailableMissions());
    }

    @GetMapping("/metadata/track-types")
    public Mono<List<String>> getTrackTypes() {
        return Mono.just(campaignService.getAvailableTrackTypes());
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
            @RequestParam(required = false) Integer lengthInMonths,
            @RequestParam(required = false) Integer trackCount) {
        return Mono.just(campaignService.generateProposal(employer, opponent, mission,
                employerCategory, systemName, payRate, salvageTerms,
                supportTerms, transportTerms, commandRights, lengthInMonths,
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
            @RequestParam(required = false) Integer lengthInMonths,
            @RequestParam(required = false) Integer trackCount,
            @AuthenticationPrincipal OAuth2User principal) {

        UUID managerId = UUID.fromString(principal.getAttribute("sub").toString());
        return campaignService.generateDoblessCampaign(managerId, employer, opponent, mission,
                employerCategory, systemName, payRate, salvageTerms,
                supportTerms, transportTerms, commandRights, lengthInMonths,
                trackCount);
    }
}
