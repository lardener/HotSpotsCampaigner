package com.hotspotscamp.service.scraper;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

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
        String unitId = extractUnitId(url);
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

    private String extractUnitId(String url) {
        Pattern pattern = Pattern.compile("Details/(\\d+)");
        Matcher matcher = pattern.matcher(url);
        return matcher.find() ? matcher.group(1) : null;
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

    private Integer parseSafeInt(String val) {
        try {
            return Integer.valueOf(val);
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}
