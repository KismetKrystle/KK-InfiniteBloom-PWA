-- ============================================================
-- Lets an admin grant free flipbook + audio access to a specific
-- email, no purchase required (e.g. collaborators, press, comps).
-- Checked by email at session time, alongside `purchases` — so it
-- works whether the person already has an account or signs up later.
-- Revoke by setting revoked_at; expires_at is optional (NULL = never).
--   npx tsx scripts/run-sql.ts migrations/0015_add_access_grants_table.sql
-- Safe to re-run.
-- ============================================================

CREATE TABLE IF NOT EXISTS access_grants (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL,
  note       TEXT,
  granted_by TEXT,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_grants_email ON access_grants(lower(email));
