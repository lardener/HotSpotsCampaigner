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

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;

import com.hotspotscamp.dto.CampaignMetadata;
import com.hotspotscamp.dto.ruleConfiguration.MissionMetadata;
import com.hotspotscamp.entity.CombatUnit;
import com.hotspotscamp.enums.RuleSet;
import com.hotspotscamp.util.RulesConstants;

class PriceComputationServiceTest {

    private final PriceComputationService service = new PriceComputationService();

    private CampaignMetadata metadata(
            Double clanMod, Double mixedMod, Integer pvMultiplier) {
        return new CampaignMetadata(
                new MissionMetadata(List.of("Raid"), List.of("Defense")),
                List.of("Assault"),
                Collections.emptyList(),
                Collections.emptyList(),
                Collections.emptyList(),
                RulesConstants.UNIT_TYPES,
                RulesConstants.TECH_BASES,
                RulesConstants.UNIT_STATUS_OPTIONS,
                0.5, 2.0, 3.0, 5.0, 0.5, mixedMod, clanMod, 0.5,
                pvMultiplier, 20, 10, 20, 100, 150, 20, 30, 2, 10, 500, 250, 250, 500, 750, 250);
    }

    private CombatUnit unit(String techBase, Integer bv, Integer pv) {
        return CombatUnit.builder().model("Atlas").variant("AS7-D").techBase(techBase).bv(bv).pv(pv).build();
    }

    @Test
    void computePrice_alphaStrike_usesPvMultiplier() {
        CampaignMetadata meta = metadata(2.0, 1.5, 40);
        assertEquals(400, service.computePrice(unit("Inner Sphere", 100, 10), meta, RuleSet.ALPHA_STRIKE));
    }

    @Test
    void computePrice_alphaStrike_usesDefaultMultiplierWhenNull() {
        CampaignMetadata meta = metadata(2.0, 1.5, null);
        assertEquals(
                10 * RulesConstants.PURCHASE_UNIT_POINT_VALUE_MULTIPLIER,
                service.computePrice(unit("Clan", 100, 10), meta, RuleSet.ALPHA_STRIKE));
    }

    @Test
    void computePrice_core_innerSphere_usesTaxOne() {
        CampaignMetadata meta = metadata(2.0, 1.5, 40);
        assertEquals(100, service.computePrice(unit("Inner Sphere", 100, 10), meta, RuleSet.CORE));
    }

    @Test
    void computePrice_core_clan_usesClanTax() {
        CampaignMetadata meta = metadata(2.0, 1.5, 40);
        assertEquals(200, service.computePrice(unit("Clan", 100, 10), meta, RuleSet.CORE));
    }

    @Test
    void computePrice_core_mixed_usesMixedTax() {
        CampaignMetadata meta = metadata(2.0, 1.5, 40);
        assertEquals(150, service.computePrice(unit("Mixed", 100, 10), meta, RuleSet.CORE));
    }

    @Test
    void computePrice_core_usesDefaultTaxesWhenNull() {
        CampaignMetadata meta = metadata(null, null, 40);
        assertEquals(200, service.computePrice(unit("Clan", 100, 10), meta, RuleSet.CORE));
        assertEquals(150, service.computePrice(unit("Mixed", 100, 10), meta, RuleSet.CORE));
        assertEquals(100, service.computePrice(unit("Inner Sphere", 100, 10), meta, RuleSet.CORE));
    }

    @Test
    void computePrice_core_roundsUpWithCeil() {
        CampaignMetadata meta = metadata(1.5, 1.5, 40);
        // 101 * 1.5 = 151.5 -> ceil -> 152
        assertEquals(152, service.computePrice(unit("Mixed", 101, 10), meta, RuleSet.CORE));
    }

    @Test
    void computePrice_nullInputs_returnsFallback() {
        CampaignMetadata meta = metadata(2.0, 1.5, 40);
        assertEquals(1000000, service.computePrice(null, meta, RuleSet.CORE));
        assertEquals(1000000, service.computePrice(unit("Clan", 100, 10), null, RuleSet.CORE));
        assertEquals(1000000, service.computePrice(unit("Clan", 100, 10), meta, null));
    }
}
