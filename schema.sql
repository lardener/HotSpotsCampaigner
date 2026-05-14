-- HotSpots Campaigner Database Schema
-- Generated for MySQL / R2DBC Compatibility

SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables in reverse order of dependency
DROP TABLE IF EXISTS ledger_entries;
DROP TABLE IF EXISTS detachments;
DROP TABLE IF EXISTS mercenary_commands;
DROP TABLE IF EXISTS contracts;
DROP TABLE IF EXISTS campaign_factions;
DROP TABLE IF EXISTS campaigns;

SET FOREIGN_KEY_CHECKS = 1;

-- Create campaigns table (Campaign.java)
CREATE TABLE campaigns (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    name VARCHAR(255),
    manager_id VARCHAR(36),
    status VARCHAR(50),
    system_name VARCHAR(255),
    track_count INT
);

-- Create campaign_factions table (CampaignFaction.java)
CREATE TABLE campaign_factions (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    campaign_id VARCHAR(36) NOT NULL,
    faction_name VARCHAR(255),
    offers_contracts BOOLEAN,
    CONSTRAINT fk_faction_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- Create contracts table (Contract.java)
CREATE TABLE contracts (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    campaign_id VARCHAR(36) NOT NULL,
    employer_faction_id VARCHAR(36),
    employer_category VARCHAR(255),
    primary_contract BOOLEAN,
    mission_type VARCHAR(255),
    pay_rate DOUBLE,
    pay_step INT,
    salvage_terms VARCHAR(255),
    salvage_step INT,
    support_terms VARCHAR(255),
    support_step INT,
    transport_terms VARCHAR(255),
    transport_step INT,
    command_rights VARCHAR(255),
    command_step INT,
    track_count INT,
    CONSTRAINT fk_contract_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    CONSTRAINT fk_contract_faction FOREIGN KEY (employer_faction_id) REFERENCES campaign_factions(id)
);

-- Create mercenary_commands table (MercenaryCommand.java)
CREATE TABLE mercenary_commands (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    owner_id VARCHAR(36),
    total_support_points INT DEFAULT 0
);

-- Create detachments table (Detachment.java)
CREATE TABLE detachments (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    mercenary_command_id VARCHAR(36) NOT NULL,
    contract_id VARCHAR(36) NOT NULL,
    CONSTRAINT fk_detachment_command FOREIGN KEY (mercenary_command_id) REFERENCES mercenary_commands(id),
    CONSTRAINT fk_detachment_contract FOREIGN KEY (contract_id) REFERENCES contracts(id)
);

-- Create ledger_entries table (LedgerEntry.java)
CREATE TABLE ledger_entries (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    detachment_id VARCHAR(36) NOT NULL,
    amount INT,
    short_description VARCHAR(1000),
    timestamp DATETIME,
    CONSTRAINT fk_ledger_detachment FOREIGN KEY (detachment_id) REFERENCES detachments(id) ON DELETE CASCADE
);
