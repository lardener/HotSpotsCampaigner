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
package com.hotspotscamp.service;

import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;

import com.hotspotscamp.dto.CampaignMetadata;
import com.hotspotscamp.entity.CombatUnit;
import com.hotspotscamp.enums.MarketType;
import com.hotspotscamp.enums.RuleSet;
import com.hotspotscamp.util.DiceUtils;
import com.hotspotscamp.util.TypeUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Formats scraped CombatUnits into markdown tables with embedded hsc:// links.
 * Also parses markdown back into CombatUnit lists (for scrapper pool
 * randomization).
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class MarkdownMarketFormatter {

    private final PriceComputationService priceComputationService;

    // ----- FORMATTING -----
    /**
     * Format a list of CombatUnits into a markdown table with
     * hsc://market/purchase links.
     *
     * @param units list of scraped units
     * @param campaignId campaign UUID
     * @param marketType the market slot (FREE, SCRAPPERS, etc.)
     * @param metadata campaign metadata with pricing multipliers
     * @return markdown table string
     */
    public String formatUnitTable(List<CombatUnit> units, UUID campaignId, MarketType marketType, CampaignMetadata metadata, RuleSet ruleSet) {
        if (units == null || units.isEmpty()) {
            return "*No units available in this market.*";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("## Available Units\n\n");
        sb.append("| Model | Variant | BV [PV] | Tech | Condition | Price | Action |\n");
        sb.append("|-------|---------|---------|------|-----------|-------|--------|\n");

        for (CombatUnit unit : units) {
            long price = priceComputationService.computePrice(unit, metadata, ruleSet);
            String hscLink = buildPurchaseLink(unit, price);

            sb.append("| ")
                    .append(escapePipe(unit.getModel() != null ? unit.getModel() : "Unknown Model"))
                    .append(" | ")
                    .append(escapePipe(unit.getVariant() != null ? unit.getVariant() : "Unknown Variant"))
                    .append(" | ")
                    .append(safeInt(unit.getBv()))
                    .append(" [")
                    .append(safeInt(unit.getPv()))
                    .append("] | ")
                    .append(safeString(unit.getTechBase()))
                    .append(" | ")
                    .append(safeString(unit.getStatus()))
                    .append(" | ")
                    .append(formatCBills(price))
                    .append(" | [Buy](").append(hscLink).append(")")
                    .append(" |\n");
        }

        return sb.toString();
    }

    // ----- LINK BUILDING -----
    /**
     * Build an hsc://procure link for a unit.
     */
    private String buildPurchaseLink(CombatUnit unit, long price) {
        return String.format(
                "hsc://procure?model=%s&variant=%s&bv=%s&pv=%s&sz=%s&type=%s&tech=%s&tons=%s&price=%d",
                encodeURIComponent(getDisplayName(unit)),
                encodeURIComponent(safeString(unit.getVariant())),
                safeInt(unit.getBv()),
                safeInt(unit.getPv()),
                safeInt(unit.getAsSize()),
                encodeURIComponent(safeString(unit.getType())),
                encodeURIComponent(safeString(unit.getTechBase())),
                safeInt(unit.getTonnage()),
                price
        );
    }

    // ----- HELPERS -----
    private String getDisplayName(CombatUnit unit) {
        String model = unit.getModel(); // Ensure model is not null
        String variant = unit.getVariant(); // Ensure variant is not null
        if (model == null || model.isEmpty()) {
            model = "Unknown Model";
        }
        if (variant == null || variant.isEmpty()) {
            variant = "Unknown Variant";
        }
        return model + " " + variant;
    }

    private String escapePipe(String text) {
        return text != null ? text.replace("|", "\\|") : "";
    }

    private String safeString(String val) {
        return val != null ? val : "N/A";
    }

    private String safeInt(Integer val) {
        return val != null ? String.valueOf(val) : "N/A";
    }

    private String formatCBills(long amount) {
        return String.format("%,d", amount);
    }

    private String encodeURIComponent(String s) {
        try {
            return java.net.URLEncoder.encode(s, "UTF-8").replace("+", "%20");
        } catch (UnsupportedEncodingException e) {
            return s;
        }
    }

    // ----- PARSING -----
    private static final Pattern SEPARATOR_CELL = Pattern.compile("^:?-+:?$");

    private static final Pattern MARKDOWN_LINK = Pattern.compile("\\[([^\\]]*)\\]\\(([^)]+)\\)");

    private static boolean isTableRow(String line) {
        return line != null && line.trim().startsWith("|");
    }

    /**
     * Split a markdown table row into trimmed cell values (leading/trailing
     * empty cells from the outer pipes are removed).
     */
    private static String[] splitRow(String line) {
        String t = line.trim();
        if (t.startsWith("|")) {
            t = t.substring(1);
        }
        if (t.endsWith("|")) {
            t = t.substring(0, t.length() - 1);
        }
        String[] cells = t.split("\\|", -1);
        for (int i = 0; i < cells.length; i++) {
            cells[i] = cells[i].trim();
        }
        return cells;
    }

    private static boolean isSeparatorRow(String[] cells) {
        if (cells.length == 0) {
            return false;
        }
        for (String cell : cells) {
            if (cell.isEmpty() || !SEPARATOR_CELL.matcher(cell).matches()) {
                return false;
            }
        }
        return true;
    }

    /**
     * Mapped unit-table column indexes, resolved from the table's header row.
     * An index of -1 means the column is not present in the table. Optional
     * columns (Weight, Source, ...) may appear in any order or be absent.
     */
    private record ColumnMap(int model, int variant, int bvPv, int tech, int condition, int weight) {

        static ColumnMap fromHeader(String[] header) {
            return new ColumnMap(
                    findHeaderIndex(header, "model"),
                    findHeaderIndex(header, "variant"),
                    findHeaderIndex(header, "bv [pv]", "bv", "bv/pv"),
                    findHeaderIndex(header, "tech", "tech base", "technology"),
                    findHeaderIndex(header, "condition", "status"),
                    findHeaderIndex(header, "weight"));
        }
    }

    private record ParsedTable(ColumnMap map, List<String[]> rows) {

    }

    /**
     * Parse all unit tables in a markdown document into their header (column
     * map) and data rows. A markdown document may contain several tables (e.g.
     * a unit table and a pilot table); only tables whose header includes a
     * Model column are returned.
     */
    private static List<ParsedTable> parseTables(String markdown) {
        List<String[]> rows = new ArrayList<>();
        for (String line : markdown.split("\n")) {
            if (isTableRow(line)) {
                rows.add(splitRow(line));
            }
        }

        List<ParsedTable> tables = new ArrayList<>();
        int i = 0;
        while (i < rows.size()) {
            if (i + 1 < rows.size() && !isSeparatorRow(rows.get(i)) && isSeparatorRow(rows.get(i + 1))) {
                ColumnMap map = ColumnMap.fromHeader(rows.get(i));
                // A unit table must have both a Model and a BV [PV] column;
                // this keeps other tables (e.g. pilot tables) out of the pool.
                if (map.model() != -1 && map.bvPv() != -1) {
                    List<String[]> data = new ArrayList<>();
                    int r = i + 2;
                    // Data rows run until the next separator row or the header
                    // row of the next table (a row directly above a separator).
                    while (r < rows.size() && !isSeparatorRow(rows.get(r))
                            && !(r + 1 < rows.size() && isSeparatorRow(rows.get(r + 1)))) {
                        data.add(rows.get(r));
                        r++;
                    }
                    tables.add(new ParsedTable(map, data));
                    i = r;
                    continue;
                }
            }
            i++;
        }
        return tables;
    }

    /**
     * Index of the first cell whose (trimmed, case-insensitive) value matches
     * the header name or one of its aliases. Returns -1 when absent.
     */
    private static int findHeaderIndex(String[] header, String name, String... aliases) {
        List<String> candidates = new ArrayList<>();
        candidates.add(name.toLowerCase(Locale.ROOT));
        if (aliases != null) {
            for (String alias : aliases) {
                candidates.add(alias.toLowerCase(Locale.ROOT));
            }
        }
        for (int i = 0; i < header.length; i++) {
            String c = header[i].toLowerCase(Locale.ROOT);
            if (candidates.contains(c)) {
                return i;
            }
        }
        return -1;
    }

    private static String cell(String[] cells, int index) {
        return index >= 0 && index < cells.length ? cells[index] : "";
    }

    /**
     * Reduce a markdown link cell such as
     * `[Griffin](https://mekbay.com/?shareUnit=...)` to its label text, so
     * linkified unit names parse back to the plain name.
     */
    private static String cellLabel(String cellText) {
        if (cellText == null) {
            return "";
        }
        Matcher m = MARKDOWN_LINK.matcher(cellText);
        if (m.find()) {
            return m.group(1).trim();
        }
        return cellText.trim();
    }

    private static CombatUnit buildUnit(String[] cells, ColumnMap map) {
        Integer bv = null;
        Integer pv = null;
        String bvpv = cell(cells, map.bvPv());
        if (!bvpv.isEmpty() && bvpv.contains("[")) {
            String[] parts = bvpv.split("\\s+");
            bv = TypeUtils.asInt(parts[0], null);
            pv = TypeUtils.asInt(parts[1].replace('[', ' ').replace(']', ' ').trim(), null);
        }

        return CombatUnit.builder()
                .model(cellLabel(cell(cells, map.model())))
                .variant(cellLabel(cell(cells, map.variant())))
                .bv(bv)
                .pv(pv)
                .techBase(cell(cells, map.tech()))
                .status(cell(cells, map.condition()))
                .build();
    }

    /**
     * Parse a markdown table back into a list of CombatUnits. Columns are
     * resolved by header name so tables may include optional columns (e.g.
     * Weight, Source) in any order.
     */
    public List<CombatUnit> parseUnitTable(String markdown) {
        List<CombatUnit> units = new ArrayList<>();
        if (markdown == null || markdown.isBlank()) {
            return units;
        }

        for (ParsedTable table : parseTables(markdown)) {
            for (String[] cells : table.rows()) {
                if (cell(cells, table.map().model()).isEmpty()) {
                    continue; // A row without a model is not a unit row
                }
                try {
                    units.add(buildUnit(cells, table.map()));
                } catch (Exception e) {
                    log.warn("Failed to parse unit from markdown row: {}", String.join("|", cells));
                }
            }
        }

        return units;
    }

    /**
     * A unit paired with its selection weight in a weighted pool.
     */
    public record WeightedUnit(CombatUnit unit, int weight, boolean randomCondition) {

    }

    /**
     * Parse a markdown table back into a list of CombatUnits with their
     * associated selection weights. The Weight column is optional (header
     * "Weight"); when absent or invalid the weight defaults to 1.
     */
    public List<WeightedUnit> parseUnitTableWithWeights(String markdown) {
        List<WeightedUnit> weightedUnits = new ArrayList<>();
        if (markdown == null || markdown.isBlank()) {
            return weightedUnits;
        }

        for (ParsedTable table : parseTables(markdown)) {
            for (String[] cells : table.rows()) {
                if (cell(cells, table.map().model()).isEmpty()) {
                    continue; // A row without a model is not a unit row
                }
                try {
                    CombatUnit unit = buildUnit(cells, table.map());

                    int weight = 1;
                    String weightCell = cell(cells, table.map().weight());
                    if (!weightCell.isEmpty()) {
                        try {
                            weight = Integer.parseInt(weightCell);
                        } catch (NumberFormatException e) {
                            log.warn("Invalid weight '{}', defaulting to 1", weightCell);
                        }
                    }

                    boolean isRandom = "RANDOM".equalsIgnoreCase(unit.getStatus());
                    weightedUnits.add(new WeightedUnit(unit, weight, isRandom));
                } catch (Exception e) {
                    log.warn("Failed to parse weighted unit from markdown row: {}", String.join("|", cells));
                }
            }
        }

        return weightedUnits;
    }

    /**
     * Perform a weighted random selection from the scrapper market and roll a
     * 2D6 condition to determine unit status.
     *
     * <ul>
     * <li>Roll 2-4: Unit is DESTROYED (Nearly Impossible)</li>
     * <li>Roll 5-9: Unit is DESTROYED</li>
     * <li>Roll 10-12: Unit is CRIPPLED</li>
     * </ul>
     */
    public CombatUnit selectRandomUnitWithCondition(String markdown) {
        List<WeightedUnit> weightedUnits = parseUnitTableWithWeights(markdown);
        if (weightedUnits.isEmpty()) {
            return null;
        }

        // Calculate total weight
        int totalWeight = weightedUnits.stream().mapToInt(w -> w.weight).sum();
        if (totalWeight <= 0) {
            log.warn("Total weight is zero, falling back to uniform selection");
            totalWeight = weightedUnits.size();
        }

        // Weighted random selection
        int roll = ThreadLocalRandom.current().nextInt(totalWeight);
        int cumulativeWeight = 0;
        WeightedUnit selectedWeightedUnit = weightedUnits.get(weightedUnits.size() - 1); // default to last

        for (WeightedUnit weightedUnit : weightedUnits) {
            cumulativeWeight += weightedUnit.weight;
            if (cumulativeWeight > roll) {
                selectedWeightedUnit = weightedUnit;
                break;
            }
        }

        // Roll 2D6 for condition (only if marked RANDOM)
        if (selectedWeightedUnit.randomCondition()) {
            int conditionRoll = DiceUtils.roll(2, 6);
            if (conditionRoll <= 4) {
                // Nearly Impossible - Destroyed
                selectedWeightedUnit.unit().setStatus("DESTROYED");
                log.info("Scrapper draw: {} {} rolled {} (Nearly Impossible) -> DESTROYED",
                        selectedWeightedUnit.unit().getModel(), selectedWeightedUnit.unit().getVariant(), conditionRoll);
            } else if (conditionRoll <= 9) {
                // Destroyed
                selectedWeightedUnit.unit().setStatus("DESTROYED");
                log.info("Scrapper draw: {} {} rolled {} -> DESTROYED",
                        selectedWeightedUnit.unit().getModel(), selectedWeightedUnit.unit().getVariant(), conditionRoll);
            } else {
                // Crippled (10-12)
                selectedWeightedUnit.unit().setStatus("CRIPPLED");
                log.info("Scrapper draw: {} {} rolled {} -> CRIPPLED",
                        selectedWeightedUnit.unit().getModel(), selectedWeightedUnit.unit().getVariant(), conditionRoll);
            }
        }

        return selectedWeightedUnit.unit();
    }
}
