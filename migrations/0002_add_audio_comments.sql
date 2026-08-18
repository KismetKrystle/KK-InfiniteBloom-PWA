-- ============================================================
-- Adds audio_comments — reader feedback on the /audio page,
-- scoped per tenant like messages/testimonials.
-- Run against the existing Neon DB:
--   psql "$DATABASE_URL" -f migrations/0002_add_audio_comments.sql
-- Safe to re-run.
-- ============================================================

CREATE TABLE IF NOT EXISTS audio_comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audio_comments_tenant_id  ON audio_comments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audio_comments_user_id    ON audio_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_audio_comments_created_at ON audio_comments(created_at);

-- Reuses the update_updated_at_column() trigger function already defined in schema.sql
DROP TRIGGER IF EXISTS trg_audio_comments_updated_at ON audio_comments;
CREATE TRIGGER trg_audio_comments_updated_at
  BEFORE UPDATE ON audio_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
