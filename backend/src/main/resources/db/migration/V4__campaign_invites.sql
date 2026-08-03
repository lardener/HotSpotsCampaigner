-- Create campaign_invites table (CampaignInvite.java)
CREATE TABLE IF NOT EXISTS campaign_invites (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    campaign_id VARCHAR(36) NOT NULL,
    `token` VARCHAR(64) NOT NULL UNIQUE,
    `recipient_name` VARCHAR(255),
    `expires_at` DATETIME,
    `used` BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_invite_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);
