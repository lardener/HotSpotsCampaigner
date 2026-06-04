package com.hotspotscamp.service;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Random;
import java.util.UUID;
import java.util.function.IntSupplier;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import com.hotspotscamp.util.TypeUtils;

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

    // --- Rule Configuration DTOs ---
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

    private record ContractTableConfigV2(int diceCount, int diceSides, List<RollToStepEntry> rollToStep, Map<String, Integer> employerModifiers, Map<String, Integer> missionModifiers) {

    }

    private record IntensityMonthEntry(int minRoll, int maxRoll, String intensity) {

    }

    private record IntensityTrackCountEntry(int count, List<IntensityMonthEntry> months) {

    }

    private record IntensityTracksConfig(int diceCount, int diceSides, List<IntensityTrackCountEntry> tracks) {

    }

    private record IntensityTableEntry(int campaignLength, IntensityTracksConfig tracks) {

    }

    // --- Public DTOs ---
    public record RepairRules(Double armorMultiplier, Double internalMultiplier, Double crippledMultiplier, Double destroyedMultiplier, Double nonMechModifier, Double mixedTechModifier, Double clanTechModifier) {

    }

    public record CampaignCreateInput(String name, String employer, String opponent, String mission, String employerCategory, String opponentCategory, String oppMission, String systemName, String description, String status, Double payRate, String salvageTerms, String supportTerms, String transportTerms, String commandRights, Integer payStep, Integer salvageStep, Integer supportStep, Integer transportStep, Integer commandStep, Double oppPayRate, Integer oppPayStep, String oppSalvageTerms, Integer oppSalvageStep, String oppSupportTerms, Integer oppSupportStep, String oppTransportTerms, Integer oppTransportStep, String oppCommandRights, Integer oppCommandStep, Integer trackCount, Integer lengthInMonths, Integer monthlyPay, Integer monthlyMaintenance, Integer transportationCost, Integer combatPay, RepairRules repairRules, List<GeneratedTrack> tracks) {

    }

    public record TrackUpdateInput(String trackName, Integer sequenceOrder, String location, String nextSession, UUID attackerFactionId, Integer monthIndex, String complications, String oppositionComplications, String afterActionNarrative) {

    }

    public record ResolvedStepEntry(Integer step, Map<String, String> values) {

    }

    public record MissionMetadata(List<String> primary, List<String> opponent) {

    }

    public record CampaignMetadata(MissionMetadata missions, List<String> trackTypes, List<String> factions, List<String> employerTypes, List<ResolvedStepEntry> resolvedSteps, RepairRules repairRules, List<String> unitTypes, List<String> techBases, List<String> unitStatuses) {

    }

    public record GeneratedTrack(String name, String complication, String oppositionComplication) {

    }

    public record CampaignProposal(Campaign campaign, List<Contract> contracts, List<GeneratedTrack> tracks) {

    }

    public record ActiveCampaignSummary(UUID id, String name, String systemName, Integer trackCount, String primaryEmployer, String secondaryEmployer) {

    }

    // --- Loaded Tables ---
    private EmployerTableConfig employerTableConfig;
    private SystemTableConfig systemTableConfig;
    private MissionTableConfig missionTableData;
    private TrackTableConfig trackTableData;
    private TrackCountTableConfig trackCountTableData;
    private ContractStepsTableConfig contractStepsTableConfig;
    private ComplicationsTableConfig complicationsTableConfig;
    private Map<String, List<String>> factionOrganizations;
    private List<String> corporateSuffixes;
    private List<String> noblePrefixes;
    private List<String> availableFactions;
    private List<String> availablePrimaryMissions;
    private List<String> availableOpponentMissions;
    private List<String> availableTrackTypes;
    private final Map<String, ContractTableConfigV2> contractTables = new HashMap<>();
    private int systemGroupDiceCount, systemGroupDiceSides, systemEntryDiceCount, systemEntryDiceSides;
    private List<IntensityTableEntry> trackIntensityTable;

    @PostConstruct
    public void init() throws IOException {
        log.trace("[TRACE] Starting init");
        ObjectMapper mapper = new ObjectMapper();
        log.info("Starting initialization of campaign rules from JSON configuration files.");

        employerTableConfig = loadMapTyped("employerTable.json", mapper, new TypeReference<EmployerTableConfig>() {
        });
        systemTableConfig = loadMapTyped("systemTable.json", mapper, new TypeReference<SystemTableConfig>() {
        });
        systemGroupDiceCount = Objects.requireNonNullElse(systemTableConfig.groupDiceCount(), 2);
        systemGroupDiceSides = Objects.requireNonNullElse(systemTableConfig.groupDiceSides(), 6);
        systemEntryDiceCount = Objects.requireNonNullElse(systemTableConfig.entryDiceCount(), 2);
        systemEntryDiceSides = Objects.requireNonNullElse(systemTableConfig.entryDiceSides(), 6);

        missionTableData = loadMapTyped("missionTable.json", mapper, new TypeReference<MissionTableConfig>() {
        });
        availableFactions = loadList("factions.json", mapper);
        availablePrimaryMissions = missionTableData.entries().stream().flatMap(entry -> entry.primary().entries().stream().map(RollEntry::value)).distinct().sorted().collect(Collectors.toList());
        availableOpponentMissions = missionTableData.entries().stream().flatMap(entry -> entry.opponent().entries().stream().map(RollEntry::value)).distinct().sorted().collect(Collectors.toList());

        trackTableData = loadMapTyped("trackTable.json", mapper, new TypeReference<TrackTableConfig>() {
        });
        availableTrackTypes = trackTableData.groups().stream().flatMap(g -> g.entries().stream()).map(RollEntry::value).distinct().sorted().collect(Collectors.toList());

        trackCountTableData = loadMapTyped("trackCountTable.json", mapper, new TypeReference<TrackCountTableConfig>() {
        });
        contractStepsTableConfig = loadMapTyped("contractStepsTable.json", mapper, new TypeReference<ContractStepsTableConfig>() {
        });
        complicationsTableConfig = loadMapTyped("complicationsTable.json", mapper, new TypeReference<ComplicationsTableConfig>() {
        });
        factionOrganizations = loadMapTyped("factionOrganizations.json", mapper, new TypeReference<Map<String, List<String>>>() {
        });
        corporateSuffixes = loadList("corporateSuffixes.json", mapper);
        noblePrefixes = loadList("noblePrefixes.json", mapper);

        String[] tableKeys = {"payRateTable", "salvageTable", "supportTable", "transportationTable", "commandRightsTable"};

        trackIntensityTable = loadMapTyped("trackIntensityTable.json", mapper, new TypeReference<List<IntensityTableEntry>>() {
        });

        for (String key : tableKeys) {
            contractTables.put(key, loadMapTyped(key + ".json", mapper, new TypeReference<ContractTableConfigV2>() {
            }));
        }
        log.info("Successfully loaded all campaign configuration tables.");
        log.trace("[TRACE] Finished init");
    }

    private <T> T loadMapTyped(String fileName, ObjectMapper mapper, TypeReference<T> typeReference) throws IOException {
        log.trace("[TRACE] Starting loadMapTyped: fileName={}", fileName);
        try (InputStream is = new ClassPathResource("rules/" + fileName).getInputStream()) {
            T result = mapper.readValue(is, typeReference);
            log.trace("[TRACE] Finished loadMapTyped: fileName={}", fileName);
            return result;
        } catch (IOException e) {
            log.error("CRITICAL: Failed to load configuration file: rules/{}", fileName, e);
            throw e;
        }
    }

    private List<String> loadList(String fileName, ObjectMapper mapper) throws IOException {
        log.trace("[TRACE] Starting loadList: fileName={}", fileName);
        try (InputStream is = new ClassPathResource("rules/" + fileName).getInputStream()) {
            List<String> result = mapper.readValue(is, new TypeReference<List<String>>() {
            });
            log.trace("[TRACE] Finished loadList: fileName={}", fileName);
            return result;
        } catch (IOException e) {
            log.error("CRITICAL: Failed to load rules list: rules/{}", fileName, e);
            throw e;
        }
    }

    // --- Metadata and Summaries ---
    public CampaignMetadata getCampaignMetadata() {
        log.trace("[TRACE] Starting getCampaignMetadata");
        RepairRules rules = new RepairRules(
                RulesConstants.REPAIR_MULT_ARMOR, RulesConstants.REPAIR_MULT_INTERNAL,
                RulesConstants.REPAIR_MULT_CRIPPLED, RulesConstants.REPAIR_MULT_DESTROYED,
                RulesConstants.REPAIR_MULT_NON_MECH_MODIFIER, RulesConstants.REPAIR_MULT_MIXED_TECH,
                RulesConstants.REPAIR_MULT_CLAN_TECH
        );

        List<ResolvedStepEntry> resolvedSteps = getResolvedStepsTable().entrySet().stream()
                .map(e -> new ResolvedStepEntry(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        CampaignMetadata metadata = new CampaignMetadata(
                new MissionMetadata(availablePrimaryMissions, availableOpponentMissions),
                availableTrackTypes, availableFactions,
                employerTableConfig.entries().stream().map(EmployerEntry::type).distinct().sorted().collect(Collectors.toList()),
                resolvedSteps, rules, RulesConstants.UNIT_TYPES, RulesConstants.TECH_BASES, RulesConstants.UNIT_STATUS_OPTIONS
        );
        log.trace("[TRACE] Finished getCampaignMetadata");
        return metadata;
    }

    public Map<Integer, Map<String, String>> getResolvedStepsTable() {
        log.trace("[TRACE] Starting getResolvedStepsTable");
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
        log.trace("[TRACE] Finished getResolvedStepsTable");
        return resolvedSteps;
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
        log.trace("[TRACE] Starting generateProposal");
        Random rand = new Random();
        boolean employerProvided = input.employer() != null && !input.employer().isEmpty();
        boolean opponentProvided = input.opponent() != null && !input.opponent().isEmpty();

        String finalEmp = employerProvided ? input.employer() : getRandomFaction(null);
        String finalOpp = opponentProvided ? input.opponent() : getRandomFaction(finalEmp);

        String empMission, oppMission;
        if (input.mission() == null || input.mission().isEmpty()) {
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
            empMission = input.mission();
            oppMission = input.oppMission() != null ? input.oppMission() : getOpposingMissionType(empMission, rand);
        }

        int finalTracksCount = Math.max(1, TypeUtils.asInt(input.trackCount(), rollTrackCount(empMission, rand)));
        String finalSystemName = (input.systemName() != null && !input.systemName().isEmpty()) ? input.systemName() : rollSystemName(rand);

        // Determine campaign duration based on mission type if not explicitly provided
        Integer calculatedLength = input.lengthInMonths();
        if (calculatedLength == null) {
            String missionLower = empMission.toLowerCase();
            if (missionLower.contains("raid") || missionLower.contains("expedition")) {
                calculatedLength = 3;
            } else if (missionLower.contains("garrison") || missionLower.contains("invasion")) {
                calculatedLength = 6;
            } else {
                calculatedLength = finalTracksCount;
            }
        }

        RepairRules rules = Objects.requireNonNullElse(input.repairRules(), new RepairRules(
                RulesConstants.REPAIR_MULT_ARMOR, RulesConstants.REPAIR_MULT_INTERNAL,
                RulesConstants.REPAIR_MULT_CRIPPLED, RulesConstants.REPAIR_MULT_DESTROYED,
                RulesConstants.REPAIR_MULT_NON_MECH_MODIFIER, RulesConstants.REPAIR_MULT_MIXED_TECH,
                RulesConstants.REPAIR_MULT_CLAN_TECH
        ));

        Contract primaryContract = generateContract(finalEmp, empMission, input.employerCategory(),
                input.payRate(), input.salvageTerms(), input.supportTerms(), input.transportTerms(), input.commandRights(),
                input.payStep(), input.salvageStep(), input.supportStep(), input.transportStep(), input.commandStep(), finalTracksCount, true, finalSystemName, rand, employerProvided);

        Campaign campaign = Campaign.builder()
                .name(input.name() != null && !input.name().isBlank() ? input.name() : finalSystemName.toUpperCase() + ": OP " + empMission.toUpperCase() + " [" + finalEmp + "]")
                .systemName(finalSystemName)
                .trackCount(finalTracksCount)
                .lengthInMonths(Math.max(1, calculatedLength))
                .description(input.description() != null && !input.description().isBlank() ? input.description() : "Theater established in the " + finalSystemName + " system.")
                .payRate(primaryContract.getPayRate()).payStep(primaryContract.getPayStep())
                .salvageTerms(primaryContract.getSalvageTerms()).salvageStep(primaryContract.getSalvageStep())
                .supportTerms(primaryContract.getSupportTerms()).supportStep(primaryContract.getSupportStep())
                .transportTerms(primaryContract.getTransportTerms()).transportStep(primaryContract.getTransportStep())
                .commandRights(primaryContract.getCommandRights()).commandStep(primaryContract.getCommandStep())
                .monthlyPay(TypeUtils.asInt(input.monthlyPay(), RulesConstants.DEFAULT_MONTHLY_PAY))
                .monthlyMaintenance(TypeUtils.asInt(input.monthlyMaintenance(), RulesConstants.DEFAULT_MONTHLY_MAINTENANCE))
                .transportationCost(TypeUtils.asInt(input.transportationCost(), RulesConstants.DEFAULT_TRANSPORTATION_COST))
                .combatPay(TypeUtils.asInt(input.combatPay(), RulesConstants.DEFAULT_COMBAT_PAY))
                .armorMultiplier(rules.armorMultiplier()).internalMultiplier(rules.internalMultiplier())
                .crippledMultiplier(rules.crippledMultiplier()).destroyedMultiplier(rules.destroyedMultiplier())
                .nonMechModifier(rules.nonMechModifier()).mixedTechModifier(rules.mixedTechModifier())
                .clanTechModifier(rules.clanTechModifier()).repairRules(rules)
                .status(input.status() != null && !input.status().isBlank() ? input.status() : "PREVIEW")
                .build();

        Contract oppositionContract = generateContract(finalOpp, oppMission, input.opponentCategory(),
                input.oppPayRate(), input.oppSalvageTerms(), input.oppSupportTerms(), input.oppTransportTerms(), input.oppCommandRights(),
                input.oppPayStep(), input.oppSalvageStep(), input.oppSupportStep(), input.oppTransportStep(), input.oppCommandStep(),
                finalTracksCount, false, finalSystemName, rand, opponentProvided);

        List<GeneratedTrack> tracksList = (input.tracks() != null && !input.tracks().isEmpty()) ? input.tracks()
                : generateTracks(empMission, primaryContract.getCommandRights(), oppositionContract.getCommandRights(), finalTracksCount, null);

        CampaignProposal proposal = new CampaignProposal(campaign, List.of(primaryContract, oppositionContract), tracksList);
        log.trace("[TRACE] Finished generateProposal");
        return proposal;
    }

    private Contract generateContract(String faction, String type, String category,
            Double payRate, String salvage, String support, String transport, String rights,
            Integer payStepIn, Integer salvageStepIn, Integer supportStepIn, Integer transportStepIn, Integer commandStepIn,
            int tracks, boolean isPrimary, String system, Random rand, boolean isUserProvided) {
        log.trace("[TRACE] Starting generateContract: faction={}, mission={}", faction, type);

        String employerCategory;
        int payStep, salvageStep, supportStep, transportStep, rightsStep;

        if (category != null) {
            // Path A: Explicit category provided (user edit "Name: Category" or refined proposal)
            employerCategory = faction + ": " + category;
            payStep = payStepIn != null ? payStepIn : calculateFinalStep("payRateTable", category, type, rand);
            salvageStep = salvageStepIn != null ? salvageStepIn : calculateFinalStep("salvageTable", category, type, rand);
            supportStep = supportStepIn != null ? supportStepIn : calculateFinalStep("supportTable", category, type, rand);
            transportStep = transportStepIn != null ? transportStepIn : calculateFinalStep("transportationTable", category, type, rand);
            rightsStep = commandStepIn != null ? commandStepIn : calculateFinalStep("commandRightsTable", category, type, rand);
        } else if (isUserProvided) {
            // Path B: User provided an employer name but removed/didn't provide a category suffix
            employerCategory = faction;
            String lookupType = "Minor Power"; // Default for table lookup when category is absent
            payStep = payStepIn != null ? payStepIn : calculateFinalStep("payRateTable", lookupType, type, rand);
            salvageStep = salvageStepIn != null ? salvageStepIn : calculateFinalStep("salvageTable", lookupType, type, rand);
            supportStep = supportStepIn != null ? supportStepIn : calculateFinalStep("supportTable", lookupType, type, rand);
            transportStep = transportStepIn != null ? transportStepIn : calculateFinalStep("transportationTable", lookupType, type, rand);
            rightsStep = commandStepIn != null ? commandStepIn : calculateFinalStep("commandRightsTable", lookupType, type, rand);
        } else {
            // Path C: Procedural generation (Initial Preview)
            String empType = rollEmployerType(rand);
            payStep = payStepIn != null ? payStepIn : calculateFinalStep("payRateTable", empType, type, rand);
            salvageStep = salvageStepIn != null ? salvageStepIn : calculateFinalStep("salvageTable", empType, type, rand);
            supportStep = supportStepIn != null ? supportStepIn : calculateFinalStep("supportTable", empType, type, rand);
            transportStep = transportStepIn != null ? transportStepIn : calculateFinalStep("transportationTable", empType, type, rand);
            rightsStep = commandStepIn != null ? commandStepIn : calculateFinalStep("commandRightsTable", empType, type, rand);

            String finalOrgName = empType.contains(" (") ? empType.substring(0, empType.indexOf(" (")) : getPlausibleOrganization(faction, empType, system, rand);
            String finalCategory = empType.contains(" (") ? empType.substring(empType.indexOf(" (") + 2, empType.length() - 1) : empType;
            employerCategory = finalOrgName + ": " + finalCategory;
        }

        Double resolvedPayRate = parsePayRate(resolveStepValue(payStep, "payRate"));

        return Contract.builder()
                .missionType(type)
                .employerCategory(employerCategory)
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

    // --- Utility Rolling Methods ---
    private String getPlausibleOrganization(String faction, String empType, String system, Random rand) {
        log.trace("[TRACE] Starting getPlausibleOrganization: faction={}, empType={}", faction, empType);
        List<String> factionOrgs = factionOrganizations.entrySet().stream()
                .filter(e -> faction.toLowerCase().contains(e.getKey().toLowerCase()))
                .map(Map.Entry::getValue).findFirst().orElse(List.of(faction));
        String baseOrg = factionOrgs.get(rand.nextInt(factionOrgs.size()));
        String result = baseOrg;
        if ("Corporate".equalsIgnoreCase(empType)) {
            result = baseOrg + " " + corporateSuffixes.get(rand.nextInt(corporateSuffixes.size()));
        } else if ("Noble".equalsIgnoreCase(empType)) {
            result = noblePrefixes.get(rand.nextInt(noblePrefixes.size())) + " of " + system;
        } else if (empType.toLowerCase().contains("government")) {
            result = system + " Planetary Council (" + baseOrg + ")";
        }

        log.trace("[TRACE] Finished getPlausibleOrganization");
        return result;
    }

    private Double parsePayRate(String raw) {
        log.trace("[TRACE] Starting parsePayRate: raw={}", raw);
        try {
            String clean = raw.replace("%", "").trim();
            double val = Double.parseDouble(clean);
            log.trace("[TRACE] Finished parsePayRate");
            return raw.contains("%") ? val / 100.0 : val;
        } catch (NumberFormatException e) {
            log.trace("[TRACE] Finished parsePayRate (fallback)");
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

    private int rollTrackCount(String missionType, Random rand) {
        log.trace("[TRACE] Starting rollTrackCount: missionType={}", missionType);
        int roll = rollDice(trackCountTableData.diceCount(), trackCountTableData.diceSides(), rand);
        var group = trackCountTableData.groups().stream().filter(g -> g.missions().stream().anyMatch(m -> missionMatches(missionType, m))).findFirst().orElse(trackCountTableData.groups().get(0));
        for (var entry : group.entries()) {
            if (roll >= entry.minRoll() && roll <= entry.maxRoll()) {
                log.trace("[TRACE] Finished rollTrackCount");
                return entry.value();
            }
        }
        log.trace("[TRACE] Finished rollTrackCount (fallback)");
        return 1;
    }

    public List<GeneratedTrack> generateTracks(String missionType, String commandRights, String oppCommandRights, int count, List<GeneratedTrack> existing) {
        log.trace("[TRACE] Starting generateTracks: count={}", count);
        Random rand = new Random();
        List<GeneratedTrack> tracksList = (existing != null) ? new java.util.ArrayList<>(existing) : new java.util.ArrayList<>();
        for (int i = tracksList.size(); i < count; i++) {
            tracksList.add(new GeneratedTrack(rollTrackType(missionType, rand), rollComplication(commandRights, rand), rollComplication(oppCommandRights, rand)));
        }
        log.trace("[TRACE] Finished generateTracks");
        return tracksList;
    }

    private String rollComplication(String commandRights, Random rand) {
        log.trace("[TRACE] Starting rollComplication: rights={}", commandRights);
        ComplicationRule rule = complicationsTableConfig.rules().getOrDefault(commandRights, complicationsTableConfig.rules().get("Independent"));
        int roll = rollDice(rule.diceCount(), rule.diceSides(), rand) + rule.modifier();
        String result = complicationsTableConfig.entries().stream().filter(e -> roll >= e.minRoll() && roll <= e.maxRoll()).map(RollEntry::value).findFirst().orElse("None");
        log.trace("[TRACE] Finished rollComplication");
        return result;
    }

    private String rollTrackType(String missionType, Random rand) {
        log.trace("[TRACE] Starting rollTrackType: missionType={}", missionType);
        int roll = rollDice(trackTableData.diceCount(), trackTableData.diceSides(), rand);
        var group = trackTableData.groups().stream().filter(g -> g.missions().stream().anyMatch(m -> missionMatches(missionType, m))).findFirst()
                .orElseGet(() -> trackTableData.groups().stream().filter(g -> g.missions().contains("Default")).findFirst().orElse(trackTableData.groups().get(0)));
        for (var entry : group.entries()) {
            if (roll >= entry.minRoll() && roll <= entry.maxRoll()) {
                log.trace("[TRACE] Finished rollTrackType");
                return entry.value();
            }
        }
        return group.entries().get(0).value();
    }

    private int calculateFinalStep(String tableKey, String empType, String missionType, Random rand) {
        log.trace("[TRACE] Starting calculateFinalStep: table={}, emp={}, mission={}", tableKey, empType, missionType);
        ContractTableConfigV2 config = contractTables.get(tableKey);
        if (config == null) {
            return 7;
        }
        int roll = rollDice(config.diceCount(), config.diceSides(), rand);
        int initialStep = config.rollToStep().stream().filter(r -> roll >= r.minRoll() && roll <= r.maxRoll()).map(RollToStepEntry::step).findFirst().orElse(6);
        int empMod = config.employerModifiers().entrySet().stream().filter(e -> empType.toLowerCase().contains(e.getKey().toLowerCase())).map(Map.Entry::getValue).findFirst().orElse(0);
        int missionMod = config.missionModifiers().entrySet().stream().filter(e -> missionMatches(missionType, e.getKey())).map(Map.Entry::getValue).findFirst().orElse(0);
        log.trace("[TRACE] Finished calculateFinalStep");
        return Math.max(1, Math.min(13, initialStep + empMod + missionMod));
    }

    private String rollEmployerType(Random rand) {
        log.trace("[TRACE] Starting rollEmployerType");
        int roll = rollDice(employerTableConfig.diceCount(), employerTableConfig.diceSides(), rand);
        String result = employerTableConfig.entries().stream().filter(e -> e.roll() == roll).map(EmployerEntry::type).findFirst().orElse("Other");
        log.trace("[TRACE] Finished rollEmployerType");
        return result;
    }

    private String rollSystemName(Random rand) {
        log.trace("[TRACE] Starting rollSystemName");
        int gRoll = rollDice(systemGroupDiceCount, systemGroupDiceSides, rand);
        int eRoll = rollDice(systemEntryDiceCount, systemEntryDiceSides, rand);
        String result = systemTableConfig.groups().stream().filter(g -> g.roll() == gRoll).flatMap(g -> g.entries().stream()).filter(e -> e.roll() == eRoll).map(SystemEntry::name).findFirst().orElse("Unknown");
        log.trace("[TRACE] Finished rollSystemName");
        return result;
    }

    private String resolveStepValue(int step, String column) {
        log.trace("[TRACE] Starting resolveStepValue: step={}, col={}", step, column);
        int currentStep = step;
        while (true) {
            final int lookup = currentStep;
            var entry = contractStepsTableConfig.entries().stream().filter(e -> e.step() == lookup).findFirst().orElse(null);
            String val = getColumnValue(entry, column);
            if (!"-".equals(val)) {
                log.trace("[TRACE] Finished resolveStepValue");
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
        log.trace("[TRACE] Starting resolveFromSubTable");
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
        log.trace("[TRACE] Starting getOpposingMissionType: mission={}", employerMission);
        for (var entry : missionTableData.entries()) {
            if (entry.primary().entries().stream().anyMatch(se -> missionMatches(employerMission, se.value()))) {
                return resolveFromSubTable(entry.opponent(), rand);
            }
        }
        return "Garrison";
    }

    // --- Operational Track Management ---
    @Transactional
    public Mono<Campaign> reconcileTracks(Campaign camp, int newCount) {
        log.trace("[TRACE] Starting reconcileTracks: campId={}, newCount={}", camp.getId(), newCount);
        camp.setNew(false);
        return campaignTrackRepository.findAllByCampaignId(camp.getId()).collectList()
                .flatMap(existing -> {
                    int targetCount = Math.max(1, newCount);
                    int actualCount = existing.size();
                    camp.setTrackCount(targetCount);

                    if (targetCount > actualCount) {
                        IntSupplier monthSupplier = getMonthSupplier(trackIntensityTable, camp.getLengthInMonths(), targetCount);
                        // Skip distribution indices for existing tracks to align new ones correctly
                        for (int i = 0; i < actualCount; i++) {
                            monthSupplier.getAsInt();
                        }
                        return contractRepository.findAllByCampaignId(camp.getId()).collectList()
                                .flatMap(contracts -> {
                                    Contract primary = contracts.stream().filter(c -> Boolean.TRUE.equals(c.getPrimaryContract())).findFirst().orElse(null);
                                    Contract opposition = contracts.stream().filter(c -> Boolean.FALSE.equals(c.getPrimaryContract())).findFirst().orElse(null);

                                    if (primary == null) {
                                        return Mono.empty();
                                    }

                                    String oppRights = (opposition != null && opposition.getCommandRights() != null) ? opposition.getCommandRights() : "Independent";
                                    List<GeneratedTrack> existingGen = existing.stream().map(t -> new GeneratedTrack(t.getTrackName(), t.getComplications(), t.getOppositionComplications())).toList();
                                    List<GeneratedTrack> allTracks = generateTracks(primary.getMissionType(), primary.getCommandRights(), oppRights, targetCount, existingGen);
                                    List<GeneratedTrack> newOnes = allTracks.subList(actualCount, allTracks.size());

                                    return Flux.fromIterable(newOnes).index().concatMap(tuple
                                            -> campaignTrackRepository.save(Objects.requireNonNull(
                                                    CampaignTrack.builder().id(UUID.randomUUID()).campaignId(camp.getId()).trackName(tuple.getT2().name()).complications(tuple.getT2().complication()).oppositionComplications(tuple.getT2().oppositionComplication())
                                                            .sequenceOrder(actualCount + tuple.getT1().intValue()).monthIndex(monthSupplier.getAsInt()).isNew(true).build())))
                                            .then(campaignRepository.save(camp));
                                })
                                .switchIfEmpty(Mono.defer(() -> Flux.range(actualCount, targetCount - actualCount)
                                .concatMap(i -> campaignTrackRepository.save(Objects.requireNonNull(
                                CampaignTrack.builder().id(UUID.randomUUID()).campaignId(camp.getId()).trackName("NEW OPERATIONAL TRACK").sequenceOrder(i).monthIndex(monthSupplier.getAsInt()).isNew(true).build())))
                                .then(campaignRepository.save(camp))));
                    }

                    if (targetCount < actualCount) {
                        List<CampaignTrack> toDelete = existing.stream().sorted((a, b) -> b.getSequenceOrder().compareTo(a.getSequenceOrder())).limit(actualCount - targetCount).toList();
                        return Flux.fromIterable(toDelete).flatMap(campaignTrackRepository::delete).then(campaignRepository.save(camp));
                    }
                    return campaignRepository.save(camp);
                })
                .doOnTerminate(() -> log.trace("[TRACE] Finished reconcileTracks"));
    }

    @Transactional
    public Mono<Campaign> generateDoblessCampaign(String managerId, CampaignCreateInput input) {
        log.trace("[TRACE] Starting generateDoblessCampaign: managerId={}, system={}", managerId, input.systemName());
        return userService.resolveOrCreateUser(managerId).flatMap(user -> {
            if (!"ROLE_AUTHENTICATED".equals(user.getRole())) {
                return Mono.error(new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Only Managers can create campaigns"));
            }

            CampaignProposal proposal = generateProposal(input);
            Campaign campaign = proposal.campaign();
            campaign.setId(campaign.getId() == null ? UUID.randomUUID() : campaign.getId());
            campaign.setManagerId(user.getId().toString());
            campaign.setNew(true);
            campaign.setStatus(input.status() != null && !input.status().isBlank() ? input.status() : "ACTIVE");

            final List<Contract> contractProposals = proposal.contracts();
            final String primaryEmp = (input.employer() != null && !input.employer().isBlank()) ? input.employer() : contractProposals.get(0).getEmployerCategory().split(": ", 2)[0];
            final String oppositionEmp = (input.opponent() != null && !input.opponent().isBlank()) ? input.opponent() : contractProposals.get(1).getEmployerCategory().split(": ", 2)[0];

            return campaignRepository.save(campaign).onErrorResume(DuplicateKeyException.class, e -> campaignRepository.findById(Objects.requireNonNull(campaign.getId())))
                    .flatMap(saved -> {
                        CampaignFaction f1 = CampaignFaction.builder().id(UUID.randomUUID()).campaignId(saved.getId()).factionName(primaryEmp).offersContracts(true).isNew(true).build();
                        CampaignFaction f2 = CampaignFaction.builder().id(UUID.randomUUID()).campaignId(saved.getId()).factionName(oppositionEmp).offersContracts(true).isNew(true).build();

                        return campaignFactionRepository.saveAll(Objects.requireNonNull(List.of(f1, f2))).collectList()
                                .flatMap(factions -> {
                                    Flux<Contract> conFlux = Flux.fromIterable(contractProposals).zipWith(Flux.fromIterable(factions)).concatMap(t -> {
                                        Contract c = t.getT1();
                                        c.setId(UUID.randomUUID());
                                        c.setCampaignId(saved.getId());
                                        c.setNew(true);
                                        c.setEmployerFactionId(t.getT2().getId());
                                        return contractRepository.save(c);
                                    });

                                    IntSupplier monthSupplier = getMonthSupplier(trackIntensityTable, saved.getLengthInMonths(), saved.getTrackCount());

                                    Flux<CampaignTrack> trackFlux = Flux.fromIterable(proposal.tracks()).index().concatMap(t -> {
                                        int idx = t.getT1().intValue();
                                        int monthIdx = monthSupplier.getAsInt();

                                        return campaignTrackRepository.save(Objects.requireNonNull(
                                                CampaignTrack.builder().id(UUID.randomUUID()).campaignId(saved.getId()).trackName(t.getT2().name()).complications(t.getT2().complication()).oppositionComplications(t.getT2().oppositionComplication())
                                                        .sequenceOrder(idx).monthIndex(monthIdx).isNew(true).build()));
                                    });
                                    return Mono.when(conFlux.then(), trackFlux.then()).thenReturn(saved);
                                });
                    });
        })
                .doOnTerminate(() -> log.trace("[TRACE] Finished generateDoblessCampaign"));
    }

    // --- Invite and Social Logic ---
    @Transactional
    public Mono<CampaignInvite> createInvite(@NonNull UUID campaignId, String recipientName, String userId) {
        log.trace("[TRACE] Starting createInvite: campaignId={}, user={}", campaignId, userId);
        return userService.resolveOrCreateUser(userId).flatMap(user -> campaignRepository.findById(campaignId).switchIfEmpty(Mono.error(new RuntimeException("Campaign not found"))).flatMap(camp -> {
            if (!camp.getManagerId().equals(user.getId().toString())) {
                return Mono.error(new RuntimeException("Access Denied: Not the campaign manager."));
            }
            return inviteService.generateInvite(campaignId, recipientName);
        }))
                .doOnTerminate(() -> log.trace("[TRACE] Finished createInvite"));
    }

    @Transactional
    public Mono<Boolean> joinCampaign(String token, @NonNull UUID detachmentId) {
        log.trace("[TRACE] Starting joinCampaign: detachmentId={}", detachmentId);
        return inviteService.validateAndConsumeInvite(token)
                .flatMap(invite -> detachmentRepository.findById(detachmentId)
                .switchIfEmpty(Mono.error(new RuntimeException("DETACHMENT NOT FOUND")))
                .flatMap(detachment -> {
                    detachment.setNew(false);
                    detachment.setCampaignId(invite.getCampaignId());
                    return detachmentRepository.save(detachment).thenReturn(true);
                }))
                .doOnTerminate(() -> log.trace("[TRACE] Finished joinCampaign"));
    }

    @Transactional
    public Mono<Boolean> deleteInvite(@NonNull UUID inviteId, String userId) {
        log.trace("[TRACE] Starting deleteInvite: inviteId={}, userId={}", inviteId, userId);
        return userService.resolveOrCreateUser(userId).flatMap(user -> campaignInviteRepository.findById(inviteId)
                .switchIfEmpty(Mono.error(new RuntimeException("Invite not found")))
                .flatMap(invite -> campaignRepository.findById(Objects.requireNonNull(invite.getCampaignId()))
                .flatMap(camp -> {
                    if (!camp.getManagerId().equals(user.getId().toString())) {
                        return Mono.error(new RuntimeException("Access Denied: Not the campaign manager."));
                    }
                    return campaignInviteRepository.delete(invite).thenReturn(true);
                })))
                .doOnTerminate(() -> log.trace("[TRACE] Finished deleteInvite"));
    }

    private IntSupplier getMonthSupplier(List<IntensityTableEntry> table, int length, int trackCount) {
        log.trace("[TRACE] Starting getMonthSupplier: length={}, tracks={}", length, trackCount);
        Random rand = new Random();

        IntensityTableEntry lengthEntry = table.stream()
                .filter(e -> e.campaignLength() == length)
                .findFirst().orElse(null);

        if (lengthEntry == null) {
            return new IntSupplier() {
                private int current = 1;

                @Override
                public int getAsInt() {
                    int val = current++;
                    return Math.min(val, length);
                }
            };
        }

        IntensityTracksConfig config = lengthEntry.tracks();
        int roll = rollDice(config.diceCount(), config.diceSides(), rand);

        IntensityTrackCountEntry countEntry = config.tracks().stream()
                .filter(e -> e.count() == trackCount)
                .findFirst().orElse(null);

        if (countEntry == null) {
            return new IntSupplier() {
                private int current = 1;

                @Override
                public int getAsInt() {
                    int val = current++;
                    return Math.min(val, length);
                }
            };
        }

        String intensityStr = countEntry.months().stream()
                .filter(m -> roll >= m.minRoll() && roll <= m.maxRoll())
                .map(IntensityMonthEntry::intensity)
                .findFirst().orElse("");

        List<Integer> distribution = new java.util.ArrayList<>();
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
                return (index < distribution.size()) ? Objects.requireNonNull(distribution.get(index++)) : length;
            }
        };
    }

    public Flux<CampaignInvite> getCampaignInvites(@NonNull UUID campaignId) {
        log.trace("[TRACE] Starting getCampaignInvites: campaignId={}", campaignId);
        return campaignInviteRepository.findAllByCampaignId(campaignId).doOnTerminate(() -> log.trace("[TRACE] Finished getCampaignInvites"));
    }

    @Transactional
    public Mono<CampaignTrack> rerollTrack(@NonNull UUID trackId, String managerId) {
        log.trace("[TRACE] Starting rerollTrack: trackId={}, managerId={}", trackId, managerId);
        return campaignTrackRepository.findById(trackId)
                .switchIfEmpty(Mono.error(new RuntimeException("Track not found")))
                .flatMap(track -> userService.resolveOrCreateUser(managerId).flatMap(user -> campaignRepository.findById(Objects.requireNonNull(track.getCampaignId()))
                .switchIfEmpty(Mono.error(new RuntimeException("Campaign not found")))
                .flatMap(campaign -> {
                    if (!campaign.getManagerId().equals(user.getId().toString())) {
                        return Mono.error(new RuntimeException("Access Denied: Only the theater manager can reroll tracks."));
                    }
                    return contractRepository.findAllByCampaignId(campaign.getId()).collectList()
                            .flatMap(contracts -> {
                                Contract primary = contracts.stream().filter(c -> Boolean.TRUE.equals(c.getPrimaryContract())).findFirst().orElse(null);
                                Contract opposition = contracts.stream().filter(c -> Boolean.FALSE.equals(c.getPrimaryContract())).findFirst().orElse(null);

                                if (primary == null) {
                                    return Mono.empty();
                                }

                                Random rand = new Random();
                                track.setTrackName(rollTrackType(primary.getMissionType(), rand));
                                track.setComplications(rollComplication(Objects.requireNonNullElse(primary.getCommandRights(), "Independent"), rand));
                                String oppRights = (opposition != null && opposition.getCommandRights() != null) ? opposition.getCommandRights() : "Independent";
                                track.setOppositionComplications(rollComplication(oppRights, rand));
                                track.setNew(false);
                                return campaignTrackRepository.save(track);
                            })
                            .switchIfEmpty(Mono.error(new RuntimeException("Primary contract not found for track context.")));
                })))
                .doOnTerminate(() -> log.trace("[TRACE] Finished rerollTrack"));
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
}
