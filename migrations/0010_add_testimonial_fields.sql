-- ============================================================
-- Adds rating + author_email to testimonials, so the real submission
-- flow (UserTestimonialForm) can store what it collects. author_email
-- is admin-only (for following up), never shown publicly.
-- Run against the existing Neon DB:
--   psql "$DATABASE_URL" -f migrations/0010_add_testimonial_fields.sql
-- Safe to re-run.
-- ============================================================

ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS rating SMALLINT CHECK (rating BETWEEN 1 AND 5);
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS author_email TEXT;
