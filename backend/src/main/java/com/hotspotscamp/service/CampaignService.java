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
    private Map<String, Object> trackTableData;
    private Map<String, Object> roleTableData;
    private Map<String, Object> lengthOfContractTableData;
    private Map<String, Object> trackCountTableData;

    private Map<String, ContractTableConfig> contractTables = new HashMap<>();

    private record ContractTableConfig(int diceCount, int diceSides, List<Map<String, Object>> rollToStep,
            Map<String, Integer> empMods, Map<String, Integer> missionMods) {

    }

    private List<String> availableFactions;
    private List<String> availableMissions;
    private List<String> availableTrackTypes;
    private List<String> availablePayRates;
    private List<String> availableSalvage;
    private List<String> availableSupport;
    private List<String> availableTransport;
    private List<String> availableCommand;

    @PostConstruct
    public void init() throws IOException {
        ObjectMapper mapper = new ObjectMapper();

        Map<String, Object> empData = loadMap("employerTable.json", mapper);
        employerDiceCount = (Integer) empData.get("diceCount");
        employerDiceSides = (Integer) empData.get("diceSides");
        List<Map<String, Object>> entries = (List<Map<String, Object>>) empData.get("entries");
        employerTable = entries.stream()
                .collect(Collectors.toMap(
                        entry -> (Integer) entry.get("roll"),
                        entry -> (String) entry.get("type")
                ));

        Map<String, Object> sysData = loadMap("systemTable.json", mapper);
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

        missionTableData = loadMap("missionTable.json", mapper);

        // Load basic lists from config to avoid hardcoding book-specific data
        availableFactions = loadList("factions.json", mapper);
        availableMissions = loadList("missions.json", mapper);
        availableTrackTypes = loadList("trackTypes.json", mapper);

        trackTableData = loadMap("trackTable.json", mapper);
        roleTableData = loadMap("roleTable.json", mapper);
        lengthOfContractTableData = loadMap("lengthOfContractTable.json", mapper);
        trackCountTableData = loadMap("trackCountTable.json", mapper);

        Map<String, Object> stepsData = loadMap("contractStepsTable.json", mapper);
        List<Map<String, Object>> stepEntries = (List<Map<String, Object>>) stepsData.get("entries");
        contractStepsTable = new HashMap<>();
        for (Map<String, Object> entry : stepEntries) {
            Integer step = (Integer) entry.get("step");
            Map<String, String> values = new HashMap<>();
            values.put("payRate", (String) entry.get("payRate"));
            values.put("supportRights", (String) entry.get("supportRights"));
            values.put("transportation", (String) entry.get("transportation"));
            values.put("salvageRights", (String) entry.get("salvageRights"));
            values.put("commandRights", (String) entry.get("commandRights"));
            contractStepsTable.put(step, values);
        }

        availablePayRates = stepEntries.stream().map(e -> (String) e.get("payRate")).filter(v -> v != null && !"-".equals(v)).distinct().collect(Collectors.toList());
        availableSalvage = stepEntries.stream().map(e -> (String) e.get("salvageRights")).filter(v -> v != null && !"-".equals(v)).distinct().collect(Collectors.toList());
        availableSupport = stepEntries.stream().map(e -> (String) e.get("supportRights")).filter(v -> v != null && !"-".equals(v)).distinct().collect(Collectors.toList());
        availableTransport = stepEntries.stream().map(e -> (String) e.get("transportation")).filter(v -> v != null && !"-".equals(v)).distinct().collect(Collectors.toList());
        availableCommand = stepEntries.stream().map(e -> (String) e.get("commandRights")).filter(v -> v != null && !"-".equals(v)).distinct().collect(Collectors.toList());

        // Load all contract sub-tables (Pay, Salvage, Support, Transport, Command)
        String[] tableKeys = {"payRateTable", "salvageTable", "supportTable", "transportationTable", "commandRightsTable"};
        for (String key : tableKeys) {
            Map<String, Object> tableData = loadMap(key + ".json", mapper);
            contractTables.put(key, new ContractTableConfig(
                    (Integer) tableData.get("diceCount"),
                    (Integer) tableData.get("diceSides"),
                    (List<Map<String, Object>>) tableData.get("rollToStep"),
                    (Map<String, Integer>) tableData.get("employerModifiers"),
                    (Map<String, Integer>) tableData.get("missionModifiers")
            ));
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> loadMap(String fileName, ObjectMapper mapper) throws IOException {
        try (InputStream is = new ClassPathResource("rules/" + fileName).getInputStream()) {
            return mapper.readValue(is, Map.class);
        }
    }

    @SuppressWarnings("unchecked")
    private List<String> loadList(String fileName, ObjectMapper mapper) throws IOException {
        try (InputStream is = new ClassPathResource("rules/" + fileName).getInputStream()) {
            return mapper.readValue(is, List.class);
        }
    }

    public List<String> getEmployerTypes() {
        return employerTable.values().stream().distinct().sorted().collect(Collectors.toList());
    }

    public List<String> getAvailableFactions() {
        return availableFactions;
    }

    public List<String> getAvailableMissions() {
        return availableMissions;
    }

    public List<String> getAvailableTrackTypes() {
        return availableTrackTypes;
    }

    public List<String> getAvailablePayRates() {
        return availablePayRates;
    }

    public List<String> getAvailableSalvage() {
        return availableSalvage;
    }

    public List<String> getAvailableSupport() {
        return availableSupport;
    }

    public List<String> getAvailableTransport() {
        return availableTransport;
    }

    public List<String> getAvailableCommand() {
        return availableCommand;
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
            String employerCategory, String systemName, Double payRate,
            String salvageTerms, String supportTerms, String transportTerms,
            String commandRights, Integer lengthInMonths,
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
            oppMission = getOpposingMissionType(empMission);
        }

        // Calculate duration and track count once for the campaign
        // Default to 3 months if no specific length is requested
        int finalLength = lengthInMonths != null ? lengthInMonths : rollLengthOfContract(empMission, rand);
        int finalTracksCount = trackCount != null ? trackCount : rollTrackCount(empMission, rand);

        String finalSystemName = (systemName != null && !systemName.isEmpty()) ? systemName : rollSystemName(rand);

        Campaign campaign = Campaign.builder()
                .name("DOBLESS OP: " + empMission.toUpperCase() + " [" + finalEmp + "]")
                .systemName(finalSystemName)
                .status("PREVIEW")
                .build();

        // Command rights are resolved per-contract below but can be overridden here
        String previewRights = commandRights != null ? commandRights : "Liaison";

        Contract primaryContract = generateContract(finalEmp, empMission, employerCategory,
                payRate, salvageTerms, supportTerms, transportTerms,
                commandRights, finalLength, finalTracksCount, true, rand);

        // Determine Attacker/Defender role based on p. 135
        String primaryRole = determineUnitRole(empMission, rand);

        // Opponent remains randomized to maintain conflict balance
        // but shares the same duration and track count as the theater
        Contract oppositionContract = generateContract(finalOpp, oppMission, "Minor Power",
                null, null, null, null, null, finalLength, finalTracksCount, false, rand);

        // Generate tracks at the campaign level
        List<String> tracksList = new java.util.ArrayList<>();
        for (int i = 0; i < finalTracksCount; i++) {
            String track = rollTrackType(primaryRole, rand);
            // Complications based on the actual resolved command rights of the primary contract
            if ("House".equalsIgnoreCase(primaryContract.getCommandRights())) {
                track += " (Forced Complication)";
            } else if ("Liaison".equalsIgnoreCase(primaryContract.getCommandRights())) {
                track += " (Potential Complication)";
            }
            tracksList.add(track);
        }

        return new CampaignProposal(campaign, List.of(primaryContract, oppositionContract), tracksList);
    }

    private Contract generateContract(String faction, String type, String category,
            Double payRate, String salvage, String support, String transport,
            String rights, int length, int tracks, boolean isPrimary, Random rand) {

        String empType = category != null ? category : rollEmployerType(rand);

        int payStep = calculateFinalStep("payRateTable", empType, type, rand);
        int salvageStep = calculateFinalStep("salvageTable", empType, type, rand);
        int supportStep = calculateFinalStep("supportTable", empType, type, rand);
        int transportStep = calculateFinalStep("transportationTable", empType, type, rand);
        int rightsStep = calculateFinalStep("commandRightsTable", empType, type, rand);

        String rawPayRate = resolveStepValue(payStep, "payRate");
        Double resolvedPayRate = 1.0;
        try {
            String cleanPayRate = rawPayRate.replace("%", "").trim();
            resolvedPayRate = Double.parseDouble(cleanPayRate);
            if (rawPayRate.contains("%")) {
                resolvedPayRate /= 100.0;
            }
        } catch (Exception e) {
            resolvedPayRate = 1.0;
        }

        return Contract.builder()
                .missionType(type)
                .employerCategory(faction + ": " + empType)
                .payRate(payRate != null ? payRate : resolvedPayRate)
                .salvageTerms(salvage != null ? salvage : resolveStepValue(salvageStep, "salvageRights"))
                .supportTerms(support != null ? support : resolveStepValue(supportStep, "supportRights"))
                .transportTerms(transport != null ? transport : resolveStepValue(transportStep, "transportation"))
                .commandRights(rights != null ? rights : resolveStepValue(rightsStep, "commandRights"))
                .primaryContract(isPrimary)
                .lengthInMonths(length)
                .trackCount(tracks)
                .build();
    }

    private String determineUnitRole(String missionType, Random rand) {
        int diceCount = (Integer) roleTableData.get("diceCount");
        int diceSides = (Integer) roleTableData.get("diceSides");
        int threshold = (Integer) roleTableData.get("threshold");
        Map<String, Integer> mods = (Map<String, Integer>) roleTableData.get("missionModifiers");

        int roll = rollDice(diceCount, diceSides, rand);
        int mod = mods.entrySet().stream()
                .filter(e -> missionType.contains(e.getKey()))
                .map(Map.Entry::getValue)
                .findFirst()
                .orElse(0);

        return (roll + mod >= threshold)
                ? (String) roleTableData.get("attackerLabel")
                : (String) roleTableData.get("defenderLabel");
    }

    private int rollLengthOfContract(String missionType, Random rand) {
        int diceCount = (Integer) lengthOfContractTableData.get("diceCount");
        int diceSides = (Integer) lengthOfContractTableData.get("diceSides");
        Map<String, Integer> mods = (Map<String, Integer>) lengthOfContractTableData.get("missionModifiers");

        int roll = rollDice(diceCount, diceSides, rand);
        int mod = mods.entrySet().stream()
                .filter(e -> missionType.contains(e.getKey()))
                .map(Map.Entry::getValue)
                .findFirst()
                .orElse(0);

        int finalRoll = roll + mod;
        List<Map<String, Object>> entries = (List<Map<String, Object>>) lengthOfContractTableData.get("entries");
        return entries.stream()
                .filter(entry -> finalRoll >= (Integer) entry.get("minRoll") && finalRoll <= (Integer) entry.get("maxRoll"))
                .map(entry -> (Integer) entry.get("value"))
                .findFirst().orElse(3); // Default to 3 months if no match
    }

    private int rollTrackCount(String missionType, Random rand) {
        int diceCount = (Integer) trackCountTableData.get("diceCount");
        int diceSides = (Integer) trackCountTableData.get("diceSides");
        Map<String, Integer> mods = (Map<String, Integer>) trackCountTableData.get("missionModifiers");

        int roll = rollDice(diceCount, diceSides, rand);
        int mod = mods.entrySet().stream()
                .filter(e -> missionType.contains(e.getKey()))
                .map(Map.Entry::getValue)
                .findFirst()
                .orElse(0);

        return Math.max(1, roll + mod);
    }

    private String rollTrackType(String role, Random rand) {
        int diceCount = (Integer) trackTableData.get("diceCount");
        int diceSides = (Integer) trackTableData.get("diceSides");
        int roll = rollDice(diceCount, diceSides, rand);

        List<Map<String, Object>> entries = (List<Map<String, Object>>) trackTableData.get("entries");
        String baseTrack = "Assault";

        for (Map<String, Object> entry : entries) {
            int min = (Integer) entry.get("minRoll");
            int max = (Integer) entry.get("maxRoll");
            if (roll >= min && roll <= max) {
                baseTrack = (String) entry.get("value");
                break;
            }
        }

        if ("Standard".equals(baseTrack)) {
            return "Attacker".equalsIgnoreCase(role) ? "Assault" : "Defend";
        }

        return baseTrack;
    }

    private int calculateFinalStep(String tableKey, String empType, String missionType, Random rand) {
        ContractTableConfig config = contractTables.get(tableKey);
        if (config == null) {
            return 7; // Safety default
        }
        int roll = rollDice(config.diceCount, config.diceSides, rand);
        int initialStep = 6;
        for (Map<String, Object> range : config.rollToStep) {
            int min = (Integer) range.get("minRoll");
            int max = (Integer) range.get("maxRoll");
            if (roll >= min && roll <= max) {
                initialStep = (Integer) range.get("step");
                break;
            }
        }

        int empMod = config.empMods.entrySet().stream()
                .filter(e -> empType.contains(e.getKey())).map(Map.Entry::getValue).findFirst().orElse(0);
        int missionMod = config.missionMods.entrySet().stream()
                .filter(e -> missionType.contains(e.getKey())).map(Map.Entry::getValue).findFirst().orElse(0);

        return Math.max(1, Math.min(13, initialStep + empMod + missionMod));
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
            String employerCategory, String systemName, Double payRate,
            String salvageTerms, String supportTerms, String transportTerms,
            String commandRights, Integer lengthInMonths,
            Integer trackCount) {
        CampaignProposal proposal = generateProposal(employer, opponent, mission, employerCategory, systemName,
                payRate, salvageTerms, supportTerms, transportTerms, commandRights,
                lengthInMonths, trackCount);
        Campaign campaign = proposal.campaign();
        campaign.setManagerId(managerId);
        campaign.setStatus("ACTIVE");

        // The faction names were determined during proposal generation and prepended to the employerCategory
        final String primaryEmployerName = proposal.contracts().get(0).getEmployerCategory().split(": ")[0];
        final String oppositionEmployerName = proposal.contracts().get(1).getEmployerCategory().split(": ")[0];

        return campaignRepository.save(campaign)
                .flatMap(savedCampaign -> {
                    CampaignFaction empFaction = CampaignFaction.builder()
                            .campaignId(savedCampaign.getId())
                            .factionName(primaryEmployerName)
                            .offersContracts(true)
                            .build();

                    CampaignFaction oppFaction = CampaignFaction.builder()
                            .campaignId(savedCampaign.getId())
                            .factionName(oppositionEmployerName)
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
        if (availableFactions == null || availableFactions.isEmpty()) {
            return "Unknown Faction";
        }
        // If there's only one faction available, we can't exclude it without looping forever
        if (availableFactions.size() <= 1) {
            return availableFactions.get(0);
        }

        Random rand = new Random();
        String selected;
        do {
            selected = availableFactions.get(rand.nextInt(availableFactions.size()));
        } while (selected.equals(exclude));
        return selected;
    }

    private String getRandomMission() {
        return availableMissions.get(new Random().nextInt(availableMissions.size()));
    }
}
