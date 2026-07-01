package com.hotspotscamp.api;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Controller;

import com.hotspotscamp.dto.CampaignCreateInput;
import com.hotspotscamp.dto.CampaignMetadata;
import com.hotspotscamp.dto.CampaignProposal;
import com.hotspotscamp.dto.GeneratedTrack;
import com.hotspotscamp.dto.TrackUpdateInput;
import com.hotspotscamp.entity.Campaign;
import com.hotspotscamp.entity.CampaignFaction;
import com.hotspotscamp.entity.CampaignInvite;
import com.hotspotscamp.entity.CampaignTrack;
import com.hotspotscamp.entity.Contract;
import com.hotspotscamp.entity.Detachment;
import com.hotspotscamp.service.CampaignService;
import com.hotspotscamp.service.MercenaryCommandService;
import com.hotspotscamp.service.UserService;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Controller
@RequiredArgsConstructor
public class CampaignGraphQLController {

    private static final Logger log = LoggerFactory.getLogger(CampaignGraphQLController.class);

    private final CampaignService campaignService;
    private final MercenaryCommandService commandService;
    private final UserService userService;

    @QueryMapping
    public Flux<Campaign> activeCampaigns(@Argument Integer page, @Argument Integer size, Principal principal) {
        log.trace("[TRACE] Entering activeCampaigns");
        if (isAnonymous(principal)) {
            log.trace("[TRACE] Exiting activeCampaigns (anonymous)");
            return Flux.empty();
        }
        int pageSize = (size != null) ? size : 5;
        int offset = (page != null) ? page * pageSize : 0;
        return campaignService.findAllByStatus("ACTIVE", pageSize, offset)
                .doOnTerminate(() -> log.trace("[TRACE] Exiting activeCampaigns"));
    }

    @QueryMapping
    public Flux<Campaign> managedCampaigns(@Argument String status, Principal principal) {
        log.trace("[TRACE] Entering managedCampaigns: status={}", status);
        log.info("[GQL] managedCampaigns query received. Principal: {}", principal != null ? principal.getName() : "NULL");
        String identity = principal != null ? principal.getName() : null;
        if (identity == null || "anonymousUser".equals(identity)) {
            log.trace("[TRACE] Exiting managedCampaigns (anonymous)");
            return Flux.empty();
        }
        return userService.resolveOrCreateUser(identity)
                .flatMapMany(user -> {
                    String internalId = user.getId().toString();
                    if (status != null && !status.isEmpty() && !status.equals("ALL")) {
                        return campaignService.findAllByManagerIdAndStatus(internalId, status);
                    }
                    return campaignService.findAllByManagerId(internalId);
                })
                .doOnTerminate(() -> log.trace("[TRACE] Exiting managedCampaigns"));
    }

    @QueryMapping
    public Mono<Campaign> getCampaign(@Argument UUID id) {
        log.trace("[TRACE] Entering getCampaign: id={}", id);
        if (id == null) {
            log.trace("[TRACE] Exiting getCampaign (null id)");
            return Mono.empty();
        }
        return campaignService.findById(id)
                .doOnTerminate(() -> log.trace("[TRACE] Exiting getCampaign"));
    }

    @QueryMapping
    public Flux<Campaign> participatingCampaigns(@Argument UUID commandId) {
        log.trace("[TRACE] Entering participatingCampaigns: commandId={}", commandId);
        if (commandId == null) {
            log.trace("[TRACE] Exiting participatingCampaigns (null id)");
            return Flux.empty();
        }
        return campaignService.getParticipatingCampaigns(commandId)
                .flatMap(summary -> {
                    UUID id = summary.id();
                    if (id == null) {
                        return Mono.empty();
                    }
                    return campaignService.findById(id);
                })
                .doOnTerminate(() -> log.trace("[TRACE] Exiting participatingCampaigns"));
    }

    @SchemaMapping(typeName = "Campaign", field = "primaryEmployer")
    public Mono<String> getPrimaryEmployer(Campaign campaign) {
        log.trace("[TRACE] Entering getPrimaryEmployer for campaign: {}", campaign.getId());
        UUID id = campaign.getId();
        if (id == null) {
            log.trace("[TRACE] Exiting getPrimaryEmployer (null id)");
            return Mono.empty();
        }
        return campaignService.getPrimaryEmployer(id)
                .doOnTerminate(() -> log.trace("[TRACE] Exiting getPrimaryEmployer"));
    }

    @SchemaMapping(typeName = "Campaign", field = "secondaryEmployer")
    public Mono<String> getSecondaryEmployer(Campaign campaign) {
        log.trace("[TRACE] Entering getSecondaryEmployer for campaign: {}", campaign.getId());
        UUID id = campaign.getId();
        if (id == null) {
            log.trace("[TRACE] Exiting getSecondaryEmployer (null id)");
            return Mono.empty();
        }
        return campaignService.getSecondaryEmployer(id)
                .doOnTerminate(() -> log.trace("[TRACE] Exiting getSecondaryEmployer"));
    }

    @SchemaMapping(typeName = "Campaign", field = "participatingDetachments")
    public Flux<Detachment> getParticipatingDetachments(Campaign campaign) {
        log.trace("[TRACE] Entering getParticipatingDetachments for campaign: {}", campaign.getId());
        UUID id = campaign.getId();
        if (id == null) {
            log.trace("[TRACE] Exiting getParticipatingDetachments (null id)");
            return Flux.empty();
        }
        return campaignService.getParticipatingDetachments(id)
                .doOnTerminate(() -> log.trace("[TRACE] Exiting getParticipatingDetachments"));
    }

    @SchemaMapping(typeName = "Campaign", field = "tracks")
    public Flux<CampaignTrack> getTracks(Campaign campaign) {
        log.trace("[TRACE] Entering getTracks for campaign: {}", campaign.getId());
        return campaignService.getTracks(campaign.getId())
                .doOnTerminate(() -> log.trace("[TRACE] Exiting getTracks"));
    }

    @SchemaMapping(typeName = "Campaign", field = "factions")
    public Flux<CampaignFaction> getFactions(Campaign campaign) {
        log.trace("[TRACE] Entering getFactions for campaign: {}", campaign.getId());
        return campaignService.getFactions(campaign.getId())
                .doOnTerminate(() -> log.trace("[TRACE] Exiting getFactions"));
    }

    @SchemaMapping(typeName = "Campaign", field = "contracts")
    public Flux<Contract> getContracts(Campaign campaign) {
        log.trace("[TRACE] Entering getContracts for campaign: {}", campaign.getId());
        UUID id = campaign.getId();
        if (id == null) {
            log.trace("[TRACE] Exiting getContracts (null id)");
            return Flux.empty();
        }
        return campaignService.getContracts(id)
                .doOnTerminate(() -> log.trace("[TRACE] Exiting getContracts"));
    }

    @SchemaMapping(typeName = "Campaign", field = "campaignInvites")
    public Flux<CampaignInvite> getCampaignInvites(Campaign campaign) {
        log.trace("[TRACE] Entering getCampaignInvites for campaign: {}", campaign.getId());
        UUID id = campaign.getId();
        if (id == null) {
            log.trace("[TRACE] Exiting getCampaignInvites (null id)");
            return Flux.empty();
        }
        return campaignService.getCampaignInvites(id)
                .doOnTerminate(() -> log.trace("[TRACE] Exiting getCampaignInvites"));
    }

    @SchemaMapping(typeName = "Campaign", field = "isManager")
    public Mono<Boolean> isManager(Campaign campaign, Principal principal) {
        if (isAnonymous(principal)) {
            return Mono.just(false);
        }
        return userService.resolveOrCreateUser(principal.getName())
                .map(user -> campaign.getManagerId().equals(user.getId().toString()))
                .defaultIfEmpty(false);
    }

    @SchemaMapping(typeName = "Campaign", field = "isParticipant")
    public Mono<Boolean> isParticipant(Campaign campaign, Principal principal) {
        if (isAnonymous(principal)) {
            return Mono.just(false);
        }
        return userService.resolveOrCreateUser(principal.getName())
                .flatMap(user -> commandService.isParticipantInCampaign(campaign.getId(), user.getId().toString(), principal.getName()))
                .defaultIfEmpty(false);
    }

    @QueryMapping
    public CampaignMetadata campaignMetadata(Principal principal) {
        log.trace("[TRACE] Entering campaignMetadata");
        if (isAnonymous(principal)) {
            log.trace("[TRACE] Exiting campaignMetadata (anonymous)");
            return null;
        }
        return campaignService.getCampaignMetadata();
    }

    @QueryMapping
    public Mono<List<GeneratedTrack>> generateTracks(
            @Argument String mission,
            @Argument String commandRights,
            @Argument String oppCommandRights,
            @Argument Integer count,
            @Argument List<GeneratedTrack> existing) {
        log.trace("[TRACE] Entering generateTracks: mission={}, count={}", mission, count);
        String finalOppRights = (oppCommandRights != null) ? oppCommandRights : "Independent";
        return Mono.just(campaignService.generateTracks(mission, commandRights, finalOppRights, count, existing))
                .doOnTerminate(() -> log.trace("[TRACE] Exiting generateTracks"));
    }

    @QueryMapping
    public Mono<CampaignProposal> previewCampaign(@Argument CampaignCreateInput input, Principal principal) {
        log.trace("[TRACE] Entering previewCampaign");
        if (isAnonymous(principal)) {
            log.trace("[TRACE] Exiting previewCampaign (anonymous)");
            return Mono.empty();
        }
        return Mono.just(campaignService.generateProposal(input))
                .doOnTerminate(() -> log.trace("[TRACE] Exiting previewCampaign"));
    }

    @QueryMapping
    public Flux<Campaign> publicActiveCampaigns(@Argument Integer page, @Argument Integer size) {
        log.trace("[TRACE] Entering publicActiveCampaigns");
        int pageSize = (size != null) ? size : 5;
        int offset = (page != null) ? page * pageSize : 0;
        return campaignService.findAllByStatus("ACTIVE", pageSize, offset)
                .doOnTerminate(() -> log.trace("[TRACE] Exiting publicActiveCampaigns"));
    }

    @QueryMapping
    @SuppressWarnings("Convert2Lambda")
    public CampaignMetadata publicCampaignMetadata() {
        log.trace("[TRACE] Entering publicCampaignMetadata");
        return campaignMetadata(new java.security.Principal() {
            @Override
            public String getName() {
                return "SYSTEM";
            }
        });
    }

    @QueryMapping
    @SuppressWarnings("Convert2Lambda")
    public Mono<CampaignProposal> publicPreviewCampaign(@Argument CampaignCreateInput input) {
        log.trace("[TRACE] Entering publicPreviewCampaign");
        return previewCampaign(input, new java.security.Principal() {
            @Override
            public String getName() {
                return "SYSTEM";
            }
        });
    }

    private boolean isAnonymous(Principal principal) {
        return principal == null || "anonymousUser".equals(principal.getName());
    }

    @MutationMapping
    public Mono<Campaign> createCampaign(@Argument CampaignCreateInput input, Principal principal) {
        log.trace("[TRACE] Entering createCampaign: name={}", input.name());
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentication required to create campaign"));
        }

        return userService.resolveOrCreateUser(principal.getName())
                .<Campaign>flatMap(user -> {
                    String internalId = user.getId().toString();
                    return campaignService.generateDoblessCampaign(internalId, input);
                })
                .doOnTerminate(() -> log.trace("[TRACE] Exiting createCampaign"));
    }

    @MutationMapping
    public Mono<CampaignInvite> createInvite(@Argument UUID campaignId, @Argument String recipientName, Principal principal) {
        log.trace("[TRACE] Entering createInvite: campaignId={}, recipient={}", campaignId, recipientName);
        if (campaignId == null) {
            return Mono.error(new IllegalArgumentException("Campaign ID is required"));
        }
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentication required to create invite"));
        }
        return campaignService.createInvite(campaignId, recipientName, principal.getName())
                .doOnTerminate(() -> log.trace("[TRACE] Exiting createInvite"));
    }

    @MutationMapping
    public Mono<Boolean> deleteInvite(@Argument UUID id, Principal principal) {
        log.trace("[TRACE] Entering deleteInvite: id={}", id);
        if (id == null) {
            return Mono.error(new IllegalArgumentException("Invite ID is required"));
        }
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentication required"));
        }
        return campaignService.deleteInvite(id, principal.getName())
                .doOnTerminate(() -> log.trace("[TRACE] Exiting deleteInvite"));
    }

    @MutationMapping
    public Mono<Boolean> joinCampaign(@Argument String token, @Argument @NonNull UUID detachmentId) {
        log.trace("[TRACE] Entering joinCampaign: detachmentId={}", detachmentId);
        return campaignService.joinCampaign(token, detachmentId)
                .doOnTerminate(() -> log.trace("[TRACE] Exiting joinCampaign"));
    }

    @MutationMapping
    public Mono<CampaignTrack> updateTrack(@Argument @NonNull UUID id, @Argument TrackUpdateInput input, Principal principal) {
        log.trace("[TRACE] Entering updateTrack: id={}", id);
        if (principal == null) {
            return Mono.error(new RuntimeException("Unauthorized"));
        }
        return commandService.updateTrack(id, input, principal.getName())
                .doOnTerminate(() -> log.trace("[TRACE] Exiting updateTrack"));
    }

    @MutationMapping
    public Mono<CampaignTrack> rerollTrack(@Argument @NonNull UUID id, Principal principal) {
        log.trace("[TRACE] Entering rerollTrack: id={}", id);
        if (principal == null) {
            return Mono.error(new RuntimeException("Unauthorized"));
        }
        return campaignService.rerollTrack(id, principal.getName())
                .doOnTerminate(() -> log.trace("[TRACE] Exiting rerollTrack"));
    }

    @MutationMapping
    public Flux<CampaignTrack> reorderTracks(@Argument UUID campaignId, @Argument List<UUID> trackIds, Principal principal) {
        log.trace("[TRACE] Entering reorderTracks: campaignId={}", campaignId);
        if (principal == null) {
            return Flux.error(new RuntimeException("Unauthorized"));
        }
        return commandService.reorderTracks(campaignId, trackIds, principal.getName())
                .doOnTerminate(() -> log.trace("[TRACE] Exiting reorderTracks"));
    }
}
