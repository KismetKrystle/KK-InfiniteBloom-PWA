-- ============================================================
-- Repoints the Digital Flipbook at the correct Stripe Price, created
-- under the right account (the 0008 price belonged to a different one).
-- Run against the existing Neon DB:
--   psql "$DATABASE_URL" -f migrations/0009_update_flipbook_stripe_price.sql
-- Safe to re-run.
-- ============================================================

UPDATE products
SET stripe_price_id = 'price_1U5xsnRH9kUMR4GzyNxuHhQa'
WHERE type = 'flipbook';
