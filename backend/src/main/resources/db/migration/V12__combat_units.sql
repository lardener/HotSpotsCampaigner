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
