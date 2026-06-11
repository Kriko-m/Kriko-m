-- ============================================================
--  S3 — Opruimen na het verwijderen van ouderaccounts + S&G
--  Voer dit uit in Supabase → SQL Editor NA update_kamp_rsvp.sql,
--  en pas wanneer de nieuwe flows (RSVP + accountloze webshop) live zijn.
--  LET OP: dit verwijdert tabellen onomkeerbaar. Maak desgewenst eerst
--  een export/back-up van kampinschrijvingen.
-- ============================================================

-- 1. Ouder-gerelateerde tabellen vervallen (geen accounts meer).
--    CASCADE verwijdert meteen hun RLS-policies en indexen.
DROP TABLE IF EXISTS parent_children    CASCADE;
DROP TABLE IF EXISTS ouder_profiles     CASCADE;

-- 2. Account-gebaseerde kampinschrijvingen zijn vervangen door kamp_rsvp.
DROP TABLE IF EXISTS kampinschrijvingen CASCADE;

-- 3. orders.parent_id koppelde een bestelling aan een ouder-account; nu altijd
--    NULL. De bijhorende RLS-policy en kolom mogen weg. Bestellingen worden
--    enkel server-side (service role) gelezen door de leiding.
DROP POLICY IF EXISTS "Ouder: eigen bestellingen" ON orders;
DROP INDEX IF EXISTS orders_parent_id_idx;
ALTER TABLE orders DROP COLUMN IF EXISTS parent_id;

-- RLS blijft aan op orders: geen publieke policy → enkel service role leest/schrijft.
