package com.hotspotscamp.api;

import java.util.UUID;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import com.hotspotscamp.entity.CampaignMarket;
import com.hotspotscamp.enums.MarketType;
import com.hotspotscamp.enums.RuleSet;
import com.hotspotscamp.service.MarketService;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@Controller
@RequiredArgsConstructor
public class MarketGraphQLController {

    private final MarketService marketService;

    @QueryMapping
    public Mono<CampaignMarket> campaignMarket(@Argument UUID campaignId) {
        return marketService.getMarket(campaignId);
    }

    @MutationMapping
    public Mono<String> importUnitsToMarket(
            @Argument UUID campaignId,
            @Argument String url,
            @Argument MarketType marketType,
            @Argument RuleSet ruleSet) {
        return marketService.importUnitsToMarkdown(campaignId, url, marketType, ruleSet);
    }

    @MutationMapping
    public Mono<Boolean> saveMarketMarkdown(
            @Argument UUID campaignId,
            @Argument MarketType marketType,
            @Argument String markdown) {
        return marketService.saveMarketMarkdown(campaignId, marketType, markdown)
                .map(m -> true);
    }
}
