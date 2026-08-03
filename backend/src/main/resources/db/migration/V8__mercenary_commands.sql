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
