package com.hotspotscamp.dto;

import java.util.UUID;

public record TrackUpdateInput(String trackName, Integer sequenceOrder, String location, String nextSession, UUID attackerFactionId, Integer monthIndex, String complications, String oppositionComplications, String afterActionNarrative) {

}