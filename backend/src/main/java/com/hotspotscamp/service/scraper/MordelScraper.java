package com.hotspotscamp.service.scraper;

import java.io.IOException;
import java.util.Objects;
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

/**
 * Scraper for Mordel.net TRO pages.
 */
@Component
public class MordelScraper implements UnitScraper {
    private static final Logger log = LoggerFactory.getLogger(MordelScraper.class);

    @Override
    public boolean supports(String url) {
        return url != null && url.contains("mordel.net");
    }

    @Override
    public Flux<CombatUnit> scrape(String url) {
        log.info("Scraping Mordel unit from URL: {}", url);
        return Mono.fromCallable(() -> fetchAndParse(url))
                .subscribeOn(Schedulers.boundedElastic())
                .flux();
    }

    private CombatUnit fetchAndParse(String url) throws IOException {
        // Connect with a user agent to avoid bot blocking
        Document doc = Jsoup.connect(url)
                .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                .get();

        Element troCell = doc.getElementById("trocell");
        if (troCell == null) {
            log.warn("Mordel Scraper: Target element '#trocell' not found at URL: {}", url);
        }
        String troContent = troCell != null ? troCell.text() : "";
        log.info("TRO content: {}", troContent.substring(0, 200));
        String model = Objects.requireNonNullElse(extractRegex(troContent, "Name/Model:\\s*(.+?)(?=\\s*Designer:|$)"), "UNKNOWN MODEL").trim();
        log.info("model extracted: {}", model);
        String variant = "";

        // Mordel titles usually follow "Model Variant" pattern, e.g., "Catapult CPLT-C1"
        if (model.contains(" ")) {
            int lastSpace = model.lastIndexOf(" ");
            variant = model.substring(lastSpace + 1).trim();
            model = model.substring(0, lastSpace).trim();
        }

        String type = parseUnitTypeFromUrl(url);
        String techBase = extractRegex(troContent, "Technology:\\s*(.+?)(?=\\s*Technology Rating:|$)");
        if (Objects.requireNonNullElse(techBase, "").contains("Mixed")) {
            techBase = "Mixed";
        }
        Integer tonnage = parseSafeInt(extractRegex(troContent, "Tonnage:\\s*(\\d+)"));
        Integer bv = parseSafeInt(extractRegex(troContent, "Battle Value:\\s*([\\d,]+)"));

        // Alpha Strike data (if available on the TRO page)
        Integer pv = parseSafeInt(extractRegex(troContent, "Point Value \\(PV\\):\\s*(\\d+)"));
        Integer size = parseSafeInt(extractRegex(troContent, "\\sSZ:\\s*(\\d+)"));

        return CombatUnit.builder()
                .model(model)
                .variant(variant)
                .type(type)
                .techBase(techBase)
                .tonnage(tonnage)
                .bv(bv)
                .pv(pv)
                .asSize(size)
                .build();
    }

    private String extractRegex(String text, String patternStr) {
        Pattern pattern = Pattern.compile(patternStr, Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        log.warn("Mordel Scraper: Regex match failed for pattern: {}", patternStr);
        return null;
    }

    private String parseUnitTypeFromUrl(String url) {
        if (url.contains("ut=bm")) {
            return "BM";
        }
        if (url.contains("ut=cv")) {
            return "CV";
        }
        if (url.contains("ut=pm")) {
            return "PM";
        }
        if (url.contains("ut=ba")) {
            return "BA";
        }
        if (url.contains("ut=ci")) {
            return "CI";
        }
        if (url.contains("ut=im")) {
            return "IM";
        }
        return "BM";
    }

    private Integer parseSafeInt(String val) {
        if (val == null || val.isEmpty()) {
            return 0;
        }
        try {
            String cleaned = val.replaceAll("[^0-9]", "");
            return cleaned.isEmpty() ? 0 : Integer.valueOf(cleaned);
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}
