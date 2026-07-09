package com.hotspotscamp.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hotspotscamp.dto.CampaignMetadata;
import com.hotspotscamp.entity.CampaignMarket;
import com.hotspotscamp.entity.CombatUnit;
import com.hotspotscamp.entity.Pilot;
import com.hotspotscamp.enums.MarketType;
import com.hotspotscamp.enums.RuleSet;
import com.hotspotscamp.repository.CampaignMarketRepository;
import com.hotspotscamp.repository.CampaignRepository;
import com.hotspotscamp.service.scraper.ScraperFactory;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Service
@Slf4j
@RequiredArgsConstructor
public class MarketService {

    private final ScraperFactory scraperFactory;
    private final MarkdownMarketFormatter formatter;
    private final CampaignMarketRepository marketRepository;
    private final CampaignRepository campaignRepository;
    private final CampaignService campaignService;
    private final PilotGeneratorService pilotGenerator;

    // ----- IMPORT -----
    /**
     * Import units from a MUL/Mordel URL into markdown for a given market slot.
     * The scraped units are formatted as a markdown table with hsc:// links.
     */
    @Transactional
    public Mono<String> importUnitsToMarkdown(UUID campaignId, String url, MarketType marketType, RuleSet ruleSet) {
        return campaignRepository.findById(campaignId)
                .switchIfEmpty(Mono.error(new RuntimeException("Campaign not found: " + campaignId)))
                .flatMap(campaign
                        -> scraperFactory.getScraper(url)
                        .flatMapMany(scraper -> scraper.scrape(url))
                        .collectList()
                        .flatMap(units -> {
                            if (units.isEmpty()) {
                                return Mono.error(new RuntimeException("No units scraped from URL: " + url));
                            }

                            CampaignMetadata metadata = campaignService.getCampaignMetadata();
                            String markdown = formatter.formatUnitTable(units, campaignId, marketType, metadata, ruleSet);
                            return saveMarkdownField(campaignId, marketType, markdown);
                        })
                );
    }

    // ----- RETRIEVAL -----
    /**
     * Get the market entity for a campaign.
     */
    public Mono<CampaignMarket> getMarket(UUID campaignId) {
        return marketRepository.findByCampaignId(campaignId);
    }

    /**
     * Get the market markdown for display.
     */
    public Mono<String> getMarketMarkdown(UUID campaignId, MarketType marketType) {
        return marketRepository.findByCampaignId(campaignId)
                .defaultIfEmpty(CampaignMarket.builder().campaignId(campaignId).build())
                .flatMap(market -> {
                    return switch (marketType) {
                        case FREE ->
                            Mono.justOrEmpty(market.getFreeMarketMarkdown());
                        case SCRAPPERS ->
                            Mono.justOrEmpty(market.getScrapperMarketMarkdown());
                        case PRIMARY_EMPLOYER, OPPOSITION_EMPLOYER -> {
                            Mono<String> employerMono = (marketType == MarketType.OPPOSITION_EMPLOYER)
                                    ? campaignService.getSecondaryEmployer(market.getCampaignId())
                                    : campaignService.getPrimaryEmployer(market.getCampaignId());
                            yield employerMono
                            .switchIfEmpty(Mono.error(new IllegalArgumentException(marketType + " not found for campaign: " + campaignId)))
                            .flatMap(employer -> {
                                Map<String, String> employerMarkets = market.getEmployerMarkets();
                                if (employerMarkets == null) {
                                    employerMarkets = new HashMap<>();
                                    market.setEmployerMarkets(employerMarkets);
                                }
                                String markdown = employerMarkets.get(employer);
                                return Mono.justOrEmpty(markdown);
                            });
                        }
                    };
                });
    }

    // ----- SAVE -----
    /**
     * Save market markdown after the campaign manager edits it.
     */
    @Transactional
    public Mono<CampaignMarket> saveMarketMarkdown(UUID campaignId, MarketType marketType, String markdown) {
        return marketRepository.findByCampaignId(campaignId)
                .defaultIfEmpty(CampaignMarket.builder().campaignId(campaignId).build())
                .map(market -> updateMarketField(market, marketType, markdown))
                .flatMap(marketRepository::save);
    }

    /**
     * Generates a random pilot and returns it as an hsc://hire link for the CM
     * to paste into the markdown.
     */
    public String generatePilotHireLink(UUID campaignId, String weightClass) {
        Pilot pilot = pilotGenerator.generateRandomPilot(weightClass);

        // Assume a standard hire rate based on experience for the link
        int rate = 25000;

        return String.format(
                "hsc://hire?name=%s&unitType=%s&wounds=%d&gunnerySpEarned=%d&pilotingSpEarned=%d&edgeTokensSpEarned=%d&edgeAbilitySpEarned=%d&edgeAbilities=%s&price=%d",
                encode(pilot.getName()),
                encode(pilot.getUnitType()),
                java.util.Objects.requireNonNullElse(pilot.getWounds(), 0),
                java.util.Objects.requireNonNullElse(pilot.getGunnerySpEarned(), 0),
                java.util.Objects.requireNonNullElse(pilot.getPilotingSpEarned(), 0),
                java.util.Objects.requireNonNullElse(pilot.getEdgeTokensSpEarned(), 0),
                java.util.Objects.requireNonNullElse(pilot.getEdgeAbilitySpEarned(), 0),
                encode(pilot.getEdgeAbilities()),
                rate
        );
    }

    /**
     * Random draw from the scrapper pool. Returns a unit from the pool for the
     * frontend to "reveal".
     */
    public Mono<CombatUnit> scrapperDraw(UUID campaignId) {
        return marketRepository.findByCampaignId(campaignId)
                .switchIfEmpty(Mono.error(new RuntimeException("Market not found for campaign: " + campaignId)))
                .flatMap(market -> {
                    String poolMarkdown = market.getScrapperPoolMarkdown();
                    if (poolMarkdown == null || poolMarkdown.isBlank()) {
                        return Mono.error(new RuntimeException("Scrapper pool is empty"));
                    }

                    List<CombatUnit> pool = formatter.parseUnitTable(poolMarkdown);
                    if (pool.isEmpty()) {
                        return Mono.error(new RuntimeException("No units in scrapper pool"));
                    }

                    return Mono.just(pool.get(new Random().nextInt(pool.size())));
                });
    }

    private Mono<String> saveMarkdownField(UUID campaignId, MarketType marketType, String markdown) {
        return saveMarketMarkdown(campaignId, marketType, markdown).map(m -> markdown);
    }

    private CampaignMarket updateMarketField(CampaignMarket market, MarketType marketType, String markdown) {
        switch (marketType) {
            case FREE ->
                market.setFreeMarketMarkdown(markdown);
            case SCRAPPERS ->
                market.setScrapperMarketMarkdown(markdown);
            case PRIMARY_EMPLOYER, OPPOSITION_EMPLOYER -> {
                Mono<String> employerMono = (marketType == MarketType.OPPOSITION_EMPLOYER)
                        ? campaignService.getSecondaryEmployer(market.getCampaignId())
                        : campaignService.getPrimaryEmployer(market.getCampaignId());
                employerMono
                        .switchIfEmpty(Mono.error(new IllegalArgumentException(marketType + " not found for campaign: " + market.getCampaignId())))
                        .flatMap(employer -> {
                            Map<String, String> employerMarkets = market.getEmployerMarkets();
                            if (employerMarkets == null) {
                                employerMarkets = new HashMap<>();
                                market.setEmployerMarkets(employerMarkets);
                            }
                            employerMarkets.put(employer, markdown);
                            return Mono.just(market);
                        });
            }
        }
        return market;
    }

    private String encode(String value) {
        return value == null ? "" : URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
