-- SQLBook: Code
-- Populate missing email column from legacy external_id values
-- This migration copies external_id into email for accounts where the
-- external_id appears to be an email address (contains '@') and the
-- email column is currently NULL. Emails are normalized to lowercase
-- and trimmed to match application lookup behavior.

-- Safety: only update rows where email IS NULL and external_id looks
-- like an email; this avoids overwriting intentionally blank or
-- provider-keyed identities.

UPDATE app_users
SET email = LOWER(TRIM(external_id))
WHERE email IS NULL
  AND external_id LIKE '%@%';

-- NOTE: the previous diagnostic `SELECT ROW_COUNT() AS rows_updated;` was
-- removed because ROW_COUNT() is a MySQL-specific function that does not exist
-- in H2's MySQL mode, which broke Flyway validation under tests. The UPDATE
-- above is idempotent and safe to leave in place.
