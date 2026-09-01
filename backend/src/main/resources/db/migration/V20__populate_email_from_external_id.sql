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

-- Report affected rows (for manual verification when running interactively)
SELECT ROW_COUNT() AS rows_updated;
