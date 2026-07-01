package com.hotspotscamp.dto.ruleConfiguration;

import java.util.List;

public record ContractStepsTableConfig(int diceCount, int diceSides, List<ContractStepEntry> entries) {

}
