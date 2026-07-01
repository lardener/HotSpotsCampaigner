package com.hotspotscamp.service;

import java.util.Objects;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hotspotscamp.entity.Detachment;
import com.hotspotscamp.repository.CampaignRepository;
import com.hotspotscamp.repository.CampaignTrackRepository;
import com.hotspotscamp.repository.DetachmentRepository;
import com.hotspotscamp.repository.MercenaryCommandRepository;

import lombok.NonNull;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class DetachmentService {

    private static final Logger log = LoggerFactory.getLogger(DetachmentService.class);

    private final DetachmentRepository detachmentRepository;
    private final MercenaryCommandRepository commandRepository;
    private final CampaignRepository campaignRepository;
    private final CampaignTrackRepository campaignTrackRepository;
    private final UserService userService;

    public DetachmentService(
            DetachmentRepository detachmentRepository,
            MercenaryCommandRepository commandRepository,
            CampaignRepository campaignRepository,
            CampaignTrackRepository campaignTrackRepository,
            UserService userService) {
        this.detachmentRepository = detachmentRepository;
        this.commandRepository = commandRepository;
        this.campaignRepository = campaignRepository;
        this.campaignTrackRepository = campaignTrackRepository;
        this.userService = userService;
    }

    /**
     * Creates a new detachment for a command assigned to a specific campaign
     * theater.
     */
    @Transactional
    public Mono<Detachment> createDetachment(@NonNull UUID commandId, UUID campaignId, String name, String userId) {
        log.trace("[TRACE] Starting createDetachment: command={}, campaign={}", commandId, campaignId);
        return commandRepository.findById(commandId)
                .flatMap(cmd -> userService.resolveOrCreateUser(userId).<Detachment>flatMap(user -> {
                    if (!cmd.getOwnerId().equals(user.getId().toString())) {
                        return Mono.<Detachment>error(new RuntimeException("Access Denied"));
                    }
                    Detachment det = new Detachment();
                    det.setId(UUID.randomUUID());
                    det.setMercenaryCommandId(commandId);
                    det.setCampaignId(campaignId);
                    det.setName(name);
                    return detachmentRepository.save(det)
                            .onErrorResume(DuplicateKeyException.class, e -> detachmentRepository.findById(Objects.requireNonNull(det.getId())));
                }))
                .doOnTerminate(() -> log.trace("[TRACE] Finished createDetachment"));
    }

    /**
     * Removes a detachment.
     */
    @Transactional
    public Mono<Void> deleteDetachment(@NonNull UUID detachmentId, String userId) {
        log.trace("[TRACE] Starting deleteDetachment: id={}, user={}", detachmentId, userId);
        return detachmentRepository.findById(detachmentId)
                .switchIfEmpty(Mono.<Detachment>error(new RuntimeException("Detachment not found: " + detachmentId)))
                .<Void>flatMap(det -> userService.resolveOrCreateUser(userId).<Void>flatMap(user -> {
                    // Logic for checking ownership would go here, potentially needing command repository
                    return detachmentRepository.delete(det);
                }));
    }

    /**
     * Gets the rating of a detachment.
     */
    public Mono<Integer> getDetachmentRating(@NonNull UUID detachmentId, UUID campaignId) {
        // Placeholder implementation for now, as I don't have the full logic from MercenaryCommandService
        return detachmentRepository.findById(detachmentId)
                .map(det -> 0);
    }

    /**
     * Fetches all detachments belonging to a specific mercenary command.
     */
    public Flux<Detachment> getDetachmentsByCommandId(@NonNull UUID commandId) {
        return detachmentRepository.findAll().filter(det -> commandId.equals(det.getMercenaryCommandId()));
    }

    /**
     * Assigns a detachment to a campaign.
     */
    public Mono<Void> assignDetachmentToCampaign(@NonNull UUID detachmentId, UUID campaignId, String userId) {
        return detachmentRepository.findById(detachmentId)
                .flatMap(det -> {
                    det.setCampaignId(campaignId);
                    return detachmentRepository.save(det);
                })
                .then();
    }
}