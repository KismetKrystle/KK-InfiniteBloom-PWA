-- ============================================================
-- Physical book owners claim audio access by submitting proof
-- of purchase (order # optional) + a required verification photo.
-- Auto-approved on submit; reviewed/restricted later by hand.
-- One claim per user — resubmitting updates the existing row.
--   npx tsx scripts/run-sql.ts migrations/0014_add_book_claims_table.sql
-- Safe to re-run.
-- ============================================================

CREATE TABLE IF NOT EXISTS book_claims (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
  order_number TEXT,
  photo_url    TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'approved'
               CHECK (status IN ('approved', 'restricted')),
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_book_claims_user_id ON book_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_book_claims_status  ON book_claims(status);
