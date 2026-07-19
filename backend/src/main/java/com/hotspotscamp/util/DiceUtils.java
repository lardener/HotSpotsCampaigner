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

import java.util.concurrent.ThreadLocalRandom;

/**
 * Utility class for gaming dice mechanics.
 */
public class DiceUtils {

    /**
     * Rolls a specified number of dice with a specified number of sides and
     * returns the sum.
     *
     * @param count Number of dice to roll.
     * @param sides Number of sides per die.
     * @return The total sum of the rolls.
     */
    public static int roll(int count, int sides) {
        if (count <= 0 || sides <= 0) {
            return 0;
        }
        int sum = 0;
        for (int i = 0; i < count; i++) {
            sum += ThreadLocalRandom.current().nextInt(sides) + 1;
        }
        return sum;
    }

    /**
     * Rolls a single die with a specified number of sides.
     *
     * @param sides Number of sides.
     * @return The result of the roll.
     */
    public static int roll(int sides) {
        return roll(1, sides);
    }

    /**
     * Generates a random integer between min (inclusive) and max (inclusive).
     *
     * @param min Minimum value.
     * @param max Maximum value.
     * @return A random integer in the range.
     */
    public static int randomInt(int min, int max) {
        return ThreadLocalRandom.current().nextInt(min, max + 1);
    }
}
