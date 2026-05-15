package com.hotspotscamp.service;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

import com.fasterxml.jackson.core.type.TypeReference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotspotscamp.entity.Campaign;
import com.hotspotscamp.entity.CampaignFaction;
import com.hotspotscamp.entity.CampaignTrack;
import com.hotspotscamp.entity.Contract;
import com.hotspotscamp.entity.User;
import com.hotspotscamp.repository.CampaignFactionRepository;
import com.hotspotscamp.repository.CampaignRepository;
import com.hotspotscamp.repository.CampaignTrackRepository;
import com.hotspotscamp.repository.DetachmentRepository;
import com.hotspotscamp.repository.ContractRepository;
import com.hotspotscamp.repository.UserRepository;
import com.hotspotscamp.service.CampaignService.CampaignProposal;

import jakarta.annotation.PostConstruct;
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
    private final DetachmentRepository detachmentRepository;
    private final UserRepository userRepository;
    private final UserService userService;

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
    private Map<String, Object> trackCountTableData;

    private Map<String, ContractTableConfig> contractTables = new HashMap<>();

    private record ContractTableConfig(int diceCount, int diceSides, List<Map<String, Object>> rollToStep,
            Map<String, Integer> empMods, Map<String, Integer> missionMods) {

    }

    private List<String> availableFactions;
    private List<String> availablePrimaryMissions;
    private List<String> availableOpponentMissions;
    private List<String> availableTrackTypes;
    private List<String> availablePayRates;
    private List<String> availableSalvage;
    private List<String> availableSupport;
    private List<String> availableTransport;
    private List<String> availableCommand;

    private Map<String, List<String>> factionOrganizations;
    private List<String> corporateSuffixes;
    private List<String> noblePrefixes;

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
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> missionEntries = (List<Map<String, Object>>) missionTableData.get("entries");
        if (missionEntries == null) {
            missionEntries = java.util.Collections.emptyList();
        }

        availablePrimaryMissions = missionEntries.stream()
                .flatMap(entry -> {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> primary = (Map<String, Object>) entry.get("primary");
                    if (primary == null) {
                        return java.util.stream.Stream.empty();
                    }
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> subEntries = (List<Map<String, Object>>) primary.get("entries");
                    return subEntries == null ? java.util.stream.Stream.empty() : subEntries.stream().map(e -> (String) e.get("value"));
                })
                .distinct().sorted().collect(Collectors.toList());

        availableOpponentMissions = missionEntries.stream()
                .flatMap(entry -> {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> opponent = (Map<String, Object>) entry.get("opponent");
                    if (opponent == null) {
                        return java.util.stream.Stream.empty();
                    }
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> subEntries = (List<Map<String, Object>>) opponent.get("entries");
                    return subEntries == null ? java.util.stream.Stream.empty() : subEntries.stream().map(e -> (String) e.get("value"));
                })
                .distinct().sorted().collect(Collectors.toList());

        trackTableData = loadMap("trackTable.json", mapper);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> trackGroups = (List<Map<String, Object>>) trackTableData.get("groups");
        availableTrackTypes = trackGroups.stream()
                .flatMap(g -> ((List<Map<String, Object>>) g.get("entries")).stream())
                .map(e -> (String) e.get("value"))
                .distinct()
                .sorted()
                .collect(Collectors.toList());

        roleTableData = loadMap("roleTable.json", mapper);
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

        Map<String, List<String>> orgData = loadMapTyped("factionOrganizations.json", mapper, new TypeReference<Map<String, List<String>>>() {
        });
        factionOrganizations = orgData;
        corporateSuffixes = loadList("corporateSuffixes.json", mapper);
        noblePrefixes = loadList("noblePrefixes.json", mapper);

        // Load all contract sub-tables (Pay, Salvage, Support, Transport, Command)
        String[] tableKeys = {"payRateTable", "salvageTable", "supportTable", "transportationTable", "commandRightsTable"};
        for (String key : tableKeys) {
            Map<String, Object> tableData = loadMap(key + ".json", mapper);

            @SuppressWarnings("unchecked")
            Map<String, Integer> empMods = (Map<String, Integer>) tableData.get("employerModifiers");
            @SuppressWarnings("unchecked")
            Map<String, Integer> missionMods = (Map<String, Integer>) tableData.get("missionModifiers");

            contractTables.put(key, new ContractTableConfig(
                    (Integer) tableData.get("diceCount"),
                    (Integer) tableData.get("diceSides"),
                    (List<Map<String, Object>>) (tableData.get("rollToStep") != null ? tableData.get("rollToStep") : java.util.Collections.emptyList()),
                    empMods != null ? empMods : java.util.Collections.emptyMap(),
                    missionMods != null ? missionMods : java.util.Collections.emptyMap()
            ));
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> loadMap(String fileName, ObjectMapper mapper) throws IOException {
        return loadMapTyped(fileName, mapper, new TypeReference<Map<String, Object>>() {
        });
    }

    private <T> T loadMapTyped(String fileName, ObjectMapper mapper, TypeReference<T> typeReference) throws IOException {
        try (InputStream is = new ClassPathResource("rules/" + fileName).getInputStream()) {
            return mapper.readValue(is, typeReference);
        }
    }

    @SuppressWarnings("unchecked")
    private List<String> loadList(String fileName, ObjectMapper mapper) throws IOException {
        try (InputStream is = new ClassPathResource("rules/" + fileName).getInputStream()) {
            return mapper.readValue(is, new TypeReference<List<String>>() {
            });
        }
    }

    public List<String> getEmployerTypes() {
        return employerTable.values().stream().distinct().sorted().collect(Collectors.toList());
    }

    public List<String> getAvailableFactions() {
        return availableFactions;
    }

    public Map<String, List<String>> getAvailableMissions() {
        return Map.of(
                "primary", availablePrimaryMissions,
                "opponent", availableOpponentMissions
        );
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

    public Map<Integer, Map<String, String>> getResolvedStepsTable() {
        Map<Integer, Map<String, String>> resolved = new HashMap<>();
        for (Integer step : contractStepsTable.keySet()) {
            Map<String, String> values = new HashMap<>();
            values.put("payRate", resolveStepValue(step, "payRate"));
            values.put("salvageRights", resolveStepValue(step, "salvageRights"));
            values.put("supportRights", resolveStepValue(step, "supportRights"));
            values.put("transportation", resolveStepValue(step, "transportation"));
            values.put("commandRights", resolveStepValue(step, "commandRights"));
            resolved.put(step, values);
        }
        return resolved;
    }

    /**
     * Tracks are part of the campaign metadata in the proposal, not nested in
     * contracts.
     */
    public record CampaignProposal(Campaign campaign, List<Contract> contracts, List<String> tracks) {

    }

    public record ActiveCampaignSummary(
            UUID id,
            String name,
            String systemName,
            Integer trackCount,
            String primaryEmployer,
            String secondaryEmployer
            ) {

    }

    public record ActiveCampaignPage(List<ActiveCampaignSummary> content, long totalElements, int totalPages) {

    }

    public Mono<ActiveCampaignPage> getActiveCampaigns(int page, int size) {
        log.debug("Fetching active campaigns - page: {}, size: {}", page, size);
        int offset = page * size;
        return campaignRepository.countByStatus("ACTIVE")
                .doOnNext(total -> log.debug("Total active campaigns count: {}", total))
                .flatMap(total -> campaignRepository.findAllByStatus("ACTIVE", size, offset)
                .doOnNext(c -> log.debug("Processing campaign: {} (ID: {})", c.getName(), c.getId()))
                .flatMap(c -> contractRepository.findAllByCampaignId(c.getId())
                .collectList()
                .doOnNext(contracts -> log.debug("Found {} contracts for campaign ID: {}", contracts.size(), c.getId()))
                .map(contracts -> {
                    String primary = contracts.stream()
                            .filter(contract -> Boolean.TRUE.equals(contract.getPrimaryContract()))
                            .map(Contract::getEmployerCategory).findFirst().orElse("Unknown");
                    log.debug("Primary employer for campaign ID {}: {}", c.getId(), primary);
                    String secondary = contracts.stream()
                            .filter(contract -> Boolean.FALSE.equals(contract.getPrimaryContract()))
                            .map(Contract::getEmployerCategory).findFirst().orElse("Unknown");
                    log.debug("Oppponent employer for campaign ID {}: {}", c.getId(), secondary);
                    String campaignName = c.getName() != null ? c.getName() : "Unknown Campaign";
                    String systemName = c.getSystemName() != null ? c.getSystemName() : "Unknown System";
                    Integer trackCount = c.getTrackCount() != null ? c.getTrackCount() : 0;
                    return new ActiveCampaignSummary(c.getId(), campaignName, systemName, trackCount, primary, secondary);
                }))
                .collectList()
                .map(list -> {
                    int totalPages = (int) Math.ceil((double) total / size);
                    log.debug("Returning page of active campaigns - count: {}, total: {}, pages: {}", list.size(), total, totalPages);
                    return new ActiveCampaignPage(list, total, totalPages);
                }));
    }

    /**
     * Fetches campaigns where the user is the designated Campaign Manager.
     */
    public Flux<ActiveCampaignSummary> getManagedCampaigns(String managerId) {
        return campaignRepository.findAllByManagerId(managerId)
                .flatMap(this::mapToSummary);
    }

    /**
     * Fetches campaigns that the Mercenary Command is currently participating
     * in via its detachments.
     */
    public Flux<ActiveCampaignSummary> getParticipatingCampaigns(UUID commandId) {
        return detachmentRepository.findAllByMercenaryCommandId(commandId)
                .flatMap(det -> contractRepository.findById(det.getContractId()))
                .map(Contract::getCampaignId)
                .distinct()
                .flatMap(campaignRepository::findById)
                .flatMap(this::mapToSummary);
    }

    private Mono<ActiveCampaignSummary> mapToSummary(Campaign c) {
        return contractRepository.findAllByCampaignId(c.getId())
                .collectList()
                .map(contracts -> createSummary(c, contracts));
    }

    private ActiveCampaignSummary createSummary(Campaign c, List<Contract> contracts) {
        String primary = contracts.stream()
                .filter(contract -> Boolean.TRUE.equals(contract.getPrimaryContract()))
                .map(Contract::getEmployerCategory).findFirst().orElse("Unknown");
        String secondary = contracts.stream()
                .filter(contract -> Boolean.FALSE.equals(contract.getPrimaryContract()))
                .map(Contract::getEmployerCategory).findFirst().orElse("Unknown");
        return new ActiveCampaignSummary(
                c.getId(),
                c.getName(),
                c.getSystemName(),
                c.getTrackCount(),
                primary,
                secondary
        );
    }

    /**
     * Generates the data for a campaign without saving it.
     */
    public CampaignProposal generateProposal(String employer, String opponent, String mission,
            String employerCategory, String systemName, Double payRate,
            String salvageTerms, String supportTerms, String transportTerms, String commandRights,
            Integer payStep, Integer salvageStep, Integer supportStep, Integer transportStep, Integer commandStep,
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
            oppMission = getOpposingMissionType(empMission, rand);
        }

        // Calculate track count and duration for the campaign.
        // Per Hinterlands p. 134, the length of the contract in months is equal to the number of tracks.
        int finalTracksCount = trackCount != null ? trackCount : rollTrackCount(empMission, rand);

        String finalSystemName = (systemName != null && !systemName.isEmpty()) ? systemName : rollSystemName(rand);

        // Ensure the campaign name and primary contract mission type are derived from the same empMission string
        Campaign campaign = Campaign.builder()
                .name(finalSystemName.toUpperCase() + ": OP " + empMission.toUpperCase() + " [" + finalEmp + "]")
                .systemName(finalSystemName)
                .trackCount(finalTracksCount)
                .status("PREVIEW")
                .build();

        // Command rights are resolved per-contract below but can be overridden here
        String previewRights = commandRights != null ? commandRights : "Liaison";

        Contract primaryContract = generateContract(finalEmp, empMission, employerCategory,
                payRate, salvageTerms, supportTerms, transportTerms, commandRights, payStep, salvageStep,
                supportStep, transportStep, commandStep, finalTracksCount, true,
                finalSystemName, rand);

        // Determine Attacker/Defender role based on p. 135
        String primaryRole = determineUnitRole(empMission, rand);

        // Opponent remains randomized to maintain conflict balance
        // but shares the same duration and track count as the theater
        Contract oppositionContract = generateContract(finalOpp, oppMission, "Minor Power",
                null, null, null, null, null, null, null, null, null, null,
                finalTracksCount, false, finalSystemName, rand);

        // Generate tracks at the campaign level
        List<String> tracksList = new java.util.ArrayList<>();
        for (int i = 0; i < finalTracksCount; i++) {
            String track = rollTrackType(primaryRole, empMission, rand);
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
            Double payRate, String salvage, String support, String transport, String rights,
            Integer payStepIn, Integer salvageStepIn, Integer supportStepIn, Integer transportStepIn, Integer commandStepIn,
            int tracks, boolean isPrimary, String system, Random rand) {

        String empType = category != null ? category : rollEmployerType(rand);

        int payStep = payStepIn != null ? payStepIn : calculateFinalStep("payRateTable", empType, type, rand);
        int salvageStep = salvageStepIn != null ? salvageStepIn : calculateFinalStep("salvageTable", empType, type, rand);
        int supportStep = supportStepIn != null ? supportStepIn : calculateFinalStep("supportTable", empType, type, rand);
        int transportStep = transportStepIn != null ? transportStepIn : calculateFinalStep("transportationTable", empType, type, rand);
        int rightsStep = commandStepIn != null ? commandStepIn : calculateFinalStep("commandRightsTable", empType, type, rand);

        Double resolvedPayRate = parsePayRate(resolveStepValue(payStep, "payRate"));

        String finalOrgName;
        String finalEmpType;

        // If category already includes an organization name (format "Org (Type)"), extract them to avoid double nesting during save
        if (empType.contains(" (") && empType.endsWith(")")) {
            finalOrgName = empType.substring(0, empType.indexOf(" ("));
            finalEmpType = empType.substring(empType.indexOf(" (") + 2, empType.length() - 1);
        } else {
            finalOrgName = getPlausibleOrganization(faction, empType, system, rand);
            finalEmpType = empType;
        }

        return Contract.builder()
                .missionType(type)
                .employerCategory(faction + ": " + finalOrgName + " (" + finalEmpType + ")")
                .payRate(payRate != null ? payRate : resolvedPayRate)
                .payStep(payStep)
                .salvageTerms(salvage != null ? salvage : resolveStepValue(salvageStep, "salvageRights"))
                .salvageStep(salvageStep)
                .supportTerms(support != null ? support : resolveStepValue(supportStep, "supportRights"))
                .supportStep(supportStep)
                .transportTerms(transport != null ? transport : resolveStepValue(transportStep, "transportation"))
                .transportStep(transportStep)
                .commandRights(rights != null ? rights : resolveStepValue(rightsStep, "commandRights"))
                .commandStep(rightsStep)
                .primaryContract(isPrimary)
                .trackCount(tracks)
                .build();
    }

    private String getPlausibleOrganization(String faction, String empType, String system, Random rand) {
        List<String> factionOrgs = factionOrganizations.entrySet().stream()
                .filter(e -> faction.toLowerCase().contains(e.getKey().toLowerCase()))
                .map(Map.Entry::getValue)
                .findFirst()
                .orElse(factionOrganizations.get("Minor Power"));

        String baseOrg = factionOrgs.get(rand.nextInt(factionOrgs.size()));

        // Refine name based on employer type
        if ("Corporate".equalsIgnoreCase(empType)) {
            return baseOrg + " " + corporateSuffixes.get(rand.nextInt(corporateSuffixes.size()));
        } else if ("Noble".equalsIgnoreCase(empType)) {
            return noblePrefixes.get(rand.nextInt(noblePrefixes.size())) + " of " + system;
        } else if ("Government".equalsIgnoreCase(empType) || "Local Government".equalsIgnoreCase(empType)) {
            return system + " Planetary Council (" + baseOrg + ")";
        }

        return baseOrg;
    }

    private Double parsePayRate(String raw) {
        try {
            String clean = raw.replace("%", "").trim();
            double val = Double.parseDouble(clean);
            return raw.contains("%") ? val / 100.0 : val;
        } catch (Exception e) {
            return 1.0;
        }
    }

    /**
     * Helper to perform fuzzy mission matching against JSON keys.
     */
    private boolean missionMatches(String missionType, String target) {
        if (missionType == null || target == null) {
            return false;
        }
        String mt = missionType.toLowerCase();
        String t = target.toLowerCase();
        return mt.equals(t) || mt.contains(t) || t.contains(mt);
    }

    private String determineUnitRole(String missionType, Random rand) {
        int diceCount = (Integer) roleTableData.get("diceCount");
        int diceSides = (Integer) roleTableData.get("diceSides");
        int threshold = (Integer) roleTableData.get("threshold");
        Map<String, Integer> mods = (Map<String, Integer>) roleTableData.get("missionModifiers");

        int roll = rollDice(diceCount, diceSides, rand);
        int mod = mods.entrySet().stream()
                .filter(e -> missionMatches(missionType, e.getKey()))
                .map(Map.Entry::getValue)
                .findFirst()
                .orElse(0);

        return (roll + mod >= threshold)
                ? (String) roleTableData.get("attackerLabel")
                : (String) roleTableData.get("defenderLabel");
    }

    private int rollTrackCount(String missionType, Random rand) {
        int diceCount = (Integer) trackCountTableData.get("diceCount");
        int diceSides = (Integer) trackCountTableData.get("diceSides");
        int roll = rollDice(diceCount, diceSides, rand);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> groups = (List<Map<String, Object>>) trackCountTableData.get("groups");

        Map<String, Object> selectedGroup = groups.stream()
                .filter(g -> ((List<String>) g.get("missions")).stream()
                .anyMatch(m -> missionMatches(missionType, m)))
                .findFirst()
                .orElse(groups.get(0)); // Default to Raid/Expedition logic

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> entries = (List<Map<String, Object>>) selectedGroup.get("entries");
        for (Map<String, Object> entry : entries) {
            int min = (Integer) entry.get("minRoll");
            int max = (Integer) entry.get("maxRoll");
            if (roll >= min && roll <= max) {
                return (Integer) entry.get("value");
            }
        }

        return 1;
    }

    /**
     * Generates a list of tracks based on mission type and command rights. Used
     * when the theater operational scope is expanded.
     */
    public List<String> generateTracks(String missionType, String commandRights, int count) {
        Random rand = new Random();
        String role = determineUnitRole(missionType, rand);
        List<String> tracksList = new java.util.ArrayList<>();

        for (int i = 0; i < count; i++) {
            String track = rollTrackType(role, missionType, rand);

            if ("House".equalsIgnoreCase(commandRights)) {
                track += " (Forced Complication)";
            } else if ("Liaison".equalsIgnoreCase(commandRights)) {
                track += " (Potential Complication)";
            }
            tracksList.add(track);
        }

        return tracksList;
    }

    private String rollTrackType(String role, String missionType, Random rand) {
        log.debug("Rolling track type for role: {}, mission: {}", role, missionType);
        int diceCount = (Integer) trackTableData.get("diceCount");
        int diceSides = (Integer) trackTableData.get("diceSides");
        int roll = rollDice(diceCount, diceSides, rand);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> groups = (List<Map<String, Object>>) trackTableData.get("groups");

        Map<String, Object> selectedGroup = groups.stream()
                .filter(g -> ((List<String>) g.get("missions")).stream()
                .anyMatch(m -> missionMatches(missionType, m)))
                .findFirst()
                .orElseGet(() -> groups.stream()
                .filter(g -> ((List<String>) g.get("missions")).contains("Default"))
                .findFirst()
                .orElse(groups.get(0)));

        log.debug("Selected track group for mission '{}': {}", missionType, selectedGroup.get("missions"));

        List<Map<String, Object>> entries = (List<Map<String, Object>>) selectedGroup.get("entries");
        log.debug("Track entries for selected group: {}", entries.size());

        // Initialize baseTrack with the first entry as a safer default than a hardcoded "Assault"
        String baseTrack = entries.get(0).get("value").toString();

        for (Map<String, Object> entry : entries) {
            int min = (Integer) entry.get("minRoll");
            int max = (Integer) entry.get("maxRoll");
            if (roll >= min && roll <= max) {
                baseTrack = (String) entry.get("value");
                break;
            }
        }
        log.debug("Final track type for mission '{}': {}", missionType, baseTrack);
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

        final String finalEmpType = empType != null ? empType.toLowerCase() : "";

        int empMod = config.empMods.entrySet().stream()
                .filter(e -> finalEmpType.contains(e.getKey().toLowerCase())).map(Map.Entry::getValue).findFirst().orElse(0);
        int missionMod = config.missionMods.entrySet().stream()
                .filter(e -> missionMatches(missionType, e.getKey())).map(Map.Entry::getValue).findFirst().orElse(0);

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

    /**
     * Resolves the opposing mission type by finding the entry in
     * missionTable.json that corresponds to the provided primary mission type.
     */
    @SuppressWarnings("unchecked")
    private String getOpposingMissionType(String employerMission, Random rand) {
        List<Map<String, Object>> entries = (List<Map<String, Object>>) missionTableData.get("entries");
        for (Map<String, Object> entry : entries) {
            Map<String, Object> primary = (Map<String, Object>) entry.get("primary");
            List<Map<String, Object>> subEntries = (List<Map<String, Object>>) primary.get("entries");

            boolean matchFound = subEntries.stream()
                    .anyMatch(se -> missionMatches(employerMission, (String) se.get("value")));

            if (matchFound) {
                return resolveFromSubTable((Map<String, Object>) entry.get("opponent"), rand);
            }
        }
        // Fallback if the specific mission type isn't mapped to a table entry
        return "Garrison";
    }

    /**
     * Persists a generated campaign to the database.
     */
    @Transactional
    public Mono<Campaign> generateDoblessCampaign(String managerId, String employer, String opponent, String mission,
            String employerCategory, String systemName, Double payRate,
            String salvageTerms, String supportTerms, String transportTerms, String commandRights,
            Integer payStep, Integer salvageStep, Integer supportStep, Integer transportStep, Integer commandStep,
            Integer trackCount) {

        return userService.resolveOrCreateUser(managerId)
                .flatMap(user -> {
                    if (!"ROLE_AUTHENTICATED".equals(user.getRole())) {
                        return Mono.error(new org.springframework.web.server.ResponseStatusException(
                                org.springframework.http.HttpStatus.FORBIDDEN, "Only Managers can create campaigns"));
                    }

                    CampaignProposal proposal = generateProposal(employer, opponent, mission, employerCategory, systemName,
                            payRate, salvageTerms, supportTerms, transportTerms, commandRights,
                            payStep, salvageStep, supportStep, transportStep, commandStep,
                            trackCount);
                    Campaign campaign = proposal.campaign();
                    if (campaign.getId() == null) {
                        campaign.setId(UUID.randomUUID());
                    }
                    campaign.setManagerId(user.getId().toString());
                    campaign.setStatus("ACTIVE");

                    // The faction names were determined during proposal generation and prepended to the employerCategory
                    final String primaryEmployerName = proposal.contracts().get(0).getEmployerCategory().split(": ", 2)[0];
                    final String oppositionEmployerName = proposal.contracts().get(1).getEmployerCategory().split(": ", 2)[0];

                    return campaignRepository.save(campaign)
                            .flatMap(savedCampaign -> {
                                CampaignFaction empFaction = CampaignFaction.builder()
                                        .id(UUID.randomUUID())
                                        .campaignId(savedCampaign.getId())
                                        .factionName(primaryEmployerName)
                                        .offersContracts(true)
                                        .build();

                                CampaignFaction oppFaction = CampaignFaction.builder()
                                        .id(UUID.randomUUID())
                                        .campaignId(savedCampaign.getId())
                                        .factionName(oppositionEmployerName)
                                        .offersContracts(true) // Per Hinterlands, both sides often hire mercs
                                        .build();

                                return campaignFactionRepository.saveAll(List.of(empFaction, oppFaction))
                                        .collectList()
                                        .flatMap(factions -> {
                                            Flux<Contract> contractFlux = Flux.fromIterable(proposal.contracts())
                                                    .zipWith(Flux.fromIterable(factions))
                                                    .flatMap(tuple -> {
                                                        Contract c = tuple.getT1();
                                                        if (c.getId() == null) {
                                                            c.setId(UUID.randomUUID());
                                                        }
                                                        c.setCampaignId(savedCampaign.getId());
                                                        c.setEmployerFactionId(tuple.getT2().getId());
                                                        return contractRepository.save(c);
                                                    });

                                            Flux<CampaignTrack> trackFlux = Flux.fromIterable(proposal.tracks())
                                                    .index()
                                                    .flatMap(tuple -> {
                                                        CampaignTrack track = CampaignTrack.builder()
                                                                .id(UUID.randomUUID())
                                                                .campaignId(savedCampaign.getId())
                                                                .trackName(tuple.getT2())
                                                                .sequenceOrder(tuple.getT1().intValue())
                                                                .build();
                                                        return campaignTrackRepository.save(track);
                                                    });

                                            return Flux.merge(contractFlux, trackFlux).then(Mono.just(savedCampaign));
                                        });
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
        return availablePrimaryMissions.get(new Random().nextInt(availablePrimaryMissions.size()));
    }
}
