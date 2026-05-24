package com.hotspotscamp;

import java.io.FileWriter;
import java.io.IOException;

/**
 * Utility program to generate a MySQL schema script aligned with the HotSpots
 * Campaigner entity classes and R2DBC configuration.
 */
public class SchemaGenerator {

    public static void main(String[] args) {
        StringBuilder sql = new StringBuilder();

        sql.append("-- HotSpots Campaigner Database Schema\n");
        sql.append("-- Generated for MySQL / R2DBC Compatibility\n\n");

        sql.append("USE `BT_Campaigner`;\n\n");

        sql.append("SET FOREIGN_KEY_CHECKS = 0;\n\n");

        sql.append("SET SESSION group_concat_max_len = 1000000;\n");
        sql.append("-- Dynamic drop of all tables in the current schema to ensure a clean slate\n");
        sql.append("SET @tables = NULL;\n");
        sql.append("SELECT GROUP_CONCAT('`', table_name, '`') INTO @tables\n");
        sql.append("  FROM information_schema.tables\n");
        sql.append("  WHERE table_schema = DATABASE();\n\n");
        sql.append("SET @tables = IF(@tables IS NOT NULL, CONCAT('DROP TABLE IF EXISTS ', @tables), 'SELECT \"No tables to drop\"');\n");
        sql.append("PREPARE stmt FROM @tables;\n");
        sql.append("EXECUTE stmt;\n");
        sql.append("DEALLOCATE PREPARE stmt;\n\n");

        sql.append("SET FOREIGN_KEY_CHECKS = 1;\n\n");

        sql.append("-- Create app_users table (User.java)\n");
        sql.append("CREATE TABLE app_users (\n");
        sql.append("    `id` VARCHAR(36) NOT NULL PRIMARY KEY,\n");
        sql.append("    `external_id` VARCHAR(255) UNIQUE,\n");
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
        sql.append("    CONSTRAINT fk_campaign_manager FOREIGN KEY (manager_id) REFERENCES app_users(id)\n");
        sql.append(");\n\n");

        sql.append("-- Create campaign_invites table (CampaignInvite.java)\n");
        sql.append("CREATE TABLE campaign_invites (\n");
        sql.append("    `id` VARCHAR(36) NOT NULL PRIMARY KEY,\n");
        sql.append("    campaign_id VARCHAR(36) NOT NULL,\n");
        sql.append("    `token` VARCHAR(255) UNIQUE,\n");
        sql.append("    `expires_at` DATETIME,\n");
        sql.append("    `used` BOOLEAN DEFAULT FALSE,\n");
        sql.append("    CONSTRAINT fk_invite_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE\n");
        sql.append(");\n\n");

        sql.append("-- Create campaign_tracks table (CampaignTrack.java)\n");
        sql.append("CREATE TABLE campaign_tracks (\n");
        sql.append("    `id` VARCHAR(36) NOT NULL PRIMARY KEY,\n");
        sql.append("    campaign_id VARCHAR(36) NOT NULL,\n");
        sql.append("    `track_name` VARCHAR(255),\n");
        sql.append("    `sequence_order` INT,\n");
        sql.append("    `location` VARCHAR(255),\n");
        sql.append("    `next_session` DATETIME,\n");
        sql.append("    `attacker_faction_id` VARCHAR(36),\n");
        sql.append("    `month_index` INT,\n");
        sql.append("    `complications` VARCHAR(1000),\n");
        sql.append("    CONSTRAINT fk_track_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,\n");
        sql.append("    CONSTRAINT fk_track_attacker FOREIGN KEY (attacker_faction_id) REFERENCES campaign_factions(id) ON DELETE SET NULL\n");
        sql.append(");\n\n");

        sql.append("-- Create campaign_factions table (CampaignFaction.java)\n");
        sql.append("CREATE TABLE campaign_factions (\n");
        sql.append("    `id` VARCHAR(36) NOT NULL PRIMARY KEY,\n");
        sql.append("    campaign_id VARCHAR(36) NOT NULL,\n");
        sql.append("    `faction_name` VARCHAR(255),\n");
        sql.append("    `offers_contracts` BOOLEAN,\n");
        sql.append("    `short_description` VARCHAR(1000),\n");
        sql.append("    CONSTRAINT fk_faction_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE\n");
        sql.append(");\n\n");

        sql.append("-- Create contracts table (Contract.java)\n");
        sql.append("CREATE TABLE contracts (\n");
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
        sql.append("CREATE TABLE mercenary_commands (\n");
        sql.append("    `id` VARCHAR(36) NOT NULL PRIMARY KEY,\n");
        sql.append("    `name` VARCHAR(255),\n");
        sql.append("    `owner_id` VARCHAR(36) NOT NULL,\n");
        sql.append("    `total_support_points` INT DEFAULT 0,\n");
        sql.append("    `reputation` INT DEFAULT 1,\n");
        sql.append("    `commanding_officer` VARCHAR(255),\n");
        sql.append("    CONSTRAINT fk_command_owner FOREIGN KEY (owner_id) REFERENCES app_users(id)\n");
        sql.append(");\n\n");

        sql.append("-- Create detachments table (Detachment.java)\n");
        sql.append("CREATE TABLE detachments (\n");
        sql.append("    `id` VARCHAR(36) NOT NULL PRIMARY KEY,\n");
        sql.append("    `mercenary_command_id` VARCHAR(36) NOT NULL,\n");
        sql.append("    `campaign_id` VARCHAR(36),\n");
        sql.append("    `name` VARCHAR(255),\n");
        sql.append("    `callsign` VARCHAR(255),\n");
        sql.append("    CONSTRAINT fk_detachment_command FOREIGN KEY (mercenary_command_id) REFERENCES mercenary_commands(id) ON DELETE CASCADE,\n");
        sql.append("    CONSTRAINT fk_detachment_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE\n");
        sql.append(");\n\n");

        sql.append("-- Track which contract a detachment is working under for a specific month\n");
        sql.append("CREATE TABLE detachment_contract_assignments (\n");
        sql.append("    `id` VARCHAR(36) NOT NULL PRIMARY KEY,\n");
        sql.append("    detachment_id VARCHAR(36) NOT NULL,\n");
        sql.append("    contract_id VARCHAR(36) NOT NULL,\n");
        sql.append("    `month_index` INT NOT NULL,\n");
        sql.append("    CONSTRAINT fk_assign_detachment FOREIGN KEY (detachment_id) REFERENCES detachments(id) ON DELETE CASCADE,\n");
        sql.append("    CONSTRAINT fk_assign_contract FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,\n");
        sql.append("    UNIQUE KEY idx_det_month_contract (detachment_id, month_index)\n");
        sql.append(");\n\n");

        sql.append("-- Create ledger_entries table (LedgerEntry.java)\n");
        sql.append("CREATE TABLE ledger_entries (\n");
        sql.append("    `id` VARCHAR(36) NOT NULL PRIMARY KEY,\n");
        sql.append("    `command_id` VARCHAR(36) NOT NULL,\n");
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
        sql.append("CREATE TABLE combat_units (\n");
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
        sql.append("    `available_from_month` INT DEFAULT 1,\n");
        sql.append("    `status` VARCHAR(255),\n");
        sql.append("    CONSTRAINT fk_combat_unit_command FOREIGN KEY (command_id) REFERENCES mercenary_commands(id) ON DELETE CASCADE,\n");
        sql.append("    CONSTRAINT fk_combat_unit_detachment FOREIGN KEY (detachment_id) REFERENCES detachments(id) ON DELETE SET NULL\n");
        sql.append(");\n\n");

        sql.append("-- Create pilots table (Pilot.java)\n");
        sql.append("CREATE TABLE pilots (\n");
        sql.append("    `id` VARCHAR(36) NOT NULL PRIMARY KEY,\n");
        sql.append("    `command_id` VARCHAR(36) NOT NULL,\n");
        sql.append("    `detachment_id` VARCHAR(36),\n");
        sql.append("    `name` VARCHAR(255),\n");
        sql.append("    `gunnery` INT,\n");
        sql.append("    `piloting` INT,\n");
        sql.append("    `as_skill` INT,\n");
        sql.append("    `unit_type` VARCHAR(50),\n");
        sql.append("    `status` VARCHAR(255),\n");
        sql.append("    CONSTRAINT fk_pilot_command FOREIGN KEY (command_id) REFERENCES mercenary_commands(id) ON DELETE CASCADE,\n");
        sql.append("    CONSTRAINT fk_pilot_detachment FOREIGN KEY (detachment_id) REFERENCES detachments(id) ON DELETE SET NULL\n");
        sql.append(");\n\n");

        sql.append("-- Create faction_reputations table (FactionReputation.java)\n");
        sql.append("CREATE TABLE faction_reputations (\n");
        sql.append("    `id` VARCHAR(36) NOT NULL PRIMARY KEY,\n");
        sql.append("    `campaign_faction_id` VARCHAR(36) NOT NULL,\n");
        sql.append("    `mercenary_command_id` VARCHAR(36) NOT NULL,\n");
        sql.append("    `score` INT,\n");
        sql.append("    `standing` VARCHAR(255),\n");
        sql.append("    CONSTRAINT fk_reputation_faction FOREIGN KEY (campaign_faction_id) REFERENCES campaign_factions(id) ON DELETE CASCADE,\n");
        sql.append("    CONSTRAINT fk_reputation_command FOREIGN KEY (mercenary_command_id) REFERENCES mercenary_commands(id) ON DELETE CASCADE\n");
        sql.append(");\n\n");

        try (FileWriter writer = new FileWriter("schema.sql")) {
            writer.write(sql.toString());
            System.out.println("SQL schema script generated: schema.sql");
        } catch (IOException e) {
            System.err.println("Error writing schema.sql: " + e.getMessage());
        }
    }
}
