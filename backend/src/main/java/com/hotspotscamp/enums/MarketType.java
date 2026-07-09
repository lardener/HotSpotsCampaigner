package com.hotspotscamp.enums;

/**
 * Market types for the campaign unit market. Each campaign has up to 3 market
 * slots plus a scrapper market.
 */
public enum MarketType {
    /**
     * Generic units available to all players, not tied to any employer
     */
    FREE,
    /**
     * Units offered by THE Primary Employer
     */
    PRIMARY_EMPLOYER,
    /**
     * Units offered by THE Opposition Employer
     */
    OPPOSITION_EMPLOYER,
    /**
     * Random-unit draw — a special section with a "pay X, get random" link
     */
    SCRAPPERS
}
