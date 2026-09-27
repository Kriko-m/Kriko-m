-- ============================================================
-- Scouts Kriko-M — Webshop / Uniformverantwoordelijke Telefoonnummer
-- Voer dit script uit in Supabase → SQL Editor → New query
-- ============================================================

-- Voeg het telefoonnummer van de webshop / uniformverantwoordelijke toe aan de settings tabel
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS webshop_phone TEXT NOT NULL DEFAULT '';
