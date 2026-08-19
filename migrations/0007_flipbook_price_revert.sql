-- ============================================================
-- Reverts the Digital Flipbook price back to $20 (0006 briefly set it
-- to $15 before the final price was confirmed).
-- Run against the existing Neon DB:
--   psql "$DATABASE_URL" -f migrations/0007_flipbook_price_revert.sql
-- Safe to re-run.
-- ============================================================

UPDATE products
SET price_cents = 2000
WHERE type = 'flipbook';
