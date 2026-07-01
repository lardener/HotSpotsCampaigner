package com.hotspotscamp.dto.ruleConfiguration;

import java.util.List;

public record TrackCountTableConfig(int diceCount, int diceSides, List<TrackCountGroup> groups) {

}
