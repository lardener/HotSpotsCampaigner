-- Create campaign_factions table (CampaignFaction.java)
CREATE TABLE IF NOT EXISTS campaign_factions (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    campaign_id VARCHAR(36) NOT NULL,
    `faction_name` VARCHAR(255),
    `offers_contracts` BOOLEAN,
    `short_description` VARCHAR(1000),
    CONSTRAINT fk_faction_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);
