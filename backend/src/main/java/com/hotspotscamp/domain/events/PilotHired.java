package com.hotspotscamp.domain.events;

import java.util.UUID;
import lombok.NonNull;

public record PilotHired(
        @NonNull UUID pilotId,
        @NonNull UUID commandId,
    String name,
    int gunnery,
    int piloting
) implements CommandEvents {}