package com.hotspotscamp.dto.ruleConfiguration;

import java.util.List;
import java.util.Map;

public record ContractTableConfigV2(int diceCount, int diceSides, List<RollToStepEntry> rollToStep, Map<String, Integer> employerModifiers, Map<String, Integer> missionModifiers) {

}
