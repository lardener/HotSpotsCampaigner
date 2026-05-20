package com.hotspotscamp.domain.events;

import java.util.UUID;
import lombok.NonNull;

public record CommandEstablished(
        @NonNull UUID commandId,
    String name, 
    String commandingOfficer, 
    int startingSp
) implements CommandEvents {}