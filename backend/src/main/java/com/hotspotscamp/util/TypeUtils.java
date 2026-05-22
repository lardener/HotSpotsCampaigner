package com.hotspotscamp.util;

/**
 * Utility class for safe numeric conversions from GraphQL inputs.
 */
public class TypeUtils {

    public static Integer asInt(Object o) {
        if (o == null) return null;
        if (o instanceof String s) {
            return s.isEmpty() ? null : Integer.parseInt(s);
        }
        if (o instanceof Number n) return n.intValue();
        return null;
    }

    public static Double asDouble(Object o) {
        if (o == null) return null;
        if (o instanceof String s) {
            return s.isEmpty() ? null : Double.parseDouble(s);
        }
        if (o instanceof Number n) return n.doubleValue();
        return null;
    }
}