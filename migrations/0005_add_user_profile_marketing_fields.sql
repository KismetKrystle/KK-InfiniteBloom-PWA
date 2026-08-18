-- ============================================================
-- Adds phone + marketing_consent to user_profiles, captured by the
-- inline sign-up gate on /audio (replaces the hard redirect-to-/login
-- with a popup so the page itself stays visible behind it).
-- Run against the existing Neon DB:
--   psql "$DATABASE_URL" -f migrations/0005_add_user_profile_marketing_fields.sql
-- Safe to re-run.
-- ============================================================

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN NOT NULL DEFAULT FALSE;
