-- HotSpots Campaigner Database Schema
-- Versioned Flyway migration (V1). Replaces the old destructive schema.sql
-- which dropped every table on each init. Flyway guarantees this runs once.
-- Generated for MySQL / R2DBC Compatibility.

-- Create app_users table (User.java)
CREATE TABLE IF NOT EXISTS app_users (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `external_id` VARCHAR(64) NOT NULL UNIQUE,
    `display_name` VARCHAR(255),
    `email` VARCHAR(255),
    `role` VARCHAR(50)
);

-- Create campaigns table (Campaign.java)
CREATE TABLE IF NOT EXISTS campaigns (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `name` VARCHAR(255),
    `manager_id` VARCHAR(36) NOT NULL,
    `status` VARCHAR(50),
    `system_name` VARCHAR(255),
    `description` TEXT,
    `track_count` INT,
    `length_in_months` INT,
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
    `monthly_pay` INT DEFAULT 500,
    `monthly_maintenance` INT DEFAULT 500,
    `transportation_cost` INT DEFAULT 300,
    `combat_pay` INT DEFAULT 500,
    `armor_multiplier` DOUBLE,
    `internal_multiplier` DOUBLE,
    `crippled_multiplier` DOUBLE,
    `destroyed_multiplier` DOUBLE,
    `non_mech_modifier` DOUBLE,
    `mixed_tech_modifier` DOUBLE,
    `clan_tech_modifier` DOUBLE,
    `omnimech_reconfigure_modifier` DOUBLE,
    `purchase_unit_multiplier` INT,
    `sell_unit_multiplier` INT,
    `rearm_cost_per_ton` INT,
    `rearm_cost_per_ton_alpha_strike` INT,
    `hire_mechwarrior_cost` INT,
    `hire_named_pilot_cost` INT,
    `hire_battle_armor_cost` INT,
    `heal_mechwarrior_per_wound_box_cost` INT,
    `heal_mechwarrior_per_month_cost` INT,
    `heal_battle_armor_cost` INT,
    `train_formation_commander_cost` INT,
    `change_formation_training_cost` INT,
    `learn_first_ability_cost` INT,
    `learn_second_ability_cost` INT,
    `learn_third_ability_cost` INT,
    `replace_ability_cost` INT,
    CONSTRAINT fk_campaign_manager FOREIGN KEY (manager_id) REFERENCES app_users(id)
);

-- Create campaign_factions table (CampaignFaction.java)
CREATE TABLE IF NOT EXISTS campaign_factions (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    campaign_id VARCHAR(36) NOT NULL,
    `faction_name` VARCHAR(255),
    `offers_contracts` BOOLEAN,
    `short_description` VARCHAR(1000),
    CONSTRAINT fk_faction_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

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

-- Create mercenary_commands table (MercenaryCommand.java)
CREATE TABLE IF NOT EXISTS mercenary_commands (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `name` VARCHAR(255),
    `owner_id` VARCHAR(36) NOT NULL,
    `total_support_points` INT DEFAULT 0,
    `reputation` INT DEFAULT 1,
    `commanding_officer` VARCHAR(255),
    CONSTRAINT fk_command_owner FOREIGN KEY (owner_id) REFERENCES app_users(id)
);

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

-- Track which contract a detachment is working under for a specific month
CREATE TABLE IF NOT EXISTS detachment_contract_assignments (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    detachment_id VARCHAR(36) NOT NULL,
    contract_id VARCHAR(36) NOT NULL,
    `month_index` INT NOT NULL,
    CONSTRAINT fk_assign_detachment FOREIGN KEY (detachment_id) REFERENCES detachments(id) ON DELETE CASCADE,
    CONSTRAINT fk_assign_contract FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    UNIQUE KEY idx_det_month_contract (detachment_id, month_index)
);

-- Create ledger_entries table (LedgerEntry.java)
CREATE TABLE IF NOT EXISTS ledger_entries (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `command_id` VARCHAR(36) NOT NULL,
    `campaign_id` VARCHAR(36),
    `detachment_id` VARCHAR(36),
    `amount` INT,
    `short_description` VARCHAR(1000),
    `timestamp` DATETIME,
    `reputation_change` INT,
    `campaign_name` VARCHAR(255),
    `month_index` INT,
    CONSTRAINT fk_ledger_command FOREIGN KEY (command_id) REFERENCES mercenary_commands(id) ON DELETE CASCADE,
    CONSTRAINT fk_ledger_detachment FOREIGN KEY (detachment_id) REFERENCES detachments(id) ON DELETE SET NULL
);

-- Create combat_units table (CombatUnit.java)
CREATE TABLE IF NOT EXISTS combat_units (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
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
CREATE TABLE IF NOT EXISTS pilots (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `command_id` VARCHAR(36) NOT NULL,
    `detachment_id` VARCHAR(36),
    `name` VARCHAR(255),
    `gunnery` INT,
    `piloting` INT,
    `as_skill` INT,
    `unit_type` VARCHAR(50),
    `wounds` INT DEFAULT 0,
    `handicap` INT DEFAULT 0,
    `total_sp_earned` INT DEFAULT 0,
    `gunnery_sp_earned` INT DEFAULT 0,
    `piloting_sp_earned` INT DEFAULT 0,
    `edge_tokens_sp_earned` INT DEFAULT 0,
    `edge_ability_sp_earned` INT DEFAULT 0,
    `edge_tokens_skill` INT DEFAULT 0,
    `edge_ability_skill` INT DEFAULT 0,
    `edge_abilities` VARCHAR(255),
    CONSTRAINT fk_pilot_command FOREIGN KEY (command_id) REFERENCES mercenary_commands(id) ON DELETE CASCADE,
    CONSTRAINT fk_pilot_detachment FOREIGN KEY (detachment_id) REFERENCES detachments(id) ON DELETE SET NULL
);

-- Create faction_reputations table (FactionReputation.java)
CREATE TABLE IF NOT EXISTS faction_reputations (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `campaign_faction_id` VARCHAR(36) NOT NULL,
    `mercenary_command_id` VARCHAR(36) NOT NULL,
    `score` INT,
    `standing` VARCHAR(255),
    CONSTRAINT fk_reputation_faction FOREIGN KEY (campaign_faction_id) REFERENCES campaign_factions(id) ON DELETE CASCADE,
    CONSTRAINT fk_reputation_command FOREIGN KEY (mercenary_command_id) REFERENCES mercenary_commands(id) ON DELETE CASCADE
);
