package com.hotspotscamp.util;

/**
 * Utility class for safe type conversions.
 */
public class TypeUtils {

    /**
     * Converts an Object to an Integer, returning null if conversion fails.
     */
    public static Integer asInt(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        if (value instanceof String) {
            try {
                String s = (String) value;
                if (s.isBlank()) {
                    return null;
                }
                return Integer.parseInt(s);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    /**
     * Converts an Object to a Double, returning a default value if conversion
     * fails or input is null/blank.
     */
    public static Double asDouble(Object value, Double defaultValue) {
        if (value == null) {
            return defaultValue;
        }
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        if (value instanceof String) {
            try {
                String s = (String) value;
                if (s.isBlank()) {
                    return defaultValue;
                }
                return Double.parseDouble(s);
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
