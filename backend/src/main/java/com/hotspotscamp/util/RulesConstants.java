package com.hotspotscamp.util;

import java.util.List;

/**
 * Centralized constants for Battletech Campaign rulesets. Defaults aligned with
 * Chaos Campaign: Hinterlands and Hot Spots: Draconis Reach.
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
    public static final int BASE_UNIT_UPKEEP = 50; // Per unit per month
    public static final int BASE_PILOT_UPKEEP = 20; // Per pilot per month

    // Repair Multipliers (Cost = Tonnage * Multiplier)
    public static final double REPAIR_MULT_ARMOR = 0.5;
    public static final double REPAIR_MULT_INTERNAL = 2.0;
    public static final double REPAIR_MULT_CRIPPLED = 3.0;
    public static final double REPAIR_MULT_DESTROYED = 5.0;
    public static final double REPAIR_MULT_NON_MECH_MODIFIER = 0.5; // For CV, BA, CI
    public static final double REPAIR_MULT_MIXED_TECH = 1.5;
    public static final double REPAIR_MULT_CLAN_TECH = 2.0;

    // Asset Taxonomy & Statuses
    public static final List<String> UNIT_TYPES = List.of("BM", "CV", "PM", "IM", "BA", "CI");
    public static final List<String> TECH_BASES = List.of("Inner Sphere", "Clan", "Mixed");
    public static final List<String> UNIT_STATUS_OPTIONS = List.of(
            "OPERATIONAL", "ARMOR DAMAGE", "INTERNAL DAMAGE", "CRIPPLED", "DESTROYED", "TRULY DESTROYED"
    );
}
