-- ============================================================
--  B4 — Werkjaar-archief + rollover
--  Voer dit uit in Supabase → SQL Editor.
--  Het actieve werkjaar = settings.scouts_year (bestaat al).
-- ============================================================

-- 1. werkjaar-kolom op jaargebonden records. Backfill bestaande rijen met
--    het huidige actieve werkjaar.
ALTER TABLE kampen    ADD COLUMN IF NOT EXISTS werkjaar TEXT NOT NULL DEFAULT '';
ALTER TABLE echos     ADD COLUMN IF NOT EXISTS werkjaar TEXT NOT NULL DEFAULT '';
ALTER TABLE calendar  ADD COLUMN IF NOT EXISTS werkjaar TEXT NOT NULL DEFAULT '';
ALTER TABLE kamp_rsvp ADD COLUMN IF NOT EXISTS werkjaar TEXT NOT NULL DEFAULT '';

UPDATE kampen    SET werkjaar = (SELECT scouts_year FROM settings WHERE id = 1) WHERE werkjaar = '';
UPDATE echos     SET werkjaar = (SELECT scouts_year FROM settings WHERE id = 1) WHERE werkjaar = '';
UPDATE calendar  SET werkjaar = (SELECT scouts_year FROM settings WHERE id = 1) WHERE werkjaar = '';
UPDATE kamp_rsvp SET werkjaar = (SELECT scouts_year FROM settings WHERE id = 1) WHERE werkjaar = '';

CREATE INDEX IF NOT EXISTS kampen_werkjaar_idx   ON kampen(werkjaar);
CREATE INDEX IF NOT EXISTS echos_werkjaar_idx    ON echos(werkjaar);
CREATE INDEX IF NOT EXISTS calendar_werkjaar_idx ON calendar(werkjaar);
CREATE INDEX IF NOT EXISTS kamp_rsvp_werkjaar_idx ON kamp_rsvp(werkjaar);

-- 2. Wie had welke tak in welk werkjaar (historisch, los van settings.takken
--    dat enkel het huidige jaar bevat). Gevuld bij het publiceren van een
--    nieuw werkjaar (snapshot van het aflopende jaar).
CREATE TABLE IF NOT EXISTS werkjaar_leiding (
  id        TEXT PRIMARY KEY DEFAULT 'wjl_' || gen_random_uuid(),
  werkjaar  TEXT NOT NULL,
  tak       TEXT NOT NULL CHECK (tak IN ('kapoenen','welpen','jonggivers','givers')),
  naam      TEXT NOT NULL,
  rol       TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS werkjaar_leiding_idx ON werkjaar_leiding(werkjaar);

ALTER TABLE werkjaar_leiding ENABLE ROW LEVEL SECURITY;
-- Enkel via service role (leiding-only API).

-- 3. Concept (draft) van het volgende werkjaar: naam + leiding→tak.
--    Niets gaat live tot er expliciet gepubliceerd wordt.
ALTER TABLE settings ADD COLUMN IF NOT EXISTS concept JSONB NOT NULL DEFAULT '{}'::jsonb;
