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
