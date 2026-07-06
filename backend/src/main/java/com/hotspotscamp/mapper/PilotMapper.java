package com.hotspotscamp.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.hotspotscamp.dto.PilotUpdateInput;
import com.hotspotscamp.entity.Pilot;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface PilotMapper {

    @Mapping(target = "detachmentId", ignore = true)
    void updatePilotFromDto(PilotUpdateInput dto, @MappingTarget Pilot entity);
}
