package com.hotspotscamp.dto.ruleConfiguration;

import java.util.List;

public record AttackerRule(String missionType, List<Integer> primaryAttackerRolls, List<String> attackerTracks, List<String> defenderTracks) {
}
