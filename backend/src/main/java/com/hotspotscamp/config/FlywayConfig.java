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

import org.flywaydb.core.Flyway;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

/**
 * Manual Flyway configuration for use alongside Spring Data R2DBC.
 *
 * <p>
 * Spring Boot's {@code DataSourceAutoConfiguration} carries a
 * {@code @ConditionalOnMissingBean(ConnectionFactory.class)} guard, so it backs
 * off completely when an R2DBC {@code ConnectionFactory} is present in the
 * context. Without a {@code DataSource} bean, {@code FlywayAutoConfiguration}
 * also skips, leaving the database un-migrated with zero log output.
 *
 * <p>
 * This configuration creates a minimal, short-lived HikariCP {@code DataSource}
 * purely for the Flyway migration step and runs all pending migrations eagerly
 * at startup before the application begins serving traffic. All runtime
 * database access continues to use the R2DBC {@code ConnectionFactory} as
 * usual.
 */
@Configuration
public class FlywayConfig {

    private static final Logger log = LoggerFactory.getLogger(FlywayConfig.class);

    @Value("${spring.datasource.url:jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=MYSQL}")
    private String jdbcUrl;

    @Value("${spring.datasource.username:sa}")
    private String username;

    @Value("${spring.datasource.password:}")
    private String password;

    @Value("${spring.flyway.locations:classpath:db/migration}")
    private String locations;

    @Value("${spring.flyway.baseline-on-migrate:false}")
    private boolean baselineOnMigrate;

    @Value("${spring.flyway.baseline-version:1}")
    private String baselineVersion;

    @Bean(initMethod = "migrate")
    public Flyway flyway() {
        log.info("Running Flyway migrations via manual JDBC DataSource — locations: {}", locations);

        HikariConfig hikariConfig = new HikariConfig();
        hikariConfig.setJdbcUrl(jdbcUrl);
        hikariConfig.setUsername(username);
        hikariConfig.setPassword(password);
        hikariConfig.setMinimumIdle(1);
        hikariConfig.setMaximumPoolSize(3);
        hikariConfig.setPoolName("flyway-migration-pool");
        hikariConfig.setConnectionTimeout(30_000);

        HikariDataSource dataSource = new HikariDataSource(hikariConfig);

        return Flyway.configure()
                .dataSource(dataSource)
                .locations(locations)
                .baselineOnMigrate(baselineOnMigrate)
                .baselineVersion(baselineVersion)
                .load();
    }
}
