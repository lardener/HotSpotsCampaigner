package com.hotspotscamp.service;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
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

    private Map<Integer, Map<Integer, String>> systemTable;
    private int systemGroupDiceCount;
    private int systemGroupDiceSides;
    private int systemEntryDiceCount;
    private int systemEntryDiceSides;

    private Map<String, Object> missionTableData;

    private Map<Integer, Map<String, String>> contractStepsTable;
    private int stepsDiceCount;
    private int stepsDiceSides;

    private int transDiceCount;
    private int transDiceSides;
    private List<Map<String, Object>> transRollToStep;
    private Map<String, Integer> transEmpMods;
    private Map<String, Integer> transMissionMods;

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

        Map<String, Object> sysData = (Map<String, Object>) data.get("systemTable");
        systemGroupDiceCount = (Integer) sysData.get("groupDiceCount");
        systemGroupDiceSides = (Integer) sysData.get("groupDiceSides");
        systemEntryDiceCount = (Integer) sysData.get("entryDiceCount");
        systemEntryDiceSides = (Integer) sysData.get("entryDiceSides");
        List<Map<String, Object>> groups = (List<Map<String, Object>>) sysData.get("groups");

        systemTable = new HashMap<>();
        for (Map<String, Object> group : groups) {
            Integer groupRoll = (Integer) group.get("roll");
            List<Map<String, Object>> entriesList = (List<Map<String, Object>>) group.get("entries");
            Map<Integer, String> entryMap = entriesList.stream()
                    .collect(Collectors.toMap(
                            e -> (Integer) e.get("roll"),
                            e -> (String) e.get("name")
                    ));
            systemTable.put(groupRoll, entryMap);
        }

        missionTableData = (Map<String, Object>) data.get("missionTable");

        Map<String, Object> stepsData = (Map<String, Object>) data.get("contractStepsTable");
        stepsDiceCount = (Integer) stepsData.get("diceCount");
        stepsDiceSides = (Integer) stepsData.get("diceSides");
        List<Map<String, Object>> stepEntries = (List<Map<String, Object>>) stepsData.get("entries");
        contractStepsTable = new HashMap<>();
        for (Map<String, Object> entry : stepEntries) {
            Integer step = (Integer) entry.get("step");
            Map<String, String> values = new HashMap<>();
            values.put("length", (String) entry.get("length"));
            values.put("payRate", (String) entry.get("payRate"));
            values.put("support", (String) entry.get("support"));
            values.put("transport", (String) entry.get("transport"));
            values.put("salvage", (String) entry.get("salvage"));
            values.put("command", (String) entry.get("command"));
            contractStepsTable.put(step, values);
        }

        Map<String, Object> transData = (Map<String, Object>) data.get("transportationTable");
        transDiceCount = (Integer) transData.get("diceCount");
        transDiceSides = (Integer) transData.get("diceSides");

        transRollToStep = (List<Map<String, Object>>) transData.get("rollToStep");

        transEmpMods = (Map<String, Integer>) transData.get("employerModifiers");
        transMissionMods = (Map<String, Integer>) transData.get("missionModifiers");
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

        String empMission;
        String oppMission;

        if (mission == null || mission.isEmpty()) {
            int diceCount = (Integer) missionTableData.get("diceCount");
            int diceSides = (Integer) missionTableData.get("diceSides");
            int roll = rollDice(diceCount, diceSides, rand);
            List<Map<String, Object>> entries = (List<Map<String, Object>>) missionTableData.get("entries");

            empMission = "Unknown Mission";
            oppMission = "Unknown Opponent Mission";

            for (Map<String, Object> entry : entries) {
                int min = (Integer) entry.get("minRoll");
                int max = (Integer) entry.get("maxRoll");
                if (roll >= min && roll <= max) {
                    empMission = resolveFromSubTable((Map<String, Object>) entry.get("primary"), rand);
                    oppMission = resolveFromSubTable((Map<String, Object>) entry.get("opponent"), rand);
                    break;
                }
            }
        } else {
            empMission = mission;
            oppMission = (opponent == null || opponent.isEmpty()) ? getOpposingMissionType(empMission) : opponent;
        }

        if (opponent != null && !opponent.isEmpty()) {
            oppMission = opponent;
        }

        String finalSystemName = (systemName != null && !systemName.isEmpty()) ? systemName : rollSystemName(rand);

        Campaign campaign = Campaign.builder()
                .name("DOBLESS OP: " + empMission.toUpperCase() + " [" + finalEmp + "]")
                .systemName(finalSystemName)
                .status("PREVIEW")
                .build();

        // Calculate duration and track count once for the campaign
        String stepLengthStr = resolveStepValue(rollDice(stepsDiceCount, stepsDiceSides, rand), "length");
        int rolledLength = Integer.parseInt(stepLengthStr.split(" ")[0]);
        int finalLength = lengthInMonths != null ? lengthInMonths : rolledLength;
        int finalTracksCount = trackCount != null ? trackCount : (finalLength / 2) + rand.nextInt(2);
        String finalRights = commandRights != null ? commandRights : resolveStepValue(rollDice(stepsDiceCount, stepsDiceSides, rand), "command");

        Contract empContract = generateContract(finalEmp, empMission, employerCategory,
                warchestMultiplier, salvageTerms, supportTerms, transportTerms,
                finalRights, paymentSp, finalLength, finalTracksCount, rand);

        // Opponent remains randomized to maintain conflict balance
        // but shares the same duration and track count as the theater
        Contract oppContract = generateContract(finalOpp, oppMission, "Minor Power",
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

    private Contract generateContract(String faction, String type, String category,
            Double multiplier, String salvage, String support, String transport,
            String rights, Integer payment, int length, int tracks, Random rand) {

        String stepPay = resolveStepValue(rollDice(stepsDiceCount, stepsDiceSides, rand), "payRate");
        String stepSalvage = resolveStepValue(rollDice(stepsDiceCount, stepsDiceSides, rand), "salvage");
        String stepSupport = resolveStepValue(rollDice(stepsDiceCount, stepsDiceSides, rand), "support");
        String stepRights = resolveStepValue(rollDice(stepsDiceCount, stepsDiceSides, rand), "command");

        String empType = category != null ? category : rollEmployerType(rand);

        // Hinterlands Transportation Logic: 
        // 1. Roll 2D6 to get initial Step from table.
        int transRoll = rollDice(transDiceCount, transDiceSides, rand);
        int initialStep = 6; // Default to Step 6 (Roll 7)
        for (Map<String, Object> range : transRollToStep) {
            int min = (Integer) range.get("minRoll");
            int max = (Integer) range.get("maxRoll");
            if (transRoll >= min && transRoll <= max) {
                initialStep = (Integer) range.get("step");
                break;
            }
        }

        // 2. Apply modifiers to the Step.
        int empMod = transEmpMods.entrySet().stream()
                .filter(e -> empType.contains(e.getKey()))
                .map(Map.Entry::getValue)
                .findFirst().orElse(-2); // Default to "Other"

        int missionMod = transMissionMods.entrySet().stream()
                .filter(e -> type.contains(e.getKey()))
                .map(Map.Entry::getValue)
                .findFirst().orElse(0); // Default to Expedition/Standard

        // 3. Clamp final Step [1-13] and resolve value.
        int finalTransStep = Math.max(1, Math.min(13, initialStep + empMod + missionMod));
        String stepTransport = resolveStepValue(finalTransStep, "transport");

        return Contract.builder()
                .missionType(type)
                .employerCategory(faction + ": " + empType)
                .warchestMultiplier(multiplier != null ? multiplier : Double.parseDouble(stepPay))
                .salvageTerms(salvage != null ? salvage : stepSalvage)
                .supportTerms(support != null ? support : stepSupport)
                .transportTerms(transport != null ? transport : stepTransport)
                .commandRights(rights != null ? rights : stepRights)
                .paymentSp(payment != null ? payment : 300 + rand.nextInt(500))
                .lengthInMonths(length)
                .trackCount(tracks)
                .build();
    }

    private String rollEmployerType(Random rand) {
        int roll = rollDice(employerDiceCount, employerDiceSides, rand);
        return employerTable.getOrDefault(roll, "Other");
    }

    private String rollSystemName(Random rand) {
        int groupRoll = rollDice(systemGroupDiceCount, systemGroupDiceSides, rand);
        int entryRoll = rollDice(systemEntryDiceCount, systemEntryDiceSides, rand);
        return systemTable.getOrDefault(groupRoll, Map.of())
                .getOrDefault(entryRoll, "Unknown System");
    }

    private String resolveStepValue(int step, String column) {
        Map<String, String> entry = contractStepsTable.get(step);
        if (entry == null) {
            return "-";
        }
        String value = entry.get(column);
        if (value == null || !"-".equals(value)) {
            return value;
        }

        int currentStep = step;
        while ("-".equals(value)) {
            if (currentStep < 7) {
                currentStep++;
            } else if (currentStep > 7) {
                currentStep--;
            } else {
                break;
            }
            value = contractStepsTable.get(currentStep).get(column);
        }
        return value;
    }

    private String resolveFromSubTable(Map<String, Object> subTable, Random rand) {
        int diceCount = (Integer) subTable.get("diceCount");
        int diceSides = (Integer) subTable.get("diceSides");
        int roll = rollDice(diceCount, diceSides, rand);
        List<Map<String, Object>> entries = (List<Map<String, Object>>) subTable.get("entries");
        for (Map<String, Object> entry : entries) {
            int min = (Integer) entry.get("minRoll");
            int max = (Integer) entry.get("maxRoll");
            if (roll >= min && roll <= max) {
                return (String) entry.get("value");
            }
        }
        return "Unknown";
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

        // The faction names were determined during proposal generation and prepended to the employerCategory
        final String finalEmp = proposal.contracts().get(0).getEmployerCategory().split(": ")[0];
        final String finalOpp = proposal.contracts().get(1).getEmployerCategory().split(": ")[0];

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
