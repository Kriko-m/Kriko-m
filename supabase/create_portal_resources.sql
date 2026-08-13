-- ============================================================
--  Scouts Kriko-M — Portal Resources (Documenten & Links)
--  Voer dit script uit in Supabase → SQL Editor → New query
-- ============================================================

CREATE TABLE IF NOT EXISTS portal_resources (
  id          TEXT PRIMARY KEY DEFAULT 'res_' || gen_random_uuid(),
  type        TEXT NOT NULL CHECK (type IN ('quicklink', 'document')),
  category    TEXT NOT NULL DEFAULT 'Algemeen',
  label       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  url         TEXT NOT NULL DEFAULT '',
  icon        TEXT NOT NULL DEFAULT 'fa-solid fa-file',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Inschakelen
ALTER TABLE portal_resources ENABLE ROW LEVEL SECURITY;

-- Publieke leesrechten voor alle ingelogde rollen
CREATE POLICY "Leiding: portal_resources lezen" ON portal_resources FOR SELECT USING (true);

-- Initialiseer standaard snelkoppelingen (Quicklinks)
INSERT INTO portal_resources (id, type, category, label, description, url, icon, sort_order) VALUES
  ('res_q1', 'quicklink', 'Snelkoppelingen', 'Groepsadmin', 'Leden & leiding administratie', 'https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/client/', 'fa-solid fa-users-gear', 1),
  ('res_q2', 'quicklink', 'Snelkoppelingen', 'Google Drive', 'Gedeelde mappen & bestanden', 'https://drive.google.com', 'fa-brands fa-google-drive', 2),
  ('res_q3', 'quicklink', 'Snelkoppelingen', 'Facebook', 'Officiële Kriko-M pagina', 'https://www.facebook.com/ScoutsKrikoM', 'fa-brands fa-facebook', 3),
  ('res_q4', 'quicklink', 'Snelkoppelingen', 'Scouts & Gidsen VL', 'Spelaanbod & richtlijnen', 'https://www.scoutsengidsenvlaanderen.be', 'fa-solid fa-compass-drafting', 4)
ON CONFLICT (id) DO NOTHING;

-- Initialiseer standaard sjablonen & documenten
INSERT INTO portal_resources (id, type, category, label, description, url, icon, sort_order) VALUES
  ('res_d1', 'document', '🏕️ Kamp', 'Kampgids & Draaiboek', 'Handleiding & stappenplan om een vlekkeloos kamp te organiseren.', 'https://drive.google.com', 'fa-solid fa-tent', 10),
  ('res_d2', 'document', '🏕️ Kamp', 'Checklist Kamp', 'Overzicht van materialen, veiligheid, EHBO en transport.', 'https://drive.google.com', 'fa-solid fa-clipboard-check', 11),
  ('res_d3', 'document', '💶 Financieel', 'Financieel Sjabloon', 'Excel/Google Sheet sjabloon voor kasboeken en takbudgetten.', 'https://drive.google.com', 'fa-solid fa-calculator', 20),
  ('res_d4', 'document', '💶 Financieel', 'Afrekeningsfiche', 'Sjabloon voor het indienen van onkostennota''s en bewijsstukken.', 'https://drive.google.com', 'fa-solid fa-receipt', 21),
  ('res_d5', 'document', '🎲 Spel & Activiteiten', 'Spel Sjabloon', 'Standaard format voor het uitwerken van een spelvoorbereiding.', 'https://drive.google.com', 'fa-solid fa-file-pen', 30),
  ('res_d6', 'document', '🎲 Spel & Activiteiten', 'Checklist Spel', 'Checklist voor materiaal, regels, veiligheid en tijdsduur.', 'https://drive.google.com', 'fa-solid fa-list-check', 31),
  ('res_d7', 'document', '🎲 Spel & Activiteiten', 'Spelideeën Lijst', 'Lijst met originele spelideeën en bosspelen per leeftijd.', 'https://drive.google.com', 'fa-solid fa-lightbulb', 32),
  ('res_d8', 'document', '📑 Veiligheid & Formulieren', 'Medische Fiches', 'Standaard medische steunfiche van Scouts & Gidsen Vlaanderen.', 'https://www.scoutsengidsenvlaanderen.be', 'fa-solid fa-notes-medical', 40),
  ('res_d9', 'document', '📑 Veiligheid & Formulieren', 'Noodnummers & Reglement', 'Lijst met belangrijke contactpersonen en groepsafspraken.', 'https://drive.google.com', 'fa-solid fa-phone-volume', 41)
ON CONFLICT (id) DO NOTHING;
