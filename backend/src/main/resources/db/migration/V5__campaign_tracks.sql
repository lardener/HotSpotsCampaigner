-- Create campaign_tracks table (CampaignTrack.java)
CREATE TABLE IF NOT EXISTS campaign_tracks (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    campaign_id VARCHAR(36) NOT NULL,
    `track_name` VARCHAR(255),
    `sequence_order` INT,
    `location` VARCHAR(255),
    `next_session` DATETIME,
    `attacker_faction_id` VARCHAR(36),
    `month_index` INT,
    `complications` VARCHAR(1000),
    `opposition_complications` VARCHAR(1000),
    `after_action_narrative` TEXT,
    CONSTRAINT fk_track_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    CONSTRAINT fk_track_attacker FOREIGN KEY (attacker_faction_id) REFERENCES campaign_factions(id) ON DELETE SET NULL
);
