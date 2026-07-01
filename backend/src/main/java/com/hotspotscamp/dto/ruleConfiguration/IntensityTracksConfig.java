package com.hotspotscamp.dto.ruleConfiguration;

import java.util.List;

public record IntensityTracksConfig(int diceCount, int diceSides, List<IntensityTrackCountEntry> tracks) {

}
