-- ============================================================
--  Scouts Kriko-M — Update: rijke velden voor (groeps)evenementen
--  Voer dit script uit in Supabase → SQL Editor → New query
-- ============================================================
--
-- Publieke groepsevenementen (audience bevat 'groep' + is_evenement) krijgen
-- extra visuele velden zodat ze op de publieke kalender uitgebreid getoond
-- kunnen worden. cover_image (hero-foto) en document_url (uitnodiging) bestaan al.
-- Idempotent: veilig om meermaals te draaien.

ALTER TABLE calendar
  ADD COLUMN IF NOT EXISTS banner_image TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS header       TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS body         TEXT NOT NULL DEFAULT '';
