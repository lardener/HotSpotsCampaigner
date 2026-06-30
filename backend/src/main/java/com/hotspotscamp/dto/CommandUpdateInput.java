package com.hotspotscamp.dto;

public record CommandUpdateInput(
        String name,
        String commandingOfficer,
        Integer totalSupportPoints,
        Integer reputation
        ) {

}
