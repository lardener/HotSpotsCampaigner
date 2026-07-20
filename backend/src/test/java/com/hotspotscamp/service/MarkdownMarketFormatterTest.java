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
    void parseUnitTable_ignoresMalformedLines() {
        String md = "| Only | Two | Columns |\n"
                + "| Atlas | AS7-D | 100 [10] | Clan | OPERATIONAL | 123,456 | [Buy](x) |\n";
        List<CombatUnit> parsed = formatter.parseUnitTable(md);
        assertEquals(1, parsed.size());
        assertFalse(parsed.isEmpty());
    }
}
