package com.hotspotscamp.dto.ruleConfiguration;

import java.util.List;

public record SystemTableConfig(Integer groupDiceCount, Integer groupDiceSides, Integer entryDiceCount, Integer entryDiceSides, List<SystemGroup> groups) {

}
