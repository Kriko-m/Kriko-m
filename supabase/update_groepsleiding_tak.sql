-- ============================================================
--  Scouts Kriko-M — Update: tak 'groep' → 'evenementen' + tak 'groepsleiding'
--  Voer dit script uit in Supabase → SQL Editor → New query
-- ============================================================
--
-- 1. De interne tak-sleutel 'groep' wordt hernoemd naar 'evenementen'
--    (overkoepelende/publieke acties; enkel bewerkbaar door rol groepsleiding).
-- 2. Een nieuwe 5e tak 'groepsleiding' wordt toegevoegd (enkel zichtbaar voor
--    rol groepsleiding).
--
-- Idempotent: veilig om meermaals te draaien.


-- ── 1. todos.tak: data migreren + CHECK herzetten ───────────
UPDATE todos SET tak = 'evenementen' WHERE tak = 'groep';

ALTER TABLE todos DROP CONSTRAINT IF EXISTS todos_tak_check;
ALTER TABLE todos ADD CONSTRAINT todos_tak_check
  CHECK (tak IN ('evenementen','kapoenen','welpen','jonggivers','givers','groepsleiding'));


-- ── 2. settings.portal_backgrounds: 'groep'-key hernoemen ───
-- JSONB-key 'groep' → 'evenementen' (indien aanwezig), behoud de rest.
UPDATE settings
SET portal_backgrounds =
  (portal_backgrounds - 'groep')
  || COALESCE(jsonb_build_object('evenementen', portal_backgrounds -> 'groep'), '{}'::jsonb)
WHERE id = 1 AND portal_backgrounds ? 'groep';
