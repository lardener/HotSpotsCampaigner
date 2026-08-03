-- Create app_users table (User.java)
CREATE TABLE IF NOT EXISTS app_users (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `external_id` VARCHAR(64) NOT NULL UNIQUE,
    `display_name` VARCHAR(255),
    `email` VARCHAR(255),
    `role` VARCHAR(50)
);
