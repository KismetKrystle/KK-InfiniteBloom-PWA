-- ============================================================
-- Points the Digital Flipbook at its LIVE-mode Stripe Price
-- (0008/0009 pointed it at test-mode prices).
-- Replace PRICE_ID_HERE with the live price ID from the Stripe
-- Dashboard (Live mode > Products > Digital Flipbook > Price),
-- then run against the production Neon DB:
--   psql "$DATABASE_URL" -f migrations/0013_flipbook_live_stripe_price.sql
-- Safe to re-run.
-- ============================================================

UPDATE products
SET stripe_price_id = 'price_1U70QwIVRjdAod4UU3WtoRiv'
WHERE type = 'flipbook';
