-- ============================================================
-- Generalizes audio_comments into a shared comments table, so the
-- same comment/like system can be reused on the flipbook page (and
-- any future page) via a "context" column instead of one table per page.
-- Postgres tracks foreign keys by OID, not name, so renaming the
-- referenced table does not break comment_likes' FK.
-- Run against the existing Neon DB:
--   psql "$DATABASE_URL" -f migrations/0004_generalize_comments.sql
-- Safe to re-run.
-- ============================================================

ALTER TABLE IF EXISTS audio_comments RENAME TO comments;
ALTER TABLE IF EXISTS audio_comment_likes RENAME TO comment_likes;

ALTER TABLE comments ADD COLUMN IF NOT EXISTS context TEXT NOT NULL DEFAULT 'audio';

CREATE INDEX IF NOT EXISTS idx_comments_context ON comments(context);
