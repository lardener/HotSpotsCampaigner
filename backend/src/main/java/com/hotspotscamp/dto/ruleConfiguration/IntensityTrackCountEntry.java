package com.hotspotscamp.dto.ruleConfiguration;

import java.util.List;

public record IntensityTrackCountEntry(int count, List<IntensityMonthEntry> months) {
}
