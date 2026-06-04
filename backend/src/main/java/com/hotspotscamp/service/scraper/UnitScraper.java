package com.hotspotscamp.service.scraper;

import java.util.regex.Pattern;
import java.util.regex.Matcher;

import com.hotspotscamp.entity.CombatUnit;
import com.hotspotscamp.util.TypeUtils;

import reactor.core.publisher.Flux;

public interface UnitScraper {

    boolean supports(String url);

    /**
     * Scrapes the provided link and returns one or more CombatUnits.
     */
    Flux<CombatUnit> scrape(String url);

    default String extractRegex(String text, String patternStr) {
        Pattern pattern = Pattern.compile(patternStr, Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        return null;
    }

    default Integer parseSafeInt(String val) {
        return TypeUtils.asInt(val, 0);
    }
}
