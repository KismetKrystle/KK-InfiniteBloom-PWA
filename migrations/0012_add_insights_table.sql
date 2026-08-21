-- ============================================================
-- Adds the insights table backing the hero's random-quote display.
-- Run against the existing Neon DB:
--   npx tsx scripts/run-sql.ts migrations/0012_add_insights_table.sql
-- Safe to re-run. Data is seeded separately via `npm run seed:insights`.
-- ============================================================

CREATE TABLE IF NOT EXISTS insights (
  id                  SERIAL PRIMARY KEY,
  insight_number      INT UNIQUE NOT NULL,
  content             TEXT NOT NULL,
  source_type         VARCHAR(50) NOT NULL, -- 'insight' or 'poem-line'
  source_poem_number  INT,
  source_poem_title   VARCHAR(255),
  page_number         INT,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
