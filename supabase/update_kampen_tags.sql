-- ============================================================
--  Scouts Kriko-M — Update: kampen krijgen tags (audience) i.p.v. één tak
--  Voer dit script uit in Supabase → SQL Editor → New query
-- ============================================================
--
-- Een kamp/weekend kan nu meerdere tags dragen (zelfde vocab als de kalender):
-- leiding/kapoenen/welpen/jonggivers/givers/groep. Een groepskamp = de 4 takken;
-- een leiding-weekend = enkel 'leiding'. Kampen verschijnen nooit publiek, dus
-- 'groep' op een kamp = enkel intern "hele groep".
--
-- Idempotent: veilig om meermaals te draaien.


-- ── 1. Nieuwe audience-kolom ────────────────────────────────
ALTER TABLE kampen ADD COLUMN IF NOT EXISTS audience TEXT[] NOT NULL DEFAULT '{}';


-- ── 2. Bestaande tak → audience migreren (enkel als tak nog bestaat) ──
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'kampen' AND column_name = 'tak'
  ) THEN
    -- 'alle' → de 4 takken; anders de tak zelf als enige tag.
    UPDATE kampen SET audience = ARRAY['kapoenen','welpen','jonggivers','givers']
      WHERE tak = 'alle' AND audience = '{}';
    UPDATE kampen SET audience = ARRAY[tak]
      WHERE tak <> 'alle' AND audience = '{}';
  END IF;
END $$;


-- ── 3. CHECK op geldige tags ────────────────────────────────
ALTER TABLE kampen DROP CONSTRAINT IF EXISTS kampen_audience_valid;
ALTER TABLE kampen ADD CONSTRAINT kampen_audience_valid
  CHECK (audience <@ ARRAY['leiding','kapoenen','welpen','jonggivers','givers','groep']::text[]);


-- ── 4. GIN-index voor "audience bevat tag"-filters ──────────
CREATE INDEX IF NOT EXISTS kampen_audience_idx ON kampen USING GIN (audience);


-- ── 5. Oude tak-kolom + index verwijderen ───────────────────
DROP INDEX IF EXISTS kampen_tak_idx;
ALTER TABLE kampen DROP COLUMN IF EXISTS tak;
