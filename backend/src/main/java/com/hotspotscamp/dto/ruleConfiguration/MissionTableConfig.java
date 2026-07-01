package com.hotspotscamp.dto.ruleConfiguration;

import java.util.List;

public record MissionTableConfig(int diceCount, int diceSides, List<MissionEntry> entries) {

}
