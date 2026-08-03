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
