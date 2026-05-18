package com.hotspotscamp.util;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.r2dbc.core.DatabaseClient;

/**
 * Utility for handling R2DBC SQL binding edge cases, specifically UUID and
 * DateTime encoding for MySQL.
 */
public class SqlUtils {

    public static DatabaseClient.GenericExecuteSpec bindUuid(
            DatabaseClient.GenericExecuteSpec spec,
            String name,
            UUID value) {
        if (value == null) {
            return spec.bindNull(name, String.class);
        }
        return spec.bind(name, value.toString());
    }

    public static DatabaseClient.GenericExecuteSpec bindDateTime(
            DatabaseClient.GenericExecuteSpec spec,
            String name,
            LocalDateTime value) {
        if (value == null) {
            return spec.bindNull(name, LocalDateTime.class);
        }
        return spec.bind(name, value);
    }
}
