package com.hotspotscamp.dto.ruleConfiguration;

import java.util.List;

public record TrackTableConfig(int diceCount, int diceSides, List<TrackGroup> groups) {

}
