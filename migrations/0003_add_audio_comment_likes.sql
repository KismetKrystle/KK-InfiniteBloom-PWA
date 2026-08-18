-- ============================================================
-- Adds audio_comment_likes — one row per (comment, user) like,
-- so the audio comment wall can show like counts and toggle state.
-- Run against the existing Neon DB:
--   psql "$DATABASE_URL" -f migrations/0003_add_audio_comment_likes.sql
-- Safe to re-run.
-- ============================================================

CREATE TABLE IF NOT EXISTS audio_comment_likes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES audio_comments(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_audio_comment_likes_comment_id ON audio_comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_audio_comment_likes_user_id    ON audio_comment_likes(user_id);
