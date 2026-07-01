package com.hotspotscamp.dto;

import java.util.List;

import com.hotspotscamp.dto.ruleConfiguration.MissionMetadata;
import com.hotspotscamp.dto.ruleConfiguration.ResolvedStepEntry;

public record CampaignMetadata(
        MissionMetadata missions,
        List<String> trackTypes,
        List<String> factions,
        List<String> employerTypes,
        List<ResolvedStepEntry> resolvedSteps,
        List<String> unitTypes,
        List<String> techBases,
        List<String> unitStatuses,
        Double armorMultiplier,
        Double internalMultiplier,
        Double crippledMultiplier,
        Double destroyedMultiplier,
        Double nonMechModifier,
        Double mixedTechModifier,
        Double clanTechModifier,
        Double omnimechReconfigureModifier,
        Integer pvPurchaseUnitMultiplier,
        Integer pvSellUnitMultiplier,
        Integer rearmCostPerTon,
        Integer rearmCostPerTonAlphaStrike,
        Integer hireMechWarriorCost,
        Integer hireNamedPilotCost,
        Integer hireBattleArmorCost,
        Integer healMechWarriorPerWoundBoxCost,
        Integer healMechWarriorPerMonthLimit,
        Integer healBattleArmorCost,
        Integer trainFormationCommanderCost,
        Integer changeFormationTrainingCost,
        Integer learnCommandAbility1Cost,
        Integer learnCommandAbility2Cost,
        Integer learnCommandAbility3Cost,
        Integer replaceCommandAbilityCost) {

}
