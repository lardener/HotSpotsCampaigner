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
import java.net.URI;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotspotscamp.entity.CombatUnit;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

/**
 * Scraper for the new Battlerite-hosted Master Unit List site
 * (masterunitlist.battletech.com).
 *
 * <p>
 * The site is protected by a Cloudflare JS challenge that blocks plain HTTP
 * clients (including Jsoup), so live scraping from the backend is not viable.
 * Instead this scraper consumes a bundled snapshot of the site's machine
 * readable <em>/data/*.json</em> files (which the site itself loads), served
 * from a timed in-memory cache. The snapshot is loaded lazily on first use and
 * refreshed automatically once the cache expires, mirroring the MekBay
 * scraper's approach.</p>
 */
@Component
public class MulBtlScraper implements UnitScraper {

    private static final Logger log = LoggerFactory.getLogger(MulBtlScraper.class);

    private static final String USER_AGENT
            = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

    /**
     * How long a loaded snapshot stays fresh before it is re-read from disk.
     */
    private static final long DEFAULT_CACHE_TTL_MS = 4 * 60 * 60 * 1000L; // 4 hours

    private static final String DEFAULT_DATA_URL
            = "classpath:scraper/mul-units.json";

    private final String dataUrl;
    private final long cacheTtlMs;
    private final ObjectMapper objectMapper;
    private final AtomicReference<CachedSnapshot> cache = new AtomicReference<>(null);

    private record CachedSnapshot(Map<String, CombatUnit> units, long loadedAtEpochMs) {

        boolean isExpired(long ttlMs) {
            return System.currentTimeMillis() - loadedAtEpochMs > ttlMs;
        }
    }

    public MulBtlScraper() {
        this(DEFAULT_DATA_URL, DEFAULT_CACHE_TTL_MS);
    }

    public MulBtlScraper(@Value("${mul.data.url:" + DEFAULT_DATA_URL + "}") String dataUrl, long cacheTtlMs) {
        this.dataUrl = dataUrl;
        this.cacheTtlMs = cacheTtlMs;
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public boolean supports(String url) {
        return url != null && url.toLowerCase().contains("masterunitlist.battletech.com");
    }

    @Override
    public Flux<CombatUnit> scrape(String url) {
        log.debug("Scraping MUL unit from URL: {}", url);
        String slug = extractSlug(url);
        if (slug == null || slug.isBlank()) {
            return Flux.error(new IllegalArgumentException(
                    "Could not resolve unit slug from URL: " + url));
        }

        return Mono.fromCallable(() -> lookupUnit(slug))
                .subscribeOn(Schedulers.boundedElastic())
                .flux();
    }

    /**
     * Extract the unit slug (the last path segment) from a MUL battletech.com
     * URL, e.g. {@code .../units/marauder-mad-9m2} -> {@code marauder-mad-9m2}.
     */
    public String extractSlug(String url) {
        if (url == null) {
            return null;
        }
        int idx = url.lastIndexOf('/');
        if (idx < 0 || idx == url.length() - 1) {
            return null;
        }
        return url.substring(idx + 1).trim();
    }

    private CombatUnit lookupUnit(String slug) {
        Map<String, CombatUnit> map = getOrLoadSnapshot();
        CombatUnit unit = map.get(slug);
        if (unit == null) {
            throw new IllegalArgumentException("Unit not found in MUL database for slug: " + slug);
        }
        log.info("Resolved MUL unit: slug:{}, model:{}, variant:{}, type:{}, techBase:{}, tonnage:{}, bv:{}, pv:{}",
                slug, unit.getModel(), unit.getVariant(), unit.getType(),
                unit.getTechBase(), unit.getTonnage(), unit.getBv(), unit.getPv());
        return unit;
    }

    private Map<String, CombatUnit> getOrLoadSnapshot() {
        CachedSnapshot cached = cache.get();
        if (cached == null || cached.isExpired(cacheTtlMs)) {
            synchronized (this) {
                cached = cache.get();
                if (cached == null || cached.isExpired(cacheTtlMs)) {
                    log.info("Loading MUL unit database from {}: {}", dataUrl, dataUrl);
                    Map<String, CombatUnit> map = loadUnitsMapFromUrl(dataUrl);
                    CachedSnapshot fresh = new CachedSnapshot(map, System.currentTimeMillis());
                    cache.set(fresh);
                    cached = fresh;
                    log.info("Successfully loaded {} units from MUL database.", map.size());
                }
            }
        }
        return cached.units();
    }

    private Map<String, CombatUnit> loadUnitsMapFromUrl(String url) {
        Map<String, CombatUnit> map = new HashMap<>();
        try (InputStream in = openStream(url)) {
            JsonNode root = objectMapper.readTree(in);
            JsonNode unitsNode = root.path("units");
            if (!unitsNode.isArray()) {
                throw new IllegalStateException(
                        "MUL data source missing 'units' array: " + url);
            }
            for (JsonNode u : unitsNode) {
                String slug = u.path("slug").asText(null);
                if (slug != null && !slug.isBlank()) {
                    map.put(slug, parseUnitJson(u));
                }
            }
        } catch (IOException e) {
            throw new IllegalStateException("Failed to read MUL data source: " + url, e);
        }
        return map;
    }

    private InputStream openStream(String url) throws IOException {
        if (url.startsWith("classpath:")) {
            String path = url.substring("classpath:".length());
            InputStream in = getClass().getResourceAsStream("/" + path);
            if (in == null) {
                throw new IOException("MUL data resource not found on classpath: " + path);
            }
            return in;
        }
        URL u = URI.create(url).toURL();
        return u.openConnection().getInputStream();
    }

    private CombatUnit parseUnitJson(JsonNode u) {
        String model = u.path("model").asText("").trim();
        String variant = u.path("name").asText("").trim();

        String type = u.hasNonNull("type") ? u.path("type").asText().trim() : "BattleMech";
        String techBase = u.hasNonNull("techBase") ? u.path("techBase").asText().trim() : null;
        Integer tonnage = u.hasNonNull("tonnage") ? u.path("tonnage").asInt() : null;
        Integer bv = u.hasNonNull("bv") ? u.path("bv").asInt() : null;
        Integer pv = u.hasNonNull("pv") ? u.path("pv").asInt() : null;
        Integer asSize = u.hasNonNull("asSize") ? u.path("asSize").asInt() : null;

        return CombatUnit.builder()
                .model(model.isEmpty() ? variant : model)
                .variant(variant.isEmpty() ? model : variant)
                .type(type)
                .techBase(techBase)
                .tonnage(tonnage)
                .asSize(asSize)
                .bv(bv)
                .pv(pv)
                .build();
    }

    /**
     * Fetches the unit page, injecting browser-like headers to avoid being
     * blocked.
     */
    private Document fetchDocument(String url) throws IOException {
        Document doc = Jsoup.connect(url)
                .userAgent(USER_AGENT)
                .header("Referer", "https://masterunitlist.battletech.com/")
                .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8")
                .header("Accept-Language", "en-US,en;q=0.9")
                .ignoreContentType(true)
                .ignoreHttpErrors(true)
                .followRedirects(false)
                .maxBodySize(0)
                .timeout(15000)
                .get();
        // Cloudflare challenge pages return 200 with an HTML body that
        // contains neither a unit title nor detail grids. Detect that and
        // surface a clear, network-agnostic error.
        if (doc.selectFirst(".u-kv") == null && doc.selectFirst(".u-statgrid") == null) {
            throw new IOException("No unit detail content found in response for URL: " + url);
        }
        return doc;
    }

    /**
     * Parses a fetched unit document into a {@link CombatUnit}. Exposed for
     * unit testing against HTML fixtures.
     */
    public CombatUnit parse(Document doc) {
        if (doc == null) {
            throw new IllegalArgumentException("No document parsed for MUL unit");
        }
        Element title = doc.selectFirst(".ba-title");
        if (title == null) {
            throw new IllegalArgumentException(
                    "Could not locate unit title on page");
        }
        String nameLine = title.text().trim();
        String model = nameLine;
        String variant = "";
        if (nameLine.contains(" ")) {
            int lastSpace = nameLine.lastIndexOf(" ");
            model = nameLine.substring(0, lastSpace).trim();
            variant = nameLine.substring(lastSpace + 1).trim();
        }

        CombatUnit unit = CombatUnit.builder()
                .model(model)
                .variant(variant)
                .build();

        scrapeDetails(unit, doc);
        scrapeAlphaStrike(unit, doc);

        log.info("Finished scraping unit: type:{}, model:{}, variant:{}, techBase:{}, tonnage:{}, bv:{}, asSize:{}, pv:{}",
                unit.getType(), unit.getModel(), unit.getVariant(), unit.getTechBase(),
                unit.getTonnage(), unit.getBv(), unit.getAsSize(), unit.getPv());
        return unit;
    }

    private void scrapeDetails(CombatUnit unit, Document doc) {
        Element kv = doc.selectFirst(".u-kv");
        if (kv == null) {
            log.warn("No '.u-kv' details grid found on page");
            return;
        }
        // The Details grid is a flat sequence of alternating value spans; we
        // key off the value spans and read each value's preceding sibling key.
        for (Element val : kv.select("> span.v")) {
            Element key = val.previousElementSibling();
            if (key == null) {
                continue;
            }
            String label = key.text().trim().toLowerCase();
            String raw = val.text().trim();
            switch (label) {
                case "type" ->
                    unit.setType(parseType(raw));
                case "tonnage" ->
                    unit.setTonnage(parseSafeInt(raw.replace("t", "").trim()));
                case "tech base" ->
                    unit.setTechBase(raw);
                case "bv" ->
                    unit.setBv(parseSafeInt(raw.replace(",", "").trim()));
                case "pv" ->
                    unit.setPv(parseSafeInt(raw));
            }
        }
    }

    private void scrapeAlphaStrike(CombatUnit unit, Document doc) {
        Element grid = doc.selectFirst(".u-statgrid");
        if (grid == null) {
            log.debug("No '.u-statgrid' Alpha Strike grid found on page");
            return;
        }
        for (Element row : grid.select("> div")) {
            Element key = row.selectFirst(".k");
            Element val = row.selectFirst(".v");
            if (key == null || val == null) {
                continue;
            }
            switch (key.text().trim().toLowerCase()) {
                case "pv" ->
                    unit.setPv(parseSafeInt(val.text().trim()));
                case "size" ->
                    unit.setAsSize(parseSafeInt(val.text().trim()));
            }
        }
    }

    private String parseType(String raw) {
        // e.g., "BattleMech · Standard BattleMech"
        String type = raw.contains(" · ") ? raw.split(" · ")[0] : raw;
        return type.isBlank() ? null : type;
    }
}
