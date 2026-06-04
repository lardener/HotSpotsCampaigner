package com.hotspotscamp.dto;

import com.hotspotscamp.entity.Campaign;
import com.hotspotscamp.entity.Contract;
import java.util.List;

public record CampaignProposal(Campaign campaign, List<Contract> contracts, List<GeneratedTrack> tracks, String employer, String opponent) {

}
