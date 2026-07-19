package com.hotspotscamp;

import java.io.FileWriter;
import java.io.IOException;

/**
 * Utility program to (re)generate the V1 Flyway migration
 * (backend/src/main/resources/db/migration/V1__init_schema.sql) aligned with
 * the HotSpots Campaigner entity classes and R2DBC configuration.
 *
 * NOTE: The migration is the single source of truth for the schema. This
 * generator is a convenience for regenerating it; it no longer emits a
 * destructive drop-all script.
 */
public class SchemaGenerator {

    public static void main(String[] args) {
        StringBuilder sql = new StringBuilder();

        sql.append("-- HotSpots Campaigner Database Schema\n");
        sql.append("-- Versioned Flyway migration (V1). Replaces the old destructive schema.sql\n");
        sql.append("-- which dropped every table on each init. Flyway guarantees this runs once.\n");
        sql.append("-- Generated for MySQL / R2DBC Compatibility.\n\n");

        sql.append("-- Create app_users table (User.java)\n");
        sql.append("CREATE TABLE IF NOT EXISTS app_users (\n");
        sql.append("    `id` VARCHAR(36) NOT NULL PRIMARY KEY,\n");
        sql.append("    `external_id` VARCHAR(64) NOT NULL UNIQUE,\n");
        sql.append("    `display_name` VARCHAR(255),\n");
        sql.append("    `email` VARCHAR(255),\n");
        sql.append("    `role` VARCHAR(50)\n");
        sql.append(");\n\n");

        sql.append("-- Create campaigns table (Campaign.java)\n");
        sql.append("CREATE TABLE campaigns (\n");
        sql.append("    `id` VARCHAR(36) NOT NULL PRIMARY KEY,\n");
        sql.append("    `name` VARCHAR(255),\n");
        sql.append("    `manager_id` VARCHAR(36) NOT NULL,\n");
        sql.append("    `status` VARCHAR(50),\n");
        sql.append("    `system_name` VARCHAR(255),\n");
        sql.append("    `description` TEXT,\n");
        sql.append("    `track_count` INT,\n");
        sql.append("    `length_in_months` INT,\n");
        sql.append("    `pay_rate` DOUBLE,\n");
        sql.append("    `pay_step` INT,\n");
        sql.append("    `salvage_terms` VARCHAR(255),\n");
        sql.append("    `salvage_step` INT,\n");
        sql.append("    `support_terms` VARCHAR(255),\n");
        sql.append("    `support_step` INT,\n");
        sql.append("    `transport_terms` VARCHAR(255),\n");
        sql.append("    `transport_step` INT,\n");
        sql.append("    `command_rights` VARCHAR(255),\n");
        sql.append("    `command_step` INT,\n");
        sql.append("    `monthly_pay` INT DEFAULT 500,\n");
        sql.append("    `monthly_maintenance` INT DEFAULT 500,\n");
        sql.append("    `transportation_cost` INT DEFAULT 300,\n");
        sql.append("    `combat_pay` INT DEFAULT 500,\n");
        sql.append("    `armor_multiplier` DOUBLE,\n");
        sql.append("    `internal_multiplier` DOUBLE,\n");
        sql.append("    `crippled_multiplier` DOUBLE,\n");
        sql.append("    `destroyed_multiplier` DOUBLE,\n");
        sql.append("    `non_mech_modifier` DOUBLE,\n");
        sql.append("    `mixed_tech_modifier` DOUBLE,\n");
        sql.append("    `clan_tech_modifier` DOUBLE,\n");
        sql.append("    `omnimech_reconfigure_modifier` DOUBLE,\n");
        sql.append("    `purchase_unit_multiplier` INT,\n");
        sql.append("    `sell_unit_multiplier` INT,\n");
        sql.append("    `rearm_cost_per_ton` INT,\n");
        sql.append("    `rearm_cost_per_ton_alpha_strike` INT,\n");
        sql.append("    `hire_mechwarrior_cost` INT,\n");
        sql.append("    `hire_named_pilot_cost` INT,\n");
        sql.append("    `hire_battle_armor_cost` INT,\n");
        sql.append("    `heal_mechwarrior_per_wound_box_cost` INT,\n");
        sql.append("    `heal_mechwarrior_per_month_cost` INT,\n");
        sql.append("    `heal_battle_armor_cost` INT,\n");
        sql.append("    `train_formation_commander_cost` INT,\n");
        sql.append("    `change_formation_training_cost` INT,\n");
        sql.append("    `learn_first_ability_cost` INT,\n");
        sql.append("    `learn_second_ability_cost` INT,\n");
        sql.append("    `learn_third_ability_cost` INT,\n");
        sql.append("    `replace_ability_cost` INT,\n");
        sql.append("    CONSTRAINT fk_campaign_manager FOREIGN KEY (manager_id) REFERENCES app_users(id)\n");
        sql.append(");\n\n");

        sql.append("-- Create campaign_factions table (CampaignFaction.java)\n");
        sql.append("CREATE TABLE IF NOT EXISTS campaign_factions (\n");
        sql.append("    `id` VARCHAR(36) NOT NULL PRIMARY KEY,\n");
        sql.append("    campaign_id VARCHAR(36) NOT NULL,\n");
        sql.append("    `faction_name` VARCHAR(255),\n");
        sql.append("    `offers_contracts` BOOLEAN,\n");
        sql.append("    `short_description` VARCHAR(1000),\n");
        sql.append("    CONSTRAINT fk_faction_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE\n");
        sql.append(");\n\n");

        sql.append("-- Create campaign_invites table (CampaignInvite.java)\n");
        sql.append("CREATE TABLE IF NOT EXISTS campaign_invites (\n");
        sql.append("    `id` VARCHAR(36) NOT NULL PRIMARY KEY,\n");
        sql.append("    campaign_id VARCHAR(36) NOT NULL,\n");
        sql.append("    `token` VARCHAR(64) NOT NULL UNIQUE,\n");
        sql.append("    `recipient_name` VARCHAR(255),\n");
        sql.append("    `expires_at` DATETIME,\n");
        sql.append("    `used` BOOLEAN DEFAULT FALSE,\n");
        sql.append("    CONSTRAINT fk_invite_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE\n");
        sql.append(");\n\n");

        sql.append("-- Create campaign_tracks table (CampaignTrack.java)\n");
        sql.append("CREATE TABLE IF NOT EXISTS campaign_tracks (\n");
        sql.append("    `id` VARCHAR(36) NOT NULL PRIMARY KEY,\n");
        sql.append("    campaign_id VARCHAR(36) NOT NULL,\n");
        sql.append("    `track_name` VARCHAR(255),\n");
        sql.append("    `sequence_order` INT,\n");
        sql.append("    `location` VARCHAR(255),\n");
        sql.append("    `next_session` DATETIME,\n");
        sql.append("    `attacker_faction_id` VARCHAR(36),\n");
        sql.append("    `month_index` INT,\n");
        sql.append("    `complications` VARCHAR(1000),\n");
        sql.append("    `opposition_complications` VARCHAR(1000),\n");
        sql.append("    `after_action_narrative` TEXT,\n");
        sql.append("    CONSTRAINT fk_track_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,\n");
        sql.append("    CONSTRAINT fk_track_attacker FOREIGN KEY (attacker_faction_id) REFERENCES campaign_factions(id) ON DELETE SET NULL\n");
        sql.append(");\n\n");

        sql.append("-- Create contracts table (Contract.java)\n");
        sql.append("CREATE TABLE IF NOT EXISTS contracts (\n");
        sql.append("    `id` VARCHAR(36) NOT NULL PRIMARY KEY,\n");
        sql.append("    campaign_id VARCHAR(36) NOT NULL,\n");
        sql.append("    `employer_faction_id` VARCHAR(36),\n");
        sql.append("    `employer_category` VARCHAR(255),\n");
        sql.append("    `primary_contract` BOOLEAN,\n");
        sql.append("    `mission_type` VARCHAR(255),\n");
        sql.append("    `pay_rate` DOUBLE,\n");
        sql.append("    `pay_step` INT,\n");
        sql.append("    `salvage_terms` VARCHAR(255),\n");
        sql.append("    `salvage_step` INT,\n");
        sql.append("    `support_terms` VARCHAR(255),\n");
        sql.append("    `support_step` INT,\n");
        sql.append("    `transport_terms` VARCHAR(255),\n");
        sql.append("    `transport_step` INT,\n");
        sql.append("    `command_rights` VARCHAR(255),\n");
        sql.append("    `command_step` INT,\n");
        sql.append("    `track_count` INT,\n");
        sql.append("    CONSTRAINT fk_contract_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,\n");
        sql.append("    CONSTRAINT fk_contract_faction FOREIGN KEY (employer_faction_id) REFERENCES campaign_factions(id) ON DELETE CASCADE\n");
        sql.append(");\n\n");

        sql.append("-- Create mercenary_commands table (MercenaryCommand.java)\n");
        sql.append("CREATE TABLE IF NOT EXISTS mercenary_commands (\n");
        sql.append("    `id` VARCHAR(36) NOT NULL PRIMARY KEY,\n");
        sql.append("    `name` VARCHAR(255),\n");
        sql.append("    `owner_id` VARCHAR(36) NOT NULL,\n");
        sql.append("    `total_support_points` INT DEFAULT 0,\n");
        sql.append("    `reputation` INT DEFAULT 1,\n");
        sql.append("    `commanding_officer` VARCHAR(255),\n");
        sql.append("    CONSTRAINT fk_command_owner FOREIGN KEY (owner_id) REFERENCES app_users(id)\n");
        sql.append(");\n\n");

        sql.append("-- Create campaign_markets table (CampaignMarkets.java)\n");
        sql.append("CREATE TABLE IF NOT EXISTS campaign_markets (\n");
        sql.append("    `id` VARCHAR(36) NOT NULL PRIMARY KEY,\n");
        sql.append("    `campaign_id` VARCHAR(36) NOT NULL UNIQUE,\n");
        sql.append("    `free_market_markdown` TEXT,\n");
        sql.append("    `scrapper_market_markdown` TEXT,\n");
        sql.append("    `scrapper_pool_markdown` TEXT,\n");
        sql.append("    `scrapper_fee` INT NOT NULL DEFAULT 50000,\n");
        sql.append("    `employer_markets_json` JSON,\n");
        sql.append("    CONSTRAINT fk_market_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE\n");
        sql.append(");\n\n");

        sql.append("-- Create detachments table (Detachment.java)\n");
        sql.append("CREATE TABLE IF NOT EXISTS detachments (\n");
        sql.append("    `id` VARCHAR(36) NOT NULL PRIMARY KEY,\n");
        sql.append("    `mercenary_command_id` VARCHAR(36) NOT NULL,\n");
        sql.append("    `campaign_id` VARCHAR(36),\n");
        sql.append("    `name` VARCHAR(255),\n");
        sql.append("    `callsign` VARCHAR(255),\n");
        sql.append("    CONSTRAINT fk_detachment_command FOREIGN KEY (mercenary_command_id) REFERENCES mercenary_commands(id) ON DELETE CASCADE,\n");
        sql.append("    CONSTRAINT fk_detachment_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE\n");
        sql.append(");\n\n");

        sql.append("-- Track which contract a detachment is working under for a specific month\n");
        sql.append("CREATE TABLE IF NOT EXISTS detachment_contract_assignments (\n");
        sql.append("    `id` VARCHAR(36) NOT NULL PRIMARY KEY,\n");
        sql.append("    detachment_id VARCHAR(36) NOT NULL,\n");
        sql.append("    contract_id VARCHAR(36) NOT NULL,\n");
        sql.append("    `month_index` INT NOT NULL,\n");
        sql.append("    CONSTRAINT fk_assign_detachment FOREIGN KEY (detachment_id) REFERENCES detachments(id) ON DELETE CASCADE,\n");
        sql.append("    CONSTRAINT fk_assign_contract FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,\n");
        sql.append("    UNIQUE KEY idx_det_month_contract (detachment_id, month_index)\n");
        sql.append(");\n\n");

        sql.append("-- Create ledger_entries table (LedgerEntry.java)\n");
        sql.append("CREATE TABLE IF NOT EXISTS ledger_entries (\n");
        sql.append("    `id` VARCHAR(36) NOT NULL PRIMARY KEY,\n");
        sql.append("    `command_id` VARCHAR(36) NOT NULL,\n");
        sql.append("    `campaign_id` VARCHAR(36),\n");
        sql.append("    `detachment_id` VARCHAR(36),\n");
        sql.append("    `amount` INT,\n");
        sql.append("    `short_description` VARCHAR(1000),\n");
        sql.append("    `timestamp` DATETIME,\n");
        sql.append("    `reputation_change` INT,\n");
        sql.append("    `campaign_name` VARCHAR(255),\n");
        sql.append("    `month_index` INT,\n");
        sql.append("    CONSTRAINT fk_ledger_command FOREIGN KEY (command_id) REFERENCES mercenary_commands(id) ON DELETE CASCADE,\n");
        sql.append("    CONSTRAINT fk_ledger_detachment FOREIGN KEY (detachment_id) REFERENCES detachments(id) ON DELETE SET NULL\n");
        sql.append(");\n\n");

        sql.append("-- Create combat_units table (CombatUnit.java)\n");
        sql.append("CREATE TABLE IF NOT EXISTS combat_units (\n");
        sql.append("    `id` VARCHAR(36) NOT NULL PRIMARY KEY,\n");
        sql.append("    `command_id` VARCHAR(36) NOT NULL,\n");
        sql.append("    `detachment_id` VARCHAR(36),\n");
        sql.append("    `model` VARCHAR(255),\n");
        sql.append("    `type` VARCHAR(255),\n");
        sql.append("    `variant` VARCHAR(255),\n");
        sql.append("    `tech_base` VARCHAR(100),\n");
        sql.append("    `tonnage` INT,\n");
        sql.append("    `as_size` INT,\n");
        sql.append("    `bv` INT,\n");
        sql.append("    `pv` INT,\n");
        sql.append("    `status` VARCHAR(255),\n");
        sql.append("    CONSTRAINT fk_combat_unit_command FOREIGN KEY (command_id) REFERENCES mercenary_commands(id) ON DELETE CASCADE,\n");
        sql.append("    CONSTRAINT fk_combat_unit_detachment FOREIGN KEY (detachment_id) REFERENCES detachments(id) ON DELETE SET NULL\n");
        sql.append(");\n\n");

        sql.append("-- Create pilots table (Pilot.java)\n");
        sql.append("CREATE TABLE IF NOT EXISTS pilots (\n");
        sql.append("    `id` VARCHAR(36) NOT NULL PRIMARY KEY,\n");
        sql.append("    `command_id` VARCHAR(36) NOT NULL,\n");
        sql.append("    `detachment_id` VARCHAR(36),\n");
        sql.append("    `name` VARCHAR(255),\n");
        sql.append("    `gunnery` INT,\n");
        sql.append("    `piloting` INT,\n");
        sql.append("    `as_skill` INT,\n");
        sql.append("    `unit_type` VARCHAR(50),\n");
        sql.append("    `wounds` INT DEFAULT 0,\n");
        sql.append("    `handicap` INT DEFAULT 0,\n");
        sql.append("    `total_sp_earned` INT DEFAULT 0,\n");
        sql.append("    `gunnery_sp_earned` INT DEFAULT 0,\n");
        sql.append("    `piloting_sp_earned` INT DEFAULT 0,\n");
        sql.append("    `edge_tokens_sp_earned` INT DEFAULT 0,\n");
        sql.append("    `edge_ability_sp_earned` INT DEFAULT 0,\n");
        sql.append("    `edge_tokens_skill` INT DEFAULT 0,\n");
        sql.append("    `edge_ability_skill` INT DEFAULT 0,\n");
        sql.append("    `edge_abilities` VARCHAR(255),\n");
        sql.append("    CONSTRAINT fk_pilot_command FOREIGN KEY (command_id) REFERENCES mercenary_commands(id) ON DELETE CASCADE,\n");
        sql.append("    CONSTRAINT fk_pilot_detachment FOREIGN KEY (detachment_id) REFERENCES detachments(id) ON DELETE SET NULL\n");
        sql.append(");\n\n");

        sql.append("-- Create faction_reputations table (FactionReputation.java)\n");
        sql.append("CREATE TABLE IF NOT EXISTS faction_reputations (\n");
        sql.append("    `id` VARCHAR(36) NOT NULL PRIMARY KEY,\n");
        sql.append("    `campaign_faction_id` VARCHAR(36) NOT NULL,\n");
        sql.append("    `mercenary_command_id` VARCHAR(36) NOT NULL,\n");
        sql.append("    `score` INT,\n");
        sql.append("    `standing` VARCHAR(255),\n");
        sql.append("    CONSTRAINT fk_reputation_faction FOREIGN KEY (campaign_faction_id) REFERENCES campaign_factions(id) ON DELETE CASCADE,\n");
        sql.append("    CONSTRAINT fk_reputation_command FOREIGN KEY (mercenary_command_id) REFERENCES mercenary_commands(id) ON DELETE CASCADE\n");
        sql.append(");\n\n");

        try (FileWriter writer = new FileWriter(
                "src/main/resources/db/migration/V1__init_schema.sql")) {
            writer.write(sql.toString());
            System.out.println("V1 Flyway migration generated: src/main/resources/db/migration/V1__init_schema.sql");
        } catch (IOException e) {
            System.err.println("Error writing V1 migration: " + e.getMessage());
        }
    }
}
