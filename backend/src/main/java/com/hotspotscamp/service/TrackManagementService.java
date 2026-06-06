package com.hotspotscamp.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Random;
import java.util.UUID;
import java.util.function.IntSupplier;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hotspotscamp.entity.Campaign;
import com.hotspotscamp.entity.CampaignTrack;
import com.hotspotscamp.entity.Contract;
import com.hotspotscamp.repository.CampaignRepository;
import com.hotspotscamp.repository.CampaignTrackRepository;
import com.hotspotscamp.repository.ContractRepository;
import com.hotspotscamp.dto.*;
import com.hotspotscamp.service.RuleConfigurationService.*;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class TrackManagementService {

    private final CampaignTrackRepository campaignTrackRepository;
    private final ContractRepository contractRepository;
    private final CampaignRepository campaignRepository;
    private final RuleConfigurationService configService;
    private final CampaignGenerationService generationService;

    @Transactional
    public Mono<Campaign> reconcileTracks(Campaign camp, int newCount) {
        camp.setNew(false);
        return campaignTrackRepository.findAllByCampaignId(camp.getId()).collectList()
                .<Campaign>flatMap(existing -> {
                    int targetCount = Math.max(1, newCount);
                    int actualCount = existing.size();
                    camp.setTrackCount(targetCount);

                    if (targetCount > actualCount) {
                        IntSupplier monthSupplier = getMonthSupplier(configService.getTrackIntensityTable(), camp.getLengthInMonths(), targetCount);
                        for (int i = 0; i < actualCount; i++) {
                            monthSupplier.getAsInt();
                        }

                        return contractRepository.findAllByCampaignId(camp.getId()).collectList()
                                .<Campaign>flatMap(contracts -> {
                                    Contract primary = contracts.stream().filter(c -> Boolean.TRUE.equals(c.getPrimaryContract())).findFirst().orElse(null);
                                    Contract opposition = contracts.stream().filter(c -> Boolean.FALSE.equals(c.getPrimaryContract())).findFirst().orElse(null);
                                    if (primary == null) {
                                        return Mono.<Campaign>empty();
                                    }

                                    String primaryRights = camp.getCommandRights() != null ? camp.getCommandRights() : (primary.getCommandRights() != null ? primary.getCommandRights() : "Independent");
                                    String oppRights = (opposition != null && opposition.getCommandRights() != null) ? opposition.getCommandRights() : "Independent";
                                    List<GeneratedTrack> existingGen = existing.stream().map(t -> new GeneratedTrack(t.getTrackName(), t.getComplications(), t.getOppositionComplications())).toList();
                                    List<GeneratedTrack> allTracks = generationService.generateTracks(primary.getMissionType(), primaryRights, oppRights, targetCount, existingGen);
                                    List<GeneratedTrack> newOnes = allTracks.subList(actualCount, allTracks.size());

                                    return Flux.fromIterable(newOnes).index().concatMap(tuple
                                            -> campaignTrackRepository.save(Objects.requireNonNull(CampaignTrack.builder()
                                                    .id(UUID.randomUUID()).campaignId(camp.getId()).trackName(tuple.getT2().name())
                                                    .complications(tuple.getT2().complication()).oppositionComplications(tuple.getT2().oppositionComplication())
                                                    .attackerFactionId(primaryIsAttacker(primary.getMissionType(), tuple.getT2().name()) ? primary.getEmployerFactionId() : (opposition != null ? opposition.getEmployerFactionId() : null))
                                                    .sequenceOrder(actualCount + tuple.getT1().intValue()).monthIndex(monthSupplier.getAsInt()).isNew(true).build())))
                                            .then(campaignRepository.save(camp));
                                });
                    }
                    if (targetCount < actualCount) {
                        List<CampaignTrack> toDelete = existing.stream()
                                .sorted((a, b) -> b.getSequenceOrder().compareTo(a.getSequenceOrder()))
                                .limit(actualCount - targetCount).toList();
                        return Flux.fromIterable(toDelete).flatMap(campaignTrackRepository::delete).then(campaignRepository.save(camp));
                    }
                    return campaignRepository.save(camp);
                });
    }

    @Transactional
    public Mono<CampaignTrack> rerollTrack(@NonNull UUID trackId, String managerId, UserService userService) {
        return campaignTrackRepository.findById(trackId)
                .switchIfEmpty(Mono.<CampaignTrack>error(new RuntimeException("Track not found")))
                .<CampaignTrack>flatMap(track -> userService.resolveOrCreateUser(managerId).<CampaignTrack>flatMap(user -> campaignRepository.findById(Objects.requireNonNull(track.getCampaignId()))
                .<CampaignTrack>flatMap(campaign -> {
                    if (!campaign.getManagerId().equals(user.getId().toString())) {
                        return Mono.<CampaignTrack>error(new RuntimeException("Access Denied"));
                    }
                    return contractRepository.findAllByCampaignId(campaign.getId()).collectList()
                            .<CampaignTrack>flatMap(contracts -> {
                                Contract primary = contracts.stream().filter(c -> Boolean.TRUE.equals(c.getPrimaryContract())).findFirst().orElse(null);
                                Contract opposition = contracts.stream().filter(c -> Boolean.FALSE.equals(c.getPrimaryContract())).findFirst().orElse(null);
                                if (primary == null) {
                                    return Mono.<CampaignTrack>empty();
                                }

                                Random rand = new Random();
                                track.setTrackName(generationService.rollTrackType(primary.getMissionType(), rand));
                                track.setComplications(generationService.rollComplication(Objects.requireNonNullElse(primary.getCommandRights(), "Independent"), rand));
                                String oppRights = (opposition != null && opposition.getCommandRights() != null) ? opposition.getCommandRights() : "Independent";
                                track.setOppositionComplications(generationService.rollComplication(oppRights, rand));
                                track.setNew(false);
                                return campaignTrackRepository.save(track);
                            });
                })));
    }

    public IntSupplier getMonthSupplier(List<IntensityTableEntry> table, int length, int trackCount) {
        Random rand = new Random();
        IntensityTableEntry lengthEntry = table.stream().filter(e -> e.campaignLength() == length).findFirst().orElse(null);

        if (lengthEntry == null) {
            return new IntSupplier() {
                private int current = 1;

                @Override
                public int getAsInt() {
                    return Math.min(current++, length);
                }
            };
        }

        IntensityTracksConfig config = lengthEntry.tracks();
        int roll = generationService.rollDice(config.diceCount(), config.diceSides(), rand);
        IntensityTrackCountEntry countEntry = config.tracks().stream().filter(e -> e.count() == trackCount).findFirst().orElse(null);

        if (countEntry == null) {
            return new IntSupplier() {
                private int current = 1;

                @Override
                public int getAsInt() {
                    return Math.min(current++, length);
                }
            };
        }

        String intensityStr = countEntry.months().stream()
                .filter(m -> roll >= m.minRoll() && roll <= m.maxRoll())
                .map(IntensityMonthEntry::intensity).findFirst().orElse("");

        List<Integer> distribution = new ArrayList<>();
        for (int i = 0; i < intensityStr.length(); i++) {
            int monthNum = i + 1;
            int tracksThisMonth = Character.getNumericValue(intensityStr.charAt(i));
            for (int t = 0; t < tracksThisMonth; t++) {
                distribution.add(monthNum);
            }
        }

        return new IntSupplier() {
            private int index = 0;

            @Override
            public int getAsInt() {
                if (index < distribution.size()) {
                    return Objects.requireNonNullElse(distribution.get(index++), length);
                } else {
                    return length;
                }
            }
        };
    }

    public boolean primaryIsAttacker(String mission, String trackName) {
        RuleConfigurationService.AttackerDeterminationConfig config = configService.getAttackerDeterminationConfig();
        if (config == null || mission == null) {
            return false;
        }

        // Extract base mission type (e.g. "Raid" from "Raid: Planetary")
        String baseType = mission.split(":")[0].trim();

        return config.rules().stream()
                .filter(r -> r.missionType().equalsIgnoreCase(baseType))
                .findFirst()
                .map(rule -> {
                    // 1. Check for track-based assignment (e.g. Covert tracks)
                    if (trackName != null) {
                        if (rule.attackerTracks() != null && rule.attackerTracks().stream().anyMatch(trackName::contains)) {
                            return true;
                        }
                        if (rule.defenderTracks() != null && rule.defenderTracks().stream().anyMatch(trackName::contains)) {
                            return false;
                        }
                    }

                    // 2. Roll-based determination
                    if (rule.primaryAttackerRolls() != null && !rule.primaryAttackerRolls().isEmpty()) {
                        int roll = generationService.rollDice(config.diceCount(), config.diceSides(), new Random());
                        return rule.primaryAttackerRolls().contains(roll);
                    }
                    return false;
                })
                .orElse(false);
    }
}
