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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.Test;

class DiceUtilsTest {

    @Test
    void roll_withZeroCount_returnsZero() {
        assertEquals(0, DiceUtils.roll(0, 6));
    }

    @Test
    void roll_withZeroSides_returnsZero() {
        assertEquals(0, DiceUtils.roll(3, 0));
    }

    @Test
    void roll_withNegativeInputs_returnsZero() {
        assertEquals(0, DiceUtils.roll(-2, 6));
        assertEquals(0, DiceUtils.roll(2, -6));
    }

    @RepeatedTest(20)
    void roll_withinBounds() {
        int result = DiceUtils.roll(2, 6);
        assertTrue(result >= 2, "min is count");
        assertTrue(result <= 12, "max is count*sides");
    }

    @RepeatedTest(20)
    void rollSingleDie_withinBounds() {
        int result = DiceUtils.roll(20);
        assertTrue(result >= 1);
        assertTrue(result <= 20);
    }

    @RepeatedTest(20)
    void randomInt_withinInclusiveBounds() {
        int result = DiceUtils.randomInt(5, 9);
        assertTrue(result >= 5);
        assertTrue(result <= 9);
    }

    @Test
    void randomInt_singleValue_returnsThatValue() {
        // Run several times; with min==max the only possible result is that value.
        for (int i = 0; i < 20; i++) {
            assertEquals(7, DiceUtils.randomInt(7, 7));
        }
    }
}
