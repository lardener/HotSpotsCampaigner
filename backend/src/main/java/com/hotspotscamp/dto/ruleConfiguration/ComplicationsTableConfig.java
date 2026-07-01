package com.hotspotscamp.dto.ruleConfiguration;

import java.util.List;
import java.util.Map;

public record ComplicationsTableConfig(Map<String, ComplicationRule> rules, List<RollEntry> entries) {

}
