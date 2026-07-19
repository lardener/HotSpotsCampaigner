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

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.hotspotscamp.entity.Pilot;
import com.hotspotscamp.util.DiceUtils;

@Service
public class PilotGeneratorService {

    public Pilot generateRandomPilot(String weightClass) {
        // 1. Determine Experience Level
        int expRoll = DiceUtils.roll(2, 6) + getWeightClassModifier(weightClass);
        String expLevel = determineExperienceLevel(expRoll);

        // 2. Determine Skills (Gunnery/Piloting)
        int skillRoll = DiceUtils.roll(1, 6);
        int[] skills = determineSkills(expLevel, skillRoll);

        // 3. Determine Edge Abilities
        int edgeCountRoll = DiceUtils.roll(1, 6);
        int edgeCount = determineEdgeAbilityCount(expLevel, edgeCountRoll);
        List<String> edges = new ArrayList<>();
        for (int i = 0; i < edgeCount; i++) {
            edges.add(rollEdgeAbility());
        }

        return Pilot.builder()
                .id(UUID.randomUUID())
                .name("Generated Pilot " + DiceUtils.randomInt(1000, 9999))
                .gunnery(skills[0])
                .piloting(skills[1])
                .gunnerySpEarned(calculateSpForSkill(skills[0]))
                .pilotingSpEarned(calculateSpForSkill(skills[1]))
                .edgeAbilities(String.join(", ", edges))
                .edgeAbilitySpEarned(edges.size() * 150)
                .edgeTokensSpEarned(edgeCount * 100)
                .unitType(weightClass)
                .wounds(0)
                .handicap(0)
                .build();
    }

    private int calculateSpForSkill(int skill) {
        // Simple mapping: lower skill value = more SP earned
        // 0 -> 500, 1 -> 400, 2 -> 300, 3 -> 200, 4 -> 100, 5 -> 0
        return Math.max(0, (5 - skill) * 100);
    }

    private int getWeightClassModifier(String weightClass) {
        if (weightClass == null) {
            return 0;
        }
        return switch (weightClass.toUpperCase()) {
            case "LIGHT" ->
                -2;
            case "HEAVY" ->
                2;
            case "ASSAULT" ->
                4;
            case "OPEN" ->
                6;
            default ->
                0;
        };
    }

    private String determineExperienceLevel(int roll) {
        if (roll <= 5) {
            return "Regular";
        }
        if (roll <= 8) {
            return "Veteran";
        }
        if (roll <= 12) {
            return "Elite";
        }
        if (roll <= 15) {
            return "Heroic";
        }
        return "Legendary";
    }

    private int[] determineSkills(String level, int roll) {
        return switch (level) {
            case "Regular" ->
                roll <= 2 ? new int[]{5, 5} : roll <= 4 ? new int[]{5, 4} : new int[]{4, 5};
            case "Veteran" ->
                roll <= 2 ? new int[]{4, 4} : roll <= 4 ? new int[]{4, 3} : new int[]{3, 4};
            case "Elite" ->
                roll <= 2 ? new int[]{3, 3} : roll <= 4 ? new int[]{3, 2} : new int[]{2, 3};
            case "Heroic" ->
                roll <= 2 ? new int[]{2, 2} : roll <= 4 ? new int[]{2, 1} : new int[]{1, 2};
            case "Legendary" ->
                roll <= 2 ? new int[]{1, 1} : roll <= 4 ? new int[]{1, 0} : new int[]{0, 1};
            default ->
                new int[]{5, 5};
        };
    }

    private int determineEdgeAbilityCount(String level, int roll) {
        return switch (level) {
            case "Regular" ->
                roll >= 3 && roll <= 4 ? 1 : roll >= 5 ? 2 : 0;
            case "Veteran" ->
                roll >= 2 ? (roll >= 3 && roll <= 6 ? 2 : 1) : 0;
            case "Elite" ->
                roll >= 2 ? (roll >= 3 && roll <= 4 ? 2 : (roll >= 5 ? 3 : 1)) : 0;
            case "Heroic" ->
                roll == 1 ? 1 : roll <= 2 ? 2 : (roll >= 3 && roll <= 4 ? 2 : 3);
            case "Legendary" ->
                roll == 1 ? 1 : roll <= 2 ? 2 : (roll >= 3 && roll <= 4 ? 3 : 4);
            default ->
                0;
        };
    }

    private String rollEdgeAbility() {
        int roll = DiceUtils.roll(2, 6);
        return switch (roll) {
            case 2 ->
                "Assassin";
            case 3 ->
                "Coolant Flush";
            case 4 ->
                "Patient";
            case 5 ->
                "Jumping Jack";
            case 6 ->
                "Cautious";
            case 7 ->
                "+1 Edge Token";
            case 8 ->
                "Marksman";
            case 9 ->
                "Speed Demon";
            case 10 ->
                "Melee Specialist";
            case 11 ->
                "Nimble";
            case 12 ->
                "Bulwark";
            default ->
                "Generalist";
        };
    }
}
