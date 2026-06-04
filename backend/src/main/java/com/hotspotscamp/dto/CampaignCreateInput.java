package com.hotspotscamp.dto;

import java.util.List;

public record CampaignCreateInput(String name, String employer, String opponent, String mission, String employerCategory, String opponentCategory, String oppMission, String systemName, String description, String status, Double payRate, String salvageTerms, String supportTerms, String transportTerms, String commandRights, Integer payStep, Integer salvageStep, Integer supportStep, Integer transportStep, Integer commandStep, Double oppPayRate, Integer oppPayStep, String oppSalvageTerms, Integer oppSalvageStep, String oppSupportTerms, Integer oppSupportStep, String oppTransportTerms, Integer oppTransportStep, String oppCommandRights, Integer oppCommandStep, Integer trackCount, Integer lengthInMonths, Integer monthlyPay, Integer monthlyMaintenance, Integer transportationCost, Integer combatPay, RepairRules repairRules, List<GeneratedTrack> tracks) {

}