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
