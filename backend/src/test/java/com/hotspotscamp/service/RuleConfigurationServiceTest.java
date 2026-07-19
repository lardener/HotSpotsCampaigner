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

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.hotspotscamp.dto.ruleConfiguration.ContractStepEntry;
import com.hotspotscamp.dto.ruleConfiguration.ContractStepsTableConfig;

@ExtendWith(MockitoExtension.class)
class RuleConfigurationServiceTest {

    @InjectMocks
    private RuleConfigurationService ruleConfigurationService;

    @Test
    void getResolvedStepsTable_ShouldReturnCorrectMappings() {
        // Arrange
        ContractStepEntry entry = new ContractStepEntry(
                7, "100%", "None", "None", "None", "House");
        ContractStepsTableConfig config = new ContractStepsTableConfig(
                2, 6, List.of(entry));

        ReflectionTestUtils.setField(ruleConfigurationService, "contractStepsTableConfig", config);

        // Act
        Map<Integer, Map<String, String>> result = ruleConfigurationService.getResolvedStepsTable();

        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey(7));
        assertEquals("100%", result.get(7).get("payRate"));
        assertEquals("House", result.get(7).get("commandRights"));
    }
}
