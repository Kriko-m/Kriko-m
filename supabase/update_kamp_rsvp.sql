-- ============================================================
--  B1 — Tokenless camp RSVP (privélink + self-RSVP)
--  Voer dit script uit in Supabase → SQL Editor → New query.
--  Idempotent waar mogelijk.
-- ============================================================

-- 1. Privé-slug per kamp (lang, ongokbaar). Bestaande kampen krijgen
--    automatisch een slug via de DEFAULT; we backfillen voor de zekerheid.
ALTER TABLE kampen
  ADD COLUMN IF NOT EXISTS slug TEXT;

UPDATE kampen
  SET slug = replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
  WHERE slug IS NULL;

ALTER TABLE kampen
  ALTER COLUMN slug SET DEFAULT replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');

ALTER TABLE kampen
  ALTER COLUMN slug SET NOT NULL;

-- Unieke index op slug (idempotent).
CREATE UNIQUE INDEX IF NOT EXISTS kampen_slug_idx ON kampen(slug);


-- 2. RSVP-tabel. Self-declared antwoorden per kind+tak.
--    kind_naam_norm normaliseert (trim, witruimte samenvouwen, lowercase)
--    zodat "Jan", "jan " en "Jan  P." correct samenvallen bij heraanmelden.
CREATE TABLE IF NOT EXISTS kamp_rsvp (
  id              TEXT PRIMARY KEY DEFAULT 'rsvp_' || gen_random_uuid(),
  kamp_id         TEXT NOT NULL REFERENCES kampen(id) ON DELETE CASCADE,
  kind_naam       TEXT NOT NULL,
  kind_naam_norm  TEXT GENERATED ALWAYS AS (lower(btrim(regexp_replace(kind_naam, '\s+', ' ', 'g')))) STORED,
  tak             TEXT NOT NULL CHECK (tak IN ('kapoenen','welpen','jonggivers','givers')),
  status          TEXT NOT NULL CHECK (status IN ('ja','nee')),
  opmerking       TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Heraanmelden = upsert: laatste antwoord per (kamp, kind, tak) wint.
  UNIQUE (kamp_id, kind_naam_norm, tak)
);

CREATE INDEX IF NOT EXISTS kamp_rsvp_kamp_idx ON kamp_rsvp(kamp_id);


-- 3. RLS: kamp_rsvp wordt enkel via de service-role (server-side API) gelezen
--    en geschreven. Geen publieke policies → standaard dichtgetimmerd.
ALTER TABLE kamp_rsvp ENABLE ROW LEVEL SECURITY;

-- kampen is al publiek leesbaar (zie schema.sql) — nodig zodat de publieke
-- /kamp/[slug]-pagina het kamp via de slug kan ophalen.
