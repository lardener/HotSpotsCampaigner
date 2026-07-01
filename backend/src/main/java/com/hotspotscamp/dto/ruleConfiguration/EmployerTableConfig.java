package com.hotspotscamp.dto.ruleConfiguration;

import java.util.List;

public record EmployerTableConfig(int diceCount, int diceSides, List<EmployerEntry> entries) {

}
