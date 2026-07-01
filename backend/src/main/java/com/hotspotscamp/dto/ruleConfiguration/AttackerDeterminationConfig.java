package com.hotspotscamp.dto.ruleConfiguration;

import java.util.List;

public record AttackerDeterminationConfig(int diceCount, int diceSides, List<AttackerRule> rules) {
}
