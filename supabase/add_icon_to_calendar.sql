-- ── SUPABASE MIGRATIE: ICON KOLOM TOEVOEGEN AAN CALENDAR ───────────────────────
-- Run dit SQL-script in Supabase → SQL Editor om de `icon` kolom toe te voegen.

ALTER TABLE calendar ADD COLUMN IF NOT EXISTS icon TEXT;
