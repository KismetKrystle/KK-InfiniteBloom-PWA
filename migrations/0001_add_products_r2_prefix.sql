-- ============================================================
-- Adds products.r2_prefix — maps a product (book) to its R2 key
-- prefix, so the flipbook gate route isn't hardcoded to one book.
-- Run against the existing Neon DB:
--   psql "$DATABASE_URL" -f migrations/0001_add_products_r2_prefix.sql
-- Safe to re-run.
-- ============================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS r2_prefix TEXT;

UPDATE products
SET r2_prefix = 'book'
WHERE type = 'flipbook'
  AND r2_prefix IS NULL;
