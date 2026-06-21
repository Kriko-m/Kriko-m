-- ============================================================
--  Scouts Kriko-M — Twee-kalender systeem (Ouder + Leiding)
--  Voer dit script uit in Supabase → SQL Editor → New query
-- ============================================================
--
-- Eén onderliggende `calendar`-tabel met audience-tags. De zichtbaarheid is
-- volledig afgeleid van de tags: een event is PUBLIEK (oudercalender) als het de
-- tag 'ouders' draagt. Alle events verschijnen in de leidingcalender. Zo werkt
-- "voeg toe aan de ene → verschijnt in de andere" automatisch, zonder synclogica.
--
-- LET OP: bestaande kalender-rijen worden gewist (schone start, zoals afgesproken).


-- ── 1. Bestaande events wissen ──────────────────────────────
DELETE FROM calendar;


-- ── 2. Oude tak-kolom vervangen door audience-tags ──────────
ALTER TABLE calendar DROP COLUMN IF EXISTS tak;

ALTER TABLE calendar
  ADD COLUMN IF NOT EXISTS audience     TEXT[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_evenement BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS cover_image  TEXT    NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS document_url TEXT    NOT NULL DEFAULT '';

-- werkjaar-kolom kan al bestaan via update_werkjaar.sql; zorg dat ze er is.
ALTER TABLE calendar ADD COLUMN IF NOT EXISTS werkjaar TEXT NOT NULL DEFAULT '';

-- Enkel geldige audience-waarden toelaten (subset-check op de array).
ALTER TABLE calendar DROP CONSTRAINT IF EXISTS calendar_audience_valid;
ALTER TABLE calendar ADD CONSTRAINT calendar_audience_valid
  CHECK (audience <@ ARRAY['leiding','kapoenen','welpen','jonggivers','givers','ouders']::text[]);

-- GIN-index voor snelle "audience bevat tag"-filters (@> / = ANY).
CREATE INDEX IF NOT EXISTS calendar_audience_idx ON calendar USING GIN (audience);


-- ── 3. Row Level Security: anon mag enkel publieke (ouders) events lezen ──
-- De server-side API-routes gebruiken de service_role key en bypassen RLS;
-- deze policy is een extra verdedigingslaag voor directe anon-toegang.
DROP POLICY IF EXISTS "Publiek: kalender lezen" ON calendar;
CREATE POLICY "Publiek: kalender lezen" ON calendar
  FOR SELECT USING ('ouders' = ANY(audience));


-- ── 4. Geheime token voor de private leiding-ICS-feed ───────
-- Agenda-apps pollen de feed anoniem (geen login-cookie), dus beveiligen we ze
-- met een ongokbaar token in de URL: /api/leiding/ics?token=<token>.
ALTER TABLE settings ADD COLUMN IF NOT EXISTS leiding_ics_token TEXT NOT NULL DEFAULT '';

UPDATE settings
  SET leiding_ics_token = replace(gen_random_uuid()::text, '-', '')
  WHERE id = 1 AND (leiding_ics_token IS NULL OR leiding_ics_token = '');
