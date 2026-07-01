package com.hotspotscamp.dto.ruleConfiguration;

import java.util.Map;

public record ResolvedStepEntry(Integer step, Map<String, String> values) {
}
