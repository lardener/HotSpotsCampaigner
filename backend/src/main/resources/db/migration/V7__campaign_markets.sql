-- Create campaign_markets table (CampaignMarket.java)
CREATE TABLE IF NOT EXISTS campaign_markets (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `campaign_id` VARCHAR(36) NOT NULL UNIQUE,
    `free_market_markdown` TEXT,
    `scrapper_market_markdown` TEXT,
    `scrapper_pool_markdown` TEXT,
    `scrapper_fee` INT NOT NULL DEFAULT 50000,
    `employer_markets_json` JSON,
    CONSTRAINT fk_market_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);
