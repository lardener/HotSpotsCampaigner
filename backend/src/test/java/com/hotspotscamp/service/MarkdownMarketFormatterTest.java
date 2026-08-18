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

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.Mock;
import static org.mockito.Mockito.lenient;
import org.mockito.junit.jupiter.MockitoExtension;

import com.hotspotscamp.dto.CampaignMetadata;
import com.hotspotscamp.dto.ruleConfiguration.MissionMetadata;
import com.hotspotscamp.entity.CombatUnit;
import com.hotspotscamp.enums.MarketType;
import com.hotspotscamp.enums.RuleSet;
import com.hotspotscamp.util.RulesConstants;

@ExtendWith(MockitoExtension.class)
class MarkdownMarketFormatterTest {

    @Mock
    private PriceComputationService priceComputationService;

    private MarkdownMarketFormatter formatter;

    private CampaignMetadata metadata;

    @BeforeEach
    void setUp() {
        formatter = new MarkdownMarketFormatter(priceComputationService);
        metadata = new CampaignMetadata(
                new MissionMetadata(List.of("Raid"), List.of("Defense")),
                List.of("Assault"),
                Collections.emptyList(),
                Collections.emptyList(),
                Collections.emptyList(),
                RulesConstants.UNIT_TYPES,
                RulesConstants.TECH_BASES,
                RulesConstants.UNIT_STATUS_OPTIONS,
                0.5, 2.0, 3.0, 5.0, 0.5, 1.5, 2.0, 0.5,
                40, 20, 10, 20, 100, 150, 20, 30, 2, 10, 500, 250, 250, 500, 750, 250);
        lenient().when(priceComputationService.computePrice(any(), any(), any())).thenReturn(123456L);
    }

    private CombatUnit unit(String model, String variant, String tech, String status) {
        return CombatUnit.builder()
                .model(model)
                .variant(variant)
                .techBase(tech)
                .status(status)
                .bv(100)
                .pv(10)
                .asSize(4)
                .type("BM")
                .tonnage(60)
                .build();
    }

    @Test
    void formatUnitTable_emptyList_returnsPlaceholder() {
        String result = formatter.formatUnitTable(
                List.of(), UUID.randomUUID(), MarketType.FREE, metadata, RuleSet.CORE);
        assertEquals("*No units available in this market.*", result);
    }

    @Test
    void formatUnitTable_nullList_returnsPlaceholder() {
        String result = formatter.formatUnitTable(
                null, UUID.randomUUID(), MarketType.FREE, metadata, RuleSet.CORE);
        assertEquals("*No units available in this market.*", result);
    }

    @Test
    void formatUnitTable_rendersRowsWithPriceAndLink() {
        CombatUnit u = unit("Atlas", "AS7-D", "Clan", "OPERATIONAL");
        String result = formatter.formatUnitTable(
                List.of(u), UUID.randomUUID(), MarketType.FREE, metadata, RuleSet.CORE);

        assertTrue(result.contains("## Available Units"));
        assertTrue(result.contains("Atlas"));
        assertTrue(result.contains("AS7-D"));
        assertTrue(result.contains("123,456"));
        assertTrue(result.contains("[Buy](hsc://procure"));
        assertTrue(result.contains("tech=Clan"));
    }

    @Test
    void formatUnitTable_escapesPipesInModel() {
        CombatUnit u = unit("A|B", "Variant", "Inner Sphere", "OPERATIONAL");
        String result = formatter.formatUnitTable(
                List.of(u), UUID.randomUUID(), MarketType.FREE, metadata, RuleSet.CORE);
        assertTrue(result.contains("A\\|B"));
    }

    @Test
    void formatUnitTable_handlesNullFields() {
        CombatUnit u = CombatUnit.builder().build();
        String result = formatter.formatUnitTable(
                List.of(u), UUID.randomUUID(), MarketType.FREE, metadata, RuleSet.CORE);
        assertTrue(result.contains("Unknown Model"));
        assertTrue(result.contains("Unknown Variant"));
        assertTrue(result.contains("N/A"));
    }

    @Test
    void parseUnitTable_nullOrBlank_returnsEmpty() {
        assertTrue(formatter.parseUnitTable(null).isEmpty());
        assertTrue(formatter.parseUnitTable("   ").isEmpty());
        assertTrue(formatter.parseUnitTable("").isEmpty());
    }

    @Test
    void parseUnitTable_roundTripsFormattedTable() {
        CombatUnit u = unit("Atlas", "AS7-D", "Clan", "OPERATIONAL");
        String md = formatter.formatUnitTable(
                List.of(u), UUID.randomUUID(), MarketType.FREE, metadata, RuleSet.CORE);

        List<CombatUnit> parsed = formatter.parseUnitTable(md);
        assertEquals(1, parsed.size());
        assertEquals("Atlas", parsed.get(0).getModel());
        assertEquals("AS7-D", parsed.get(0).getVariant());
        assertEquals("Clan", parsed.get(0).getTechBase());
        assertEquals("OPERATIONAL", parsed.get(0).getStatus());
        assertEquals(100, parsed.get(0).getBv());
        assertEquals(10, parsed.get(0).getPv());
    }

    @Test
    void parseUnitTable_skipsHeaderAndSeparator() {
        String md = "## Available Units\n\n"
                + "| Model | Variant | BV [PV] | Tech | Condition | Price | Action |\n"
                + "|-------|---------|---------|------|-----------|-------|--------|\n"
                + "| Atlas | AS7-D | 100 [10] | Clan | OPERATIONAL | 123,456 | [Buy](x) |\n";
        List<CombatUnit> parsed = formatter.parseUnitTable(md);
        assertEquals(1, parsed.size());
        assertEquals("Atlas", parsed.get(0).getModel());
    }

    @Test
    void parseUnitTable_requiresHeaderRow() {
        // No header + separator row, so no table can be resolved
        String md = "| Only | Two | Columns |\n"
                + "| Atlas | AS7-D | 100 [10] | Clan | OPERATIONAL | 123,456 | [Buy](x) |\n";
        List<CombatUnit> parsed = formatter.parseUnitTable(md);
        assertTrue(parsed.isEmpty());
    }

    @Test
    void parseUnitTable_toleratesShortDataRows() {
        String md = "| Model | Variant | BV [PV] | Tech | Condition |\n"
                + "|-------|---------|---------|------|-----------|\n"
                + "| Atlas |\n"
                + "| |\n";
        List<CombatUnit> parsed = formatter.parseUnitTable(md);
        assertEquals(1, parsed.size());
        assertEquals("Atlas", parsed.get(0).getModel());
        assertTrue(parsed.get(0).getVariant().isEmpty());
    }

    @Test
    void parseUnitTableWithWeights_readsWeightColumnAndLinkLabels() {
        String md = "## Scrapper Pool\n\n"
                + "| Model | Variant | BV [PV] | Tech | Condition | Weight | Source |\n"
                + "| ----- | ------- | ------- | ---- | --------- | ------ | ------ |\n"
                + "| [Tian-Zong](https://mekbay.com/?shareUnit=BMTianZong_TNZN3Jasminda&tab=Sheet) | TNZ-N3 'Jasminda' | 1826 [39] | Inner Sphere | RANDOM | 1 | https://mekbay.com/?shareUnit=BMTianZong_TNZN3Jasminda&tab=Sheet |\n"
                + "| [Griffin](https://mekbay.com/?q=griff&shareUnit=BMGriffin_GRF3N&tab=General&expanded=true) | GRF-3N | 1560 [34] | Inner Sphere | RANDOM | 3 | https://mekbay.com/?q=griff&shareUnit=BMGriffin_GRF3N&tab=General&expanded=true |\n";

        List<MarkdownMarketFormatter.WeightedUnit> parsed = formatter.parseUnitTableWithWeights(md);
        assertEquals(2, parsed.size());

        // Linkified model cells parse back to the plain label text
        assertEquals("Tian-Zong", parsed.get(0).unit().getModel());
        assertEquals("TNZ-N3 'Jasminda'", parsed.get(0).unit().getVariant());
        assertEquals(1826, parsed.get(0).unit().getBv());
        assertEquals(39, parsed.get(0).unit().getPv());
        assertEquals(1, parsed.get(0).weight());
        assertTrue(parsed.get(0).randomCondition());

        assertEquals("Griffin", parsed.get(1).unit().getModel());
        assertEquals(1560, parsed.get(1).unit().getBv());
        assertEquals(3, parsed.get(1).weight());
    }

    @Test
    void parseUnitTableWithWeights_defaultsWeightTo1WhenColumnAbsent() {
        String md = "| Model | Variant | BV [PV] | Tech | Condition |\n"
                + "| ----- | ------- | ------- | ---- | --------- |\n"
                + "| Atlas | AS7-D | 100 [10] | Clan | RANDOM |\n";

        List<MarkdownMarketFormatter.WeightedUnit> parsed = formatter.parseUnitTableWithWeights(md);
        assertEquals(1, parsed.size());
        assertEquals(1, parsed.get(0).weight());
        assertTrue(parsed.get(0).randomCondition());
    }

    @Test
    void parseUnitTableWithWeights_handlesAnyColumnOrderAndInvalidWeight() {
        String md = "| Weight | Model | Variant | BV [PV] | Condition | Source |\n"
                + "| ------ | ----- | ------- | ------- | --------- | ------ |\n"
                + "| 2 | Griffin | GRF-3N | 1560 [34] | CRIPPLED | https://mekbay.com/?shareUnit=BMGriffin_GRF3N |\n"
                + "| abc | Atlas | AS7-D | 100 [10] | RANDOM | https://mekbay.com/?shareUnit=BMAxman_AXM2R |\n";

        List<MarkdownMarketFormatter.WeightedUnit> parsed = formatter.parseUnitTableWithWeights(md);
        assertEquals(2, parsed.size());
        assertEquals("Griffin", parsed.get(0).unit().getModel());
        assertEquals(2, parsed.get(0).weight());
        assertEquals("CRIPPLED", parsed.get(0).unit().getStatus());
        assertFalse(parsed.get(0).randomCondition());
        assertEquals(1, parsed.get(1).weight()); // invalid weight falls back to 1
        assertTrue(parsed.get(1).randomCondition());
    }

    @Test
    void parseUnitTable_skipsNonUnitTables() {
        String md = "## Available Units\n\n"
                + "| Model | Variant | BV [PV] | Tech | Condition | Price | Action |\n"
                + "|-------|---------|---------|------|-----------|-------|--------|\n"
                + "| Atlas | AS7-D | 100 [10] | Clan | OPERATIONAL | 123,456 | [Buy](x) |\n\n"
                + "## Available Pilots\n\n"
                + "| Name | Unit Type | Gunnery | Piloting | Wounds | Price | Action |\n"
                + "|------|-----------|---------|----------|--------|-------|--------|\n"
                + "| Jane Doe | BM | 4 | 5 | 0 | 20000 | [Hire](x) |\n";

        List<CombatUnit> parsed = formatter.parseUnitTable(md);
        assertEquals(1, parsed.size());
        assertEquals("Atlas", parsed.get(0).getModel());
    }

    @Test
    void selectRandomUnitWithCondition_returnsDrawnUnit() {
        String md = "| Model | Variant | BV [PV] | Tech | Condition | Weight |\n"
                + "| ----- | ------- | ------- | ---- | --------- | ------ |\n"
                + "| Griffin | GRF-3N | 1560 [34] | Inner Sphere | RANDOM | 3 |\n"
                + "| Atlas | AS7-D | 100 [10] | Clan | RANDOM | 1 |\n";

        CombatUnit drawn = formatter.selectRandomUnitWithCondition(md);
        assertNotNull(drawn);
        // 2d6 roll always lands in DESTROYED or CRIPPLED
        assertTrue("DESTROYED".equals(drawn.getStatus()) || "CRIPPLED".equals(drawn.getStatus()));
        assertTrue("Griffin".equals(drawn.getModel()) || "Atlas".equals(drawn.getModel()));
    }
}
