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

        sql.append("SET FOREIGN_KEY_CHECKS = 0;\n\n");

        sql.append("-- Drop existing tables in reverse order of dependency\n");
        sql.append("DROP TABLE IF EXISTS ledger_entries;\n");
        sql.append("DROP TABLE IF EXISTS detachments;\n");
        sql.append("DROP TABLE IF EXISTS mercenary_commands;\n");
        sql.append("DROP TABLE IF EXISTS contracts;\n");
        sql.append("DROP TABLE IF EXISTS campaign_factions;\n");
        sql.append("DROP TABLE IF EXISTS campaigns;\n\n");

        sql.append("SET FOREIGN_KEY_CHECKS = 1;\n\n");

        sql.append("-- Create campaigns table (Campaign.java)\n");
        sql.append("CREATE TABLE campaigns (\n");
        sql.append("    id VARCHAR(36) NOT NULL PRIMARY KEY,\n");
        sql.append("    name VARCHAR(255),\n");
        sql.append("    manager_id VARCHAR(36),\n");
        sql.append("    status VARCHAR(50),\n");
        sql.append("    system_name VARCHAR(255),\n");
        sql.append("    track_count INT\n");
        sql.append(");\n\n");

        sql.append("-- Create campaign_factions table (CampaignFaction.java)\n");
        sql.append("CREATE TABLE campaign_factions (\n");
        sql.append("    id VARCHAR(36) NOT NULL PRIMARY KEY,\n");
        sql.append("    campaign_id VARCHAR(36) NOT NULL,\n");
        sql.append("    faction_name VARCHAR(255),\n");
        sql.append("    offers_contracts BOOLEAN,\n");
        sql.append("    CONSTRAINT fk_faction_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE\n");
        sql.append(");\n\n");

        sql.append("-- Create contracts table (Contract.java)\n");
        sql.append("CREATE TABLE contracts (\n");
        sql.append("    id VARCHAR(36) NOT NULL PRIMARY KEY,\n");
        sql.append("    campaign_id VARCHAR(36) NOT NULL,\n");
        sql.append("    employer_faction_id VARCHAR(36),\n");
        sql.append("    employer_category VARCHAR(255),\n");
        sql.append("    primary_contract BOOLEAN,\n");
        sql.append("    mission_type VARCHAR(255),\n");
        sql.append("    pay_rate DOUBLE,\n");
        sql.append("    pay_step INT,\n");
        sql.append("    salvage_terms VARCHAR(255),\n");
        sql.append("    salvage_step INT,\n");
        sql.append("    support_terms VARCHAR(255),\n");
        sql.append("    support_step INT,\n");
        sql.append("    transport_terms VARCHAR(255),\n");
        sql.append("    transport_step INT,\n");
        sql.append("    command_rights VARCHAR(255),\n");
        sql.append("    command_step INT,\n");
        sql.append("    track_count INT,\n");
        sql.append("    CONSTRAINT fk_contract_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,\n");
        sql.append("    CONSTRAINT fk_contract_faction FOREIGN KEY (employer_faction_id) REFERENCES campaign_factions(id)\n");
        sql.append(");\n\n");

        sql.append("-- Create mercenary_commands table (MercenaryCommand.java)\n");
        sql.append("CREATE TABLE mercenary_commands (\n");
        sql.append("    id VARCHAR(36) NOT NULL PRIMARY KEY,\n");
        sql.append("    owner_id VARCHAR(36),\n");
        sql.append("    total_support_points INT DEFAULT 0\n");
        sql.append(");\n\n");

        sql.append("-- Create detachments table (Detachment.java)\n");
        sql.append("CREATE TABLE detachments (\n");
        sql.append("    id VARCHAR(36) NOT NULL PRIMARY KEY,\n");
        sql.append("    mercenary_command_id VARCHAR(36) NOT NULL,\n");
        sql.append("    contract_id VARCHAR(36) NOT NULL,\n");
        sql.append("    CONSTRAINT fk_detachment_command FOREIGN KEY (mercenary_command_id) REFERENCES mercenary_commands(id),\n");
        sql.append("    CONSTRAINT fk_detachment_contract FOREIGN KEY (contract_id) REFERENCES contracts(id)\n");
        sql.append(");\n\n");

        sql.append("-- Create ledger_entries table (LedgerEntry.java)\n");
        sql.append("CREATE TABLE ledger_entries (\n");
        sql.append("    id VARCHAR(36) NOT NULL PRIMARY KEY,\n");
        sql.append("    detachment_id VARCHAR(36) NOT NULL,\n");
        sql.append("    amount INT,\n");
        sql.append("    short_description VARCHAR(1000),\n");
        sql.append("    timestamp DATETIME,\n");
        sql.append("    CONSTRAINT fk_ledger_detachment FOREIGN KEY (detachment_id) REFERENCES detachments(id) ON DELETE CASCADE\n");
        sql.append(");\n");

        try (FileWriter writer = new FileWriter("schema.sql")) {
            writer.write(sql.toString());
            System.out.println("SQL schema script generated: schema.sql");
        } catch (IOException e) {
            System.err.println("Error writing schema.sql: " + e.getMessage());
        }
    }
}
