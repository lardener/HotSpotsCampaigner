package com.hotspotscamp.service;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotspotscamp.entity.Campaign;
import com.hotspotscamp.entity.CampaignFaction;
import com.hotspotscamp.entity.Contract;
import com.hotspotscamp.repository.CampaignFactionRepository;
import com.hotspotscamp.repository.CampaignRepository;
import com.hotspotscamp.repository.ContractRepository;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final CampaignFactionRepository campaignFactionRepository;
    private final ContractRepository contractRepository;

    private Map<Integer, String> employerTable;
    private int employerDiceCount;
    private int employerDiceSides;

    private static final String[] FACTIONS = {"Alyina Consent", "Vesper Marches", "Tamar Pact", "Clan Hell's Horses", "Jade Falcon", "Belter Alliance"};
    private static final String[] MISSIONS = {"Expedition", "Raid", "Cadre Duty", "Extraction", "Planetary Assault", "Garrison", "Insurrection"};
    private static final String[] TRACK_TYPES = {"Probe", "Recon", "Flank", "Assault", "Defend", "Breakthrough", "Trial of Possession"};

    @PostConstruct
    public void init() throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        InputStream is = new ClassPathResource("rules/contract-rules.json").getInputStream();
        Map<String, Object> data = mapper.readValue(is, Map.class);

        Map<String, Object> empData = (Map<String, Object>) data.get("employerTable");
        employerDiceCount = (Integer) empData.get("diceCount");
        employerDiceSides = (Integer) empData.get("diceSides");
        List<Map<String, Object>> entries = (List<Map<String, Object>>) empData.get("entries");

        employerTable = entries.stream()
                .collect(Collectors.toMap(
                        entry -> (Integer) entry.get("roll"),
                        entry -> (String) entry.get("type")
                ));
    }

    public List<String> getEmployerTypes() {
        return employerTable.values().stream().distinct().sorted().collect(Collectors.toList());
    }

    /**
     * Tracks are part of the campaign metadata in the proposal, not nested in
     * contracts.
     */
    public record CampaignProposal(Campaign campaign, List<Contract> contracts, List<String> tracks) {

    }

    /**
     * Generates the data for a campaign without saving it.
     */
    public CampaignProposal generateProposal(String employer, String opponent, String mission,
            String employerCategory, String systemName, Double warchestMultiplier,
            String salvageTerms, String supportTerms, String transportTerms,
            String commandRights, Integer lengthInMonths, Integer paymentSp,
            Integer trackCount) {
        Random rand = new Random();

        String finalEmp = (employer == null || employer.isEmpty()) ? getRandomFaction(null) : employer;
        String finalOpp = (opponent == null || opponent.isEmpty()) ? getRandomFaction(finalEmp) : opponent;
        String empMission = (mission == null || mission.isEmpty()) ? getRandomMission() : mission;
        String oppMission = getOpposingMissionType(empMission);

        Campaign campaign = Campaign.builder()
                .name("DOBLESS OP: " + empMission.toUpperCase() + " [" + finalEmp + "]")
                .status("PREVIEW")
                .build();

        // Calculate duration and track count once for the campaign
        int finalLength = lengthInMonths != null ? lengthInMonths : rand.nextInt(6) + 3;
        int finalTracksCount = trackCount != null ? trackCount : (finalLength / 2) + rand.nextInt(2);
        String finalRights = commandRights != null ? commandRights : List.of("Independent", "Liaison", "House").get(rand.nextInt(3));

        Contract empContract = generateContract(empMission, employerCategory, systemName,
                warchestMultiplier, salvageTerms, supportTerms, transportTerms,
                finalRights, paymentSp, finalLength, finalTracksCount, rand);

        // Opponent remains randomized to maintain conflict balance
        // but shares the same duration and track count as the theater
        Contract oppContract = generateContract(oppMission, "Minor Power", null,
                null, null, null, null, null, null, finalLength, finalTracksCount, rand);

        // Generate tracks at the campaign level
        List<String> tracksList = new java.util.ArrayList<>();
        for (int i = 0; i < finalTracksCount; i++) {
            String track = TRACK_TYPES[rand.nextInt(TRACK_TYPES.length)];
            // Complications based on the primary employer's command rights
            if ("House".equals(finalRights)) {
                track += " (Forced Complication)";
            } else if ("Liaison".equals(finalRights)) {
                track += " (Potential Complication)";
            }
            tracksList.add(track);
        }

        return new CampaignProposal(campaign, List.of(empContract, oppContract), tracksList);
    }

    private Contract generateContract(String type, String category, String system,
            Double multiplier, String salvage, String support, String transport,
            String rights, Integer payment, int length, int tracks, Random rand) {

        return Contract.builder()
                .missionType(type)
                .employerCategory(category != null ? category : rollEmployerType(rand))
                .systemName(system != null ? system : "System " + (rand.nextInt(900) + 100))
                .warchestMultiplier(multiplier != null ? multiplier : 1.0 + (rand.nextInt(5) * 0.1))
                .salvageTerms(salvage != null ? salvage : List.of("None", "Shared", "Exchange", "Full").get(rand.nextInt(4)))
                .supportTerms(support != null ? support : (rand.nextBoolean() ? "Standard" : "Full"))
                .transportTerms(transport != null ? transport : (rand.nextBoolean() ? "Employer Provided" : "Mercenary Provided"))
                .commandRights(rights != null ? rights : List.of("Independent", "Liaison", "House").get(rand.nextInt(3)))
                .paymentSp(payment != null ? payment : 300 + rand.nextInt(500))
                .lengthInMonths(length)
                .trackCount(tracks)
                .build();
    }

    private String rollEmployerType(Random rand) {
        int roll = rollDice(employerDiceCount, employerDiceSides, rand);
        return employerTable.getOrDefault(roll, "Other");
    }

    private int rollDice(int count, int sides, Random rand) {
        int sum = 0;
        for (int i = 0; i < count; i++) {
            sum += (rand.nextInt(sides) + 1);
        }
        return sum;
    }

    private String getOpposingMissionType(String employerMission) {
        return switch (employerMission) {
            case "Raid" ->
                "Defense";
            case "Planetary Assault" ->
                "Defense";
            case "Expedition" ->
                "Recon";
            case "Extraction" ->
                "Interdiction";
            case "Insurrection" ->
                "Counter-Insurrection";
            default ->
                "Garrison";
        };
    }

    /**
     * Persists a generated campaign to the database.
     */
    @Transactional
    public Mono<Campaign> generateDoblessCampaign(UUID managerId, String employer, String opponent, String mission,
            String employerCategory, String systemName, Double warchestMultiplier,
            String salvageTerms, String supportTerms, String transportTerms,
            String commandRights, Integer lengthInMonths, Integer paymentSp,
            Integer trackCount) {
        CampaignProposal proposal = generateProposal(employer, opponent, mission, employerCategory, systemName,
                warchestMultiplier, salvageTerms, supportTerms, transportTerms, commandRights,
                lengthInMonths, paymentSp, trackCount);
        Campaign campaign = proposal.campaign();
        campaign.setManagerId(managerId);
        campaign.setStatus("ACTIVE");

        final String finalEmp = employer != null ? employer : "Unknown Employer";
        final String finalOpp = opponent != null ? opponent : "Unknown Opponent";

        return campaignRepository.save(campaign)
                .flatMap(savedCampaign -> {
                    CampaignFaction empFaction = CampaignFaction.builder()
                            .campaignId(savedCampaign.getId())
                            .factionName(finalEmp)
                            .offersContracts(true)
                            .build();

                    CampaignFaction oppFaction = CampaignFaction.builder()
                            .campaignId(savedCampaign.getId())
                            .factionName(finalOpp)
                            .offersContracts(true) // Per Hinterlands, both sides often hire mercs
                            .build();

                    return campaignFactionRepository.saveAll(List.of(empFaction, oppFaction))
                            .collectList()
                            .flatMap(factions -> {
                                return Flux.fromIterable(proposal.contracts())
                                        .zipWith(Flux.fromIterable(factions))
                                        .flatMap(tuple -> {
                                            Contract c = tuple.getT1();
                                            c.setCampaignId(savedCampaign.getId());
                                            c.setEmployerFactionId(tuple.getT2().getId());
                                            return contractRepository.save(c);
                                        })
                                        .then(Mono.just(savedCampaign));
                            });
                });
    }

    private String getRandomFaction(String exclude) {
        Random rand = new Random();
        String selected;
        do {
            selected = FACTIONS[rand.nextInt(FACTIONS.length)];
        } while (selected.equals(exclude));
        return selected;
    }

    private String getRandomMission() {
        return MISSIONS[new Random().nextInt(MISSIONS.length)];
    }
}
