package com.hotspotscamp.api;

import java.util.List;
import java.util.UUID;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import com.hotspotscamp.dto.EmployerMarket;
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

    @SchemaMapping(typeName = "CampaignMarket")
    public List<EmployerMarket> employerMarkets(CampaignMarket market) {
        if (market.getEmployerMarkets() == null) {
            return List.of();
        }
        return market.getEmployerMarkets().entrySet().stream()
                .map(e -> new EmployerMarket(e.getKey(), e.getValue()))
                .toList();
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
            @Argument String markdown,
            @Argument UUID factionId) {
        return marketService.saveMarketMarkdown(campaignId, marketType, markdown, factionId)
                .map(m -> true);
    }

    @MutationMapping
    public Mono<String> generateUnitMarketLink(@Argument String url) {
        return marketService.generateUnitMarketLink(url);
    }

    @MutationMapping
    public Mono<String> generatePilotMarketLink(@Argument String url) {
        return Mono.just(marketService.generatePilotMarketLink(url));
    }

    @MutationMapping
    public Mono<String> generateRandomPilotLink(@Argument UUID campaignId, @Argument String weightClass) {
        return Mono.just(marketService.generatePilotHireLink(campaignId, weightClass));
    }
}
