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

import static org.junit.jupiter.api.Assertions.assertSame;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import reactor.test.StepVerifier;

class ScraperFactoryTest {

    private UnitScraper mockScraper(String urlFragment) {
        UnitScraper scraper = mock(UnitScraper.class);
        when(scraper.supports(org.mockito.ArgumentMatchers.anyString()))
                .thenAnswer(inv -> {
                    String url = (String) inv.getArgument(0);
                    return url != null && url.contains(urlFragment);
                });
        return scraper;
    }

    @Test
    void getScraper_returnsMatchingScraper() {
        UnitScraper mul = mockScraper("masterunitlist.info");
        UnitScraper mordel = mockScraper("mordel.net");
        ScraperFactory factory = new ScraperFactory(List.of(mul, mordel));

        StepVerifier.create(factory.getScraper("https://masterunitlist.info/Unit/Details/123"))
                .assertNext(s -> assertSame(mul, s))
                .verifyComplete();
    }

    @Test
    void getScraper_returnsFirstMatchWhenMultiple() {
        UnitScraper a = mockScraper("mordel.net");
        UnitScraper b = mockScraper("mordel.net");
        ScraperFactory factory = new ScraperFactory(List.of(a, b));

        StepVerifier.create(factory.getScraper("https://mordel.net/unit/xyz"))
                .assertNext(s -> assertSame(a, s))
                .verifyComplete();
    }

    @Test
    void getScraper_errorsWhenNoScraperSupportsUrl() {
        UnitScraper mul = mockScraper("masterunitlist.info");
        ScraperFactory factory = new ScraperFactory(List.of(mul));

        StepVerifier.create(factory.getScraper("https://example.com/unit"))
                .expectErrorMatches(t -> t instanceof RuntimeException
                && t.getMessage().contains("No compatible scraper"))
                .verify();
    }

    @Test
    void getScraper_errorsWhenEmptyList() {
        ScraperFactory factory = new ScraperFactory(List.of());
        StepVerifier.create(factory.getScraper("https://masterunitlist.info/x"))
                .expectError(RuntimeException.class)
                .verify();
    }

    @Test
    void getScraper_nullUrl_errors() {
        ScraperFactory factory = new ScraperFactory(List.of(mockScraper("x")));
        StepVerifier.create(factory.getScraper(null))
                .expectError(RuntimeException.class)
                .verify();
    }
}
