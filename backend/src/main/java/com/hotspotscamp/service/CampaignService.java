package com.hotspotscamp.service;

import java.time.LocalDateTime;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.dao.DuplicateKeyException;

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
import com.hotspotscamp.entity.Detachment;
import com.hotspotscamp.entity.CampaignInvite;
import com.hotspotscamp.entity.Contract;
import com.hotspotscamp.repository.CampaignFactionRepository;
import com.hotspotscamp.repository.CampaignRepository;
import com.hotspotscamp.repository.CampaignTrackRepository;
import com.hotspotscamp.repository.DetachmentRepository;
import com.hotspotscamp.repository.ContractRepository;
import com.hotspotscamp.repository.CampaignInviteRepository;

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
    private final CampaignInviteRepository campaignInviteRepository;
    private final DetachmentRepository detachmentRepository;
    private final UserService userService;

    private int systemGroupDiceCount;
    private int systemGroupDiceSides;
    private int systemEntryDiceCount;
    private int systemEntryDiceSides;

    // DTOs for Configuration Tables
    private record RollEntry(int minRoll, int maxRoll, String value) {

    }

    private record CountEntry(int minRoll, int maxRoll, int value) {

    }

    private record SubTable(int diceCount, int diceSides, List<RollEntry> entries) {

    }

    private record MissionEntry(int minRoll, int maxRoll, SubTable primary, SubTable opponent) {

    }

    private record MissionTableConfig(int diceCount, int diceSides, List<MissionEntry> entries) {

    }

    private record RoleTableConfig(
            int diceCount,
            int diceSides,
            int threshold,
            String attackerLabel,
            String defenderLabel,
            Map<String, Integer> missionModifiers
            ) {

    }

    // New records for systemTable
    private record SystemEntry(int roll, String name) {

    }

    private record SystemGroup(int roll, List<SystemEntry> entries) {

    }

    private record SystemTableConfig(int groupDiceCount, int groupDiceSides, int entryDiceCount, int entryDiceSides, List<SystemGroup> groups) {

    }

    // New records for contractStepsTable
    private record ContractStepEntry(int step, String payRate, String salvageRights, String supportRights, String transportation, String commandRights) {

    }

    private record ContractStepsTableConfig(int diceCount, int diceSides, List<ContractStepEntry> entries) {

    }

    // New record for rollToStep within ContractTableConfig
    private record RollToStepEntry(int minRoll, int maxRoll, int step) {

    }

    private record TrackGroup(List<String> missions, List<RollEntry> entries) {

    }

    private record TrackTableConfig(int diceCount, int diceSides, List<TrackGroup> groups) {

    }

    private record TrackCountGroup(List<String> missions, List<CountEntry> entries) {

    }

    private record TrackCountTableConfig(int diceCount, int diceSides, List<TrackCountGroup> groups) {

    }

    // New records for employerTable
    private record EmployerEntry(int roll, String type) {

    }

    private record EmployerTableConfig(int diceCount, int diceSides, List<EmployerEntry> entries) {

    }

    private EmployerTableConfig employerTableConfig;
    private SystemTableConfig systemTableConfig;
    private MissionTableConfig missionTableData;
    private RoleTableConfig roleTableData;
    private TrackTableConfig trackTableData;
    private TrackCountTableConfig trackCountTableData;
    private ContractStepsTableConfig contractStepsTableConfig;

    private record ContractTableConfig(int diceCount, int diceSides, List<Map<String, Object>> rollToStep,
            Map<String, Integer> empMods, Map<String, Integer> missionMods) {

    }

    private List<String> availableFactions;
    // Updated ContractTableConfig to use RollToStepEntry
    private final Map<String, ContractTableConfigV2> contractTables = new HashMap<>();

    private record ContractTableConfigV2(int diceCount, int diceSides, List<RollToStepEntry> rollToStep, Map<String, Integer> employerModifiers, Map<String, Integer> missionModifiers) {

    }
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

        employerTableConfig = loadMapTyped("employerTable.json", mapper, new TypeReference<EmployerTableConfig>() {
        });

        systemTableConfig = loadMapTyped("systemTable.json", mapper, new TypeReference<SystemTableConfig>() {
        });
        Integer sgdc = systemTableConfig.groupDiceCount();
        Integer sgds = systemTableConfig.groupDiceSides();
        Integer sedc = systemTableConfig.entryDiceCount();
        Integer seds = systemTableConfig.entryDiceSides();
        systemGroupDiceCount = sgdc != null ? sgdc : 2;
        systemGroupDiceSides = sgds != null ? sgds : 6;
        systemEntryDiceCount = sedc != null ? sedc : 2;
        systemEntryDiceSides = seds != null ? seds : 6;

        missionTableData = loadMapTyped("missionTable.json", mapper, new TypeReference<MissionTableConfig>() {
        });

        // Load basic lists from config to avoid hardcoding book-specific data
        availableFactions = loadList("factions.json", mapper);

        availablePrimaryMissions = missionTableData.entries().stream()
                .flatMap(entry -> entry.primary().entries().stream().map(RollEntry::value))
                .distinct().sorted().collect(Collectors.toList());

        availableOpponentMissions = missionTableData.entries().stream()
                .flatMap(entry -> entry.opponent().entries().stream().map(RollEntry::value))
                .distinct().sorted().collect(Collectors.toList());

        trackTableData = loadMapTyped("trackTable.json", mapper, new TypeReference<TrackTableConfig>() {
        });
        availableTrackTypes = trackTableData.groups().stream()
                .flatMap(g -> g.entries().stream())
                .map(RollEntry::value)
                .distinct()
                .sorted()
                .collect(Collectors.toList());

        roleTableData = loadMapTyped("roleTable.json", mapper, new TypeReference<RoleTableConfig>() {
        });
        trackCountTableData = loadMapTyped("trackCountTable.json", mapper, new TypeReference<TrackCountTableConfig>() {
        });

        contractStepsTableConfig = loadMapTyped("contractStepsTable.json", mapper, new TypeReference<ContractStepsTableConfig>() {
        });

        availablePayRates = contractStepsTableConfig.entries().stream().map(ContractStepEntry::payRate).filter(v -> v != null && !"-".equals(v)).distinct().collect(Collectors.toList());
        availableSalvage = contractStepsTableConfig.entries().stream().map(ContractStepEntry::salvageRights).filter(v -> v != null && !"-".equals(v)).distinct().collect(Collectors.toList());
        availableSupport = contractStepsTableConfig.entries().stream().map(ContractStepEntry::supportRights).filter(v -> v != null && !"-".equals(v)).distinct().collect(Collectors.toList());
        availableTransport = contractStepsTableConfig.entries().stream().map(ContractStepEntry::transportation).filter(v -> v != null && !"-".equals(v)).distinct().collect(Collectors.toList());
        availableCommand = contractStepsTableConfig.entries().stream().map(ContractStepEntry::commandRights).filter(v -> v != null && !"-".equals(v)).distinct().collect(Collectors.toList());

        Map<String, List<String>> orgData = loadMapTyped("factionOrganizations.json", mapper, new TypeReference<Map<String, List<String>>>() {
        });
        factionOrganizations = orgData;
        corporateSuffixes = loadList("corporateSuffixes.json", mapper);
        noblePrefixes = loadList("noblePrefixes.json", mapper);

        // Load all contract sub-tables (Pay, Salvage, Support, Transport, Command)
        String[] tableKeys = {"payRateTable", "salvageTable", "supportTable", "transportationTable", "commandRightsTable"};
        for (String key : tableKeys) {
            ContractTableConfigV2 config = loadMapTyped(key + ".json", mapper, new TypeReference<ContractTableConfigV2>() {
            });
            contractTables.put(key, new ContractTableConfigV2(
                    config.diceCount(),
                    config.diceSides(),
                    config.rollToStep() != null ? config.rollToStep() : java.util.Collections.emptyList(),
                    config.employerModifiers() != null ? config.employerModifiers() : java.util.Collections.emptyMap(),
                    config.missionModifiers() != null ? config.missionModifiers() : java.util.Collections.emptyMap()
            ));
        }
    }

    private Map<String, Object> loadMap(String fileName, ObjectMapper mapper) throws IOException {
        return loadMapTyped(fileName, mapper, new TypeReference<Map<String, Object>>() {
        });
    }

    private <T> T loadMapTyped(String fileName, ObjectMapper mapper, TypeReference<T> typeReference) throws IOException {
        try (InputStream is = new ClassPathResource("rules/" + fileName).getInputStream()) {
            return mapper.readValue(is, typeReference);
        }
    }

    private List<String> loadList(String fileName, ObjectMapper mapper) throws IOException {
        try (InputStream is = new ClassPathResource("rules/" + fileName).getInputStream()) {
            return mapper.readValue(is, new TypeReference<List<String>>() {
            });
        }
    }

    public List<String> getEmployerTypes() {
        return employerTableConfig.entries().stream()
                .map(EmployerEntry::type)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
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
        Map<Integer, Map<String, String>> resolvedSteps = new HashMap<>();
        for (ContractStepEntry entry : contractStepsTableConfig.entries()) {
            Map<String, String> values = new HashMap<>();
            values.put("payRate", entry.payRate());
            values.put("salvageRights", entry.salvageRights());
            values.put("supportRights", entry.supportRights());
            values.put("transportation", entry.transportation());
            values.put("commandRights", entry.commandRights());
            resolvedSteps.put(entry.step(), values);
        }
        return resolvedSteps;
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

    /**
     * Fetches campaigns that the Mercenary Command is currently participating
     * in via its detachments.
     */
    public Flux<ActiveCampaignSummary> getParticipatingCampaigns(UUID commandId) {
        log.debug("Fetching participating campaigns for commandId: {}", commandId);
        return detachmentRepository.findAllByMercenaryCommandId(commandId)
                .map(Detachment::getCampaignId)
                .distinct()
                .flatMap(campaignRepository::findById)
                .flatMap(this::mapToSummary);
    }

    private Mono<ActiveCampaignSummary> mapToSummary(Campaign c) {
        log.info("[MONITOR] Mapping campaign {} to summary", c.getId());
        return contractRepository.findAllByCampaignId(c.getId())
                .collectList()
                .map(contracts -> {
                    ActiveCampaignSummary summary = createSummary(c, contracts);
                    log.info("[MONITOR] Summary mapped for {}: Primary Employer={}", summary.name(), summary.primaryEmployer());
                    return summary;
                });
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
            int roll = rollDice(missionTableData.diceCount(), missionTableData.diceSides(), rand);
            empMission = "Unknown Mission";
            oppMission = "Unknown Opponent Mission";

            for (var entry : missionTableData.entries()) {
                if (roll >= entry.minRoll() && roll <= entry.maxRoll()) {
                    empMission = resolveFromSubTable(entry.primary(), rand);
                    oppMission = resolveFromSubTable(entry.opponent(), rand);
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

        // Command rights are resolved per-contract below but can be overridden here
        String previewRights = commandRights != null ? commandRights : "Liaison";

        Contract primaryContract = generateContract(finalEmp, empMission, employerCategory,
                payRate, salvageTerms, supportTerms, transportTerms, commandRights, payStep, salvageStep,
                supportStep, transportStep, commandStep, finalTracksCount, true,
                finalSystemName, rand);

        // Populate the Campaign entity with metadata from the Primary Contract
        Campaign campaign = Campaign.builder()
                .name(finalSystemName.toUpperCase() + ": OP " + empMission.toUpperCase() + " [" + finalEmp + "]")
                .systemName(finalSystemName)
                .trackCount(finalTracksCount)
                .description("Theater established in the " + finalSystemName + " system.")
                .payRate(primaryContract.getPayRate())
                .payStep(primaryContract.getPayStep())
                .salvageTerms(primaryContract.getSalvageTerms())
                .salvageStep(primaryContract.getSalvageStep())
                .supportTerms(primaryContract.getSupportTerms())
                .supportStep(primaryContract.getSupportStep())
                .transportTerms(primaryContract.getTransportTerms())
                .transportStep(primaryContract.getTransportStep())
                .commandRights(primaryContract.getCommandRights())
                .commandStep(primaryContract.getCommandStep())
                .status("PREVIEW")
                .build();

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
        int roll = rollDice(roleTableData.diceCount(), roleTableData.diceSides(), rand);
        int mod = roleTableData.missionModifiers().entrySet().stream()
                .filter(e -> missionMatches(missionType, e.getKey()))
                .map(Map.Entry::getValue)
                .findFirst()
                .orElse(0);

        return (roll + mod >= roleTableData.threshold())
                ? roleTableData.attackerLabel()
                : roleTableData.defenderLabel();
    }

    private int rollTrackCount(String missionType, Random rand) {
        int roll = rollDice(trackCountTableData.diceCount(), trackCountTableData.diceSides(), rand); // Use trackCountTableData

        var selectedGroup = trackCountTableData.groups().stream()
                .filter(g -> g.missions().stream().anyMatch(m -> missionMatches(missionType, m)))
                .findFirst()
                .orElse(trackCountTableData.groups().get(0));

        for (var entry : selectedGroup.entries()) {
            if (roll >= entry.minRoll() && roll <= entry.maxRoll()) {
                return entry.value();
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
        int roll = rollDice(trackTableData.diceCount(), trackTableData.diceSides(), rand);

        var selectedGroup = trackTableData.groups().stream()
                .filter(g -> g.missions().stream().anyMatch(m -> missionMatches(missionType, m)))
                .findFirst()
                .orElseGet(() -> trackTableData.groups().stream()
                .filter(g -> g.missions().contains("Default"))
                .findFirst()
                .orElse(trackTableData.groups().get(0)));

        var entries = selectedGroup.entries();
        String baseTrack = entries.get(0).value();

        for (var entry : entries) {
            if (roll >= entry.minRoll() && roll <= entry.maxRoll()) {
                baseTrack = entry.value();
                break;
            }
        }
        log.debug("Final track type for mission '{}': {}", missionType, baseTrack);
        return baseTrack;
    }

    private int calculateFinalStep(String tableKey, String empType, String missionType, Random rand) {
        ContractTableConfigV2 config = contractTables.get(tableKey);
        if (config == null) {
            return 7; // Safety default
        }
        int roll = rollDice(config.diceCount, config.diceSides, rand);
        int initialStep = 6;
        for (RollToStepEntry range : config.rollToStep) {
            int min = range.minRoll();
            int max = range.maxRoll();
            if (roll >= min && roll <= max) {
                Integer stepVal = range.step();
                initialStep = stepVal != null ? stepVal : 6;
                break;
            }
        }

        final String finalEmpType = empType != null ? empType.toLowerCase() : "";

        int empMod = config.employerModifiers().entrySet().stream()
                .filter(e -> finalEmpType.contains(e.getKey().toLowerCase())).map(Map.Entry::getValue).findFirst().orElse(0);
        int missionMod = config.missionModifiers().entrySet().stream()
                .filter(e -> missionMatches(missionType, e.getKey())).map(Map.Entry::getValue).findFirst().orElse(0);

        return Math.max(1, Math.min(13, initialStep + empMod + missionMod));
    }

    private String rollEmployerType(Random rand) {
        int roll = rollDice(employerTableConfig.diceCount(), employerTableConfig.diceSides(), rand);
        return employerTableConfig.entries().stream()
                .filter(entry -> entry.roll() == roll)
                .map(EmployerEntry::type)
                .findFirst()
                .orElse("Other");
    }

    private String rollSystemName(Random rand) {
        int groupRoll = rollDice(systemTableConfig.groupDiceCount(), systemTableConfig.groupDiceSides(), rand);
        int entryRoll = rollDice(systemTableConfig.entryDiceCount(), systemTableConfig.entryDiceSides(), rand);

        return systemTableConfig.groups().stream()
                .filter(g -> g.roll() == groupRoll)
                .flatMap(g -> g.entries().stream())
                .filter(e -> e.roll() == entryRoll)
                .map(SystemEntry::name)
                .findFirst()
                .orElse("Unknown System");
    }

    private String resolveStepValue(int step, String column) {
        ContractStepEntry entry = contractStepsTableConfig.entries().stream()
                .filter(e -> e.step() == step)
                .findFirst().orElse(null);

        String value = getColumnValue(entry, column);
        int currentStep = step; // Start with the requested step
        while ("-".equals(value)) {
            if (currentStep < 7) {
                currentStep++;
            } else if (currentStep > 7) {
                currentStep--;
            } else {
                break;
            }
            final int lookupStep = currentStep;
            ContractStepEntry currentEntry = contractStepsTableConfig.entries().stream()
                    .filter(e -> e.step() == lookupStep)
                    .findFirst().orElse(null);
            value = getColumnValue(currentEntry, column);
        }
        return value;
    }

    private String getColumnValue(ContractStepEntry entry, String column) {
        if (entry == null) {
            return "-";
        }
        return switch (column) {
            case "payRate" ->
                entry.payRate();
            case "salvageRights" ->
                entry.salvageRights();
            case "supportRights" ->
                entry.supportRights();
            case "transportation" ->
                entry.transportation();
            case "commandRights" ->
                entry.commandRights();
            default ->
                "-";
        };
    }

    private String resolveFromSubTable(SubTable subTable, Random rand) {
        int roll = rollDice(subTable.diceCount(), subTable.diceSides(), rand);
        for (var entry : subTable.entries()) {
            if (roll >= entry.minRoll() && roll <= entry.maxRoll()) {
                return entry.value();
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
    private String getOpposingMissionType(String employerMission, Random rand) {
        for (var entry : missionTableData.entries()) {
            if (entry.primary().entries().stream().anyMatch(se -> missionMatches(employerMission, se.value()))) {
                return resolveFromSubTable(entry.opponent(), rand);
            }
        }
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
                            .onErrorResume(DuplicateKeyException.class, e -> campaignRepository.findById(campaign.getId()))
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

                                return campaignFactionRepository.saveAll(java.util.Objects.requireNonNull(List.of(empFaction, oppFaction)))
                                        .collectList()
                                        .flatMap(factions -> {
                                            Flux<Contract> contractFlux = Flux.fromIterable(java.util.Objects.requireNonNull(proposal.contracts()))
                                                    .zipWith(Flux.fromIterable(java.util.Objects.requireNonNull(factions)))
                                                    .flatMap(tuple -> {
                                                        Contract c = tuple.getT1();
                                                        if (c.getId() == null) {
                                                            c.setId(UUID.randomUUID());
                                                        }
                                                        c.setCampaignId(savedCampaign.getId());
                                                        c.setEmployerFactionId(tuple.getT2().getId());
                                                        return contractRepository.save(c);
                                                    });

                                            Flux<CampaignTrack> trackFlux = Flux.fromIterable(java.util.Objects.requireNonNull(proposal.tracks()))
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

    /**
     * Creates a new invitation token for a campaign.
     */
    @Transactional
    public Mono<CampaignInvite> createInvite(UUID campaignId, String userId) {
        return userService.resolveOrCreateUser(userId).flatMap(user
                -> campaignRepository.findById(campaignId)
                        .switchIfEmpty(Mono.error(new RuntimeException("Campaign not found")))
                        .flatMap(campaign -> {
                            if (!campaign.getManagerId().equals(user.getId().toString())) {
                                return Mono.error(new RuntimeException("Access Denied: Not the campaign manager."));
                            }

                            CampaignInvite invite = CampaignInvite.builder()
                                    .id(UUID.randomUUID())
                                    .campaignId(campaignId)
                                    .token(UUID.randomUUID().toString().substring(0, 12).toUpperCase()) // Simple 12-char token
                                    .expiresAt(LocalDateTime.now().plusDays(7))
                                    .used(false)
                                    .build();
                            return campaignInviteRepository.save(invite);
                        })
        );
    }

    /**
     * Fetches all invitation tokens for a specific campaign.
     */
    public Flux<CampaignInvite> getCampaignInvites(UUID campaignId) {
        return campaignInviteRepository.findAllByCampaignId(campaignId);
    }
}
