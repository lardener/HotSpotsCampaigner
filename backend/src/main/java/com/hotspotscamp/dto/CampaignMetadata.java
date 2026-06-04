package com.hotspotscamp.dto;

import com.hotspotscamp.service.RuleConfigurationService;
import java.util.List;

public record CampaignMetadata(RuleConfigurationService.MissionMetadata missions, List<String> trackTypes, List<String> factions, List<String> employerTypes, List<RuleConfigurationService.ResolvedStepEntry> resolvedSteps, RepairRules repairRules, List<String> unitTypes, List<String> techBases, List<String> unitStatuses) {

}