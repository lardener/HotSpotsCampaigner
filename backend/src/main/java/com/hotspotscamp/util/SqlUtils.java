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

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import org.springframework.lang.NonNull;
import org.springframework.r2dbc.core.DatabaseClient;

/**
 * Utility for handling R2DBC SQL binding edge cases, specifically UUID and
 * DateTime encoding for MySQL.
 */
public class SqlUtils {

    public static DatabaseClient.GenericExecuteSpec bindUuid(
            DatabaseClient.GenericExecuteSpec spec,
            @NonNull String name,
            UUID value) {
        if (value == null) {
            return spec.bindNull(name, String.class);
        }
        return spec.bind(name, Objects.requireNonNull(value.toString()));
    }

    public static DatabaseClient.GenericExecuteSpec bindString(
            DatabaseClient.GenericExecuteSpec spec,
            @NonNull String name,
            String value) {
        if (value == null) {
            return spec.bindNull(name, String.class);
        }
        return spec.bind(name, (Object) value);
    }

    public static DatabaseClient.GenericExecuteSpec bindDateTime(
            DatabaseClient.GenericExecuteSpec spec,
            @NonNull String name,
            LocalDateTime value) {
        if (value == null) {
            return spec.bindNull(name, LocalDateTime.class);
        }
        return spec.bind(name, value);
    }
}
