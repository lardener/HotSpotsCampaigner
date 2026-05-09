package com.hotspotscamp.domain.events;

import java.util.UUID;

/**
 * Domain events for the event-sourced campaign state.
 */
public interface CampaignEvents {

    record CampaignCreated(UUID id, String name, String theater) implements CampaignEvents {

    }

    record WarchestAdjusted(UUID id, Integer delta, String reason) implements CampaignEvents {

    }

    record ReputationChanged(UUID id, String faction, Integer delta) implements CampaignEvents {

    }

    record AssetAcquired(UUID unitId, UUID assetId, String model, Integer tonnage) implements CampaignEvents {

    }

    record AssetStatusUpdated(UUID assetId, String newStatus) implements CampaignEvents {

    }
}
