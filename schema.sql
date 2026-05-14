-- HotSpots Campaigner Database Schema
-- Generated for MySQL / R2DBC Compatibility

SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables in reverse order of dependency
DROP TABLE IF EXISTS ledger_entries;
DROP TABLE IF EXISTS detachments;
DROP TABLE IF EXISTS mercenary_commands;
DROP TABLE IF EXISTS contracts;
DROP TABLE IF EXISTS combat_assets;
DROP TABLE IF EXISTS personnel;
DROP TABLE IF EXISTS faction_reputations;
DROP TABLE IF EXISTS campaign_factions;
DROP TABLE IF EXISTS campaign_tracks;
DROP TABLE IF EXISTS campaigns;

SET FOREIGN_KEY_CHECKS = 1;

-- Create campaigns table (Campaign.java)
CREATE TABLE campaigns (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    `name` VARCHAR(255),
    `manager_id` VARCHAR(36),
    `status` VARCHAR(50),
    `system_name` VARCHAR(255),
    `track_count` INT
);

-- Create campaign_tracks table (CampaignTrack.java)
CREATE TABLE campaign_tracks (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    campaign_id VARCHAR(36) NOT NULL,
    `track_name` VARCHAR(255),
    `sequence_order` INT,
    CONSTRAINT fk_track_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- Create campaign_factions table (CampaignFaction.java)
CREATE TABLE campaign_factions (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    campaign_id VARCHAR(36) NOT NULL,
    `faction_name` VARCHAR(255),
    `offers_contracts` BOOLEAN,
    `short_description` VARCHAR(1000),
    CONSTRAINT fk_faction_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- Create contracts table (Contract.java)
CREATE TABLE contracts (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
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
    CONSTRAINT fk_contract_faction FOREIGN KEY (employer_faction_id) REFERENCES campaign_factions(id)
);

-- Create mercenary_commands table (MercenaryCommand.java)
CREATE TABLE mercenary_commands (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    `name` VARCHAR(255),
    `owner_id` VARCHAR(36),
    `campaign_id` VARCHAR(36),
    `total_support_points` INT DEFAULT 0,
    `reputation` INT DEFAULT 1
);

-- Create detachments table (Detachment.java)
CREATE TABLE detachments (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    `mercenary_command_id` VARCHAR(36) NOT NULL,
    `contract_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(255),
    CONSTRAINT fk_detachment_command FOREIGN KEY (mercenary_command_id) REFERENCES mercenary_commands(id),
    CONSTRAINT fk_detachment_contract FOREIGN KEY (contract_id) REFERENCES contracts(id)
);

-- Create ledger_entries table (LedgerEntry.java)
CREATE TABLE ledger_entries (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    `detachment_id` VARCHAR(36) NOT NULL,
    `amount` INT,
    `short_description` VARCHAR(1000),
    `timestamp` DATETIME,
    `running_total` INT,
    CONSTRAINT fk_ledger_detachment FOREIGN KEY (detachment_id) REFERENCES detachments(id) ON DELETE CASCADE
);

-- Create combat_assets table (CombatAsset.java)
CREATE TABLE combat_assets (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    `mercenary_command_id` VARCHAR(36) NOT NULL,
    `detachment_id` VARCHAR(36),
    `chassis` VARCHAR(255),
    `model` VARCHAR(255),
    `tonnage` INT,
    `battle_value` INT,
    `point_value` INT,
    `size` INT,
    `tech_base` VARCHAR(255),
    `status` VARCHAR(255),
    CONSTRAINT fk_combat_asset_command FOREIGN KEY (mercenary_command_id) REFERENCES mercenary_commands(id) ON DELETE CASCADE,
    CONSTRAINT fk_combat_asset_detachment FOREIGN KEY (detachment_id) REFERENCES detachments(id) ON DELETE SET NULL
);

-- Create personnel table (Personnel.java)
CREATE TABLE personnel (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    `mercenary_command_id` VARCHAR(36) NOT NULL,
    `detachment_id` VARCHAR(36),
    `name` VARCHAR(255),
    `specialization` VARCHAR(255),
    `gunnery` INT,
    `piloting` INT,
    CONSTRAINT fk_personnel_command FOREIGN KEY (mercenary_command_id) REFERENCES mercenary_commands(id) ON DELETE CASCADE,
    CONSTRAINT fk_personnel_detachment FOREIGN KEY (detachment_id) REFERENCES detachments(id) ON DELETE SET NULL
);

-- Create faction_reputations table (FactionReputation.java)
CREATE TABLE faction_reputations (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    `campaign_faction_id` VARCHAR(36) NOT NULL,
    `mercenary_command_id` VARCHAR(36) NOT NULL,
    `score` INT,
    `standing` VARCHAR(255),
    CONSTRAINT fk_reputation_faction FOREIGN KEY (campaign_faction_id) REFERENCES campaign_factions(id) ON DELETE CASCADE,
    CONSTRAINT fk_reputation_command FOREIGN KEY (mercenary_command_id) REFERENCES mercenary_commands(id) ON DELETE CASCADE
);
