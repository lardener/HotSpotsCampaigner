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

/**
 * Centralized constants for Battletech Campaign rulesets. Defaults aligned with
 * Chaos Campaign: Hinterlands and Hot Spots: Draconis Reach.
 * 
 * NOTE: Multipliers and Costs are being migrated to RuleConfigurationService
 * to support dynamic rulesets and external configuration.
 */
public class RulesConstants {

    // Default Financial Rates (SP)
    public static final int DEFAULT_MONTHLY_PAY = 500;
    public static final int DEFAULT_MONTHLY_MAINTENANCE = 500;
    public static final int DEFAULT_TRANSPORTATION_COST = 300;
    public static final int DEFAULT_COMBAT_PAY = 500;

    // Command Initialization
    public static final int STARTING_SUPPORT_POINTS = 3000;
    public static final int STARTING_REPUTATION = 1;

    // Repair Multipliers (Cost = Tonnage * Multiplier)
    public static final double REPAIR_MULT_ARMOR = 0.5;
    public static final double REPAIR_MULT_INTERNAL = 2.0;
    public static final double REPAIR_MULT_CRIPPLED = 3.0;
    public static final double REPAIR_MULT_DESTROYED = 5.0;
    public static final double REPAIR_MULT_NON_MECH_MODIFIER = 0.5; // For CV, BA, CI
    public static final double REPAIR_MULT_MIXED_TECH = 1.5;
    public static final double REPAIR_MULT_CLAN_TECH = 2.0;

    // SP Activity Costs
    public static final double OMNIMECH_RECONFIGURE_MODIFIER = 0.5;
    public static final int PURCHASE_UNIT_POINT_VALUE_MULTIPLIER = 40;
    public static final int SELLING_UNIT_POINT_VALUE_MULTIPLIER = 20;
    public static final int REARM_COST_PER_TON = 10;
    public static final int REARM_COST_ALPHA_STRIKE = 20;
    public static final int HIRE_NON_NAMED_MECHWARRIOR_CREW = 100;
    public static final int HIRE_NAMED_PILOT = 150;
    public static final int HIRE_BATTLE_ARMOR_TROOPER = 20;
    public static final int HEAL_MECHWARRIOR_PER_WOUND_BOX = 30;
    public static final int HEAL_MECHWARRIOR_PER_MONTH = 2;
    public static final int HEAL_BATTLE_ARMOR_TROOPER = 10;
    public static final int TRAIN_FORMATION_COMMANDER = 500;
    public static final int CHANGE_FORMATION_TRAINING = 250;
    public static final int LEARN_FIRST_COMMAND_ABILITY = 250;
    public static final int LEARN_SECOND_COMMAND_ABILITY = 500;
    public static final int LEARN_THIRD_COMMAND_ABILITY = 750;
    public static final int REPLACE_COMMAND_ABILITY = 250;

    // Asset Taxonomy & Statuses
    public static final List<String> UNIT_TYPES = List.of("BM", "CV", "PM", "IM", "BA", "CI");
    public static final List<String> TECH_BASES = List.of("Inner Sphere", "Clan", "Mixed");
    public static final List<String> UNIT_STATUS_OPTIONS = List.of(
            "OPERATIONAL", "ARMOR DAMAGE", "INTERNAL DAMAGE", "CRIPPLED", "DESTROYED", "TRULY DESTROYED"
    );
}
