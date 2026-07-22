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
import java.net.URLConnection;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

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
 * Scraper for units hosted on mekbay.com.
 * Extracts unit statistics by retrieving data from MekBay's underlying unit database.
 */
@Component
public class MekbayScraper implements UnitScraper {

    private static final Logger log = LoggerFactory.getLogger(MekbayScraper.class);

    private static final long DEFAULT_CACHE_TTL_MS = 4 * 60 * 60 * 1000L; // 4 hours

    private final String dbUrl;
    private final long cacheTtlMs;
    private final ObjectMapper objectMapper;
    private final AtomicReference<CachedDatabase> unitCache = new AtomicReference<>(null);

    private record CachedDatabase(Map<String, CombatUnit> units, long loadedAtEpochMs) {
        boolean isExpired(long ttlMs) {
            return System.currentTimeMillis() - loadedAtEpochMs > ttlMs;
        }
    }

    public MekbayScraper() {
        this("https://db.mekbay.com/units.json", DEFAULT_CACHE_TTL_MS);
    }

    public MekbayScraper(@Value("${mekbay.db.url:https://db.mekbay.com/units.json}") String dbUrl) {
        this(dbUrl, DEFAULT_CACHE_TTL_MS);
    }

    public MekbayScraper(String dbUrl, long cacheTtlMs) {
        this.dbUrl = dbUrl;
        this.cacheTtlMs = cacheTtlMs;
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public boolean supports(String url) {
        return url != null && url.toLowerCase().contains("mekbay.com");
    }

    @Override
    public Flux<CombatUnit> scrape(String url) {
        log.info("Scraping MekBay unit from URL: {}", url);
        String unitKey = extractShareUnit(url);
        if (unitKey == null || unitKey.isBlank()) {
            return Flux.error(new IllegalArgumentException("Could not resolve shareUnit parameter from URL: " + url));
        }

        return Mono.fromCallable(() -> fetchAndParse(unitKey))
                .subscribeOn(Schedulers.boundedElastic())
                .flux();
    }

    public String extractShareUnit(String url) {
        if (url == null) {
            return null;
        }
        String param = extractRegex(url, "[?&]shareUnit=([^&#]+)");
        if (param != null) {
            try {
                return URLDecoder.decode(param, StandardCharsets.UTF_8);
            } catch (Exception e) {
                return param;
            }
        }
        return null;
    }

    private CombatUnit fetchAndParse(String unitKey) throws IOException {
        Map<String, CombatUnit> map = getOrLoadUnitMap();
        CombatUnit unit = map.get(unitKey);
        if (unit == null) {
            throw new IllegalArgumentException("Unit not found in MekBay database for key: " + unitKey);
        }
        log.info("Finished scraping MekBay unit key: {}, model: {}, variant: {}, type: {}, tonnage: {}, bv: {}, pv: {}",
                unitKey, unit.getModel(), unit.getVariant(), unit.getType(), unit.getTonnage(), unit.getBv(), unit.getPv());
        return unit;
    }

    private Map<String, CombatUnit> getOrLoadUnitMap() throws IOException {
        CachedDatabase cached = unitCache.get();
        if (cached == null || cached.isExpired(cacheTtlMs)) {
            synchronized (this) {
                cached = unitCache.get();
                if (cached == null || cached.isExpired(cacheTtlMs)) {
                    log.info("Loading MekBay unit database from URL: {}", dbUrl);
                    Map<String, CombatUnit> map = loadUnitsMapFromUrl(dbUrl);
                    cached = new CachedDatabase(map, System.currentTimeMillis());
                    unitCache.set(cached);
                    log.info("Successfully loaded {} units from MekBay database.", map.size());
                }
            }
        }
        return cached.units();
    }

    private Map<String, CombatUnit> loadUnitsMapFromUrl(String urlString) throws IOException {
        Map<String, CombatUnit> map = new HashMap<>();
        URL url = URI.create(urlString).toURL();
        URLConnection connection = url.openConnection();
        connection.setConnectTimeout(10000);
        connection.setReadTimeout(15000);
        connection.setRequestProperty("User-Agent", "Mozilla/5.0");

        try (InputStream in = connection.getInputStream()) {
            JsonNode root = objectMapper.readTree(in);
            JsonNode unitsNode = root.path("units");
            if (unitsNode.isArray()) {
                for (JsonNode u : unitsNode) {
                    String name = u.path("name").asText(null);
                    if (name != null && !name.isBlank()) {
                        CombatUnit unit = parseUnitJson(u);
                        map.put(name, unit);
                    }
                }
            }
        }
        return map;
    }

    private CombatUnit parseUnitJson(JsonNode u) {
        String chassis = u.path("chassis").asText("").trim();
        String modelCode = u.path("model").asText("").trim();
        String name = u.path("name").asText("").trim();

        String model = !chassis.isEmpty() ? chassis : (!name.isEmpty() ? name : "Unknown Unit");
        String variant = modelCode;

        String techBase = u.hasNonNull("techBase") ? u.path("techBase").asText().trim() : null;
        Integer tonnage = u.hasNonNull("tons") ? (int) Math.round(u.get("tons").asDouble()) : null;
        Integer bv = u.hasNonNull("bv") ? u.get("bv").asInt() : null;

        JsonNode asNode = u.path("as");
        Integer pv = null;
        if (asNode.hasNonNull("PV")) {
            pv = asNode.get("PV").asInt();
        } else if (u.hasNonNull("pv")) {
            pv = u.get("pv").asInt();
        }

        Integer asSize = null;
        if (asNode.hasNonNull("SZ")) {
            asSize = asNode.get("SZ").asInt();
        }

        String type = null;
        if (asNode.hasNonNull("TP")) {
            type = asNode.get("TP").asText().trim();
        }
        if (type == null || type.isEmpty() || "UNKNOWN".equalsIgnoreCase(type)) {
            String subType = u.path("subtype").asText("");
            String mainType = u.path("type").asText("");
            type = mapTypeFallback(mainType, subType);
        }

        return CombatUnit.builder()
                .model(model)
                .variant(variant)
                .type(type)
                .techBase(techBase)
                .tonnage(tonnage)
                .bv(bv)
                .pv(pv)
                .asSize(asSize)
                .build();
    }

    private String mapTypeFallback(String mainType, String subType) {
        if ("BattleMek".equalsIgnoreCase(subType) || "Mek".equalsIgnoreCase(mainType)) {
            return "BM";
        }
        if ("Combat Vehicle".equalsIgnoreCase(subType) || "Tank".equalsIgnoreCase(mainType)) {
            return "CV";
        }
        if ("ProtoMek".equalsIgnoreCase(subType) || "ProtoMek".equalsIgnoreCase(mainType)) {
            return "PM";
        }
        if ("Battle Armor".equalsIgnoreCase(subType) || "Infantry".equalsIgnoreCase(mainType)) {
            return "BA";
        }
        if ("IndustrialMek".equalsIgnoreCase(subType)) {
            return "IM";
        }
        if ("Conventional Infantry".equalsIgnoreCase(subType)) {
            return "CI";
        }
        return "BM";
    }
}
