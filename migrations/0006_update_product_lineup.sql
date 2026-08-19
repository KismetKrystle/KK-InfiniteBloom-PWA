-- ============================================================
-- Syncs the products table to the current pricing page:
--   Digital Flipbook -> $15 (Stripe, sold on-site)
--   Physical Book -> renamed "Physical Book - Full Color", $33 (Amazon)
--   + new "Physical Book - Black and White", $22 (Amazon)
--   Old Ebook / Bundle rows deactivated, not deleted (preserves history).
-- Run against the existing Neon DB:
--   psql "$DATABASE_URL" -f migrations/0006_update_product_lineup.sql
-- Safe to re-run.
-- ============================================================

UPDATE products
SET price_cents = 1500
WHERE type = 'flipbook';

UPDATE products
SET name = 'Physical Book - Full Color',
    description = 'Printed paperback with full-color pages, delivered to your door.',
    price_cents = 3300
WHERE name = 'Physical Book';

INSERT INTO products (tenant_id, name, description, price_cents, currency, type, order_index)
SELECT t.id, 'Physical Book - Black and White',
       'Printed paperback in classic black and white, delivered to your door.',
       2200, 'usd', 'physical', 4
FROM tenants t
WHERE t.slug = 'kismet-krystle'
ON CONFLICT (tenant_id, name) DO NOTHING;

UPDATE products
SET is_active = false
WHERE name IN ('Ebook (PDF)', 'Digital + Ebook Bundle');
