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
