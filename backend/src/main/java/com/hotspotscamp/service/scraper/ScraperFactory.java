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
