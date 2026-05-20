package com.hotspotscamp.service.scraper;

import java.util.List;

import org.springframework.stereotype.Component;

import reactor.core.publisher.Mono;

@Component
public class ScraperFactory {

    private final List<UnitScraper> scrapers;

    public ScraperFactory(List<UnitScraper> scrapers) {
        this.scrapers = scrapers;
    }

    public Mono<UnitScraper> getScraper(String url) {
        return Mono.justOrEmpty(
                scrapers.stream()
                        .filter(s -> s.supports(url))
                        .findFirst()
        ).switchIfEmpty(Mono.error(new RuntimeException("No compatible scraper found for URL: " + url)));
    }
}
