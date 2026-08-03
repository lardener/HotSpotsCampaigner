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
