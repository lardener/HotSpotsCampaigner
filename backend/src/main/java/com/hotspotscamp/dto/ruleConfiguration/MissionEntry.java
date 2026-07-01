package com.hotspotscamp.dto.ruleConfiguration;

public record MissionEntry(int minRoll, int maxRoll, SubTable primary, SubTable opponent) {

}
