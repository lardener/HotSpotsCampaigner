package com.hotspotscamp.dto;

import java.util.List;
import java.util.Map;

public class RuleConfigurationDTOs {

    public record RollEntry(int minRoll, int maxRoll, String value) {

    }

    public record CountEntry(int minRoll, int maxRoll, int value) {

    }

    public record SubTable(int diceCount, int diceSides, List<RollEntry> entries) {

    }

    public record MissionEntry(int minRoll, int maxRoll, SubTable primary, SubTable opponent) {

    }

    public record MissionTableConfig(int diceCount, int diceSides, List<MissionEntry> entries) {

    }

    public record SystemEntry(int roll, String name) {

    }

    public record SystemGroup(int roll, List<SystemEntry> entries) {

    }

    public record SystemTableConfig(Integer groupDiceCount, Integer groupDiceSides, Integer entryDiceCount, Integer entryDiceSides, List<SystemGroup> groups) {

    }

    public record ContractStepEntry(int step, String payRate, String salvageRights, String supportRights, String transportation, String commandRights) {

    }

    public record ContractStepsTableConfig(int diceCount, int diceSides, List<ContractStepEntry> entries) {

    }

    public record RollToStepEntry(int minRoll, int maxRoll, int step) {

    }

    public record TrackGroup(List<String> missions, List<RollEntry> entries) {

    }

    public record TrackTableConfig(int diceCount, int diceSides, List<TrackGroup> groups) {

    }

    public record TrackCountGroup(List<String> missions, List<CountEntry> entries) {

    }

    public record TrackCountTableConfig(int diceCount, int diceSides, List<TrackCountGroup> groups) {

    }

    public record EmployerEntry(int roll, String type) {

    }

    public record ComplicationRule(int diceCount, int diceSides, int modifier) {

    }

    public record ComplicationsTableConfig(Map<String, ComplicationRule> rules, List<RollEntry> entries) {

    }

    public record EmployerTableConfig(int diceCount, int diceSides, List<EmployerEntry> entries) {

    }

    public record ContractTableConfigV2(int diceCount, int diceSides, List<RollToStepEntry> rollToStep, Map<String, Integer> employerModifiers, Map<String, Integer> missionModifiers) {

    }

    public record IntensityMonthEntry(int minRoll, int maxRoll, String intensity) {

    }

    public record IntensityTrackCountEntry(int count, List<IntensityMonthEntry> months) {

    }

    public record IntensityTracksConfig(int diceCount, int diceSides, List<IntensityTrackCountEntry> tracks) {

    }

    public record IntensityTableEntry(int campaignLength, IntensityTracksConfig tracks) {

    }

    public record AttackerRule(String missionType, List<Integer> primaryAttackerRolls, List<String> attackerTracks, List<String> defenderTracks) {

    }

    public record AttackerDeterminationConfig(int diceCount, int diceSides, List<AttackerRule> rules) {

    }

    public record ResolvedStepEntry(Integer step, Map<String, String> values) {

    }
}
