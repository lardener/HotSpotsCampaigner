package com.hotspotscamp.service;

import java.util.List;
import com.hotspotscamp.entity.CombatUnit;
import com.hotspotscamp.entity.Pilot;

/**
 * Response wrapper for all operational assets (Units and Personnel) associated
 * with a specific Mercenary Command.
 */
public record CommandAssetsResponse(List<CombatUnit> units, List<Pilot> pilots) {

}
