package com.hotspotscamp.service.scraper;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.Test;

import com.hotspotscamp.entity.CombatUnit;

/**
 * Verifies that MulBtlScraper reloads its snapshot when the cache TTL expires.
 */
public class MulBtlScraperCacheTest {

    @Test
    public void cacheExpiryTriggersReload() throws Exception {
        Path tmp = Files.createTempFile("mul-units-cache-test", ".json");
        try {
            String a = "{\"units\":[{\"slug\":\"unit-a\",\"name\":\"VariantA\",\"model\":\"ChassisA\",\"type\":\"BattleMech\",\"techBase\":\"Inner Sphere\",\"tonnage\":50,\"bv\":1000,\"pv\":10}]}";
            Files.writeString(tmp, a);

            // Use a very small TTL so we can trigger reload quickly.
            MulBtlScraper scraper = new MulBtlScraper(tmp.toUri().toString(), 50);

            CombatUnit first = scraper.scrape("https://masterunitlist.battletech.com/units/unit-a")
                    .blockFirst(Duration.ofSeconds(2));
            assertNotNull(first);
            assertEquals("ChassisA", first.getModel());

            // Overwrite the file with changed model and wait for TTL to expire.
            String b = "{\"units\":[{\"slug\":\"unit-a\",\"name\":\"VariantA\",\"model\":\"ChassisB\",\"type\":\"BattleMech\",\"techBase\":\"Inner Sphere\",\"tonnage\":50,\"bv\":1000,\"pv\":10}]}";
            Files.writeString(tmp, b);

            Thread.sleep(150);

            CombatUnit second = scraper.scrape("https://masterunitlist.battletech.com/units/unit-a")
                    .blockFirst(Duration.ofSeconds(2));
            assertNotNull(second);
            assertEquals("ChassisB", second.getModel());

        } finally {
            try {
                Files.deleteIfExists(tmp);
            } catch (Exception e) {
                /* ignore */ }
        }
    }
}
