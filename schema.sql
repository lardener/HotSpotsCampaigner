-- HotSpots Campaigner Database Schema
-- Generated for MySQL / R2DBC Compatibility

USE `BT_Campaigner`;

SET FOREIGN_KEY_CHECKS = 0;

SET SESSION group_concat_max_len = 1000000;
-- Dynamic drop of all tables in the current schema to ensure a clean slate
SET @tables = NULL;
SELECT GROUP_CONCAT('`', table_name, '`') INTO @tables
  FROM information_schema.tables
  WHERE table_schema = DATABASE();

SET @tables = IF(@tables IS NOT NULL, CONCAT('DROP TABLE IF EXISTS ', @tables), 'SELECT "No tables to drop"');
PREPARE stmt FROM @tables;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET FOREIGN_KEY_CHECKS = 1;

-- Create event_store table for Event Sourcing
CREATE TABLE event_store (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    aggregate_id VARCHAR(36) NOT NULL,
    event_type VARCHAR(255) NOT NULL,
    event_data JSON NOT NULL,
    occurred_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    version INT NOT NULL,
    user_id VARCHAR(36),
    INDEX idx_aggregate (aggregate_id)
);

-- Create app_users table (User.java)
CREATE TABLE app_users (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    `external_id` VARCHAR(255) UNIQUE,
    `display_name` VARCHAR(255),
    `email` VARCHAR(255),
    `role` VARCHAR(50)
);

-- Create campaigns table (Campaign.java)
CREATE TABLE campaigns (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    `name` VARCHAR(255),
    `manager_id` VARCHAR(36) NOT NULL,
    `status` VARCHAR(50),
    `system_name` VARCHAR(255),
    `description` TEXT,
    `track_count` INT,
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
    CONSTRAINT fk_campaign_manager FOREIGN KEY (manager_id) REFERENCES app_users(id)
);

-- Create campaign_invites table (CampaignInvite.java)
CREATE TABLE campaign_invites (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    campaign_id VARCHAR(36) NOT NULL,
    `token` VARCHAR(255) UNIQUE,
    `expires_at` DATETIME,
    `used` BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_invite_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
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
    `owner_id` VARCHAR(36) NOT NULL,
    `total_support_points` INT DEFAULT 0,
    `reputation` INT DEFAULT 1,
    `experience_level` VARCHAR(50),
    `commanding_officer` VARCHAR(255),
    CONSTRAINT fk_command_owner FOREIGN KEY (owner_id) REFERENCES app_users(id)
);

-- Create detachments table (Detachment.java)
CREATE TABLE detachments (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    `mercenary_command_id` VARCHAR(36) NOT NULL,
    `campaign_id` VARCHAR(36),
    `name` VARCHAR(255),
    `callsign` VARCHAR(255),
    CONSTRAINT fk_detachment_command FOREIGN KEY (mercenary_command_id) REFERENCES mercenary_commands(id) ON DELETE CASCADE,
    CONSTRAINT fk_detachment_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- Create ledger_entries table (LedgerEntry.java)
CREATE TABLE ledger_entries (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    `command_id` VARCHAR(36) NOT NULL,
    `detachment_id` VARCHAR(36),
    `amount` INT,
    `short_description` VARCHAR(1000),
    `timestamp` DATETIME,
    `running_total` INT,
    `cover_amount` INT,
    `paid_amount` INT,
    `reputation_change` INT,
    `campaign_id` VARCHAR(36),
    `campaign_name` VARCHAR(255),
    `contract_month` VARCHAR(50),
    CONSTRAINT fk_ledger_command FOREIGN KEY (command_id) REFERENCES mercenary_commands(id) ON DELETE CASCADE,
    CONSTRAINT fk_ledger_detachment FOREIGN KEY (detachment_id) REFERENCES detachments(id) ON DELETE SET NULL
);

-- Create combat_units table (CombatUnit.java)
CREATE TABLE combat_units (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    `command_id` VARCHAR(36) NOT NULL,
    `detachment_id` VARCHAR(36),
    `model` VARCHAR(255),
    `type` VARCHAR(255),
    `variant` VARCHAR(255),
    `tech_base` VARCHAR(100),
    `tonnage` INT,
    `as_size` INT,
    `bv` INT,
    `pv` INT,
    `status` VARCHAR(255),
    CONSTRAINT fk_combat_unit_command FOREIGN KEY (command_id) REFERENCES mercenary_commands(id) ON DELETE CASCADE,
    CONSTRAINT fk_combat_unit_detachment FOREIGN KEY (detachment_id) REFERENCES detachments(id) ON DELETE SET NULL
);

-- Create pilots table (Pilot.java)
CREATE TABLE pilots (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    `command_id` VARCHAR(36) NOT NULL,
    `detachment_id` VARCHAR(36),
    `name` VARCHAR(255),
    `gunnery` INT,
    `piloting` INT,
    `as_skill` INT,
    `unit_type` VARCHAR(50),
    `status` VARCHAR(255),
    CONSTRAINT fk_pilot_command FOREIGN KEY (command_id) REFERENCES mercenary_commands(id) ON DELETE CASCADE,
    CONSTRAINT fk_pilot_detachment FOREIGN KEY (detachment_id) REFERENCES detachments(id) ON DELETE SET NULL
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
