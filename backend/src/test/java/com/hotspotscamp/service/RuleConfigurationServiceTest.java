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
package com.hotspotscamp.service;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.hotspotscamp.dto.ruleConfiguration.ContractStepEntry;
import com.hotspotscamp.dto.ruleConfiguration.ContractStepsTableConfig;
import com.hotspotscamp.util.RulesConstants;

@ExtendWith(MockitoExtension.class)
class RuleConfigurationServiceTest {

    @InjectMocks
    private RuleConfigurationService ruleConfigurationService;

    @Test
    void getResolvedStepsTable_ShouldReturnCorrectMappings() {
        // Arrange
        ContractStepEntry entry = new ContractStepEntry(
                7, "100%", "None", "None", "None", "House");
        ContractStepsTableConfig config = new ContractStepsTableConfig(
                2, 6, List.of(entry));

        ReflectionTestUtils.setField(ruleConfigurationService, "contractStepsTableConfig", config);

        // Act
        Map<Integer, Map<String, String>> result = ruleConfigurationService.getResolvedStepsTable();

        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey(7));
        assertEquals("100%", result.get(7).get("payRate"));
        assertEquals("House", result.get(7).get("commandRights"));
    }

    @Test
    void getResolvedStepsTable_emptyConfig_returnsEmptyMap() {
        ReflectionTestUtils.setField(ruleConfigurationService, "contractStepsTableConfig", null);
        assertTrue(ruleConfigurationService.getResolvedStepsTable().isEmpty());
    }

    @Test
    void getRepairMultiplier_returnsConstantPerKey() {
        assertEquals(RulesConstants.REPAIR_MULT_ARMOR, ruleConfigurationService.getRepairMultiplier("armor"));
        assertEquals(RulesConstants.REPAIR_MULT_INTERNAL, ruleConfigurationService.getRepairMultiplier("internal"));
        assertEquals(RulesConstants.REPAIR_MULT_CRIPPLED, ruleConfigurationService.getRepairMultiplier("crippled"));
        assertEquals(RulesConstants.REPAIR_MULT_DESTROYED, ruleConfigurationService.getRepairMultiplier("destroyed"));
        assertEquals(RulesConstants.REPAIR_MULT_NON_MECH_MODIFIER, ruleConfigurationService.getRepairMultiplier("nonMech"));
        assertEquals(RulesConstants.REPAIR_MULT_MIXED_TECH, ruleConfigurationService.getRepairMultiplier("mixedTech"));
        assertEquals(RulesConstants.REPAIR_MULT_CLAN_TECH, ruleConfigurationService.getRepairMultiplier("clanTech"));
        assertEquals(1.0, ruleConfigurationService.getRepairMultiplier("unknown"));
    }

    @Test
    void getActivityCost_returnsIntOrOmnimechModifier() {
        assertEquals(RulesConstants.OMNIMECH_RECONFIGURE_MODIFIER,
                ruleConfigurationService.getActivityCost("omnimechReconfigure"));
        assertEquals((double) RulesConstants.HIRE_NAMED_PILOT,
                ruleConfigurationService.getActivityCost("hireNamedPilot"));
        assertEquals(0.0, ruleConfigurationService.getActivityCost("unknown"));
    }

    @Test
    void getActivityCostInt_mapsAllKeys() {
        assertEquals(RulesConstants.PURCHASE_UNIT_POINT_VALUE_MULTIPLIER, ruleConfigurationService.getActivityCostInt("purchaseUnit"));
        assertEquals(RulesConstants.SELLING_UNIT_POINT_VALUE_MULTIPLIER, ruleConfigurationService.getActivityCostInt("sellUnit"));
        assertEquals(RulesConstants.REARM_COST_PER_TON, ruleConfigurationService.getActivityCostInt("rearmTon"));
        assertEquals(RulesConstants.REARM_COST_ALPHA_STRIKE, ruleConfigurationService.getActivityCostInt("rearmAS"));
        assertEquals(RulesConstants.HIRE_NON_NAMED_MECHWARRIOR_CREW, ruleConfigurationService.getActivityCostInt("hireMechWarrior"));
        assertEquals(RulesConstants.HIRE_NAMED_PILOT, ruleConfigurationService.getActivityCostInt("hireNamedPilot"));
        assertEquals(RulesConstants.HIRE_BATTLE_ARMOR_TROOPER, ruleConfigurationService.getActivityCostInt("hireBattleArmor"));
        assertEquals(RulesConstants.HEAL_MECHWARRIOR_PER_WOUND_BOX, ruleConfigurationService.getActivityCostInt("healWound"));
        assertEquals(RulesConstants.HEAL_MECHWARRIOR_PER_MONTH, ruleConfigurationService.getActivityCostInt("healMonth"));
        assertEquals(RulesConstants.HEAL_BATTLE_ARMOR_TROOPER, ruleConfigurationService.getActivityCostInt("healBattleArmor"));
        assertEquals(RulesConstants.TRAIN_FORMATION_COMMANDER, ruleConfigurationService.getActivityCostInt("trainCommander"));
        assertEquals(RulesConstants.CHANGE_FORMATION_TRAINING, ruleConfigurationService.getActivityCostInt("changeFormation"));
        assertEquals(RulesConstants.LEARN_FIRST_COMMAND_ABILITY, ruleConfigurationService.getActivityCostInt("learnAbility1"));
        assertEquals(RulesConstants.LEARN_SECOND_COMMAND_ABILITY, ruleConfigurationService.getActivityCostInt("learnAbility2"));
        assertEquals(RulesConstants.LEARN_THIRD_COMMAND_ABILITY, ruleConfigurationService.getActivityCostInt("learnAbility3"));
        assertEquals(RulesConstants.REPLACE_COMMAND_ABILITY, ruleConfigurationService.getActivityCostInt("replaceAbility"));
        assertEquals(0, ruleConfigurationService.getActivityCostInt("unknown"));
    }

    @Test
    void getCampaignDefault_mapsAllKeys() {
        assertEquals(RulesConstants.DEFAULT_MONTHLY_PAY, ruleConfigurationService.getCampaignDefault("monthlyPay"));
        assertEquals(RulesConstants.DEFAULT_MONTHLY_MAINTENANCE, ruleConfigurationService.getCampaignDefault("monthlyMaintenance"));
        assertEquals(RulesConstants.DEFAULT_TRANSPORTATION_COST, ruleConfigurationService.getCampaignDefault("transportationCost"));
        assertEquals(RulesConstants.DEFAULT_COMBAT_PAY, ruleConfigurationService.getCampaignDefault("combatPay"));
        assertEquals(0, ruleConfigurationService.getCampaignDefault("unknown"));
    }

    @Test
    void getCommandDefault_mapsAllKeys() {
        assertEquals(RulesConstants.STARTING_SUPPORT_POINTS, ruleConfigurationService.getCommandDefault("startingSP"));
        assertEquals(RulesConstants.STARTING_REPUTATION, ruleConfigurationService.getCommandDefault("startingRep"));
        assertEquals(0, ruleConfigurationService.getCommandDefault("unknown"));
    }
}
