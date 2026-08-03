-- Create contracts table (Contract.java)
CREATE TABLE IF NOT EXISTS contracts (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    campaign_id VARCHAR(36) NOT NULL,
    `employer_faction_id` VARCHAR(36),
    `employer_category` VARCHAR(255),
    `primary_contract` BOOLEAN,
    `mission_type` VARCHAR(255),
    `pay_rate` DOUBLE,
    `pay_step` INT,
    `salvage_terms` VARCHAR(255),
    `salvage_step` INT,
    `support_terms` VARCHAR(255),
    `support_step` INT,
    `transport_terms` VARCHAR(255),
    `transport_step` INT,
    `command_rights` VARCHAR(255),
    `command_step` INT,
    `track_count` INT,
    CONSTRAINT fk_contract_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    CONSTRAINT fk_contract_faction FOREIGN KEY (employer_faction_id) REFERENCES campaign_factions(id) ON DELETE CASCADE
);
