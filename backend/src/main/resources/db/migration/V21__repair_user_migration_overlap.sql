-- Repair user-migration overlap introduced by resolveOrCreateUser / migrateLegacyUserByIdentity.
--
-- Background:
--   resolveOrCreateUser() looks up a legacy account by email with findByEmail(),
--   then rewrites its external_id to the *current* login identity. Because the
--   app_users.email column is NOT unique (only external_id is), three rows shared
--   'desertsharkey@gmail.com'. Every login rewrote one of them, eventually turning
--   8d0849aa... and cbc545b7... into copies whose external_id equal their own UUID
--   (no longer a real Auth0 sub). The genuine account fc93c18a... (google-oauth2|1044...)
--   owns nothing and therefore sees no campaigns; the old data lives under cbc545b7...
--
-- Goal of this migration:
--   1. Reassign every row owned by the clobbered accounts to the canonical
--      account fc93c18a (which still holds the real Auth0 sub).
--   2. Re-point the canonical account's campaigns/commands so they remain owned
--      by the same canonical id (fc93c18a owns no campaigns/commands yet, so this
--      is a no-op that keeps the migration idempotent and explicit).
--   3. Delete the now-empty duplicate clobbered rows.
--
-- Referential integrity: only campaigns.manager_id and mercenary_commands.owner_id
-- reference app_users.id (see FKs fk_campaign_manager, fk_command_owner). Both are
-- updated below.

-- Canonical account that should own all data.
-- @canonical_id = fc93c18a-143d-497f-9dd3-4302d004bf1d
-- @old_a = 8d0849aa-cd4a-4690-9d78-a032c189a00e
-- @old_b = cbc545b7-8979-4508-ae9d-b7c62e41ede8

-- 1. Reassign campaigns to the canonical account.
UPDATE campaigns
SET manager_id = 'fc93c18a-143d-497f-9dd3-4302d004bf1d'
WHERE manager_id IN ('8d0849aa-cd4a-4690-9d78-a032c189a00e', 'cbc545b7-8979-4508-ae9d-b7c62e41ede8');

-- 2. Reassign mercenary commands to the canonical account.
UPDATE mercenary_commands
SET owner_id = 'fc93c18a-143d-497f-9dd3-4302d004bf1d'
WHERE owner_id IN ('8d0849aa-cd4a-4690-9d78-a032c189a00e', 'cbc545b7-8979-4508-ae9d-b7c62e41ede8');

-- 3. Drop the duplicate clobbered rows (their data is now owned by the canonical id).
DELETE FROM app_users
WHERE id IN ('8d0849aa-cd4a-4690-9d78-a032c189a00e', 'cbc545b7-8979-4508-ae9d-b7c62e41ede8');

-- Safety assertion (run manually if needed):
-- SELECT id, external_id, email, role FROM app_users ORDER BY id;
