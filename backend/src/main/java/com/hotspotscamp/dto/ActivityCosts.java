package com.hotspotscamp.dto;

public record ActivityCosts(
        Double omnimechReconfigureModifier,
        Integer purchaseUnitMultiplier,
        Integer sellUnitMultiplier,
        Integer rearmCostPerTon,
        Integer rearmCostPerTonAlphaStrike,
        Integer hireMechWarriorCost,
        Integer hireNamedPilotCost,
        Integer hireBattleArmorCost,
        Integer healMechWarriorPerWoundBoxCost,
        Integer healMechWarriorPerMonthCost,
        Integer healBattleArmorCost,
        Integer trainFormationCommanderCost,
        Integer changeFormationTrainingCost,
        Integer learnFirstAbilityCost,
        Integer learnSecondAbilityCost,
        Integer learnThirdAbilityCost,
        Integer replaceAbilityCost
        ) {

}
