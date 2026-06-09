-- ============================================================
--  Scouts Kriko-M — Supabase Database Schema
--  Voer dit script uit in Supabase → SQL Editor → New query
-- ============================================================


-- ── 1. SITE-INSTELLINGEN ────────────────────────────────────
-- Eén rij met alle configuratie van de site.

CREATE TABLE settings (
  id              INTEGER PRIMARY KEY DEFAULT 1,
  scouts_year     TEXT    NOT NULL DEFAULT '2026-2027',
  bank_iban       TEXT    NOT NULL DEFAULT '',
  bank_bic        TEXT    NOT NULL DEFAULT '',
  bank_holder     TEXT    NOT NULL DEFAULT '',
  contact_email   TEXT    NOT NULL DEFAULT '',
  contact_phone   TEXT    NOT NULL DEFAULT '',
  contact_address TEXT    NOT NULL DEFAULT '',
  alert_message   TEXT    NOT NULL DEFAULT '',
  alert_active    BOOLEAN NOT NULL DEFAULT false,
  reg_fee_first   NUMERIC(8,2) NOT NULL DEFAULT 50.00,
  reg_fee_extra   NUMERIC(8,2) NOT NULL DEFAULT 45.00,
  -- Takken-configuratie als JSON (naam, leeftijd, leiding, activiteiten, ...)
  takken          JSONB   NOT NULL DEFAULT '{}',
  CONSTRAINT settings_single_row CHECK (id = 1)
);

-- Vul de standaardwaarden in
INSERT INTO settings (id, scouts_year, bank_iban, bank_bic, bank_holder,
  contact_email, contact_phone, contact_address,
  alert_message, alert_active, reg_fee_first, reg_fee_extra, takken)
VALUES (1,
  '2026-2027',
  'BE76 1234 5678 9012', 'KRIKOBE2B', 'Scouts Kriko-M vzw',
  'groepsleiding@kriko-m.be', '+32 3 776 00 00', 'Industriepark-Noord 33, 9100 Sint-Niklaas',
  'Welkom op de nieuwe website van Scouts Kriko-M!', true,
  50.00, 45.00,
  '{
    "kapoenen":   {"name":"Kapoenen",   "age_range":"6 - 8 jaar",   "school_year":"1e & 2e leerjaar",              "email":"kapoenenleiding@kriko-m.be",   "class":"kapoenen"},
    "welpen":     {"name":"Welpen",     "age_range":"8 - 11 jaar",  "school_year":"3e, 4e & 5e leerjaar",         "email":"welpenleiding@kriko-m.be",     "class":"welpen"},
    "jonggivers": {"name":"Jonggivers", "age_range":"11 - 14 jaar", "school_year":"6e leerjaar, 1e & 2e middelbaar","email":"jonggiverleiding@kriko-m.be", "class":"jonggivers"},
    "givers":     {"name":"Givers",     "age_range":"14 - 17 jaar", "school_year":"3e, 4e & 5e middelbaar",       "email":"giverleiding@kriko-m.be",      "class":"givers"}
  }'::jsonb
);


-- ── 2. KALENDER ─────────────────────────────────────────────

CREATE TABLE calendar (
  id          TEXT    PRIMARY KEY DEFAULT 'cal_' || gen_random_uuid(),
  title       TEXT    NOT NULL,
  date        DATE    NOT NULL,
  time        TEXT    NOT NULL DEFAULT '',
  location    TEXT    NOT NULL DEFAULT '',
  description TEXT    NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO calendar (id, title, date, time, location, description) VALUES
  ('cal_1', 'Startdag Scoutsjaar',    '2026-09-06', '14:00 - 17:00', 'Scoutslokalen, Industriepark-Noord', 'De allereerste scoutsvergadering van het nieuwe jaar!'),
  ('cal_2', 'Kriko Dia-avond',        '2026-10-17', '19:00 - 22:30', 'Parochiecentrum Sint-Niklaas',        'Gezellige dia-avond met de leukste foto''s van de zomerkampen.'),
  ('cal_3', 'Jaarlijkse BBQ & Eetdag','2026-11-15', '11:30 - 19:30', 'Grote Speelzaal College',             'Kom smullen op onze heerlijke jaarlijkse eetdag.');


-- ── 3. KRIKO ECHO''S (nieuwsbrieven) ────────────────────────

CREATE TABLE echos (
  id          TEXT    PRIMARY KEY DEFAULT 'echo_' || gen_random_uuid(),
  title       TEXT    NOT NULL,
  month       SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year        SMALLINT NOT NULL,
  tak         TEXT    NOT NULL CHECK (tak IN ('kapoenen','welpen','jonggivers','givers')),
  file_name   TEXT    NOT NULL,
  approved    BOOLEAN NOT NULL DEFAULT false,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ── 4. WEBSHOP PRODUCTEN ────────────────────────────────────

CREATE TABLE shop_products (
  id          TEXT    PRIMARY KEY DEFAULT 'item_' || gen_random_uuid(),
  name        TEXT    NOT NULL,
  price       NUMERIC(8,2) NOT NULL,
  description TEXT    NOT NULL DEFAULT '',
  sizes       TEXT[]  NOT NULL DEFAULT '{}',
  image       TEXT    NOT NULL DEFAULT '',
  category    TEXT    NOT NULL DEFAULT 'kledij',
  active      BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

INSERT INTO shop_products (id, name, price, description, sizes, image, category, active, sort_order) VALUES
  ('item_1', 'Kriko-M T-shirt (Bordeaux)', 12.00,
   'Het officiële Kriko-M scouts t-shirt van stevig bordeaux katoen.',
   ARRAY['6 jaar','8 jaar','10 jaar','12 jaar','XS','S','M','L','XL'],
   '/images/shop/tshirt.jpg', 'kledij', true, 1),
  ('item_2', 'Kriko-M Trui (Comfortabele Hoodie)', 28.00,
   'Onze heerlijke, warme bordeaux scouts hoodie met capuchon en buidelzak.',
   ARRAY['8 jaar','10 jaar','12 jaar','XS','S','M','L','XL','XXL'],
   '/images/shop/hoodie.jpg', 'kledij', true, 2),
  ('item_3', 'Kriko-M Groepsdas', 10.00,
   'De officiële tweekleurige groepsdas van Kriko-M (bordeaux met beige boordje).',
   ARRAY['Eén maat'],
   '/images/shop/das.jpg', 'uniform', true, 3),
  ('item_4', 'Kriko Jaarkenteken', 2.00,
   'Het nieuwste jaarkenteken van Scouts en Gidsen Vlaanderen.',
   ARRAY['Standaard'],
   '/images/shop/kenteken.jpg', 'accessoires', true, 4);


-- ── 5. BESTELLINGEN ─────────────────────────────────────────

CREATE SEQUENCE order_number_seq START 1;

CREATE TABLE orders (
  id              TEXT    PRIMARY KEY DEFAULT 'ord_' || gen_random_uuid(),
  order_number    INTEGER NOT NULL UNIQUE DEFAULT nextval('order_number_seq'),
  order_ref       TEXT    GENERATED ALWAYS AS ('WEB-' || LPAD(order_number::text, 4, '0')) STORED,
  status          TEXT    NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','waiting_approval','paid','completed','cancelled')),
  customer_name   TEXT    NOT NULL,
  child_name      TEXT    NOT NULL DEFAULT '',
  child_tak       TEXT    NOT NULL DEFAULT '',
  email           TEXT    NOT NULL,
  items           JSONB   NOT NULL DEFAULT '[]',
  total           NUMERIC(10,2) NOT NULL DEFAULT 0,
  communication   TEXT    NOT NULL DEFAULT '',
  parent_id       UUID    REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX orders_status_idx    ON orders(status);
CREATE INDEX orders_email_idx     ON orders(email);
CREATE INDEX orders_parent_id_idx ON orders(parent_id);


-- ── 6. KAMPEN ───────────────────────────────────────────────

CREATE TABLE kampen (
  id                    TEXT    PRIMARY KEY DEFAULT 'kamp_' || gen_random_uuid(),
  naam                  TEXT    NOT NULL,
  tak                   TEXT    NOT NULL CHECK (tak IN ('kapoenen','welpen','jonggivers','givers','alle')),
  datum_van             DATE    NOT NULL,
  datum_tot             DATE    NOT NULL,
  locatie               TEXT    NOT NULL DEFAULT '',
  beschrijving          TEXT    NOT NULL DEFAULT '',
  open_voor_inschrijving BOOLEAN NOT NULL DEFAULT false,
  prijs                 NUMERIC(8,2) NOT NULL DEFAULT 0,
  foto                  TEXT    NOT NULL DEFAULT '',
  -- Paklijst als JSON: [{ categorie: string, items: string[] }]
  paklijst              JSONB   NOT NULL DEFAULT '[]',
  aangemaakt_op         TIMESTAMPTZ NOT NULL DEFAULT now(),
  aangemaakt_door       TEXT    NOT NULL DEFAULT ''
);

CREATE INDEX kampen_tak_idx  ON kampen(tak);
CREATE INDEX kampen_date_idx ON kampen(datum_van);


-- ── 7. KAMP BESTANDEN ───────────────────────────────────────

CREATE TABLE kamp_bestanden (
  id          TEXT    PRIMARY KEY DEFAULT 'best_' || gen_random_uuid(),
  kamp_id     TEXT    NOT NULL REFERENCES kampen(id) ON DELETE CASCADE,
  type        TEXT    NOT NULL CHECK (type IN ('paklijst_pdf','uitnodiging','infobrief','overige')),
  naam        TEXT    NOT NULL,
  file_name   TEXT    NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX kamp_bestanden_kamp_idx ON kamp_bestanden(kamp_id);


-- ── 8. KAMPINSCHRIJVINGEN ───────────────────────────────────
-- Privacyprincipe: enkel ga_id opslaan, nooit naam/geboortedatum/medische info.
-- Die worden live opgehaald uit de S&G Groepsadmin API.

CREATE TABLE kampinschrijvingen (
  id               TEXT    PRIMARY KEY DEFAULT 'ins_' || gen_random_uuid(),
  kamp_id          TEXT    NOT NULL REFERENCES kampen(id) ON DELETE CASCADE,
  ga_id            TEXT    NOT NULL,
  opmerking        TEXT    NOT NULL DEFAULT '',
  ingeschreven_op  TIMESTAMPTZ NOT NULL DEFAULT now(),
  door             TEXT    NOT NULL DEFAULT '',
  UNIQUE (kamp_id, ga_id)
);

CREATE INDEX inschrijvingen_kamp_idx  ON kampinschrijvingen(kamp_id);
CREATE INDEX inschrijvingen_ga_idx    ON kampinschrijvingen(ga_id);


-- ── 9. OUDER-PROFIELEN ──────────────────────────────────────
-- Uitbreiding op Supabase Auth (auth.users).

CREATE TABLE ouder_profiles (
  id         UUID    PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  naam       TEXT    NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ── 10. GEKOPPELDE KINDEREN ─────────────────────────────────
-- Koppelt een ouder-account aan S&G-leden (ga_id).

CREATE TABLE parent_children (
  id         TEXT    PRIMARY KEY DEFAULT gen_random_uuid()::text,
  parent_id  UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ga_id      TEXT    NOT NULL,
  voornaam   TEXT    NOT NULL DEFAULT '',
  tak        TEXT    NOT NULL DEFAULT '',
  added_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (parent_id, ga_id)
);

CREATE INDEX parent_children_parent_idx ON parent_children(parent_id);
CREATE INDEX parent_children_ga_idx     ON parent_children(ga_id);


-- ── 11. CONTACTBERICHTEN ────────────────────────────────────

CREATE TABLE messages (
  id         TEXT    PRIMARY KEY DEFAULT 'msg_' || gen_random_uuid(),
  name       TEXT    NOT NULL,
  email      TEXT    NOT NULL,
  subject    TEXT    NOT NULL DEFAULT '',
  message    TEXT    NOT NULL,
  read       BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ── 12. VERSLAGEN ───────────────────────────────────────────

CREATE TABLE verslagen (
  id          TEXT    PRIMARY KEY DEFAULT 'vers_' || gen_random_uuid(),
  title       TEXT    NOT NULL,
  tak         TEXT    NOT NULL CHECK (tak IN ('kapoenen','welpen','jonggivers','givers','alle')),
  date        DATE    NOT NULL,
  content     TEXT    NOT NULL DEFAULT '',
  author      TEXT    NOT NULL DEFAULT '',
  published   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
--  ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE settings           ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar           ENABLE ROW LEVEL SECURITY;
ALTER TABLE echos              ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_products      ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders             ENABLE ROW LEVEL SECURITY;
ALTER TABLE kampen             ENABLE ROW LEVEL SECURITY;
ALTER TABLE kamp_bestanden     ENABLE ROW LEVEL SECURITY;
ALTER TABLE kampinschrijvingen ENABLE ROW LEVEL SECURITY;
ALTER TABLE ouder_profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_children    ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages           ENABLE ROW LEVEL SECURITY;
ALTER TABLE verslagen          ENABLE ROW LEVEL SECURITY;

-- Publiek leesbaar (anon mag lezen)
CREATE POLICY "Publiek: settings lezen"      ON settings      FOR SELECT USING (true);
CREATE POLICY "Publiek: kalender lezen"      ON calendar      FOR SELECT USING (true);
CREATE POLICY "Publiek: echos lezen"         ON echos         FOR SELECT USING (approved = true);
CREATE POLICY "Publiek: shop lezen"          ON shop_products FOR SELECT USING (active = true);
CREATE POLICY "Publiek: kampen lezen"        ON kampen        FOR SELECT USING (true);
CREATE POLICY "Publiek: kamp bestanden"      ON kamp_bestanden FOR SELECT USING (true);

-- Ouders: eigen data
CREATE POLICY "Ouder: eigen profiel lezen"   ON ouder_profiles   FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Ouder: eigen profiel schrijven" ON ouder_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Ouder: eigen profiel updaten" ON ouder_profiles   FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Ouder: eigen kinderen lezen"  ON parent_children  FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY "Ouder: kind toevoegen"        ON parent_children  FOR INSERT WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "Ouder: kind verwijderen"      ON parent_children  FOR DELETE USING (auth.uid() = parent_id);

CREATE POLICY "Ouder: eigen bestellingen"    ON orders           FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "Ouder: eigen inschrijvingen"  ON kampinschrijvingen FOR SELECT
  USING (door = auth.uid()::text OR EXISTS (
    SELECT 1 FROM parent_children pc
    WHERE pc.parent_id = auth.uid() AND pc.ga_id = kampinschrijvingen.ga_id
  ));

CREATE POLICY "Ouder: inschrijving toevoegen" ON kampinschrijvingen FOR INSERT
  WITH CHECK (
    door = auth.uid()::text AND EXISTS (
      SELECT 1 FROM parent_children pc
      WHERE pc.parent_id = auth.uid() AND pc.ga_id = kampinschrijvingen.ga_id
    )
  );

CREATE POLICY "Ouder: inschrijving verwijderen" ON kampinschrijvingen FOR DELETE
  USING (
    door = auth.uid()::text OR EXISTS (
      SELECT 1 FROM parent_children pc
      WHERE pc.parent_id = auth.uid() AND pc.ga_id = kampinschrijvingen.ga_id
    )
  );

-- Contactberichten: iedereen mag schrijven (anoniem contactformulier)
CREATE POLICY "Iedereen mag contact sturen"  ON messages FOR INSERT WITH CHECK (true);

-- Alles wat hierboven niet gedekt is, verloopt via de service_role key
-- (server-side API routes) — die bypassen RLS automatisch.
