-- Ensure app_users.email is unique.
--
-- Background:
--   app_users.external_id has always been UNIQUE, but email was not. The legacy
--   login migration (resolveOrCreateUser -> migrateLegacyUserByIdentity) looks up
--   legacy accounts by email and then rewrites external_id on every login. Because
--   email was not unique, multiple rows could share one email; each login then
--   clobbered a different row's external_id, detaching the canonical Auth0 account
--   from its campaigns/commands (see V21__repair_user_migration_overlap.sql).
--
-- This constraint makes the overlap impossible going forward: once a canonical
-- row holds a real provider sub, a later login with a different email can no
-- longer create or reuse a second row under the same email.
--
-- Idempotency ("add or replace"):
--   MySQL has no "ALTER TABLE ... ADD CONSTRAINT IF NOT EXISTS", and the live
--   database may already carry the constraint (e.g. a prior partial/manual run
--   that predates this migration). So we drop the constraint first when it is
--   already present, then add it fresh. This makes the migration safe to run
--   whether or not the constraint exists, on both fresh databases and ones
--   where a previous run already added it.
--   (The preconditions from V21 — no duplicate emails — are satisfied, so the
--   ADD itself cannot fail.)
--
-- This is written as dynamic SQL (SET/PREPARE/EXECUTE) rather than a stored
-- procedure, because Flyway does not understand the mysql-shell `DELIMITER`
-- directive and would otherwise fail on `CREATE PROCEDURE`/`DELIMITER //`.

SET @uq_exists = (
    SELECT COUNT(*) FROM information_schema.table_constraints
    WHERE table_schema = DATABASE()
      AND table_name = 'app_users'
      AND constraint_name = 'uq_app_users_email'
);
SET @drop_sql = IF(@uq_exists > 0,
    'ALTER TABLE app_users DROP CONSTRAINT uq_app_users_email',
    'SELECT 1');
PREPARE __drop_uq_email FROM @drop_sql;
EXECUTE __drop_uq_email;
DROP PREPARE __drop_uq_email;

ALTER TABLE app_users ADD CONSTRAINT uq_app_users_email UNIQUE (email);
