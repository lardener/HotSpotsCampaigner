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
-- Note: this migration is safe to run only once there are no duplicate emails.
-- V21 already consolidated the desertsharkey duplicates onto a single canonical
-- account, so the preconditions are met.

ALTER TABLE app_users
    ADD CONSTRAINT uq_app_users_email UNIQUE (email);
