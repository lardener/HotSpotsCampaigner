package com.hotspotscamp.service;

import static org.junit.jupiter.api.Assertions.*;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class RuleConfigurationServiceTest {

    @InjectMocks
    private RuleConfigurationService ruleConfigurationService;

    @Test
    void getResolvedStepsTable_ShouldReturnCorrectMappings() {
        // Arrange
        RuleConfigurationService.ContractStepEntry entry = new RuleConfigurationService.ContractStepEntry(
                7, "100%", "None", "None", "None", "House");
        RuleConfigurationService.ContractStepsTableConfig config = new RuleConfigurationService.ContractStepsTableConfig(
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
