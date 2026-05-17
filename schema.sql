-- ============================================================
-- Infinite Bloom — Neon Schema (final)
-- IMPORTANT: Run better-auth migrations FIRST, then this file.
-- Run in Neon SQL editor or: psql "connection-string" -f schema.sql
-- ============================================================


-- ============================================================
-- TENANTS
-- Phase 1: one row (you). Phase 2: one row per artist.
-- ============================================================

CREATE TABLE tenants (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              TEXT UNIQUE NOT NULL,       -- e.g. 'kismet-krystle'
  display_name      TEXT NOT NULL,
  stripe_account_id TEXT,                       -- Stripe Connect (phase 2, null for now)
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- USERS & AUTH
-- better-auth creates its own user/session/account tables.
-- user_profiles extends better-auth and is global across tenants
-- (one reader account works across multiple artists' storefronts).
-- ============================================================

CREATE TABLE user_profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id  TEXT UNIQUE NOT NULL,           -- references better-auth user.id
  email         TEXT UNIQUE NOT NULL,
  display_name  TEXT,
  role          TEXT NOT NULL DEFAULT 'user'
                CHECK (role IN ('user', 'admin')),
  last_page     INTEGER DEFAULT 1,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Enforces 3-device limit — check COUNT before INSERT in API route
CREATE TABLE user_devices (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  device_label       TEXT,                      -- e.g. "Chrome on iPhone" — shown in UI
  last_seen          TIMESTAMPTZ DEFAULT NOW(),
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, device_fingerprint)
);


-- ============================================================
-- TESTIMONIALS
-- Scoped per tenant. Admin approves before showing publicly.
-- ============================================================

CREATE TABLE testimonials (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_title TEXT,                            -- e.g. "Reader" or "Poet, NYC"
  content     TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,            -- admin must approve before public display
  order_index INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- PRODUCTS
-- tenant_id scopes products to an artist.
-- Unique on (tenant_id, name) prevents duplicate seed inserts.
-- price_cents: always integers — 2499 = $24.99
-- ============================================================

CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  image_url       TEXT,
  external_link   TEXT,                         -- for physical book (Amazon etc.)
  price_cents     INTEGER NOT NULL DEFAULT 0,
  currency        TEXT NOT NULL DEFAULT 'usd',
  type            TEXT NOT NULL DEFAULT 'other'
                  CHECK (type IN ('flipbook', 'ebook', 'physical', 'bundle', 'other')),
  stripe_price_id TEXT,                         -- set after creating product in Stripe dashboard
  order_index     INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, name)                       -- prevents duplicate seed rows
);


-- ============================================================
-- PURCHASES
-- Written by Stripe webhook on successful payment.
-- This is the source of truth for who has access to what.
-- ============================================================

CREATE TABLE purchases (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  user_id                  UUID NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,
  product_id               UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  stripe_payment_intent_id TEXT UNIQUE,         -- idempotency key — prevents double processing
  stripe_customer_id       TEXT,
  amount_cents             INTEGER NOT NULL,
  currency                 TEXT NOT NULL DEFAULT 'usd',
  status                   TEXT NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'completed', 'refunded', 'failed')),
  access_granted           BOOLEAN DEFAULT FALSE, -- flipped TRUE by webhook on success
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);

-- Prevents double-processing the same Stripe webhook event
CREATE TABLE stripe_webhook_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,         -- evt_xxxx from Stripe
  event_type      TEXT NOT NULL,                -- e.g. 'payment_intent.succeeded'
  processed_at    TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- ACCESS CODES
-- Manual codes for gifting / comping access.
-- is_manual: distinguishes hand-created from system-generated.
-- note: admin annotation ("gifted to podcast guest" etc.)
-- name/phone dropped — user_profiles already holds contact info.
-- ============================================================

CREATE TABLE access_codes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code         TEXT UNIQUE NOT NULL,
  product_type TEXT NOT NULL DEFAULT 'flipbook'
               CHECK (product_type IN ('flipbook', 'ebook', 'bundle')),
  email        TEXT,                            -- optional: pre-assign to a specific email
  is_manual    BOOLEAN DEFAULT TRUE,            -- TRUE = hand-created, FALSE = system-generated
  note         TEXT,                            -- admin annotation
  is_used      BOOLEAN DEFAULT FALSE,
  used_by      UUID REFERENCES user_profiles(id),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  expires_at   TIMESTAMPTZ                      -- NULL = never expires
);


-- ============================================================
-- EBOOK DOWNLOADS
-- Audit log of signed URL generation — helps detect link sharing.
-- ============================================================

CREATE TABLE ebook_downloads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  purchase_id UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- MESSAGING (admin <-> user, scoped per tenant)
-- ============================================================

CREATE TABLE messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  to_user_id   UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  from_admin   BOOLEAN DEFAULT FALSE,
  subject      TEXT NOT NULL,
  content      TEXT NOT NULL,
  is_read      BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- SITE CONTENT (CMS — scoped per tenant)
-- ============================================================

CREATE TABLE site_content (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  section    TEXT NOT NULL,
  key        TEXT NOT NULL,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, section, key)
);


-- ============================================================
-- ANALYTICS (scoped per tenant)
-- ============================================================

CREATE TABLE analytics (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL
             CHECK (event_type IN (
               'page_view', 'flipbook_open', 'flipbook_page_turn',
               'access_code_use', 'product_click', 'purchase_start',
               'purchase_complete', 'ebook_download', 'share'
             )),
  data       JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_tenants_slug                ON tenants(slug);

CREATE INDEX idx_user_profiles_auth_user_id  ON user_profiles(auth_user_id);
CREATE INDEX idx_user_profiles_email         ON user_profiles(email);
CREATE INDEX idx_user_profiles_role          ON user_profiles(role);

CREATE INDEX idx_user_devices_user_id        ON user_devices(user_id);
CREATE INDEX idx_user_devices_fingerprint    ON user_devices(device_fingerprint);
CREATE INDEX idx_user_devices_last_seen      ON user_devices(last_seen);

CREATE INDEX idx_testimonials_tenant_id      ON testimonials(tenant_id);
CREATE INDEX idx_testimonials_is_approved    ON testimonials(is_approved);

CREATE INDEX idx_products_tenant_id          ON products(tenant_id);
CREATE INDEX idx_products_type               ON products(type);
CREATE INDEX idx_products_order_index        ON products(order_index);

CREATE INDEX idx_purchases_tenant_id         ON purchases(tenant_id);
CREATE INDEX idx_purchases_user_id           ON purchases(user_id);
CREATE INDEX idx_purchases_status            ON purchases(status);
CREATE INDEX idx_purchases_stripe_pi         ON purchases(stripe_payment_intent_id);

CREATE INDEX idx_access_codes_tenant_id      ON access_codes(tenant_id);
CREATE INDEX idx_access_codes_code           ON access_codes(code);
CREATE INDEX idx_access_codes_email          ON access_codes(email);
CREATE INDEX idx_access_codes_is_manual      ON access_codes(is_manual);

CREATE INDEX idx_ebook_downloads_user_id     ON ebook_downloads(user_id);
CREATE INDEX idx_ebook_downloads_purchase_id ON ebook_downloads(purchase_id);

CREATE INDEX idx_messages_tenant_id          ON messages(tenant_id);
CREATE INDEX idx_messages_from_user          ON messages(from_user_id);
CREATE INDEX idx_messages_to_user            ON messages(to_user_id);

CREATE INDEX idx_site_content_tenant_section ON site_content(tenant_id, section);

CREATE INDEX idx_analytics_tenant_id         ON analytics(tenant_id);
CREATE INDEX idx_analytics_event_type        ON analytics(event_type);
CREATE INDEX idx_analytics_created_at        ON analytics(created_at);
CREATE INDEX idx_analytics_user_id           ON analytics(user_id);

CREATE INDEX idx_stripe_events_id            ON stripe_webhook_events(stripe_event_id);


-- ============================================================
-- TRIGGERS — auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_purchases_updated_at
  BEFORE UPDATE ON purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_site_content_updated_at
  BEFORE UPDATE ON site_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- BLOG POSTS
-- Scoped per tenant. Supports draft/published workflow.
-- slug must be unique per tenant for clean URLs.
-- ============================================================

CREATE TABLE blog_posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  slug         TEXT NOT NULL,                   -- e.g. 'why-i-write-poetry' → /blog/why-i-write-poetry
  title        TEXT NOT NULL,
  excerpt      TEXT,                            -- short summary for cards and SEO meta
  content      TEXT NOT NULL,                   -- full post body (markdown or HTML)
  cover_image  TEXT,                            -- URL — stored in Cloudflare R2
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,                     -- set when first published
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

CREATE INDEX idx_blog_posts_tenant_id    ON blog_posts(tenant_id);
CREATE INDEX idx_blog_posts_is_published ON blog_posts(is_published);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX idx_blog_posts_slug         ON blog_posts(tenant_id, slug);

CREATE TRIGGER trg_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- SEED DATA
-- Inserts your tenant first — everything else references it.
-- Safe to re-run — all inserts use ON CONFLICT DO NOTHING.
-- ============================================================

INSERT INTO tenants (slug, display_name) VALUES
  ('kismet-krystle', 'Kismet Krystle')
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------
-- Site content — all sections
-- Each row is one editable field in your admin CMS.
-- ----------------------------------------------------------------
INSERT INTO site_content (tenant_id, section, key, value)
SELECT t.id, s.section, s.key, s.value::jsonb
FROM tenants t
CROSS JOIN (VALUES

  -- Hero
  ('hero', 'title',         '"Infinite Bloom"'),
  ('hero', 'subtitle',      '"Evolving by Perspective"'),
  ('hero', 'quote',         '"Every ending is a new beginning, every bloom infinite in its possibility."'),
  ('hero', 'description',   '"An immersive digital experience combining poetry, audio narration, and personal reflections."'),
  ('hero', 'ctaLabel',      '"Get the Book"'),
  ('hero', 'coverImage',    '""'),

  -- Features / stats bar
  ('features', 'poemsCount',       '"45"'),
  ('features', 'audioCount',       '"45"'),
  ('features', 'insightsCount',    '"143"'),
  ('features', 'chaptersCount',    '"6"'),

  -- About
  ('about', 'heading',      '"About Kismet Krystle"'),
  ('about', 'bio',          '"Kismet Krystle is a spoken word poet, author, and creative based in the United States. Her work explores self-discovery, consciousness, and the infinite nature of the human experience."'),
  ('about', 'photoUrl',     '""'),
  ('about', 'instagramUrl', '""'),
  ('about', 'twitterUrl',   '""'),
  ('about', 'youtubeUrl',   '""'),

  -- Book preview
  ('preview', 'heading',        '"Experience the Flipbook"'),
  ('preview', 'description',    '"Get a feel for the immersive reading experience before you buy."'),
  ('preview', 'samplePages',    '[]'),
  ('preview', 'previewLimit',   '3'),

  -- Audio preview
  ('audio', 'heading',          '"Hear the Poems"'),
  ('audio', 'description',      '"Each poem is narrated by the author in an intimate acapella recording."'),
  ('audio', 'sampleTracks',     '[]'),

  -- Testimonials section labels
  ('testimonials', 'heading',   '"What Readers Are Saying"'),
  ('testimonials', 'subheading','"Real experiences from real readers."'),

  -- About the Book
  ('about_book', 'heading',     '"About Infinite Bloom"'),
  ('about_book', 'quote',       '"Infinite Bloom is the eternal journey of evolution through self-discovery, Evolving by Perspective."'),
  ('about_book', 'attribution', '"— Kismet Krystle"'),

  -- Blog section labels
  ('blog', 'heading',           '"From the Author"'),
  ('blog', 'subheading',        '"Thoughts on poetry, creativity, and conscious living."'),

  -- Footer
  ('footer', 'copyrightText',   '"© 2025 Kismet Krystle. All rights reserved."'),
  ('footer', 'tagline',         '"Evolving by Perspective."')

) AS s(section, key, value)
WHERE t.slug = 'kismet-krystle'
ON CONFLICT (tenant_id, section, key) DO NOTHING;

-- ----------------------------------------------------------------
-- Products
-- ----------------------------------------------------------------
INSERT INTO products (tenant_id, name, description, price_cents, currency, type, order_index)
SELECT t.id, p.name, p.description, p.price_cents, 'usd', p.type, p.order_index
FROM tenants t
CROSS JOIN (VALUES
  ('Digital Flipbook',       'Lifetime access to the interactive Infinite Bloom flipbook', 1499, 'flipbook', 1),
  ('Ebook (PDF)',             'Downloadable PDF edition of Infinite Bloom',                  999, 'ebook',    2),
  ('Physical Book',          'Printed softcover — ships to your door',                     2499, 'physical', 3),
  ('Digital + Ebook Bundle', 'Flipbook access plus PDF download',                          1999, 'bundle',   4)
) AS p(name, description, price_cents, type, order_index)
WHERE t.slug = 'kismet-krystle'
ON CONFLICT (tenant_id, name) DO NOTHING;

-- ----------------------------------------------------------------
-- Seed testimonials (replace with real ones before launch)
-- ----------------------------------------------------------------
INSERT INTO testimonials (tenant_id, author_name, author_title, content, is_approved, order_index)
SELECT t.id, r.author_name, r.author_title, r.content, TRUE, r.order_index
FROM tenants t
CROSS JOIN (VALUES
  ('A. Johnson',  'Reader',          'Infinite Bloom stopped me in my tracks. I read it twice in one sitting.',          1),
  ('M. Davis',    'Poet & Educator', 'Kismet has a gift for turning inward experience into universal truth.',            2),
  ('T. Williams', 'Reader',          'The audio narration makes this unlike any book experience I have had before.',     3)
) AS r(author_name, author_title, content, order_index)
WHERE t.slug = 'kismet-krystle'
ON CONFLICT DO NOTHING;
