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
package com.hotspotscamp.config;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.data.convert.WritingConverter;
import org.springframework.data.r2dbc.convert.R2dbcCustomConversions;
import org.springframework.data.r2dbc.dialect.MySqlDialect;
import org.springframework.lang.NonNull;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * R2DBC configuration to provide custom converters for UUID to String mapping
 * in MySQL. This is necessary because R2DBC might not automatically handle UUID
 * to VARCHAR(36) conversion for all drivers or database versions, leading to
 * "Cannot encode class java.util.UUID" errors.
 */
@Configuration
public class R2dbcConfig {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Bean
    public R2dbcCustomConversions r2dbcCustomConversions() {
        List<Converter<?, ?>> converters = new ArrayList<>();
        converters.add(new UUIDToStringConverter());
        converters.add(new StringToUUIDConverter());
        converters.add(new MapToJsonConverter());
        converters.add(new JsonToMapConverter());
        return R2dbcCustomConversions.of(Objects.requireNonNull(MySqlDialect.INSTANCE), converters);
    }

    /**
     * Converts UUID to String for writing to the database.
     */
    @WritingConverter
    public static class UUIDToStringConverter implements Converter<UUID, String> {

        @Override
        public String convert(@NonNull UUID source) {
            return source.toString();
        }
    }

    /**
     * Converts String to UUID for reading from the database.
     */
    @ReadingConverter
    public static class StringToUUIDConverter implements Converter<String, UUID> {

        @Override
        public UUID convert(@NonNull String source) {
            return UUID.fromString(source);
        }
    }

    /**
     * Converts Map<String, String> to JSON string for writing to the database.
     */
    @WritingConverter
    public static class MapToJsonConverter implements Converter<Map<String, String>, String> {

        @Override
        public String convert(@NonNull Map<String, String> source) {
            try {
                return objectMapper.writeValueAsString(source);
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Failed to convert Map to JSON", e);
            }
        }
    }

    /**
     * Converts JSON string to Map<String, String> for reading from the
     * database.
     */
    @ReadingConverter
    public static class JsonToMapConverter implements Converter<String, Map<String, String>> {

        @Override
        public Map<String, String> convert(@NonNull String source) {
            try {
                if (source.isBlank()) {
                    return new java.util.HashMap<>();
                }
                return objectMapper.readValue(source, new TypeReference<Map<String, String>>() {
                });
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Failed to convert JSON to Map", e);
            }
        }
    }
}
