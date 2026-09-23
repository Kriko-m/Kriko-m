-- ============================================================
--  Scouts Kriko-M — Webwinkel Telefoonnummer & Optioneel E-mail
--  Voer dit script uit in Supabase → SQL Editor → New query
-- ============================================================

-- 1. Voeg telefoonnummer kolom toe aan de orders tabel
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS phone TEXT NOT NULL DEFAULT '';

-- 2. Maak e-mail optioneel (mag leeg zijn indien men enkel telefoonnummer opgeeft)
ALTER TABLE orders 
ALTER COLUMN email DROP NOT NULL;

ALTER TABLE orders 
ALTER COLUMN email SET DEFAULT '';
