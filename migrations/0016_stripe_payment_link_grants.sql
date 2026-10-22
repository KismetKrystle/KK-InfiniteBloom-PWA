-- ============================================================
-- Lets Stripe Payment Link purchases unlock the flipbook by the
-- buyer's email (no account needed at checkout). The webhook and the
-- /welcome page both write one access_grants row per Checkout
-- Session; refunds revoke it by payment intent.
--   Paste into the Neon SQL editor, or:
--   npx tsx scripts/run-sql.ts migrations/0016_stripe_payment_link_grants.sql
-- Safe to re-run.
-- ============================================================

ALTER TABLE access_grants ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;
ALTER TABLE access_grants ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_access_grants_checkout_session
  ON access_grants(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_access_grants_payment_intent
  ON access_grants(stripe_payment_intent_id);
