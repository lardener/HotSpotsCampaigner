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
package com.hotspotscamp.util;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;

class RulesConstantsTest {

    @Test
    void financialRates_matchExpectedDefaults() {
        assertEquals(500, RulesConstants.DEFAULT_MONTHLY_PAY);
        assertEquals(500, RulesConstants.DEFAULT_MONTHLY_MAINTENANCE);
        assertEquals(300, RulesConstants.DEFAULT_TRANSPORTATION_COST);
        assertEquals(500, RulesConstants.DEFAULT_COMBAT_PAY);
    }

    @Test
    void commandInitialization_matchExpectedDefaults() {
        assertEquals(3000, RulesConstants.STARTING_SUPPORT_POINTS);
        assertEquals(1, RulesConstants.STARTING_REPUTATION);
    }

    @Test
    void repairMultipliers_matchExpectedDefaults() {
        assertEquals(0.5, RulesConstants.REPAIR_MULT_ARMOR);
        assertEquals(2.0, RulesConstants.REPAIR_MULT_INTERNAL);
        assertEquals(3.0, RulesConstants.REPAIR_MULT_CRIPPLED);
        assertEquals(5.0, RulesConstants.REPAIR_MULT_DESTROYED);
        assertEquals(0.5, RulesConstants.REPAIR_MULT_NON_MECH_MODIFIER);
        assertEquals(1.5, RulesConstants.REPAIR_MULT_MIXED_TECH);
        assertEquals(2.0, RulesConstants.REPAIR_MULT_CLAN_TECH);
    }

    @Test
    void spActivityCosts_matchExpectedDefaults() {
        assertEquals(0.5, RulesConstants.OMNIMECH_RECONFIGURE_MODIFIER);
        assertEquals(40, RulesConstants.PURCHASE_UNIT_POINT_VALUE_MULTIPLIER);
        assertEquals(20, RulesConstants.SELLING_UNIT_POINT_VALUE_MULTIPLIER);
        assertEquals(10, RulesConstants.REARM_COST_PER_TON);
        assertEquals(20, RulesConstants.REARM_COST_ALPHA_STRIKE);
        assertEquals(100, RulesConstants.HIRE_NON_NAMED_MECHWARRIOR_CREW);
        assertEquals(150, RulesConstants.HIRE_NAMED_PILOT);
        assertEquals(20, RulesConstants.HIRE_BATTLE_ARMOR_TROOPER);
        assertEquals(30, RulesConstants.HEAL_MECHWARRIOR_PER_WOUND_BOX);
        assertEquals(2, RulesConstants.HEAL_MECHWARRIOR_PER_MONTH);
        assertEquals(10, RulesConstants.HEAL_BATTLE_ARMOR_TROOPER);
        assertEquals(500, RulesConstants.TRAIN_FORMATION_COMMANDER);
        assertEquals(250, RulesConstants.CHANGE_FORMATION_TRAINING);
        assertEquals(250, RulesConstants.LEARN_FIRST_COMMAND_ABILITY);
        assertEquals(500, RulesConstants.LEARN_SECOND_COMMAND_ABILITY);
        assertEquals(750, RulesConstants.LEARN_THIRD_COMMAND_ABILITY);
        assertEquals(250, RulesConstants.REPLACE_COMMAND_ABILITY);
    }

    @Test
    void assetTaxonomy_listsArePopulated() {
        List<String> unitTypes = RulesConstants.UNIT_TYPES;
        List<String> techBases = RulesConstants.TECH_BASES;
        List<String> statuses = RulesConstants.UNIT_STATUS_OPTIONS;

        assertFalse(unitTypes.isEmpty());
        assertTrue(unitTypes.contains("BM"));
        assertTrue(unitTypes.contains("BA"));
        assertTrue(techBases.contains("Clan"));
        assertTrue(statuses.contains("DESTROYED"));
        assertTrue(statuses.contains("TRULY DESTROYED"));
    }
}
