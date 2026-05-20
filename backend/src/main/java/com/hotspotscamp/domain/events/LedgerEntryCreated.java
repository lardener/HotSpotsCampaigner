package com.hotspotscamp.domain.events;

import java.util.UUID;
import lombok.NonNull;

public record LedgerEntryCreated(
        @NonNull UUID entryId,
        @NonNull UUID commandId,
    UUID detachmentId,
    int amount,
    String description
) implements CommandEvents {}