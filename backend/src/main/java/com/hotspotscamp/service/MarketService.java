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
import com.hotspotscamp.util.TypeUtils;

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
        log.info("[START] importUnitsToMarkdown: campaignId={}, url={}, marketType={}, ruleSet={}", campaignId, url, marketType, ruleSet);
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
                            return saveMarkdownField(campaignId, marketType, markdown, null);
                        })
                )
                .doOnSuccess(m -> log.info("[END] importUnitsToMarkdown: Successfully imported units to markdown for campaignId={}", campaignId))
                .doOnError(e -> log.error("[ERROR] importUnitsToMarkdown: Failed to import units to markdown for campaignId={}: {}", campaignId, e.getMessage()));
    }

    // ----- RETRIEVAL -----
    /**
     * Get the market entity for a campaign.
     */
    public Mono<CampaignMarket> getMarket(UUID campaignId) {
        log.info("[START] getMarket: campaignId={}", campaignId);
        return marketRepository.findByCampaignId(campaignId)
                .doOnSuccess(m -> log.info("[END] getMarket: Successfully retrieved market for campaignId={}, market={}", campaignId, m))
                .doOnError(e -> log.error("[ERROR] getMarket: Failed to retrieve market for campaignId={}: {}", campaignId, e.getMessage()));
    }

    /**
     * Get the market markdown for display.
     */
    public Mono<String> getMarketMarkdown(UUID campaignId, MarketType marketType) {
        log.info("[START] getMarketMarkdown: campaignId={}, marketType={}", campaignId, marketType);
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
                })
                .doOnSuccess(m -> log.info("[END] getMarketMarkdown: Successfully retrieved markdown for campaignId={}, marketType={}", campaignId, marketType))
                .doOnError(e -> log.error("[ERROR] getMarketMarkdown: Failed to retrieve markdown for campaignId={}, marketType={}: {}", campaignId, marketType, e.getMessage()));
    }

    // ----- SAVE -----
    /**
     * Save market markdown after the campaign manager edits it.
     */
    @Transactional
    public Mono<CampaignMarket> saveMarketMarkdown(UUID campaignId, MarketType marketType, String markdown, UUID factionId) {
        log.info("[START] saveMarketMarkdown: campaignId={}, marketType={}, factionId={}", campaignId, marketType, factionId);
        return marketRepository.findByCampaignId(campaignId)
                .flatMap(market -> {
                    market.setNew(false);
                    return updateMarketField(market, marketType, markdown, factionId);
                })
                .switchIfEmpty(Mono.defer(() -> {
                    CampaignMarket newMarket = CampaignMarket.builder()
                            .id(UUID.randomUUID())
                            .campaignId(campaignId)
                            .isNew(true)
                            .build();
                    return updateMarketField(newMarket, marketType, markdown, factionId);
                }))
                .flatMap(marketRepository::save)
                .doOnSuccess(m -> log.info("[END] saveMarketMarkdown: Successfully saved markdown for campaignId={}, marketType={}, market={}", campaignId, marketType, m))
                .doOnError(e -> log.error("[ERROR] saveMarketMarkdown: Failed to save markdown for campaignId={}, marketType={}: {}", campaignId, marketType, e.getMessage()));
    }

    /**
     * Generates a random pilot and returns it as an hsc://hire link for the CM
     * to paste into the markdown.
     */
    public String generatePilotHireLink(UUID campaignId, String weightClass) {
        log.info("[START] generatePilotHireLink: campaignId={}, weightClass={}", campaignId, weightClass);
        Pilot pilot = pilotGenerator.generateRandomPilot(weightClass);

        // Price is the sum of the pilot's earned Support Points (SP)
        int rate = TypeUtils.asInt(pilot.getGunnerySpEarned(), 0)
                + TypeUtils.asInt(pilot.getPilotingSpEarned(), 0)
                + TypeUtils.asInt(pilot.getEdgeTokensSpEarned(), 0)
                + TypeUtils.asInt(pilot.getEdgeAbilitySpEarned(), 0);

        String link = String.format(
                "hsc://hire?name=%s&unitType=%s&wounds=%d&gunnerySpEarned=%d&pilotingSpEarned=%d&edgeTokensSpEarned=%d&edgeAbilitySpEarned=%d&edgeAbilities=%s&price=%d",
                encode(pilot.getName()),
                encode(pilot.getUnitType()),
                TypeUtils.asInt(pilot.getWounds(), 0),
                TypeUtils.asInt(pilot.getGunnerySpEarned(), 0),
                TypeUtils.asInt(pilot.getPilotingSpEarned(), 0),
                TypeUtils.asInt(pilot.getEdgeTokensSpEarned(), 0),
                TypeUtils.asInt(pilot.getEdgeAbilitySpEarned(), 0),
                encode(pilot.getEdgeAbilities()),
                rate
        );
        log.info("[END] generatePilotHireLink: Generated link={}", link);
        return link;
    }

    /**
     * Random draw from the scrapper pool. Returns a unit from the pool for the
     * frontend to "reveal".
     */
    public Mono<CombatUnit> scrapperDraw(UUID campaignId) {
        log.info("[START] scrapperDraw: campaignId={}", campaignId);
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
                })
                .doOnSuccess(unit -> log.info("[END] scrapperDraw: Successfully drew unit {} from scrapper pool for campaignId={}", unit.getModel(), campaignId))
                .doOnError(e -> log.error("[ERROR] scrapperDraw: Failed to draw from scrapper pool for campaignId={}: {}", campaignId, e.getMessage()));
    }

    private Mono<String> saveMarkdownField(UUID campaignId, MarketType marketType, String markdown, UUID factionId) {
        return saveMarketMarkdown(campaignId, marketType, markdown, factionId).map(m -> markdown);
    }

    private Mono<CampaignMarket> updateMarketField(CampaignMarket market, MarketType marketType, String markdown, UUID factionId) {
        switch (marketType) {
            case FREE -> {
                market.setFreeMarketMarkdown(markdown);
                return Mono.just(market);
            }
            case SCRAPPERS -> {
                market.setScrapperMarketMarkdown(markdown);
                return Mono.just(market);
            }
            case PRIMARY_EMPLOYER, OPPOSITION_EMPLOYER -> {
                Mono<String> employerMono;
                if (factionId != null) {
                    employerMono = campaignService.getFactionNameById(factionId);
                } else {
                    employerMono = (marketType == MarketType.OPPOSITION_EMPLOYER)
                            ? campaignService.getSecondaryEmployer(market.getCampaignId())
                            : campaignService.getPrimaryEmployer(market.getCampaignId());
                }
                return employerMono
                        .switchIfEmpty(Mono.error(new IllegalArgumentException(marketType + " employer not found for campaign: " + market.getCampaignId())))
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
        return Mono.just(market);
    }

    private String encode(String value) {
        return value == null ? "" : URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    public Mono<String> generateUnitMarketLink(String url) {
        log.info("[START] generateUnitMarketLink: url={}", url);
        return scraperFactory.getScraper(url)
                .flatMapMany(scraper -> scraper.scrape(url))
                .next()
                .switchIfEmpty(Mono.error(new RuntimeException("No unit scraped from URL: " + url)))
                .map(unit -> {
                    String link = String.format(
                            "hsc://procure?model=%s&variant=%s&bv=%d&pv=%d&sz=%d&type=%s&tech=%s&tons=%d&price=%d",
                            encode(unit.getModel()),
                            encode(unit.getVariant()),
                            TypeUtils.asInt(unit.getBv(), 0),
                            TypeUtils.asInt(unit.getPv(), 0),
                            TypeUtils.asInt(unit.getAsSize(), 0),
                            encode(unit.getType()),
                            encode(unit.getTechBase()),
                            TypeUtils.asInt(unit.getTonnage(), 0),
                            TypeUtils.asInt(unit.getPv(), 0)
                    );
                    log.info("[END] generateUnitMarketLink: Generated link={}", link);
                    return link;
                })
                .doOnError(e -> log.error("[ERROR] generateUnitMarketLink: Failed to generate link for url={}: {}", url, e.getMessage()));
    }

    public String generatePilotMarketLink(String url) {
        log.info("[START] generatePilotMarketLink: url={}", url);
        // Similarly, scrape pilot and generate hsc://hire link.
        String link = "hsc://hire?name=ImportedPilot&unitType=BM&wounds=0&gunnerySpEarned=100&pilotingSpEarned=100&edgeTokensSpEarned=0&edgeAbilitySpEarned=0&edgeAbilities=None&price=20000";
        log.info("[END] generatePilotMarketLink: Generated link={}", link);
        return link;
    }
}
