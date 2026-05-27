package com.hotspotscamp.service;

import java.time.LocalDateTime;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.lang.NonNull;

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
import com.hotspotscamp.util.RulesConstants;
import com.hotspotscamp.util.TypeUtils;
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
    private final InviteService inviteService;

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

    private record RoleTableConfig(int diceCount, int diceSides, int threshold, String attackerLabel, String defenderLabel, Map<String, Integer> missionModifiers) {

    }

    private record SystemEntry(int roll, String name) {

    }

    private record SystemGroup(int roll, List<SystemEntry> entries) {

    }

    private record SystemTableConfig(Integer groupDiceCount, Integer groupDiceSides, Integer entryDiceCount, Integer entryDiceSides, List<SystemGroup> groups) {

    }

    private record ContractStepEntry(int step, String payRate, String salvageRights, String supportRights, String transportation, String commandRights) {

    }

    private record ContractStepsTableConfig(int diceCount, int diceSides, List<ContractStepEntry> entries) {

    }

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

    private record EmployerEntry(int roll, String type) {

    }

    private record ComplicationRule(int diceCount, int diceSides, int modifier) {

    }

    private record ComplicationsTableConfig(Map<String, ComplicationRule> rules, List<RollEntry> entries) {

    }

    private record EmployerTableConfig(int diceCount, int diceSides, List<EmployerEntry> entries) {

    }

    public record GeneratedTrack(String name, String complication) {

    }

    public record CampaignProposal(Campaign campaign, List<Contract> contracts, List<GeneratedTrack> tracks) {

    }

    public record ActiveCampaignSummary(UUID id, String name, String systemName, Integer trackCount, String primaryEmployer, String secondaryEmployer) {

    }

    private record ContractTableConfigV2(int diceCount, int diceSides, List<RollToStepEntry> rollToStep, Map<String, Integer> employerModifiers, Map<String, Integer> missionModifiers) {

    }

    private EmployerTableConfig employerTableConfig;
    private SystemTableConfig systemTableConfig;
    private MissionTableConfig missionTableData;
    private RoleTableConfig roleTableData;
    private TrackTableConfig trackTableData;
    private TrackCountTableConfig trackCountTableData;
    private ContractStepsTableConfig contractStepsTableConfig;
    private ComplicationsTableConfig complicationsTableConfig;

    private int systemGroupDiceCount;
    private int systemGroupDiceSides;
    private int systemEntryDiceCount;
    private int systemEntryDiceSides;

    private List<String> availableFactions;
    private final Map<String, ContractTableConfigV2> contractTables = new HashMap<>();
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
        systemGroupDiceCount = systemTableConfig.groupDiceCount() != null ? systemTableConfig.groupDiceCount() : 2;
        systemGroupDiceSides = systemTableConfig.groupDiceSides() != null ? systemTableConfig.groupDiceSides() : 6;
        systemEntryDiceCount = systemTableConfig.entryDiceCount() != null ? systemTableConfig.entryDiceCount() : 2;
        systemEntryDiceSides = systemTableConfig.entryDiceSides() != null ? systemTableConfig.entryDiceSides() : 6;

        missionTableData = loadMapTyped("missionTable.json", mapper, new TypeReference<MissionTableConfig>() {
        });
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
                .distinct().sorted().collect(Collectors.toList());

        roleTableData = loadMapTyped("roleTable.json", mapper, new TypeReference<RoleTableConfig>() {
        });
        trackCountTableData = loadMapTyped("trackCountTable.json", mapper, new TypeReference<TrackCountTableConfig>() {
        });
        contractStepsTableConfig = loadMapTyped("contractStepsTable.json", mapper, new TypeReference<ContractStepsTableConfig>() {
        });
        complicationsTableConfig = loadMapTyped("complicationsTable.json", mapper, new TypeReference<ComplicationsTableConfig>() {
        });

        availablePayRates = contractStepsTableConfig.entries().stream().map(ContractStepEntry::payRate).filter(v -> v != null && !"-".equals(v)).distinct().collect(Collectors.toList());
        availableSalvage = contractStepsTableConfig.entries().stream().map(ContractStepEntry::salvageRights).filter(v -> v != null && !"-".equals(v)).distinct().collect(Collectors.toList());
        availableSupport = contractStepsTableConfig.entries().stream().map(ContractStepEntry::supportRights).filter(v -> v != null && !"-".equals(v)).distinct().collect(Collectors.toList());
        availableTransport = contractStepsTableConfig.entries().stream().map(ContractStepEntry::transportation).filter(v -> v != null && !"-".equals(v)).distinct().collect(Collectors.toList());
        availableCommand = contractStepsTableConfig.entries().stream().map(ContractStepEntry::commandRights).filter(v -> v != null && !"-".equals(v)).distinct().collect(Collectors.toList());

        factionOrganizations = loadMapTyped("factionOrganizations.json", mapper, new TypeReference<Map<String, List<String>>>() {
        });
        corporateSuffixes = loadList("corporateSuffixes.json", mapper);
        noblePrefixes = loadList("noblePrefixes.json", mapper);

        String[] tableKeys = {"payRateTable", "salvageTable", "supportTable", "transportationTable", "commandRightsTable"};
        for (String key : tableKeys) {
            ContractTableConfigV2 config = loadMapTyped(key + ".json", mapper, new TypeReference<ContractTableConfigV2>() {
            });
            contractTables.put(key, config);
        }
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
        return employerTableConfig.entries().stream().map(EmployerEntry::type).distinct().sorted().collect(Collectors.toList());
    }

    public List<String> getAvailableFactions() {
        return availableFactions;
    }

    public Map<String, List<String>> getAvailableMissions() {
        return Map.of("primary", availablePrimaryMissions, "opponent", availableOpponentMissions);
    }

    public List<String> getAvailableTrackTypes() {
        return availableTrackTypes;
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

    public Flux<ActiveCampaignSummary> getParticipatingCampaigns(UUID commandId) {
        return detachmentRepository.findAllByMercenaryCommandId(commandId)
                .map(Detachment::getCampaignId)
                .distinct()
                .flatMap(campaignRepository::findById)
                .flatMap(this::mapToSummary);
    }

    private Mono<ActiveCampaignSummary> mapToSummary(Campaign c) {
        return contractRepository.findAllByCampaignId(c.getId()).collectList()
                .map(contracts -> createSummary(c, contracts));
    }

    private ActiveCampaignSummary createSummary(Campaign c, List<Contract> contracts) {
        String primary = contracts.stream().filter(Contract::getPrimaryContract).map(Contract::getEmployerCategory).findFirst().orElse("Unknown");
        String secondary = contracts.stream().filter(con -> !con.getPrimaryContract()).map(Contract::getEmployerCategory).findFirst().orElse("Unknown");
        return new ActiveCampaignSummary(c.getId(), c.getName(), c.getSystemName(), c.getTrackCount(), primary, secondary);
    }

    public CampaignProposal generateProposal(String employer, String opponent, String mission,
            String employerCategory, String systemName, Double payRate,
            String salvageTerms, String supportTerms, String transportTerms, String commandRights,
            Integer payStep, Integer salvageStep, Integer supportStep, Integer transportStep, Integer commandStep,
            Integer trackCount, Integer lengthInMonths,
            Integer monthlyPay, Integer monthlyMaintenance, Integer transportationCost, Integer combatPay) {
        Random rand = new Random();
        String finalEmp = (employer == null || employer.isEmpty()) ? getRandomFaction(null) : employer;
        String finalOpp = (opponent == null || opponent.isEmpty()) ? getRandomFaction(finalEmp) : opponent;

        String empMission, oppMission;
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

        int finalTracksCount = trackCount != null ? trackCount : rollTrackCount(empMission, rand);
        String finalSystemName = (systemName != null && !systemName.isEmpty()) ? systemName : rollSystemName(rand);

        Contract primaryContract = generateContract(finalEmp, empMission, employerCategory,
                payRate, salvageTerms, supportTerms, transportTerms, commandRights, payStep,
                salvageStep, supportStep, transportStep, commandStep, finalTracksCount, true, finalSystemName, rand);

        Campaign campaign = Campaign.builder()
                .name(finalSystemName.toUpperCase() + ": OP " + empMission.toUpperCase() + " [" + finalEmp + "]")
                .systemName(finalSystemName)
                .trackCount(finalTracksCount)
                .lengthInMonths(lengthInMonths != null ? lengthInMonths : finalTracksCount)
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
                .monthlyPay(monthlyPay != null ? monthlyPay : RulesConstants.DEFAULT_MONTHLY_PAY)
                .monthlyMaintenance(monthlyMaintenance != null ? monthlyMaintenance : RulesConstants.DEFAULT_MONTHLY_MAINTENANCE)
                .transportationCost(transportationCost != null ? transportationCost : RulesConstants.DEFAULT_TRANSPORTATION_COST)
                .combatPay(combatPay != null ? combatPay : RulesConstants.DEFAULT_COMBAT_PAY)
                .status("PREVIEW")
                .build();

        Contract oppositionContract = generateContract(finalOpp, oppMission, "Minor Power",
                null, null, null, null, null, null, null, null, null, null,
                finalTracksCount, false, finalSystemName, rand);

        List<GeneratedTrack> tracksList = generateTracks(empMission, primaryContract.getCommandRights(), finalTracksCount);
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
        String finalOrgName = empType.contains(" (") ? empType.substring(0, empType.indexOf(" (")) : getPlausibleOrganization(faction, empType, system, rand);

        return Contract.builder()
                .missionType(type)
                .employerCategory(finalOrgName + ": " + (empType.contains(" (") ? empType.substring(empType.indexOf(" (") + 2, empType.length() - 1) : empType))
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
                .map(Map.Entry::getValue).findFirst().orElse(List.of(faction));
        String baseOrg = factionOrgs.get(rand.nextInt(factionOrgs.size()));
        if ("Corporate".equalsIgnoreCase(empType)) {
            return baseOrg + " " + corporateSuffixes.get(rand.nextInt(corporateSuffixes.size()));
        }
        if ("Noble".equalsIgnoreCase(empType)) {
            return noblePrefixes.get(rand.nextInt(noblePrefixes.size())) + " of " + system;
        }
        if (empType.toLowerCase().contains("government")) {
            return system + " Planetary Council (" + baseOrg + ")";
        }
        return baseOrg;
    }

    private Double parsePayRate(String raw) {
        try {
            String clean = raw.replace("%", "").trim();
            double val = Double.parseDouble(clean);
            return raw.contains("%") ? val / 100.0 : val;
        } catch (NumberFormatException e) {
            return 1.0;
        }
    }

    private boolean missionMatches(String missionType, String target) {
        if (missionType == null || target == null) {
            return false;
        }
        String mt = missionType.toLowerCase(), t = target.toLowerCase();
        return mt.equals(t) || mt.contains(t) || t.contains(mt);
    }

    private String determineUnitRole(String missionType, Random rand) {
        int roll = rollDice(roleTableData.diceCount(), roleTableData.diceSides(), rand);
        int mod = roleTableData.missionModifiers().entrySet().stream()
                .filter(e -> missionMatches(missionType, e.getKey())).map(Map.Entry::getValue).findFirst().orElse(0);
        return (roll + mod >= roleTableData.threshold()) ? roleTableData.attackerLabel() : roleTableData.defenderLabel();
    }

    private int rollTrackCount(String missionType, Random rand) {
        int roll = rollDice(trackCountTableData.diceCount(), trackCountTableData.diceSides(), rand);
        var group = trackCountTableData.groups().stream().filter(g -> g.missions().stream().anyMatch(m -> missionMatches(missionType, m))).findFirst().orElse(trackCountTableData.groups().get(0));
        for (var entry : group.entries()) {
            if (roll >= entry.minRoll() && roll <= entry.maxRoll()) {
                return entry.value();
            }
        }
        return 1;
    }

    public List<GeneratedTrack> generateTracks(String missionType, String commandRights, int count) {
        Random rand = new Random();
        String role = determineUnitRole(missionType, rand);
        List<GeneratedTrack> tracksList = new java.util.ArrayList<>();
        for (int i = 0; i < count; i++) {
            tracksList.add(new GeneratedTrack(rollTrackType(role, missionType, rand), rollComplication(commandRights, rand)));
        }
        return tracksList;
    }

    private String rollComplication(String commandRights, Random rand) {
        ComplicationRule rule = complicationsTableConfig.rules().getOrDefault(commandRights, complicationsTableConfig.rules().get("Independent"));
        int diceRoll = rollDice(rule.diceCount(), rule.diceSides(), rand);
        int roll = diceRoll + rule.modifier();
        log.debug("[ROLL] Complication - Rights: {}, Roll: {}+{}={}", commandRights, diceRoll, rule.modifier(), roll);

        return complicationsTableConfig.entries().stream()
                .filter(e -> roll >= e.minRoll() && roll <= e.maxRoll()).map(RollEntry::value).findFirst().orElse("None");
    }

    private String rollTrackType(String role, String missionType, Random rand) {
        int roll = rollDice(trackTableData.diceCount(), trackTableData.diceSides(), rand);
        var group = trackTableData.groups().stream()
                .filter(g -> g.missions().stream().anyMatch(m -> missionMatches(missionType, m)))
                .findFirst()
                .orElseGet(() -> trackTableData.groups().stream()
                .filter(g -> g.missions().contains("Default"))
                .findFirst()
                .orElse(trackTableData.groups().get(0)));

        log.debug("[ROLL] Track Type - Mission: {}, Roll: {} (using group: {})", missionType, roll, group.missions());

        for (var entry : group.entries()) {
            if (roll >= entry.minRoll() && roll <= entry.maxRoll()) {
                return entry.value();
            }
        }
        return group.entries().get(0).value();
    }

    private int calculateFinalStep(String tableKey, String empType, String missionType, Random rand) {
        ContractTableConfigV2 config = contractTables.get(tableKey);
        if (config == null) {
            return 7;
        }
        int roll = rollDice(config.diceCount(), config.diceSides(), rand);
        int initialStep = config.rollToStep().stream().filter(r -> roll >= r.minRoll() && roll <= r.maxRoll()).map(RollToStepEntry::step).findFirst().orElse(6);
        int empMod = config.employerModifiers().entrySet().stream().filter(e -> empType.toLowerCase().contains(e.getKey().toLowerCase())).map(Map.Entry::getValue).findFirst().orElse(0);
        int missionMod = config.missionModifiers().entrySet().stream().filter(e -> missionMatches(missionType, e.getKey())).map(Map.Entry::getValue).findFirst().orElse(0);
        return Math.max(1, Math.min(13, initialStep + empMod + missionMod));
    }

    private String rollEmployerType(Random rand) {
        int roll = rollDice(employerTableConfig.diceCount(), employerTableConfig.diceSides(), rand);
        return employerTableConfig.entries().stream().filter(e -> e.roll() == roll).map(EmployerEntry::type).findFirst().orElse("Other");
    }

    private String rollSystemName(Random rand) {
        int gRoll = rollDice(systemGroupDiceCount, systemGroupDiceSides, rand);
        int eRoll = rollDice(systemEntryDiceCount, systemEntryDiceSides, rand);
        return systemTableConfig.groups().stream().filter(g -> g.roll() == gRoll).flatMap(g -> g.entries().stream()).filter(e -> e.roll() == eRoll).map(SystemEntry::name).findFirst().orElse("Unknown");
    }

    private String resolveStepValue(int step, String column) {
        int currentStep = step;
        while (true) {
            final int lookup = currentStep;
            var entry = contractStepsTableConfig.entries().stream().filter(e -> e.step() == lookup).findFirst().orElse(null);
            String val = getColumnValue(entry, column);
            if (!"-".equals(val)) {
                return val;
            }
            if (currentStep < 7) {
                currentStep++;
            } else if (currentStep > 7) {
                currentStep--;
            } else {
                break;
            }
        }
        return "-";
    }

    private String getColumnValue(ContractStepEntry entry, String col) {
        if (entry == null) {
            return "-";
        }
        return switch (col) {
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

    private String resolveFromSubTable(SubTable sub, Random rand) {
        int roll = rollDice(sub.diceCount(), sub.diceSides(), rand);
        for (var entry : sub.entries()) {
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

    private String getOpposingMissionType(String employerMission, Random rand) {
        for (var entry : missionTableData.entries()) {
            if (entry.primary().entries().stream().anyMatch(se -> missionMatches(employerMission, se.value()))) {
                return resolveFromSubTable(entry.opponent(), rand);
            }
        }
        return "Garrison";
    }

    @Transactional
    public Mono<Campaign> generateDoblessCampaign(String managerId, String employer, String opponent, String mission,
            String employerCategory, String systemName, Double payRate,
            String salvageTerms, String supportTerms, String transportTerms, String commandRights,
            Integer payStep, Integer salvageStep, Integer supportStep, Integer transportStep, Integer commandStep,
            Integer trackCount, Integer lengthInMonths,
            Integer monthlyPay, Integer monthlyMaintenance, Integer transportationCost, Integer combatPay) {
        return userService.resolveOrCreateUser(managerId).flatMap(user -> {
            if (!"ROLE_AUTHENTICATED".equals(user.getRole())) {
                return Mono.error(new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Only Managers can create campaigns"));
            }
            CampaignProposal proposal = generateProposal(employer, opponent, mission, employerCategory, systemName, payRate, salvageTerms, supportTerms, transportTerms, commandRights, payStep, salvageStep, supportStep, transportStep, commandStep, trackCount, lengthInMonths, monthlyPay, monthlyMaintenance, transportationCost, combatPay);
            Campaign campaign = proposal.campaign();
            campaign.setId(campaign.getId() == null ? UUID.randomUUID() : campaign.getId());
            campaign.setManagerId(user.getId().toString());
            campaign.setStatus("ACTIVE");

            final String primaryEmp = proposal.contracts().get(0).getEmployerCategory().split(": ", 2)[0];
            final String oppositionEmp = proposal.contracts().get(1).getEmployerCategory().split(": ", 2)[0];

            return campaignRepository.save(campaign).onErrorResume(DuplicateKeyException.class, e -> campaignRepository.findById(campaign.getId())).flatMap(saved -> {
                CampaignFaction f1 = CampaignFaction.builder().id(UUID.randomUUID()).campaignId(saved.getId()).factionName(primaryEmp).offersContracts(true).build();
                CampaignFaction f2 = CampaignFaction.builder().id(UUID.randomUUID()).campaignId(saved.getId()).factionName(oppositionEmp).offersContracts(true).build();
                return campaignFactionRepository.saveAll(List.of(f1, f2)).collectList().flatMap(factions -> {
                    Flux<Contract> conFlux = Flux.fromIterable(proposal.contracts()).zipWith(Flux.fromIterable(factions)).flatMap(t -> {
                        Contract c = t.getT1();
                        c.setId(c.getId() == null ? UUID.randomUUID() : c.getId());
                        c.setCampaignId(saved.getId());
                        c.setEmployerFactionId(t.getT2().getId());
                        return contractRepository.save(c);
                    });
                    Flux<CampaignTrack> trackFlux = Flux.fromIterable(proposal.tracks()).index().flatMap(t -> {
                        return campaignTrackRepository.save(Objects.requireNonNull(
                                CampaignTrack.builder()
                                        .id(UUID.randomUUID())
                                        .campaignId(saved.getId())
                                        .trackName(t.getT2().name())
                                        .complications(t.getT2().complication())
                                        .sequenceOrder(t.getT1().intValue())
                                        .monthIndex(t.getT1().intValue() + 1)
                                        .build()
                        ));
                    });
                    return Mono.when(conFlux.then(), trackFlux.then()).thenReturn(saved);
                });
            });
        });
    }

    private String getRandomFaction(String exclude) {
        if (availableFactions == null || availableFactions.isEmpty()) {
            return "Unknown Faction";
        }
        if (availableFactions.size() <= 1) {
            return availableFactions.get(0);
        }
        String selected;
        Random rand = new Random();
        do {
            selected = availableFactions.get(rand.nextInt(availableFactions.size()));
        } while (selected.equals(exclude));
        return selected;
    }

    @Transactional
    public Mono<CampaignInvite> createInvite(UUID campaignId, String recipientName, String userId) {
        return userService.resolveOrCreateUser(userId).flatMap(user -> campaignRepository.findById(campaignId).switchIfEmpty(Mono.error(new RuntimeException("Campaign not found"))).flatMap(camp -> {
            if (!camp.getManagerId().equals(user.getId().toString())) {
                return Mono.error(new RuntimeException("Access Denied: Not the campaign manager."));
            }
            return inviteService.generateInvite(campaignId, recipientName);
        }));
    }

    @Transactional
    public Mono<Boolean> joinCampaign(String token, @NonNull UUID detachmentId) {
        return inviteService.validateAndConsumeInvite(token)
                .flatMap(invite -> detachmentRepository.findById(detachmentId)
                .switchIfEmpty(Mono.error(new RuntimeException("DETACHMENT NOT FOUND")))
                .flatMap(detachment -> {
                    detachment.setNew(false);
                    detachment.setCampaignId(invite.getCampaignId());
                    // In R2DBC, setting campaignId on a loaded detachment and saving performs an update.
                    return detachmentRepository.save(detachment).thenReturn(true);
                })
                );
    }

    @Transactional
    public Mono<Boolean> deleteInvite(@NonNull UUID inviteId, String userId) {
        return userService.resolveOrCreateUser(userId).flatMap(user
                -> campaignInviteRepository.findById(inviteId)
                        .switchIfEmpty(Mono.error(new RuntimeException("Invite not found")))
                        .flatMap(invite -> campaignRepository.findById(Objects.requireNonNull(invite.getCampaignId()))
                        .flatMap(camp -> {
                            if (!camp.getManagerId().equals(user.getId().toString())) {
                                return Mono.error(new RuntimeException("Access Denied: Not the campaign manager."));
                            }
                            return campaignInviteRepository.delete(invite).thenReturn(true);
                        })
                        )
        );
    }

    public Flux<CampaignInvite> getCampaignInvites(UUID campaignId) {
        return campaignInviteRepository.findAllByCampaignId(campaignId);
    }

    @Transactional
    public Mono<CampaignTrack> updateTrack(@NonNull UUID trackId, Map<String, Object> input) {
        return campaignTrackRepository.findById(trackId).flatMap(track -> {
            track.setNew(false);
            if (input.containsKey("trackName")) {
                track.setTrackName((String) input.get("trackName"));
            }
            if (input.containsKey("location")) {
                track.setLocation((String) input.get("location"));
            }
            if (input.containsKey("nextSession")) {
                String ns = (String) input.get("nextSession");
                track.setNextSession(ns != null && !ns.isEmpty() ? LocalDateTime.parse(ns) : null);
            }
            if (input.containsKey("attackerFactionId")) {
                track.setAttackerFactionId(input.get("attackerFactionId") != null ? UUID.fromString((String) input.get("attackerFactionId")) : null);
            }
            if (input.containsKey("monthIndex")) {
                track.setMonthIndex(TypeUtils.asInt(input.get("monthIndex")));
            }
            if (input.containsKey("complications")) {
                track.setComplications((String) input.get("complications"));
            }
            return campaignTrackRepository.save(track);
        });
    }

    @Transactional
    public Mono<CampaignTrack> rerollTrack(@NonNull UUID trackId, String managerId) {
        log.info("[REROLL] Initializing track reroll for ID: {} by manager: {}", trackId, managerId);
        return userService.resolveOrCreateUser(managerId)
                .flatMap(user -> campaignTrackRepository.findById(trackId)
                .switchIfEmpty(Mono.error(new RuntimeException("Track not found: " + trackId)))
                .flatMap(track -> campaignRepository.findById(Objects.requireNonNull(track.getCampaignId()))
                .switchIfEmpty(Mono.error(new RuntimeException("Campaign not found")))
                .flatMap(campaign -> {
                    // Security: Ensure only the manager can trigger automation
                    if (!campaign.getManagerId().equals(user.getId().toString())) {
                        log.warn("[REROLL] Access Denied: User {} is not manager {}", user.getId(), campaign.getManagerId());
                        return Mono.error(new RuntimeException("Access Denied: Only the theater manager can reroll tracks."));
                    }

                    log.debug("[REROLL] Command Rights for theater: {}", campaign.getCommandRights());

                    return contractRepository.findAllByCampaignId(campaign.getId())
                            .filter(Contract::getPrimaryContract)
                            .next()
                            .flatMap(primary -> {
                                Random rand = new Random();
                                String role = determineUnitRole(primary.getMissionType(), rand);
                                String newName = rollTrackType(role, primary.getMissionType(), rand);
                                String complication = rollComplication(campaign.getCommandRights(), rand);

                                log.info("[REROLL] Outcome for {}: Name='{}', Complication='{}'",
                                        trackId, newName, complication);

                                track.setTrackName(newName);
                                track.setComplications(complication);
                                track.setNew(false);
                                return campaignTrackRepository.save(track)
                                        .doOnSuccess(saved -> log.debug("[REROLL] DB update successful for track {}", saved.getId()));
                            })
                            .switchIfEmpty(Mono.defer(() -> {
                                log.error("[REROLL] Failed: No primary contract found for campaign {}", campaign.getId());
                                return Mono.error(new RuntimeException("Primary contract context not found for reroll."));
                            }));
                })));
    }

    @Transactional
    public Flux<CampaignTrack> reorderTracks(UUID campaignId, List<UUID> trackIds) {
        return Flux.fromIterable(trackIds).index().flatMap(tuple -> {
            return campaignTrackRepository.findById(Objects.requireNonNull(tuple.getT2())).flatMap(track -> {
                track.setSequenceOrder(tuple.getT1().intValue());
                track.setNew(false);
                return campaignTrackRepository.save(track);
            });
        });
    }
}
