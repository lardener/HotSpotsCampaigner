package com.hotspotscamp.service;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotspotscamp.dto.ruleConfiguration.AttackerDeterminationConfig;
import com.hotspotscamp.dto.ruleConfiguration.ComplicationsTableConfig;
import com.hotspotscamp.dto.ruleConfiguration.ContractStepEntry;
import com.hotspotscamp.dto.ruleConfiguration.ContractStepsTableConfig;
import com.hotspotscamp.dto.ruleConfiguration.ContractTableConfigV2;
import com.hotspotscamp.dto.ruleConfiguration.EmployerTableConfig;
import com.hotspotscamp.dto.ruleConfiguration.IntensityTableEntry;
import com.hotspotscamp.dto.ruleConfiguration.MissionTableConfig;
import com.hotspotscamp.dto.ruleConfiguration.RollEntry;
import com.hotspotscamp.dto.ruleConfiguration.SystemTableConfig;
import com.hotspotscamp.dto.ruleConfiguration.TrackCountTableConfig;
import com.hotspotscamp.dto.ruleConfiguration.TrackTableConfig;
import com.hotspotscamp.util.RulesConstants;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RuleConfigurationService {

    private static final Logger log = LoggerFactory.getLogger(RuleConfigurationService.class);

    // Loaded Tables
    private EmployerTableConfig employerTableConfig;
    private SystemTableConfig systemTableConfig;
    private MissionTableConfig missionTableData;
    private TrackTableConfig trackTableData;
    private TrackCountTableConfig trackCountTableData;
    private ContractStepsTableConfig contractStepsTableConfig;
    private ComplicationsTableConfig complicationsTableConfig;
    private Map<String, List<String>> factionOrganizations;
    private AttackerDeterminationConfig attackerDeterminationConfig;
    private List<String> corporateSuffixes;
    private List<String> noblePrefixes;
    private List<String> availableFactions;
    private List<String> availablePrimaryMissions;
    private List<String> availableOpponentMissions;
    private List<String> availableTrackTypes;
    private final Map<String, ContractTableConfigV2> contractTables = new HashMap<>();
    private List<IntensityTableEntry> trackIntensityTable;

    @PostConstruct
    public void init() throws IOException {
        log.info("Starting initialization of campaign rules from JSON configuration files.");
        ObjectMapper mapper = new ObjectMapper();

        employerTableConfig = loadMapTyped("employerTable.json", mapper, new TypeReference<>() {
        });
        systemTableConfig = loadMapTyped("systemTable.json", mapper, new TypeReference<>() {
        });
        missionTableData = loadMapTyped("missionTable.json", mapper, new TypeReference<>() {
        });
        availableFactions = loadList("factions.json", mapper);

        availablePrimaryMissions = missionTableData.entries().stream()
                .flatMap(entry -> entry.primary().entries().stream().map(RollEntry::value)).distinct().sorted().toList();
        availableOpponentMissions = missionTableData.entries().stream()
                .flatMap(entry -> entry.opponent().entries().stream().map(RollEntry::value)).distinct().sorted().toList();

        trackTableData = loadMapTyped("trackTable.json", mapper, new TypeReference<>() {
        });
        availableTrackTypes = trackTableData.groups().stream()
                .flatMap(g -> g.entries().stream()).map(RollEntry::value).distinct().sorted().toList();

        trackCountTableData = loadMapTyped("trackCountTable.json", mapper, new TypeReference<>() {
        });
        contractStepsTableConfig = loadMapTyped("contractStepsTable.json", mapper, new TypeReference<>() {
        });
        complicationsTableConfig = loadMapTyped("complicationsTable.json", mapper, new TypeReference<>() {
        });
        factionOrganizations = loadMapTyped("factionOrganizations.json", mapper, new TypeReference<>() {
        });
        corporateSuffixes = loadList("corporateSuffixes.json", mapper);
        noblePrefixes = loadList("noblePrefixes.json", mapper);
        trackIntensityTable = loadMapTyped("trackIntensityTable.json", mapper, new TypeReference<>() {
        });
        attackerDeterminationConfig = loadMapTyped("attackerDeterminationTable.json", mapper, new TypeReference<>() {
        });

        String[] tableKeys = {"payRateTable", "salvageTable", "supportTable", "transportationTable", "commandRightsTable"};
        for (String key : tableKeys) {
            contractTables.put(key, loadMapTyped(key + ".json", mapper, new TypeReference<>() {
            }));
        }
        log.info("Successfully loaded all campaign configuration tables.");
    }

    private <T> T loadMapTyped(String fileName, ObjectMapper mapper, TypeReference<T> typeReference) throws IOException {
        try (InputStream is = new ClassPathResource("rules/" + fileName).getInputStream()) {
            return mapper.readValue(is, typeReference);
        } catch (IOException e) {
            log.error("CRITICAL: Failed to load configuration file: rules/{}", fileName, e);
            throw e;
        }
    }

    private List<String> loadList(String fileName, ObjectMapper mapper) throws IOException {
        try (InputStream is = new ClassPathResource("rules/" + fileName).getInputStream()) {
            return mapper.readValue(is, new TypeReference<>() {
            });
        } catch (IOException e) {
            log.error("CRITICAL: Failed to load rules list: rules/{}", fileName, e);
            throw e;
        }
    }

    public Map<Integer, Map<String, String>> getResolvedStepsTable() {
        Map<Integer, Map<String, String>> resolvedSteps = new HashMap<>();
        if (contractStepsTableConfig == null || contractStepsTableConfig.entries() == null) {
            return resolvedSteps;
        }
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
     * Look up default repair multipliers. In the future, these will be sourced
     * from configuration files to support different rulesets.
     */
    public Double getRepairMultiplier(String key) {
        return switch (key) {
            case "armor" ->
                RulesConstants.REPAIR_MULT_ARMOR;
            case "internal" ->
                RulesConstants.REPAIR_MULT_INTERNAL;
            case "crippled" ->
                RulesConstants.REPAIR_MULT_CRIPPLED;
            case "destroyed" ->
                RulesConstants.REPAIR_MULT_DESTROYED;
            case "nonMech" ->
                RulesConstants.REPAIR_MULT_NON_MECH_MODIFIER;
            case "mixedTech" ->
                RulesConstants.REPAIR_MULT_MIXED_TECH;
            case "clanTech" ->
                RulesConstants.REPAIR_MULT_CLAN_TECH;
            default ->
                1.0;
        };
    }

    /**
     * Look up default activity costs (Double values).
     */
    public Double getActivityCost(String key) {
        if ("omnimechReconfigure".equals(key)) {
            return RulesConstants.OMNIMECH_RECONFIGURE_MODIFIER;
        }
        return (double) getActivityCostInt(key);
    }

    /**
     * Look up default activity costs (Integer values).
     */
    public Integer getActivityCostInt(String key) {
        return switch (key) {
            case "purchaseUnit" ->
                RulesConstants.PURCHASE_UNIT_POINT_VALUE_MULTIPLIER;
            case "sellUnit" ->
                RulesConstants.SELLING_UNIT_POINT_VALUE_MULTIPLIER;
            case "rearmTon" ->
                RulesConstants.REARM_COST_PER_TON;
            case "rearmAS" ->
                RulesConstants.REARM_COST_ALPHA_STRIKE;
            case "hireMechWarrior" ->
                RulesConstants.HIRE_NON_NAMED_MECHWARRIOR_CREW;
            case "hireNamedPilot" ->
                RulesConstants.HIRE_NAMED_PILOT;
            case "hireBattleArmor" ->
                RulesConstants.HIRE_BATTLE_ARMOR_TROOPER;
            case "healWound" ->
                RulesConstants.HEAL_MECHWARRIOR_PER_WOUND_BOX;
            case "healMonth" ->
                RulesConstants.HEAL_MECHWARRIOR_PER_MONTH;
            case "healBattleArmor" ->
                RulesConstants.HEAL_BATTLE_ARMOR_TROOPER;
            case "trainCommander" ->
                RulesConstants.TRAIN_FORMATION_COMMANDER;
            case "changeFormation" ->
                RulesConstants.CHANGE_FORMATION_TRAINING;
            case "learnAbility1" ->
                RulesConstants.LEARN_FIRST_COMMAND_ABILITY;
            case "learnAbility2" ->
                RulesConstants.LEARN_SECOND_COMMAND_ABILITY;
            case "learnAbility3" ->
                RulesConstants.LEARN_THIRD_COMMAND_ABILITY;
            case "replaceAbility" ->
                RulesConstants.REPLACE_COMMAND_ABILITY;
            default ->
                0;
        };
    }

    public Integer getCampaignDefault(String key) {
        return switch (key) {
            case "monthlyPay" ->
                RulesConstants.DEFAULT_MONTHLY_PAY;
            case "monthlyMaintenance" ->
                RulesConstants.DEFAULT_MONTHLY_MAINTENANCE;
            case "transportationCost" ->
                RulesConstants.DEFAULT_TRANSPORTATION_COST;
            case "combatPay" ->
                RulesConstants.DEFAULT_COMBAT_PAY;
            default ->
                0;
        };
    }

    public Integer getCommandDefault(String key) {
        return switch (key) {
            case "startingSP" ->
                RulesConstants.STARTING_SUPPORT_POINTS;
            case "startingRep" ->
                RulesConstants.STARTING_REPUTATION;
            default ->
                0;
        };
    }

    // Getters
    public EmployerTableConfig getEmployerTableConfig() {
        return employerTableConfig;
    }

    public SystemTableConfig getSystemTableConfig() {
        return systemTableConfig;
    }

    public MissionTableConfig getMissionTableData() {
        return missionTableData;
    }

    public TrackTableConfig getTrackTableData() {
        return trackTableData;
    }

    public TrackCountTableConfig getTrackCountTableData() {
        return trackCountTableData;
    }

    public ContractStepsTableConfig getContractStepsTableConfig() {
        return contractStepsTableConfig;
    }

    public ComplicationsTableConfig getComplicationsTableConfig() {
        return complicationsTableConfig;
    }

    public Map<String, List<String>> getFactionOrganizations() {
        return factionOrganizations;
    }

    public List<String> getCorporateSuffixes() {
        return corporateSuffixes;
    }

    public List<String> getNoblePrefixes() {
        return noblePrefixes;
    }

    public List<String> getAvailableFactions() {
        return availableFactions;
    }

    public List<String> getAvailablePrimaryMissions() {
        return availablePrimaryMissions;
    }

    public List<String> getAvailableOpponentMissions() {
        return availableOpponentMissions;
    }

    public List<String> getAvailableTrackTypes() {
        return availableTrackTypes;
    }

    public Map<String, ContractTableConfigV2> getContractTables() {
        return contractTables;
    }

    public List<IntensityTableEntry> getTrackIntensityTable() {
        return trackIntensityTable;
    }

    public AttackerDeterminationConfig getAttackerDeterminationConfig() {
        return attackerDeterminationConfig;
    }
}
