package com.hotspotscamp.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.hotspotscamp.dto.CommandUpdateInput;
import com.hotspotscamp.entity.MercenaryCommand;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface CommandMapper {

    void updateCommandFromDto(CommandUpdateInput dto, @MappingTarget MercenaryCommand entity);
}
