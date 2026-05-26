package com.hotspotscamp.config;

import java.util.ArrayList;
import java.util.List;
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

/**
 * R2DBC configuration to provide custom converters for UUID to String mapping
 * in MySQL. This is necessary because R2DBC might not automatically handle UUID
 * to VARCHAR(36) conversion for all drivers or database versions, leading to
 * "Cannot encode class java.util.UUID" errors.
 */
@Configuration
public class R2dbcConfig {

    @Bean
    public R2dbcCustomConversions r2dbcCustomConversions() {
        List<Converter<?, ?>> converters = new ArrayList<>();
        converters.add(new UUIDToStringConverter());
        converters.add(new StringToUUIDConverter());
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
}
