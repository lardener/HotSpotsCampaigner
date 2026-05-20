package com.hotspotscamp.service.scraper;

import com.hotspotscamp.entity.CombatUnit;

import reactor.core.publisher.Flux;

public interface UnitScraper {

    boolean supports(String url);

    /**
     * Scrapes the provided link and returns one or more CombatUnits.
     */
    Flux<CombatUnit> scrape(String url);
}
