package com.hotspotscamp.mapper;

import java.time.LocalDateTime;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.hotspotscamp.dto.TrackUpdateInput;
import com.hotspotscamp.entity.CampaignTrack;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface TrackMapper {

    void updateTrackFromDto(TrackUpdateInput dto, @MappingTarget CampaignTrack entity);

    default LocalDateTime map(String nextSession) {
        return nextSession == null || nextSession.isBlank()
                ? null
                : LocalDateTime.parse(nextSession);
    }
}
