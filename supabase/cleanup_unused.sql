-- ============================================================
--  Scouts Kriko-M — Opruimen van ongebruikte database-objecten
--  Voer dit script uit in Supabase → SQL Editor → New query
-- ============================================================
--
-- Restanten van twee verlaten richtingen (zie CLAUDE.md / IMPLEMENTATION.md):
--   • ouderaccounts  → het portaal is leiding-only, ouders loggen niet in
--   • S&G-API integratie → fiches blijven in Groepsadmin, nooit hier opgeslagen
--
-- Geen enkele van deze objecten wordt nog in de code gebruikt. De webshop blijft
-- bestaan maar werkt accountloos, dus orders.parent_id (koppeling naar een
-- ouderaccount) vervalt.


-- ── 1. Ouderaccount-tabellen (0 code-referenties) ───────────
DROP TABLE IF EXISTS parent_children CASCADE;
DROP TABLE IF EXISTS ouder_profiles  CASCADE;


-- ── 2. Oude S&G-gebaseerde kampinschrijvingen ───────────────
-- Vervangen door kamp_rsvp (tokenloze, accountloze RSVP per kind/tak).
DROP TABLE IF EXISTS kampinschrijvingen CASCADE;


-- ── 3. orders.parent_id: koppeling naar ouderaccount ────────
DROP POLICY IF EXISTS "Ouder: eigen bestellingen" ON orders;
DROP INDEX  IF EXISTS orders_parent_id_idx;
ALTER TABLE orders DROP COLUMN IF EXISTS parent_id;
