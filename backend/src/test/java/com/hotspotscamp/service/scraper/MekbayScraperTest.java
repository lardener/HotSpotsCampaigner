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

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.hotspotscamp.entity.CombatUnit;

import reactor.test.StepVerifier;

import static org.junit.jupiter.api.Assertions.*;

class MekbayScraperTest {

    private MekbayScraper scraper;

    @BeforeEach
    void setUp() {
        scraper = new MekbayScraper();
    }

    @Test
    void supports_returnsTrueForMekbayUrls() {
        assertTrue(scraper.supports("https://mekbay.com/?shareUnit=BMAxman_AXM2R&tab=General"));
        assertTrue(scraper.supports("https://mekbay.com/?shareUnit=BMAxman_AXM2R&tab=Card"));
        assertTrue(scraper.supports("https://mekbay.com/?gs=cbt&shareUnit=BMAxman_AXM2R"));
        assertTrue(scraper.supports("https://mekbay.com/"));
        assertFalse(scraper.supports("https://masterunitlist.info/Unit/Details/123"));
        assertFalse(scraper.supports("https://mordel.net/unit.php?id=1"));
        assertFalse(scraper.supports(null));
    }

    @Test
    void extractShareUnit_extractsParameterRegardlessOfOtherUrlParams() {
        assertEquals("BMAxman_AXM2R", scraper.extractShareUnit("https://mekbay.com/?shareUnit=BMAxman_AXM2R&tab=General"));
        assertEquals("BMAxman_AXM2R", scraper.extractShareUnit("https://mekbay.com/?shareUnit=BMAxman_AXM2R&tab=Card"));
        assertEquals("BMAxman_AXM2R", scraper.extractShareUnit("https://mekbay.com/?tab=Card&shareUnit=BMAxman_AXM2R&gs=cbt"));
        assertEquals("BMAxman_AXM2R", scraper.extractShareUnit("https://mekbay.com/?shareUnit=BMAxman_AXM2R"));
        assertNull(scraper.extractShareUnit("https://mekbay.com/?tab=General"));
        assertNull(scraper.extractShareUnit(null));
    }

    @Test
    void scrape_parsesCombatUnitCorrectlyWithTabGeneral() {
        String url = "https://mekbay.com/?shareUnit=BMAxman_AXM2R&tab=General";

        StepVerifier.create(scraper.scrape(url))
                .assertNext(unit -> {
                    assertNotNull(unit);
                    assertEquals("Axman", unit.getModel());
                    assertEquals("AXM-2R", unit.getVariant());
                    assertEquals("BM", unit.getType());
                    assertEquals("Inner Sphere", unit.getTechBase());
                    assertEquals(65, unit.getTonnage());
                    assertEquals(1405, unit.getBv());
                    assertEquals(40, unit.getPv());
                    assertEquals(3, unit.getAsSize());
                })
                .verifyComplete();
    }

    @Test
    void scrape_parsesCombatUnitCorrectlyWithTabCard() {
        String url = "https://mekbay.com/?shareUnit=BMAxman_AXM2R&tab=Card";

        StepVerifier.create(scraper.scrape(url))
                .assertNext(unit -> {
                    assertNotNull(unit);
                    assertEquals("Axman", unit.getModel());
                    assertEquals("AXM-2R", unit.getVariant());
                    assertEquals("BM", unit.getType());
                    assertEquals("Inner Sphere", unit.getTechBase());
                    assertEquals(65, unit.getTonnage());
                    assertEquals(1405, unit.getBv());
                    assertEquals(40, unit.getPv());
                    assertEquals(3, unit.getAsSize());
                })
                .verifyComplete();
    }

    @Test
    void scrape_errorsWhenShareUnitMissing() {
        String url = "https://mekbay.com/?tab=General";

        StepVerifier.create(scraper.scrape(url))
                .expectErrorMatches(t -> t instanceof IllegalArgumentException &&
                        t.getMessage().contains("Could not resolve shareUnit parameter"))
                .verify();
    }

    @Test
    void scrape_errorsWhenUnitNotFoundInDatabase() {
        String url = "https://mekbay.com/?shareUnit=NON_EXISTENT_UNIT_12345";

        StepVerifier.create(scraper.scrape(url))
                .expectErrorMatches(t -> t instanceof IllegalArgumentException &&
                        t.getMessage().contains("Unit not found in MekBay database"))
                .verify();
    }

    @Test
    void cacheExpiration_reloadsWhenExpired() throws Exception {
        MekbayScraper shortTtlScraper = new MekbayScraper("https://db.mekbay.com/units.json", 100);
        String url = "https://mekbay.com/?shareUnit=BMAxman_AXM2R";

        // First scrape loads cache
        StepVerifier.create(shortTtlScraper.scrape(url))
                .assertNext(unit -> assertEquals("Axman", unit.getModel()))
                .verifyComplete();

        // Wait for cache to expire
        Thread.sleep(150);

        // Second scrape should re-fetch and succeed seamlessly
        StepVerifier.create(shortTtlScraper.scrape(url))
                .assertNext(unit -> assertEquals("Axman", unit.getModel()))
                .verifyComplete();
    }
}
