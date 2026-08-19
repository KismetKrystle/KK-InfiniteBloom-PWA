-- ============================================================
-- Links the Digital Flipbook product to its Stripe Price.
-- Run against the existing Neon DB:
--   psql "$DATABASE_URL" -f migrations/0008_link_flipbook_stripe_price.sql
-- Safe to re-run.
-- ============================================================

UPDATE products
SET stripe_price_id = 'price_1U5w2sF2U0abrJHv5pMc9K4Q'
WHERE type = 'flipbook';
