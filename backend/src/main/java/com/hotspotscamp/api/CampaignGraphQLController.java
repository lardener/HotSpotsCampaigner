package com.hotspotscamp.api;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import com.hotspotscamp.entity.Campaign;
import com.hotspotscamp.entity.CampaignInvite;
import com.hotspotscamp.entity.Contract;
import com.hotspotscamp.entity.Detachment;
import com.hotspotscamp.repository.CampaignRepository;
import com.hotspotscamp.repository.ContractRepository;
import com.hotspotscamp.repository.DetachmentRepository;
import com.hotspotscamp.service.CampaignService;
import com.hotspotscamp.service.CampaignService.CampaignProposal;
import com.hotspotscamp.service.UserService;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Controller
@RequiredArgsConstructor
public class CampaignGraphQLController {

    private static final Logger log = LoggerFactory.getLogger(CampaignGraphQLController.class);

    private final CampaignRepository campaignRepository;
    private final ContractRepository contractRepository;
    private final DetachmentRepository detachmentRepository;
    private final CampaignService campaignService;
    private final UserService userService;

    @QueryMapping
    public Flux<Campaign> activeCampaigns(@Argument Integer page, @Argument Integer size) {
        int pageSize = (size != null) ? size : 5;
        int offset = (page != null) ? page * pageSize : 0;
        return campaignRepository.findAllByStatus("ACTIVE", pageSize, offset);
    }

    @QueryMapping
    public Flux<Campaign> managedCampaigns(@Argument String status, Principal principal) {
        log.info("[GQL] managedCampaigns query received. Principal: {}", principal != null ? principal.getName() : "NULL");
        if (principal == null) {
            return Flux.empty();
        }
        return userService.resolveOrCreateUser(principal.getName())
                .flatMapMany(user -> {
                    String internalId = user.getId().toString();
                    log.info("[GQL] Querying campaigns for manager UUID: {}", internalId);
                    if (status != null && !status.isEmpty() && !status.equals("ALL")) {
                        return campaignRepository.findAllByManagerIdAndStatus(internalId, status);
                    }
                    return campaignRepository.findAllByManagerId(internalId);
                });
    }

    @QueryMapping
    public Mono<Campaign> getCampaign(@Argument UUID id) {
        return campaignRepository.findById(id);
    }

    @QueryMapping
    public Flux<Campaign> participatingCampaigns(@Argument UUID commandId) {
        return campaignService.getParticipatingCampaigns(commandId)
                .flatMap(summary -> campaignRepository.findById(summary.id()));
    }

    @SchemaMapping(typeName = "Campaign", field = "primaryEmployer")
    public Mono<String> getPrimaryEmployer(Campaign campaign) {
        return contractRepository.findAllByCampaignId(campaign.getId())
                .filter(c -> Boolean.TRUE.equals(c.getPrimaryContract()))
                .map(Contract::getEmployerCategory)
                .next()
                .defaultIfEmpty("Unknown");
    }

    @SchemaMapping(typeName = "Campaign", field = "secondaryEmployer")
    public Mono<String> getSecondaryEmployer(Campaign campaign) {
        return contractRepository.findAllByCampaignId(campaign.getId())
                .filter(c -> Boolean.FALSE.equals(c.getPrimaryContract()))
                .map(Contract::getEmployerCategory)
                .next()
                .defaultIfEmpty("Unknown");
    }

    @SchemaMapping(typeName = "Campaign", field = "participatingDetachments")
    public Flux<Detachment> getParticipatingDetachments(Campaign campaign) {
        return detachmentRepository.findAllByCampaignId(campaign.getId());
    }

    @SchemaMapping(typeName = "Campaign", field = "contracts")
    public Flux<Contract> getContracts(Campaign campaign) {
        return contractRepository.findAllByCampaignId(campaign.getId());
    }

    @SchemaMapping(typeName = "Campaign", field = "campaignInvites")
    public Flux<CampaignInvite> getCampaignInvites(Campaign campaign) {
        return campaignService.getCampaignInvites(campaign.getId());
    }

    @QueryMapping
    public Map<String, Object> campaignMetadata() {
        return Map.of(
                "missions", campaignService.getAvailableMissions(),
                "trackTypes", campaignService.getAvailableTrackTypes(),
                "factions", campaignService.getAvailableFactions(),
                "employerTypes", campaignService.getEmployerTypes(),
                "resolvedSteps", campaignService.getResolvedStepsTable().entrySet().stream()
                        .map(e -> Map.of("step", e.getKey(), "values", e.getValue()))
                        .collect(Collectors.toList())
        );
    }

    @QueryMapping
    public Mono<java.util.List<String>> generateTracks(@Argument String mission, @Argument String commandRights, @Argument Integer count) {
        return Mono.just(campaignService.generateTracks(mission, commandRights, count));
    }

    @QueryMapping
    public Mono<CampaignProposal> previewCampaign(@Argument Map<String, Object> input) {
        // Map helper for service call
        return Mono.just(campaignService.generateProposal(
                (String) input.get("employer"), (String) input.get("opponent"), (String) input.get("mission"),
                (String) input.get("employerCategory"), (String) input.get("systemName"), (Double) input.get("payRate"),
                (String) input.get("salvageTerms"), (String) input.get("supportTerms"), (String) input.get("transportTerms"),
                (String) input.get("commandRights"), (Integer) input.get("payStep"), (Integer) input.get("salvageStep"),
                (Integer) input.get("supportStep"), (Integer) input.get("transportStep"), (Integer) input.get("commandStep"),
                (Integer) input.get("trackCount")
        ));
    }

    @MutationMapping
    public Mono<Campaign> createCampaign(@Argument Map<String, Object> input, Principal principal) {
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentication required to create campaign"));
        }

        return userService.resolveOrCreateUser(principal.getName())
                .flatMap(user -> {
                    String internalId = user.getId().toString();
                    return campaignService.generateDoblessCampaign(internalId,
                            (String) input.get("employer"), (String) input.get("opponent"), (String) input.get("mission"),
                            (String) input.get("employerCategory"), (String) input.get("systemName"), (Double) input.get("payRate"),
                            (String) input.get("salvageTerms"), (String) input.get("supportTerms"), (String) input.get("transportTerms"),
                            (String) input.get("commandRights"), (Integer) input.get("payStep"), (Integer) input.get("salvageStep"),
                            (Integer) input.get("supportStep"), (Integer) input.get("transportStep"), (Integer) input.get("commandStep"),
                            (Integer) input.get("trackCount"));
                });
    }

    @MutationMapping
    public Mono<CampaignInvite> createInvite(@Argument UUID campaignId, Principal principal) {
        return campaignService.createInvite(campaignId, principal.getName());
    }
}
