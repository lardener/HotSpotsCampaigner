package com.hotspotscamp.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.hotspotscamp.dto.CombatUnitUpdateInput;
import com.hotspotscamp.entity.CombatUnit;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface CombatUnitMapper {

    @Mapping(target = "detachmentId", ignore = true)
    void updateCombatUnitFromDto(CombatUnitUpdateInput dto, @MappingTarget CombatUnit entity);

    default String mapConditionToStatus(Integer condition) {
        if (condition == null) {
            return "OPERATIONAL";
        }
        if (condition <= 0) {
            return "DESTROYED";
        }
        if (condition <= 50) {
            return "CRIPPLED";
        }
        return "OPERATIONAL";
    }
}
