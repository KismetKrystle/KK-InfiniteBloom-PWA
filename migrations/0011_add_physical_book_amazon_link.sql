-- ============================================================
-- Links the physical book product to its Amazon listing.
-- Run against the existing Neon DB:
--   psql "$DATABASE_URL" -f migrations/0011_add_physical_book_amazon_link.sql
-- Safe to re-run.
-- ============================================================

UPDATE products
SET external_link = 'https://a.co/d/02C4lAL5'
WHERE type = 'physical';
