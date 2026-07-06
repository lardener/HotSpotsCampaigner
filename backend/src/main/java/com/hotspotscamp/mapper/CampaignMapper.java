package com.hotspotscamp.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.hotspotscamp.dto.CampaignUpdateInput;
import com.hotspotscamp.entity.Campaign;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface CampaignMapper {

    void updateCampaignFromDto(CampaignUpdateInput dto, @MappingTarget Campaign entity);
}
