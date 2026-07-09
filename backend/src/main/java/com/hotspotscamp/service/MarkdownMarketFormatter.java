package com.hotspotscamp.service;

import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.hotspotscamp.dto.CampaignMetadata;
import com.hotspotscamp.entity.CombatUnit;
import com.hotspotscamp.enums.MarketType;
import com.hotspotscamp.enums.RuleSet;
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
                    .append(escapePipe(unit.getModel()))
                    .append(" | ")
                    .append(escapePipe(unit.getVariant()))
                    .append(" | ")
                    .append(TypeUtils.asInt(unit.getBv()))
                    .append(" [")
                    .append(TypeUtils.asInt(unit.getPv()))
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
                "hsc://procure?model=%s&variant=%s&bv=%d&pv=%d&sz=%d&type=%s&tech=%s&tons=%d&price=%d",
                encodeURIComponent(getDisplayName(unit)),
                encodeURIComponent(safeString(unit.getVariant())),
                TypeUtils.asInt(unit.getBv()),
                TypeUtils.asInt(unit.getPv()),
                TypeUtils.asInt(unit.getAsSize()),
                encodeURIComponent(safeString(unit.getType())),
                encodeURIComponent(safeString(unit.getTechBase())),
                TypeUtils.asInt(unit.getTonnage()),
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
    /**
     * Parse a markdown table back into a list of CombatUnits. Used for scrapper
     * pool randomization.
     */
    public List<CombatUnit> parseUnitTable(String markdown) {
        if (markdown == null || markdown.isBlank()) {
            return java.util.List.of();
        }

        List<CombatUnit> units = new ArrayList<>();
        String[] lines = markdown.split("\n");

        for (String line : lines) {
            // Skip header, separator, or empty lines
            if (line.contains("---") || line.toLowerCase().contains("condition") || line.trim().isEmpty()) {
                continue;
            }

            String[] columns = line.split("\\|");

            if (columns.length < 6) {
                continue;
            }

            try {
                String model = columns[1].trim();
                String variant = columns[2].trim();
                String[] bvpv = columns[3].split(" ");
                Integer bv = TypeUtils.asInt(bvpv[0].trim());
                Integer pv = TypeUtils.asInt(bvpv[1].replace('[', ' ').replace(']', ' ').trim());
                String tech = columns[4].trim();
                String status = columns[5].trim();

                CombatUnit unit = CombatUnit.builder()
                        .model(model)
                        .variant(variant)
                        .bv(bv)
                        .pv(pv)
                        .techBase(tech)
                        .status(status)
                        .build();
                units.add(unit);
            } catch (Exception e) {
                log.warn("Failed to parse unit from markdown line: {}", line);
            }
        }

        return units;
    }
}
