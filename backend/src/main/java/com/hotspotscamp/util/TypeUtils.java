package com.hotspotscamp.util;

/**
 * Utility class for safe type conversions.
 */
public class TypeUtils {

    /**
     * Converts an Object to an Integer, returning null if conversion fails.
     * This method is deprecated in favor of asInt(Object value, Integer
     * defaultValue) to ensure non-null defaults where appropriate.
     */
    @Deprecated
    public static Integer asInt(Object value) {
        return asInt(value, null);
    }

    /**
     * Converts an Object to an Integer, returning null if conversion fails.
     */
    public static Integer asInt(Object value, Integer defaultValue) {
        if (value == null) {
            return defaultValue;
        }
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value instanceof String string) {
            try {
                if (string.isBlank()) {
                    return defaultValue;
                }
                return Integer.valueOf(string);
            } catch (NumberFormatException e) {
                return defaultValue;
            }
        }
        return defaultValue;
    }

    /**
     * Converts an Object to a Double, returning a default value if conversion
     * fails or input is null/blank.
     */
    public static Double asDouble(Object value, Double defaultValue) {
        if (value == null) {
            return defaultValue;
        }
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        if (value instanceof String string) {
            try {
                if (string.isBlank()) {
                    return defaultValue;
                }
                return Double.valueOf(string);
            } catch (NumberFormatException e) {
                return defaultValue;
            }
        }
        return defaultValue;
    }

    /**
     * Converts an Object to a Double, returning null if conversion fails. This
     * method is deprecated in favor of asDouble(Object value, Double
     * defaultValue) to ensure non-null defaults where appropriate.
     */
    @Deprecated
    public static Double asDouble(Object value) {
        return asDouble(value, null);
    }
}
