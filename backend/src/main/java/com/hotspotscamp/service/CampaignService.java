package com.hotspotscamp.service;

import java.util.List;
import java.util.Objects;
import java.util.Random;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hotspotscamp.dto.*;
import com.hotspotscamp.entity.Campaign;
import com.hotspotscamp.entity.CampaignFaction;
import com.hotspotscamp.entity.CampaignInvite;
import com.hotspotscamp.entity.CampaignTrack;
import com.hotspotscamp.entity.Contract;
import com.hotspotscamp.entity.Detachment;
import com.hotspotscamp.repository.CampaignFactionRepository;
import com.hotspotscamp.repository.CampaignInviteRepository;
import com.hotspotscamp.repository.CampaignRepository;
import com.hotspotscamp.repository.CampaignTrackRepository;
import com.hotspotscamp.repository.ContractRepository;
import com.hotspotscamp.repository.DetachmentRepository;
import com.hotspotscamp.util.RulesConstants;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class CampaignService {

    private static final Logger log = LoggerFactory.getLogger(CampaignService.class);

    private final CampaignRepository campaignRepository;
    private final CampaignFactionRepository campaignFactionRepository;
    private final CampaignTrackRepository campaignTrackRepository;
    private final ContractRepository contractRepository;
    private final CampaignInviteRepository campaignInviteRepository;
    private final DetachmentRepository detachmentRepository;
    private final UserService userService;
    private final InviteService inviteService;
    private final RuleConfigurationService configService;
    private final CampaignGenerationService generationService;
    private final TrackManagementService trackManagementService;

    // --- Metadata and Summaries ---
    public CampaignMetadata getCampaignMetadata() {
        RepairRules rules = new RepairRules(
                RulesConstants.REPAIR_MULT_ARMOR, RulesConstants.REPAIR_MULT_INTERNAL,
                RulesConstants.REPAIR_MULT_CRIPPLED, RulesConstants.REPAIR_MULT_DESTROYED,
                RulesConstants.REPAIR_MULT_NON_MECH_MODIFIER, RulesConstants.REPAIR_MULT_MIXED_TECH,
                RulesConstants.REPAIR_MULT_CLAN_TECH
        );

        return new CampaignMetadata(
                new RuleConfigurationService.MissionMetadata(configService.getAvailablePrimaryMissions(), configService.getAvailableOpponentMissions()),
                configService.getAvailableTrackTypes(), configService.getAvailableFactions(),
                configService.getEmployerTableConfig().entries().stream().map(RuleConfigurationService.EmployerEntry::type).distinct().sorted().toList(),
                configService.getResolvedStepsTable().entrySet().stream().map(e -> new RuleConfigurationService.ResolvedStepEntry(e.getKey(), e.getValue())).toList(),
                rules, RulesConstants.UNIT_TYPES, RulesConstants.TECH_BASES, RulesConstants.UNIT_STATUS_OPTIONS
        );
    }

    public Flux<ActiveCampaignSummary> getParticipatingCampaigns(UUID commandId) {
        log.trace("[TRACE] Starting getParticipatingCampaigns: commandId={}", commandId);
        return detachmentRepository.findAllByMercenaryCommandId(commandId)
                .map(Detachment::getCampaignId)
                .distinct()
                .flatMap(campaignRepository::findById)
                .flatMap(c -> contractRepository.findAllByCampaignId(c.getId()).collectList()
                .map(contracts -> {
                    String primary = contracts.stream().filter(con -> Boolean.TRUE.equals(con.getPrimaryContract())).map(Contract::getEmployerCategory).findFirst().orElse("Unknown");
                    String secondary = contracts.stream().filter(con -> Boolean.FALSE.equals(con.getPrimaryContract())).map(Contract::getEmployerCategory).findFirst().orElse("Unknown");
                    return new ActiveCampaignSummary(c.getId(), c.getName(), c.getSystemName(), c.getTrackCount(), primary, secondary);
                }))
                .doOnTerminate(() -> log.trace("[TRACE] Finished getParticipatingCampaigns"));
    }

    // --- Generation Logic ---
    public CampaignProposal generateProposal(CampaignCreateInput input) {
        return generationService.generateProposal(input);
    }

    public List<GeneratedTrack> generateTracks(String missionType, String commandRights, String oppCommandRights, int count, List<GeneratedTrack> existing) {
        return generationService.generateTracks(missionType, commandRights, oppCommandRights, count, existing);
    }

    // --- Operational Track Management ---
    @Transactional
    public Mono<Campaign> reconcileTracks(Campaign camp, int newCount) {
        return trackManagementService.reconcileTracks(camp, newCount);
    }

    @Transactional
    public Mono<Campaign> generateDoblessCampaign(String managerId, CampaignCreateInput input) {
        return userService.resolveOrCreateUser(managerId).flatMap(user -> {
            if (!"ROLE_AUTHENTICATED".equals(user.getRole())) {
                return Mono.error(new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Only Managers can create campaigns"));
            }

            CampaignProposal proposal = generationService.generateProposal(input);
            Campaign campaign = proposal.campaign();
            campaign.setId(campaign.getId() == null ? UUID.randomUUID() : campaign.getId());
            campaign.setManagerId(user.getId().toString());
            campaign.setNew(true);
            campaign.setStatus(input.status() != null && !input.status().isBlank() ? input.status() : "ACTIVE");

            return campaignRepository.save(campaign).onErrorResume(DuplicateKeyException.class, e -> campaignRepository.findById(Objects.requireNonNull(campaign.getId())))
                    .flatMap(saved -> {
                        CampaignFaction f1 = CampaignFaction.builder().id(UUID.randomUUID()).campaignId(saved.getId()).factionName(proposal.employer()).offersContracts(true).isNew(true).build();
                        CampaignFaction f2 = CampaignFaction.builder().id(UUID.randomUUID()).campaignId(saved.getId()).factionName(proposal.opponent()).offersContracts(true).isNew(true).build();

                        return campaignFactionRepository.saveAll(Objects.requireNonNull(List.of(f1, f2))).collectList()
                                .flatMap(factions -> {
                                    Flux<Contract> conFlux = Flux.fromIterable(proposal.contracts()).zipWith(Flux.fromIterable(factions)).concatMap(t -> {
                                        Contract c = t.getT1();
                                        c.setId(UUID.randomUUID());
                                        c.setCampaignId(saved.getId());
                                        c.setNew(true);
                                        c.setEmployerFactionId(t.getT2().getId());
                                        return contractRepository.save(c);
                                    });

                                    java.util.function.IntSupplier monthSupplier = trackManagementService.getMonthSupplier(configService.getTrackIntensityTable(), saved.getLengthInMonths(), saved.getTrackCount());
                                    return conFlux.thenMany(Flux.fromIterable(proposal.tracks()).index())
                                            .concatMap(t -> campaignTrackRepository.save(Objects.requireNonNull(CampaignTrack.builder()
                                            .id(UUID.randomUUID()).campaignId(saved.getId()).trackName(t.getT2().name()).complications(t.getT2().complication()).oppositionComplications(t.getT2().oppositionComplication())
                                            .attackerFactionId(primaryIsAttacker(input.mission(), t.getT2().name()) ? f1.getId() : f2.getId())
                                            .sequenceOrder(t.getT1().intValue()).monthIndex(monthSupplier.getAsInt()).isNew(true).build())))
                                            .then(Mono.just(saved));
                                });
                    });
        })
                .doOnTerminate(() -> log.trace("[TRACE] Finished generateDoblessCampaign"));
    }

    private boolean primaryIsAttacker(String mission, String trackName) {
        boolean playerIsAttacker = false;
        int roll = new Random().nextInt(6) + 1;

        if ("Raid".equalsIgnoreCase(mission)) {
            playerIsAttacker = roll >= 2;
        } else if ("Defense".equalsIgnoreCase(mission) || "Retainer".equalsIgnoreCase(mission)) {
            playerIsAttacker = roll == 1;
        } else if ("Covert".equalsIgnoreCase(mission)) {
            String name = trackName != null ? trackName : "";
            if (name.contains("Recon") || name.contains("Strike")) {
                playerIsAttacker = true;
            } else if (name.contains("Pursuit") || name.contains("Flank") || name.contains("Retreat")) {
                playerIsAttacker = false;
            }
        } else if ("Assault".equalsIgnoreCase(mission)) {
            playerIsAttacker = roll >= 3;
        }
        return playerIsAttacker;
    }

    public Flux<CampaignInvite> getCampaignInvites(@NonNull UUID campaignId) {
        log.trace("[TRACE] Starting getCampaignInvites: campaignId={}", campaignId);
        return campaignInviteRepository.findAllByCampaignId(campaignId).doOnTerminate(() -> log.trace("[TRACE] Finished getCampaignInvites"));
    }

    @Transactional
    public Mono<CampaignInvite> createInvite(@NonNull UUID campaignId, String recipientName, String userId) {
        return userService.resolveOrCreateUser(userId).flatMap(user -> campaignRepository.findById(campaignId)
                .flatMap(camp -> camp.getManagerId().equals(user.getId().toString())
                ? inviteService.generateInvite(campaignId, recipientName)
                : Mono.error(new RuntimeException("Access Denied"))));
    }

    @Transactional
    public Mono<Boolean> joinCampaign(String token, @NonNull UUID detachmentId) {
        return inviteService.validateAndConsumeInvite(token)
                .flatMap(invite -> detachmentRepository.findById(detachmentId)
                .flatMap(det -> {
                    det.setNew(false);
                    det.setCampaignId(invite.getCampaignId());
                    return detachmentRepository.save(det).thenReturn(true);
                }));
    }

    @Transactional
    public Mono<Boolean> deleteInvite(@NonNull UUID inviteId, String userId) {
        return userService.resolveOrCreateUser(userId).flatMap(user -> campaignInviteRepository.findById(inviteId)
                .flatMap(invite -> campaignRepository.findById(invite.getCampaignId())
                .flatMap(camp -> camp.getManagerId().equals(user.getId().toString())
                ? campaignInviteRepository.delete(invite).thenReturn(true)
                : Mono.error(new RuntimeException("Access Denied")))));
    }

    @Transactional
    public Mono<CampaignTrack> rerollTrack(@NonNull UUID trackId, String managerId) {
        return trackManagementService.rerollTrack(trackId, managerId, userService);
    }
}
