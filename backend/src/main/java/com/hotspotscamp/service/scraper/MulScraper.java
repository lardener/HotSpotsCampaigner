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

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.hotspotscamp.entity.CombatUnit;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Component
public class MulScraper implements UnitScraper {

    private static final Logger log = LoggerFactory.getLogger(MulScraper.class);

    @Override
    public boolean supports(String url) {
        return url.contains("masterunitlist.info");
    }

    @Override
    public Flux<CombatUnit> scrape(String url) {
        log.info("Scraping unit from URL: {}", url);
        String unitId = extractRegex(url, "Details/(\\d+)");
        if (unitId == null) {
            return Flux.error(new IllegalArgumentException("Could not resolve unit ID from URL: " + url));
        }

        String twTargetUrl = "http://masterunitlist.info/Unit/Details/" + unitId;
        String asTargetUrl = "http://masterunitlist.info/Tools/CustomCard/" + unitId;

        log.info("TW Target URL: {}", twTargetUrl);
        log.info("AS Target URL: {}", asTargetUrl);

        return Mono.fromCallable(() -> {
            log.info("Fetching TW document from: {}", twTargetUrl);
            Document twDoc = Jsoup.connect(twTargetUrl).get();
            log.info("Fetching AS document from: {}", asTargetUrl);
            Document asDoc = Jsoup.connect(asTargetUrl).get();
            CombatUnit unit = initializeUnit(twDoc);
            // Phase 1: Core Technical Data
            scrapePhase1(unit, twDoc);
            // Phase 2: Alpha Strike Data
            scrapePhase2(unit, asDoc);
            log.info("Finished scraping unit: type:{}, model:{}, variant:{}, techBase:{}, tonnage:{}, bv:{}, size:{}, pv:{}", unit.getType(), unit.getModel(), unit.getVariant(), unit.getTechBase(), unit.getTonnage(), unit.getBv(), unit.getAsSize(), unit.getPv());
            return unit;
        })
                .subscribeOn(Schedulers.boundedElastic())
                .flux();
    }

    private CombatUnit initializeUnit(Document doc) {
        Element h2 = doc.select("h2").first();
        String nameLine = h2 != null ? h2.text() : "Unknown Unit";
        String model = nameLine;
        String variant = "";

        if (nameLine.contains(" ")) {
            int lastSpace = nameLine.lastIndexOf(" ");
            model = nameLine.substring(0, lastSpace);
            variant = nameLine.substring(lastSpace + 1);
        }

        return CombatUnit.builder()
                .model(model)
                .variant(variant)
                .build();
    }

    /**
     * Scrapes Total Warfare data from the main MUL unit page
     *
     * @param unit
     * @param doc
     */
    private void scrapePhase1(CombatUnit unit, Document doc) {
        for (Element dt : doc.select("dt")) {
            String label = dt.text().trim();
            Element dd = dt.nextElementSibling();
            if (dd == null) {
                continue;
            }
            String val = dd.text().trim();

            switch (label) {
                case "Tonnage" ->
                    unit.setTonnage(parseSafeInt(val));
                case "Battle Value", "Battle Value 2.0" ->
                    unit.setBv(parseSafeInt(val.replace(",", "")));
                case "Technology" ->
                    unit.setTechBase(val);
            }
        }
    }

    /**
     * Scrapes Alpha Strike data from the MUL Custom Card page
     *
     * @param unit
     * @param doc
     */
    private void scrapePhase2(CombatUnit unit, Document doc) {
        log.info("Starting to read custom card data for unit: " + unit.getModel() + " " + unit.getVariant());
        unit.setPv(parseSafeInt(doc.getElementById("Data_PV").attr("value").trim()));
        unit.setType(doc.getElementById("Data_Type").attr("value").trim());
        unit.setAsSize(parseSafeInt(doc.getElementById("Data_Size").attr("value").trim()));
        log.info("Finished reading custom card data for unit: " + unit.getModel() + " " + unit.getVariant());
    }

}
