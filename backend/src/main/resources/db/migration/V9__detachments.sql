-- Create detachments table (Detachment.java)
CREATE TABLE IF NOT EXISTS detachments (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `mercenary_command_id` VARCHAR(36) NOT NULL,
    `campaign_id` VARCHAR(36),
    `name` VARCHAR(255),
    `callsign` VARCHAR(255),
    CONSTRAINT fk_detachment_command FOREIGN KEY (mercenary_command_id) REFERENCES mercenary_commands(id) ON DELETE CASCADE,
    CONSTRAINT fk_detachment_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);
