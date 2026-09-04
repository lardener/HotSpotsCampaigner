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

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInfo;

import com.hotspotscamp.entity.CombatUnit;

import reactor.test.StepVerifier;

class MulBtlScraperTest {

    private final MulBtlScraper scraper = new MulBtlScraper();

    @Test
    void supports_returnsTrueOnlyForBattletechMul() {
        assertTrue(scraper.supports("https://masterunitlist.battletech.com/units/marauder-mad-9m2"));
        assertTrue(scraper.supports("https://MASTERUNITLIST.BATTLETECH.COM/units/foo-bar"));
        assertFalse(scraper.supports("https://masterunitlist.info/Unit/Details/123"));
        assertFalse(scraper.supports("https://mordel.net/unit.php?id=1"));
        assertFalse(scraper.supports("https://mekbay.com/?shareUnit=X"));
        assertFalse(scraper.supports(null));
    }

    @Test
    void parse_parsesCombatUnitFromFixture(TestInfo info) throws IOException {
        // Deterministic, offline parse test against a fixture HTML snapshot.
        // (masterunitlist.battletech.com is behind a Cloudflare JS challenge,
        // so a live fetch cannot be asserted in CI.)
        String expectedName = info.getTestMethod()
                .map(m -> m.getName() + ".html")
                .orElse("marauder-mad-9m2.html");
        String fixtureName = exists(expectedName) ? expectedName : "marauder-mad-9m2.html";
        Document doc = loadFixture(fixtureName);
        assertNotNull(doc);

        CombatUnit unit = scraper.parse(doc);
        assertNotNull(unit);
        assertEquals("Marauder", unit.getModel());
        assertEquals("MAD-9M2", unit.getVariant());
        assertEquals("BattleMech", unit.getType());
        assertEquals("Inner Sphere", unit.getTechBase());
        assertEquals(75, unit.getTonnage());
        assertEquals(1875, unit.getBv());
        assertEquals(43, unit.getPv());
        assertEquals(3, unit.getAsSize());
    }

    @Test
    void parse_throwsWhenTitleMissing() {
        Document doc = Jsoup.parse(
                "<html><body><div class='u-kv'><span class='k'>Type</span></div></body></html>");
        assertThrows(IllegalArgumentException.class, () -> scraper.parse(doc));
    }

    @Test
    void scrape_returnsErrorWhenPageCannotBeParsed() {
        // A URL that resolves to non-unit content (e.g. a Cloudflare challenge
        // page or a 404) should fail with an error signal.
        StepVerifier.create(scraper.scrape("https://masterunitlist.battletech.com/units/does-not-exist"))
                .expectError()
                .verify();
    }

    @Test
    void scrape_resolvesUnitFromMulJsonSnapshot() {
        CombatUnit unit = scraper.scrape("https://masterunitlist.battletech.com/units/gladiator-gld-1r-keller")
                .blockFirst();
        assertNotNull(unit);
        assertEquals("Gladiator", unit.getModel());
        assertEquals("GLD-1R (Keller)", unit.getVariant());
        assertEquals("BattleMech", unit.getType());
        assertEquals("Inner Sphere", unit.getTechBase());
        assertEquals(55, unit.getTonnage());
        assertEquals(1517, unit.getBv());
        assertEquals(35, unit.getPv());
        assertEquals(2, unit.getAsSize());
    }

    @Test
    void scrape_resolvesCombatVehicleFromMulJsonSnapshot() {
        CombatUnit unit = scraper.scrape("https://masterunitlist.battletech.com/units/alacorn-heavy-tank-mk-vi")
                .blockFirst();
        assertNotNull(unit);
        assertEquals("Alacorn Heavy Tank", unit.getModel());
        assertEquals("Mk. VI", unit.getVariant());
        assertEquals("Combat Vehicle", unit.getType());
        assertEquals("Inner Sphere", unit.getTechBase());
        assertEquals(95, unit.getTonnage());
        assertEquals(4, unit.getAsSize());
    }

    @Test
    void scrape_resolvesBattleArmorFromMulJsonSnapshot() {
        CombatUnit unit = scraper.scrape("https://masterunitlist.battletech.com/units/kanazuchi-assault-battle-armor-support-sqd5")
                .blockFirst();
        assertNotNull(unit);
        assertEquals("Kanazuchi Assault Battle Armor (Support)", unit.getModel());
        assertEquals("(Sqd5)", unit.getVariant());
        assertEquals("Battle Armor", unit.getType());
        assertEquals("Inner Sphere", unit.getTechBase());
        assertEquals(2, unit.getTonnage());
        assertEquals(1, unit.getAsSize());
    }

    private Document loadFixture(String name) {
        try (InputStream in = getClass().getResourceAsStream("/scraper/" + name)) {
            if (in == null) {
                return null;
            }
            String html = new String(in.readAllBytes(), StandardCharsets.UTF_8);
            return Jsoup.parse(html);
        } catch (IOException e) {
            return null;
        }
    }

    private boolean exists(String name) {
        return getClass().getResourceAsStream("/scraper/" + name) != null;
    }
}
