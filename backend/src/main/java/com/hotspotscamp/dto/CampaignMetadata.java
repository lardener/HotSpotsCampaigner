/*
 * HotSpots Campaigner - Battletech Mercenaries campaign management SaaS.
 * Copyright (C) 2026 Jose Ferrer
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
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
