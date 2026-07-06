package com.hotspotscamp.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Random;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import com.hotspotscamp.dto.CampaignCreateInput;
import com.hotspotscamp.dto.CampaignProposal;
import com.hotspotscamp.dto.GeneratedTrack;
import com.hotspotscamp.entity.Campaign;
import com.hotspotscamp.entity.Contract;
import com.hotspotscamp.dto.ruleConfiguration.ComplicationRule;
import com.hotspotscamp.dto.ruleConfiguration.ComplicationsTableConfig;
import com.hotspotscamp.dto.ruleConfiguration.ContractTableConfigV2;
import com.hotspotscamp.dto.ruleConfiguration.EmployerEntry;
import com.hotspotscamp.dto.ruleConfiguration.EmployerTableConfig;
import com.hotspotscamp.dto.ruleConfiguration.MissionTableConfig;
import com.hotspotscamp.dto.ruleConfiguration.RollEntry;
import com.hotspotscamp.dto.ruleConfiguration.RollToStepEntry;
import com.hotspotscamp.dto.ruleConfiguration.SubTable;
import com.hotspotscamp.dto.ruleConfiguration.SystemEntry;
import com.hotspotscamp.dto.ruleConfiguration.SystemTableConfig;
import com.hotspotscamp.dto.ruleConfiguration.TrackCountTableConfig;
import com.hotspotscamp.dto.ruleConfiguration.TrackTableConfig;
import com.hotspotscamp.util.TypeUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CampaignGenerationService {

    private final RuleConfigurationService configService;

    public CampaignProposal generateProposal(CampaignCreateInput input) {
        Random rand = new Random();
        boolean employerProvided = input.employer() != null && !input.employer().isEmpty();
        boolean opponentProvided = input.opponent() != null && !input.opponent().isEmpty();

        String finalEmp = employerProvided ? input.employer() : getRandomFaction(null);
        String finalOpp = opponentProvided ? input.opponent() : getRandomFaction(finalEmp);

        String empMission, oppMission;
        if (input.mission() == null || input.mission().isEmpty()) {
            MissionTableConfig missionTable = configService.getMissionTableData();
            int roll = rollDice(missionTable.diceCount(), missionTable.diceSides(), rand);
            empMission = "Unknown Mission";
            oppMission = "Unknown Opponent Mission";
            for (var entry : missionTable.entries()) {
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

        Integer inputTracks = TypeUtils.asInt(input.trackCount(), null);
        int finalTracksCount = Math.max(1, inputTracks != null ? inputTracks : rollTrackCount(empMission, rand));
        String finalSystemName = (input.systemName() != null && !input.systemName().isEmpty()) ? input.systemName() : rollSystemName(rand);

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
                .armorMultiplier(Objects.requireNonNullElse(input.armorMultiplier(), configService.getRepairMultiplier("armor")))
                .internalMultiplier(Objects.requireNonNullElse(input.internalMultiplier(), configService.getRepairMultiplier("internal")))
                .crippledMultiplier(Objects.requireNonNullElse(input.crippledMultiplier(), configService.getRepairMultiplier("crippled")))
                .destroyedMultiplier(Objects.requireNonNullElse(input.destroyedMultiplier(), configService.getRepairMultiplier("destroyed")))
                .nonMechModifier(Objects.requireNonNullElse(input.nonMechModifier(), configService.getRepairMultiplier("nonMech")))
                .mixedTechModifier(Objects.requireNonNullElse(input.mixedTechModifier(), configService.getRepairMultiplier("mixedTech")))
                .clanTechModifier(Objects.requireNonNullElse(input.clanTechModifier(), configService.getRepairMultiplier("clanTech")))
                .omnimechReconfigureModifier(Objects.requireNonNullElse(input.omnimechReconfigureModifier(), configService.getActivityCost("omnimechReconfigure")))
                .pvPurchaseUnitMultiplier(Objects.requireNonNullElse(input.pvPurchaseUnitMultiplier(), configService.getActivityCostInt("purchaseUnit")))
                .pvSellUnitMultiplier(Objects.requireNonNullElse(input.pvSellUnitMultiplier(), configService.getActivityCostInt("sellUnit")))
                .rearmCostPerTon(Objects.requireNonNullElse(input.rearmCostPerTon(), configService.getActivityCostInt("rearmTon")))
                .rearmCostPerTonAlphaStrike(Objects.requireNonNullElse(input.rearmCostPerTonAlphaStrike(), configService.getActivityCostInt("rearmAS")))
                .hireMechWarriorCost(Objects.requireNonNullElse(input.hireMechWarriorCost(), configService.getActivityCostInt("hireMechWarrior")))
                .hireNamedPilotCost(Objects.requireNonNullElse(input.hireNamedPilotCost(), configService.getActivityCostInt("hireNamedPilot")))
                .hireBattleArmorCost(Objects.requireNonNullElse(input.hireBattleArmorCost(), configService.getActivityCostInt("hireBattleArmor")))
                .healMechWarriorPerWoundBoxCost(Objects.requireNonNullElse(input.healMechWarriorPerWoundBoxCost(), configService.getActivityCostInt("healWound")))
                .healMechWarriorPerMonthLimit(Objects.requireNonNullElse(input.healMechWarriorPerMonthLimit(), configService.getActivityCostInt("healMonth")))
                .healBattleArmorCost(Objects.requireNonNullElse(input.healBattleArmorCost(), configService.getActivityCostInt("healBattleArmor")))
                .trainFormationCommanderCost(Objects.requireNonNullElse(input.trainFormationCommanderCost(), configService.getActivityCostInt("trainCommander")))
                .changeFormationTrainingCost(Objects.requireNonNullElse(input.changeFormationTrainingCost(), configService.getActivityCostInt("changeFormation")))
                .learnCommandAbility1Cost(Objects.requireNonNullElse(input.learnCommandAbility1Cost(), configService.getActivityCostInt("learnAbility1")))
                .learnCommandAbility2Cost(Objects.requireNonNullElse(input.learnCommandAbility2Cost(), configService.getActivityCostInt("learnAbility2")))
                .learnCommandAbility3Cost(Objects.requireNonNullElse(input.learnCommandAbility3Cost(), configService.getActivityCostInt("learnAbility3")))
                .replaceCommandAbilityCost(Objects.requireNonNullElse(input.replaceCommandAbilityCost(), configService.getActivityCostInt("replaceAbility")))
                .monthlyPay(TypeUtils.asInt(input.monthlyPay(), configService.getCampaignDefault("monthlyPay")))
                .monthlyMaintenance(TypeUtils.asInt(input.monthlyMaintenance(), configService.getCampaignDefault("monthlyMaintenance")))
                .transportationCost(TypeUtils.asInt(input.transportationCost(), configService.getCampaignDefault("transportationCost")))
                .combatPay(TypeUtils.asInt(input.combatPay(), configService.getCampaignDefault("combatPay")))
                .status(input.status() != null && !input.status().isBlank() ? input.status() : "PREVIEW")
                .build();

        Contract oppositionContract = generateContract(finalOpp, oppMission, input.opponentCategory(),
                input.oppPayRate(), input.oppSalvageTerms(), input.oppSupportTerms(), input.oppTransportTerms(), input.oppCommandRights(),
                input.oppPayStep(), input.oppSalvageStep(), input.oppSupportStep(), input.oppTransportStep(), input.oppCommandStep(),
                finalTracksCount, false, finalSystemName, rand, opponentProvided);

        List<GeneratedTrack> tracksList = (input.tracks() != null && !input.tracks().isEmpty()) ? input.tracks()
                : generateTracks(empMission, primaryContract.getCommandRights(), oppositionContract.getCommandRights(), finalTracksCount, null);

        return new CampaignProposal(
                campaign,
                List.of(primaryContract, oppositionContract),
                tracksList,
                finalEmp,
                finalOpp,
                campaign.getArmorMultiplier(),
                campaign.getInternalMultiplier(),
                campaign.getCrippledMultiplier(),
                campaign.getDestroyedMultiplier(),
                campaign.getNonMechModifier(),
                campaign.getMixedTechModifier(),
                campaign.getClanTechModifier(),
                campaign.getOmnimechReconfigureModifier(),
                campaign.getPvPurchaseUnitMultiplier(),
                campaign.getPvSellUnitMultiplier(),
                campaign.getRearmCostPerTon(),
                campaign.getRearmCostPerTonAlphaStrike(),
                campaign.getHireMechWarriorCost(),
                campaign.getHireNamedPilotCost(),
                campaign.getHireBattleArmorCost(),
                campaign.getHealMechWarriorPerWoundBoxCost(),
                campaign.getHealMechWarriorPerMonthLimit(),
                campaign.getHealBattleArmorCost(),
                campaign.getTrainFormationCommanderCost(),
                campaign.getChangeFormationTrainingCost(),
                campaign.getLearnCommandAbility1Cost(),
                campaign.getLearnCommandAbility2Cost(),
                campaign.getLearnCommandAbility3Cost(),
                campaign.getReplaceCommandAbilityCost());
    }

    private Contract generateContract(String faction, String type, String category,
            Double payRate, String salvage, String support, String transport, String rights,
            Integer payStepIn, Integer salvageStepIn, Integer supportStepIn, Integer transportStepIn, Integer commandStepIn,
            int tracks, boolean isPrimary, String system, Random rand, boolean isUserProvided) {
        String employerCategory;
        int payStep, salvageStep, supportStep, transportStep, rightsStep;

        if (category != null) {
            employerCategory = faction + ": " + category;
            payStep = payStepIn != null ? payStepIn : calculateFinalStep("payRateTable", category, type, rand);
            salvageStep = salvageStepIn != null ? salvageStepIn : calculateFinalStep("salvageTable", category, type, rand);
            supportStep = supportStepIn != null ? supportStepIn : calculateFinalStep("supportTable", category, type, rand);
            transportStep = transportStepIn != null ? transportStepIn : calculateFinalStep("transportationTable", category, type, rand);
            rightsStep = commandStepIn != null ? commandStepIn : calculateFinalStep("commandRightsTable", category, type, rand);
        } else if (isUserProvided) {
            employerCategory = faction;
            String lookupType = "Minor Power";
            payStep = payStepIn != null ? payStepIn : calculateFinalStep("payRateTable", lookupType, type, rand);
            salvageStep = salvageStepIn != null ? salvageStepIn : calculateFinalStep("salvageTable", lookupType, type, rand);
            supportStep = supportStepIn != null ? supportStepIn : calculateFinalStep("supportTable", lookupType, type, rand);
            transportStep = transportStepIn != null ? transportStepIn : calculateFinalStep("transportationTable", lookupType, type, rand);
            rightsStep = commandStepIn != null ? commandStepIn : calculateFinalStep("commandRightsTable", lookupType, type, rand);
        } else {
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

        return Contract.builder()
                .missionType(type).employerCategory(employerCategory)
                .payRate(payRate != null ? payRate : parsePayRate(resolveStepValue(payStep, "payRate")))
                .payStep(payStep)
                .salvageTerms(salvage != null ? salvage : resolveStepValue(salvageStep, "salvageRights")).salvageStep(salvageStep)
                .supportTerms(support != null ? support : resolveStepValue(supportStep, "supportRights")).supportStep(supportStep)
                .transportTerms(transport != null ? transport : resolveStepValue(transportStep, "transportation")).transportStep(transportStep)
                .commandRights(rights != null ? rights : resolveStepValue(rightsStep, "commandRights")).commandStep(rightsStep)
                .primaryContract(isPrimary).trackCount(tracks).build();
    }

    public List<GeneratedTrack> generateTracks(String missionType, String commandRights, String oppCommandRights, int count, List<GeneratedTrack> existing) {
        Random rand = new Random();
        List<GeneratedTrack> tracksList = (existing != null) ? new ArrayList<>(existing) : new ArrayList<>();
        for (int i = tracksList.size(); i < count; i++) {
            tracksList.add(new GeneratedTrack(rollTrackType(missionType, rand), rollComplication(commandRights, rand), rollComplication(oppCommandRights, rand)));
        }
        return tracksList;
    }

    public String rollComplication(String commandRights, Random rand) {
        ComplicationsTableConfig config = configService.getComplicationsTableConfig();
        ComplicationRule rule = config.rules().getOrDefault(commandRights, config.rules().get("Independent"));
        int roll = rollDice(rule.diceCount(), rule.diceSides(), rand) + rule.modifier();
        return config.entries().stream().filter(e -> roll >= e.minRoll() && roll <= e.maxRoll()).map(RollEntry::value).findFirst().orElse("None");
    }

    public String rollTrackType(String missionType, Random rand) {
        TrackTableConfig config = configService.getTrackTableData();
        int roll = rollDice(config.diceCount(), config.diceSides(), rand);
        var group = config.groups().stream().filter(g -> g.missions().stream().anyMatch(m -> missionMatches(missionType, m))).findFirst()
                .orElseGet(() -> config.groups().stream().filter(g -> g.missions().contains("Default")).findFirst().orElse(config.groups().get(0)));
        for (var entry : group.entries()) {
            if (roll >= entry.minRoll() && roll <= entry.maxRoll()) {
                return entry.value();
            }
        }
        return group.entries().get(0).value();
    }

    public int rollDice(int count, int sides, Random rand) {
        int sum = 0;
        for (int i = 0; i < count; i++) {
            sum += (rand.nextInt(sides) + 1);
        }
        return sum;
    }

    private int rollTrackCount(String missionType, Random rand) {
        TrackCountTableConfig config = configService.getTrackCountTableData();
        int roll = rollDice(config.diceCount(), config.diceSides(), rand);
        var group = config.groups().stream().filter(g -> g.missions().stream().anyMatch(m -> missionMatches(missionType, m))).findFirst().orElse(config.groups().get(0));
        for (var entry : group.entries()) {
            if (roll >= entry.minRoll() && roll <= entry.maxRoll()) {
                return entry.value();
            }
        }
        return 1;
    }

    private String rollSystemName(Random rand) {
        SystemTableConfig config = configService.getSystemTableConfig();
        int gRoll = rollDice(Objects.requireNonNullElse(config.groupDiceCount(), 2), Objects.requireNonNullElse(config.groupDiceSides(), 6), rand);
        int eRoll = rollDice(Objects.requireNonNullElse(config.entryDiceCount(), 2), Objects.requireNonNullElse(config.entryDiceSides(), 6), rand);
        return config.groups().stream().filter(g -> g.roll() == gRoll).flatMap(g -> g.entries().stream()).filter(e -> e.roll() == eRoll).map(SystemEntry::name).findFirst().orElse("Unknown");
    }

    private String rollEmployerType(Random rand) {
        EmployerTableConfig config = configService.getEmployerTableConfig();
        int roll = rollDice(config.diceCount(), config.diceSides(), rand);
        return config.entries().stream().filter(e -> e.roll() == roll).map(EmployerEntry::type).findFirst().orElse("Other");
    }

    private int calculateFinalStep(String tableKey, String empType, String missionType, Random rand) {
        ContractTableConfigV2 config = configService.getContractTables().get(tableKey);
        if (config == null) {
            return 7;
        }
        int roll = rollDice(config.diceCount(), config.diceSides(), rand);
        int initialStep = config.rollToStep().stream().filter(r -> roll >= r.minRoll() && roll <= r.maxRoll()).map(RollToStepEntry::step).findFirst().orElse(6);
        int empMod = config.employerModifiers().entrySet().stream().filter(e -> empType.toLowerCase().contains(e.getKey().toLowerCase())).map(Map.Entry::getValue).findFirst().orElse(0);
        int missionMod = config.missionModifiers().entrySet().stream().filter(e -> missionMatches(missionType, e.getKey())).map(Map.Entry::getValue).findFirst().orElse(0);
        return Math.max(1, Math.min(13, initialStep + empMod + missionMod));
    }

    private String resolveStepValue(int step, @NonNull String column) {
        int currentStep = step;
        while (true) {
            final int lookup = currentStep;
            var entry = configService.getContractStepsTableConfig().entries().stream().filter(e -> e.step() == lookup).findFirst().orElse(null);
            if (entry == null) {
                return "-";
            }
            String val = switch (Objects.requireNonNull(column)) {
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

    private String getOpposingMissionType(String employerMission, Random rand) {
        for (var entry : configService.getMissionTableData().entries()) {
            if (entry.primary().entries().stream().anyMatch(se -> missionMatches(employerMission, se.value()))) {
                return resolveFromSubTable(entry.opponent(), rand);
            }
        }
        return "Garrison";
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

    private String getRandomFaction(String exclude) {
        List<String> factions = configService.getAvailableFactions();
        if (factions == null || factions.isEmpty()) {
            return "Unknown Faction";
        }
        Random rand = new Random();
        String selected;
        do {
            selected = factions.get(rand.nextInt(factions.size()));
        } while (selected.equals(exclude) && factions.size() > 1);
        return selected;
    }

    private String getPlausibleOrganization(String faction, String empType, String system, Random rand) {
        List<String> factionOrgs = configService.getFactionOrganizations().entrySet().stream()
                .filter(e -> faction.toLowerCase().contains(e.getKey().toLowerCase()))
                .map(Map.Entry::getValue).findFirst().orElse(List.of(faction));
        String baseOrg = factionOrgs.get(rand.nextInt(factionOrgs.size()));
        if ("Corporate".equalsIgnoreCase(empType)) {
            return baseOrg + " " + configService.getCorporateSuffixes().get(rand.nextInt(configService.getCorporateSuffixes().size()));
        }
        if ("Noble".equalsIgnoreCase(empType)) {
            return configService.getNoblePrefixes().get(rand.nextInt(configService.getNoblePrefixes().size())) + " of " + system;
        }
        if (empType.toLowerCase().contains("government")) {
            return system + " Planetary Council (" + baseOrg + ")";
        }
        return baseOrg;
    }
}
