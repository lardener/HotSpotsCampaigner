package com.hotspotscamp.dto.ruleConfiguration;

import java.util.List;

public record SubTable(int diceCount, int diceSides, List<RollEntry> entries) {

}
