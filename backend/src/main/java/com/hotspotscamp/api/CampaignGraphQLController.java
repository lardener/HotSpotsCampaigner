package com.hotspotscamp.api;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Controller;

import com.hotspotscamp.entity.Campaign;
import com.hotspotscamp.entity.CampaignFaction;
import com.hotspotscamp.entity.CampaignInvite;
import com.hotspotscamp.entity.CampaignTrack;
import com.hotspotscamp.entity.Contract;
import com.hotspotscamp.entity.Detachment;
import com.hotspotscamp.repository.CampaignFactionRepository;
import com.hotspotscamp.repository.CampaignRepository;
import com.hotspotscamp.repository.CampaignTrackRepository;
import com.hotspotscamp.repository.ContractRepository;
import com.hotspotscamp.repository.DetachmentRepository;
import com.hotspotscamp.util.RulesConstants;

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
    private final CampaignFactionRepository campaignFactionRepository;
    private final CampaignTrackRepository campaignTrackRepository;
    private final DetachmentRepository detachmentRepository;
    private final CampaignService campaignService;
    private final UserService userService;

    @QueryMapping
    public Flux<Campaign> activeCampaigns(@Argument Integer page, @Argument Integer size, Principal principal) {
        if (isAnonymous(principal)) {
            return Flux.empty();
        }
        int pageSize = (size != null) ? size : 5;
        int offset = (page != null) ? page * pageSize : 0;
        return campaignRepository.findAllByStatus("ACTIVE", pageSize, offset);
    }

    @QueryMapping
    public Flux<Campaign> managedCampaigns(@Argument String status, Principal principal) {
        log.info("[GQL] managedCampaigns query received. Principal: {}", principal != null ? principal.getName() : "NULL");
        String identity = principal != null ? principal.getName() : null;
        if (identity == null || "anonymousUser".equals(identity)) {
            return Flux.empty();
        }
        return userService.resolveOrCreateUser(identity)
                .flatMapMany(user -> {
                    String internalId = user.getId().toString();
                    if (status != null && !status.isEmpty() && !status.equals("ALL")) {
                        return campaignRepository.findAllByManagerIdAndStatus(internalId, status);
                    }
                    return campaignRepository.findAllByManagerId(internalId);
                });
    }

    @QueryMapping
    public Mono<Campaign> getCampaign(@Argument UUID id) {
        if (id == null) {
            return Mono.empty();
        }
        return campaignRepository.findById(id);
    }

    @QueryMapping
    public Flux<Campaign> participatingCampaigns(@Argument UUID commandId) {
        if (commandId == null) {
            return Flux.empty();
        }
        return campaignService.getParticipatingCampaigns(commandId)
                .flatMap(summary -> {
                    UUID id = summary.id();
                    if (id == null) {
                        return Mono.empty();
                    }
                    return campaignRepository.findById(id);
                });
    }

    @SchemaMapping(typeName = "Campaign", field = "primaryEmployer")
    public Mono<String> getPrimaryEmployer(Campaign campaign) {
        UUID id = campaign.getId();
        if (id == null) {
            return Mono.empty();
        }
        return contractRepository.findAllByCampaignId(id)
                .filter(c -> Boolean.TRUE.equals(c.getPrimaryContract()))
                .map(Contract::getEmployerCategory)
                .next()
                .defaultIfEmpty("Unknown");
    }

    @SchemaMapping(typeName = "Campaign", field = "secondaryEmployer")
    public Mono<String> getSecondaryEmployer(Campaign campaign) {
        UUID id = campaign.getId();
        if (id == null) {
            return Mono.empty();
        }
        return contractRepository.findAllByCampaignId(id)
                .filter(c -> Boolean.FALSE.equals(c.getPrimaryContract()))
                .map(Contract::getEmployerCategory)
                .next()
                .defaultIfEmpty("Unknown");
    }

    @SchemaMapping(typeName = "Campaign", field = "participatingDetachments")
    public Flux<Detachment> getParticipatingDetachments(Campaign campaign) {
        UUID id = campaign.getId();
        if (id == null) {
            return Flux.empty();
        }
        return detachmentRepository.findAllByCampaignId(id);
    }

    @SchemaMapping(typeName = "Campaign", field = "tracks")
    public Flux<CampaignTrack> getTracks(Campaign campaign) {
        return campaignTrackRepository.findAllByCampaignId(campaign.getId());
    }

    @SchemaMapping(typeName = "Campaign", field = "factions")
    public Flux<CampaignFaction> getFactions(Campaign campaign) {
        return campaignFactionRepository.findAllByCampaignId(campaign.getId());
    }

    @SchemaMapping(typeName = "Campaign", field = "contracts")
    public Flux<Contract> getContracts(Campaign campaign) {
        UUID id = campaign.getId();
        if (id == null) {
            return Flux.empty();
        }
        return contractRepository.findAllByCampaignId(id);
    }

    @SchemaMapping(typeName = "Campaign", field = "repairRules")
    public CampaignService.RepairRules getRepairRules(Campaign campaign) {
        return new CampaignService.RepairRules(
                Objects.requireNonNullElse(campaign.getArmorMultiplier(), RulesConstants.REPAIR_MULT_ARMOR),
                Objects.requireNonNullElse(campaign.getInternalMultiplier(), RulesConstants.REPAIR_MULT_INTERNAL),
                Objects.requireNonNullElse(campaign.getCrippledMultiplier(), RulesConstants.REPAIR_MULT_CRIPPLED),
                Objects.requireNonNullElse(campaign.getDestroyedMultiplier(), RulesConstants.REPAIR_MULT_DESTROYED),
                Objects.requireNonNullElse(campaign.getNonMechModifier(), RulesConstants.REPAIR_MULT_NON_MECH_MODIFIER),
                Objects.requireNonNullElse(campaign.getMixedTechModifier(), RulesConstants.REPAIR_MULT_MIXED_TECH),
                Objects.requireNonNullElse(campaign.getClanTechModifier(), RulesConstants.REPAIR_MULT_CLAN_TECH)
        );
    }

    @SchemaMapping(typeName = "Campaign", field = "campaignInvites")
    public Flux<CampaignInvite> getCampaignInvites(Campaign campaign) {
        UUID id = campaign.getId();
        if (id == null) {
            return Flux.empty();
        }
        return campaignService.getCampaignInvites(id);
    }

    @SchemaMapping(typeName = "CampaignProposal", field = "repairRules")
    public CampaignService.RepairRules getProposalRepairRules(CampaignProposal proposal) {
        return proposal.campaign().getRepairRules();
    }

    @SchemaMapping(typeName = "CampaignProposal", field = "tracks")
    public List<String> getProposalTracks(CampaignProposal proposal) {
        return proposal.tracks().stream()
                .map(t -> t.name() + (t.complication().equals("None") ? "" : " [" + t.complication() + "]"))
                .collect(Collectors.toList());
    }

    @QueryMapping
    public CampaignMetadata campaignMetadata(Principal principal) {
        if (isAnonymous(principal)) {
            return null;
        }
        CampaignService.CampaignMetadata meta = campaignService.getCampaignMetadata();
        return new CampaignMetadata(
                new MissionMetadata(meta.missions().primary(), meta.missions().opponent()),
                meta.trackTypes(),
                meta.factions(),
                meta.employerTypes(),
                meta.resolvedSteps().stream()
                        .map(e -> new ResolvedStepEntry(e.step(), mapToValues(e.values())))
                        .collect(Collectors.toList()),
                meta.repairRules(),
                meta.unitTypes(),
                meta.techBases(),
                meta.unitStatuses()
        );
    }

    private ContractStepValues mapToValues(Map<String, String> map) {
        return new ContractStepValues(
                map.get("payRate"),
                map.get("salvageRights"),
                map.get("supportRights"),
                map.get("transportation"),
                map.get("commandRights")
        );
    }

    public record CampaignMetadata(
            MissionMetadata missions,
            List<String> trackTypes,
            List<String> factions,
            List<String> employerTypes,
            List<ResolvedStepEntry> resolvedSteps,
            CampaignService.RepairRules repairRules,
            List<String> unitTypes,
            List<String> techBases,
            List<String> unitStatuses
            ) {

    }

    public record MissionMetadata(List<String> primary, List<String> opponent) {

    }

    public record ResolvedStepEntry(Integer step, ContractStepValues values) {

    }

    public record ContractStepValues(
            String payRate,
            String salvageRights,
            String supportRights,
            String transportation,
            String commandRights
            ) {

    }

    @QueryMapping
    public Mono<java.util.List<String>> generateTracks(@Argument String mission, @Argument String commandRights, @Argument Integer count) {
        return Mono.just(campaignService.generateTracks(mission, commandRights, count).stream()
                .map(t -> t.name() + (t.complication().equals("None") ? "" : " [" + t.complication() + "]"))
                .collect(Collectors.toList())
        );
    }

    @QueryMapping
    public Mono<CampaignProposal> previewCampaign(@Argument CampaignService.CampaignCreateInput input, Principal principal) {
        if (isAnonymous(principal)) {
            return Mono.empty();
        }
        return Mono.just(campaignService.generateProposal(input));
    }

    @QueryMapping
    public Flux<Campaign> publicActiveCampaigns(@Argument Integer page, @Argument Integer size) {
        int pageSize = (size != null) ? size : 5;
        int offset = (page != null) ? page * pageSize : 0;
        return campaignRepository.findAllByStatus("ACTIVE", pageSize, offset);
    }

    @QueryMapping
    @SuppressWarnings("Convert2Lambda")
    public CampaignMetadata publicCampaignMetadata() {
        return campaignMetadata(new java.security.Principal() {
            @Override
            public String getName() {
                return "SYSTEM";
            }
        });
    }

    @QueryMapping
    @SuppressWarnings("Convert2Lambda")
    public Mono<CampaignProposal> publicPreviewCampaign(@Argument CampaignService.CampaignCreateInput input) {
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
    public Mono<Campaign> createCampaign(@Argument CampaignService.CampaignCreateInput input, Principal principal) {
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentication required to create campaign"));
        }

        return userService.resolveOrCreateUser(principal.getName())
                .<Campaign>flatMap(user -> {
                    String internalId = user.getId().toString();
                    return campaignService.generateDoblessCampaign(internalId, input);
                });
    }

    @MutationMapping
    public Mono<CampaignInvite> createInvite(@Argument UUID campaignId, @Argument String recipientName, Principal principal) {
        if (campaignId == null) {
            return Mono.error(new IllegalArgumentException("Campaign ID is required"));
        }
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentication required to create invite"));
        }
        return campaignService.createInvite(campaignId, recipientName, principal.getName());
    }

    @MutationMapping
    public Mono<Boolean> deleteInvite(@Argument UUID id, Principal principal) {
        if (id == null) {
            return Mono.error(new IllegalArgumentException("Invite ID is required"));
        }
        if (principal == null) {
            return Mono.error(new RuntimeException("Authentication required"));
        }
        return campaignService.deleteInvite(id, principal.getName());
    }

    @MutationMapping
    public Mono<Boolean> joinCampaign(@Argument String token, @Argument @NonNull UUID detachmentId) {
        return campaignService.joinCampaign(token, detachmentId);
    }

    @MutationMapping
    public Mono<CampaignTrack> updateTrack(@Argument @NonNull UUID id, @Argument CampaignService.TrackUpdateInput input, Principal principal) {
        if (principal == null) {
            return Mono.error(new RuntimeException("Unauthorized"));
        }
        return campaignService.updateTrack(id, input);
    }

    @MutationMapping
    public Mono<CampaignTrack> rerollTrack(@Argument @NonNull UUID id, Principal principal) {
        if (principal == null) {
            return Mono.error(new RuntimeException("Unauthorized"));
        }
        return campaignService.rerollTrack(id, principal.getName());
    }

    @MutationMapping
    public Flux<CampaignTrack> reorderTracks(@Argument UUID campaignId, @Argument List<UUID> trackIds, Principal principal) {
        if (principal == null) {
            return Flux.error(new RuntimeException("Unauthorized"));
        }
        return campaignService.reorderTracks(campaignId, trackIds);
    }
}
