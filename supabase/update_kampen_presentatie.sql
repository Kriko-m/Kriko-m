-- ============================================================================
-- Kampen: presentatie-bijlagen + externe links (Google Slides)
-- ----------------------------------------------------------------------------
-- Draai dit bestand handmatig in de Supabase SQL Editor (db push doet dit niet).
--
-- 1. Voeg het bijlagetype 'presentatie' toe aan kamp_bestanden.type.
-- 2. Voeg een url-kolom toe zodat een bijlage óf een geüpload bestand
--    (file_name <> '') óf een externe link (url <> '', bv. Google Slides) is.
-- ============================================================================

-- 1. CHECK-constraint op type herdefiniëren (Postgres auto-naam:
--    kamp_bestanden_type_check).
ALTER TABLE kamp_bestanden DROP CONSTRAINT IF EXISTS kamp_bestanden_type_check;

ALTER TABLE kamp_bestanden
  ADD CONSTRAINT kamp_bestanden_type_check
  CHECK (type IN ('paklijst_pdf', 'uitnodiging', 'infobrief', 'presentatie', 'overige'));

-- 2. url-kolom voor link-bijlagen (leeg voor geüploade bestanden).
ALTER TABLE kamp_bestanden ADD COLUMN IF NOT EXISTS url TEXT NOT NULL DEFAULT '';

-- file_name mag leeg zijn voor link-bijlagen — zet NOT NULL met default ''
-- voor de zekerheid (geen wijziging als de kolom al zo staat).
ALTER TABLE kamp_bestanden ALTER COLUMN file_name SET DEFAULT '';
