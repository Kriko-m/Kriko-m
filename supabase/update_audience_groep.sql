-- ============================================================
--  Scouts Kriko-M — Update: audience-tag 'ouders' → 'groep'
--  Voer dit script uit in Supabase → SQL Editor → New query
-- ============================================================
--
-- De publieke kalender-tag heette intern 'ouders' (label "Groep"). We hernoemen
-- de interne waarde naar 'groep' zodat ze overeenkomt met het label. 'groep' is
-- en blijft de enige tag die een activiteit publiek op de website-kalender zet.
--
-- Idempotent: veilig om meermaals te draaien.
--
-- BELANGRIJK: eerst de oude CHECK droppen, anders blokkeert die (laat enkel
-- 'ouders' toe, niet 'groep') de UPDATE hieronder.


-- ── 1. Oude audience-CHECK droppen ─────────────────────────
ALTER TABLE calendar DROP CONSTRAINT IF EXISTS calendar_audience_valid;


-- ── 2. Bestaande data migreren: 'ouders' → 'groep' in audience-arrays ──
UPDATE calendar
SET audience = array_replace(audience, 'ouders', 'groep')
WHERE 'ouders' = ANY(audience);


-- ── 3. Nieuwe audience-CHECK met 'groep' i.p.v. 'ouders' ──
ALTER TABLE calendar ADD CONSTRAINT calendar_audience_valid
  CHECK (audience <@ ARRAY['leiding','kapoenen','welpen','jonggivers','givers','groep']::text[]);


-- ── 4. RLS-policy: publiek mag enkel 'groep'-events lezen ──
DROP POLICY IF EXISTS "Publiek: kalender lezen" ON calendar;
CREATE POLICY "Publiek: kalender lezen" ON calendar
  FOR SELECT USING ('groep' = ANY(audience));
