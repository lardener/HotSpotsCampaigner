package com.hotspotscamp.dto;

import java.util.UUID;

/**
 * DTO for updating a pilot.
 */
public record PilotUpdateInput(
        String name,
        Integer gunnery,
        Integer piloting,
        Integer asSkill,
        Integer edgeTokensSkill,
        Integer edgeAbilitySkill,
        String edgeAbilities,
        String unitType,
        Integer wounds,
        Integer handicap,
        Integer totalSpEarned,
        Integer gunnerySpEarned,
        Integer pilotingSpEarned,
        Integer edgeTokensSpEarned,
        Integer edgeAbilitySpEarned,
        UUID detachmentId
        ) {

}
