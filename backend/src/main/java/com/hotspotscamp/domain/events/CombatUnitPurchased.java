package com.hotspotscamp.domain.events;

import java.util.UUID;
import lombok.NonNull;

public record CombatUnitPurchased(
    @NonNull UUID unitId,
    @NonNull UUID commandId,
        String model,
        String type,
        int tonnage,
        int cost
        ) implements CommandEvents {

}
