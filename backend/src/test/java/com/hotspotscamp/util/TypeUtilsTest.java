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
import static org.junit.jupiter.api.Assertions.assertNull;
import org.junit.jupiter.api.Test;

class TypeUtilsTest {

    // ---- asInt(Object) deprecated overload ----
    @Test
    void asInt_deprecated_nullReturnsNull() {
        assertNull(TypeUtils.asInt(null));
    }

    @Test
    void asInt_deprecated_numberReturnsIntValue() {
        assertEquals(Integer.valueOf(42), TypeUtils.asInt(42L));
        assertEquals(Integer.valueOf(7), TypeUtils.asInt(7.9));
    }

    @Test
    void asInt_deprecated_blankStringReturnsNull() {
        assertNull(TypeUtils.asInt("   "));
    }

    @Test
    void asInt_deprecated_numericStringReturnsParsed() {
        assertEquals(Integer.valueOf(123), TypeUtils.asInt("123"));
    }

    @Test
    void asInt_deprecated_stringWithJunkStripsNonDigits() {
        assertEquals(Integer.valueOf(12), TypeUtils.asInt("a1b2c"));
    }

    @Test
    void asInt_deprecated_unparseableStringReturnsNull() {
        assertNull(TypeUtils.asInt("abc"));
    }

    // ---- asInt(Object, Integer) ----
    @Test
    void asInt_withDefault_nullReturnsDefault() {
        assertEquals(Integer.valueOf(5), TypeUtils.asInt(null, 5));
    }

    @Test
    void asInt_withDefault_numberReturnsIntValue() {
        assertEquals(Integer.valueOf(9), TypeUtils.asInt(9.0, 1));
    }

    @Test
    void asInt_withDefault_blankStringReturnsDefault() {
        assertEquals(Integer.valueOf(5), TypeUtils.asInt("", 5));
    }

    @Test
    void asInt_withDefault_numericStringReturnsParsed() {
        assertEquals(Integer.valueOf(88), TypeUtils.asInt("88", 5));
    }

    @Test
    void asInt_withDefault_stringWithJunkStripsNonDigits() {
        assertEquals(Integer.valueOf(34), TypeUtils.asInt("3x4y", 5));
    }

    @Test
    void asInt_withDefault_stringAllJunkReturnsDefault() {
        assertEquals(Integer.valueOf(5), TypeUtils.asInt("xyz", 5));
    }

    @Test
    void asInt_withDefault_unparseableStringReturnsDefault() {
        assertEquals(Integer.valueOf(5), TypeUtils.asInt("abc", 5));
    }

    @Test
    void asInt_withDefault_otherTypeReturnsDefault() {
        assertEquals(Integer.valueOf(5), TypeUtils.asInt(new Object(), 5));
    }

    // ---- asDouble(Object, Double) ----
    @Test
    void asDouble_nullReturnsDefault() {
        assertEquals(Double.valueOf(1.5), TypeUtils.asDouble(null, 1.5));
    }

    @Test
    void asDouble_numberReturnsDoubleValue() {
        assertEquals(Double.valueOf(3.5), TypeUtils.asDouble(3.5f, 0.0));
    }

    @Test
    void asDouble_blankStringReturnsDefault() {
        assertEquals(Double.valueOf(2.0), TypeUtils.asDouble("  ", 2.0));
    }

    @Test
    void asDouble_numericStringReturnsParsed() {
        assertEquals(Double.valueOf(4.25), TypeUtils.asDouble("4.25", 0.0));
    }

    @Test
    void asDouble_unparseableStringReturnsDefault() {
        assertEquals(Double.valueOf(2.0), TypeUtils.asDouble("abc", 2.0));
    }

    @Test
    void asDouble_otherTypeReturnsDefault() {
        assertEquals(Double.valueOf(2.0), TypeUtils.asDouble(new Object(), 2.0));
    }

    // ---- asDouble(Object) deprecated overload ----
    @Test
    void asDouble_deprecated_nullReturnsNull() {
        assertNull(TypeUtils.asDouble(null));
    }

    @Test
    void asDouble_deprecated_numericStringReturnsParsed() {
        assertEquals(Double.valueOf(9.5), TypeUtils.asDouble("9.5"));
    }
}
