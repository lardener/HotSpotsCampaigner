package com.hotspotscamp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.hotspotscamp.entity.MercenaryCommand;

import reactor.core.publisher.Sinks;

@Configuration
public class ReactiveConfig {

    /**
     * Multicast sink for broadcasting MercenaryCommand updates to
     * WebSocket/GraphQL subscribers. Defined as a standalone bean to avoid
     * circular dependencies between services.
     */
    @Bean
    public Sinks.Many<MercenaryCommand> commandSink() {
        return Sinks.many().multicast().directBestEffort();
    }
}
