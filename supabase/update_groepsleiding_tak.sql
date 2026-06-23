-- ============================================================
--  Scouts Kriko-M — Update: tak 'groepsleiding' (todos)
--  Voer dit script uit in Supabase → SQL Editor → New query
-- ============================================================
--
-- Een nieuwe 5e portaal-tak 'groepsleiding' (enkel zichtbaar voor rol
-- groepsleiding). De overkoepelende to-do's die vroeger onder de pseudo-tak
-- 'groep' vielen, verhuizen naar 'groepsleiding'. "Evenementen" is GEEN tak —
-- dat is een kalender-tag (zie update_audience_groep.sql).
--
-- Idempotent: veilig om meermaals te draaien.


-- ── 1. todos.tak: data migreren + CHECK herzetten ───────────
UPDATE todos SET tak = 'groepsleiding' WHERE tak = 'groep';

ALTER TABLE todos DROP CONSTRAINT IF EXISTS todos_tak_check;
ALTER TABLE todos ADD CONSTRAINT todos_tak_check
  CHECK (tak IN ('kapoenen','welpen','jonggivers','givers','groepsleiding'));


-- ── 2. settings.portal_backgrounds: 'groep'-key hernoemen ───
-- JSONB-key 'groep' → 'groepsleiding' (indien aanwezig), behoud de rest.
UPDATE settings
SET portal_backgrounds =
  (portal_backgrounds - 'groep')
  || COALESCE(jsonb_build_object('groepsleiding', portal_backgrounds -> 'groep'), '{}'::jsonb)
WHERE id = 1 AND portal_backgrounds ? 'groep';
