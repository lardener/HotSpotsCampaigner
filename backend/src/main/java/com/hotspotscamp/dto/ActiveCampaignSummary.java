package com.hotspotscamp.dto;

import java.util.UUID;

public record ActiveCampaignSummary(UUID id, String name, String systemName, Integer trackCount, String primaryEmployer, String secondaryEmployer) {

}