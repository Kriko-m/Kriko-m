-- ============================================================
--  Scouts Kriko-M — Webshop Kentekens & Instellingen Update
--  Voer dit script uit in Supabase → SQL Editor → New query
-- ============================================================

-- 1. Voeg webshop_email toe aan settings indien nog niet aanwezig
ALTER TABLE settings ADD COLUMN IF NOT EXISTS webshop_email TEXT NOT NULL DEFAULT 'vicverhaegen4@gmail.com';

-- Update bestaande rij naar de test e-mail als deze nog leeg was
UPDATE settings SET webshop_email = 'vicverhaegen4@gmail.com' WHERE id = 1 AND (webshop_email = '' OR webshop_email IS NULL);

-- 2. Herinrichten van de producten in shop_products
-- Eerst bestaande test/demoproducten verwijderen voor schone staat
DELETE FROM shop_products;

-- 3. Invoegen van de 3 hoofdproducten
INSERT INTO shop_products (id, name, price, description, sizes, image, category, active, sort_order) VALUES
  ('item_tshirt', 'Kriko-M T-Shirt (Bordeaux)', 12.00,
   'Het officiële Kriko-M scouts t-shirt van stevig bordeaux katoen met opgedrukt logo.',
   ARRAY['6 jaar','8 jaar','10 jaar','12 jaar','XS','S','M','L','XL','XXL'],
   '/images/shop/tshirt.jpg', 'kledij', true, 1),

  ('item_trui', 'Kriko-M Trui (Warme Hoodie)', 28.00,
   'Onze heerlijke, warme bordeaux scouts trui/hoodie met capuchon, buidelzak en borstlogo.',
   ARRAY['8 jaar','10 jaar','12 jaar','XS','S','M','L','XL','XXL'],
   '/images/shop/hoodie.jpg', 'kledij', true, 2),

  ('item_das', 'Kriko-M Groepsdas', 10.00,
   'De officiële tweekleurige groepsdas van Scouts Kriko-M (bordeaux met beige rand).',
   ARRAY['Eén maat'],
   '/images/shop/das.jpg', 'uniform', true, 3);

-- 4. Invoegen van de 12 Kentekens (Collectie Kentekens)
INSERT INTO shop_products (id, name, price, description, sizes, image, category, active, sort_order) VALUES
  ('kent_1', 'Jaarkenteken Scouts & Gidsen Vlaanderen', 2.00, 'Het officiële jaarkenteken van het huidige scoutsjaar.', ARRAY['Standaard'], '/images/shop/kenteken.jpg', 'kentekens', true, 10),
  ('kent_2', 'Kriko-M Groepsschild', 2.00, 'Het geborduurde Kriko-M groepsschild voor op de rechtermouw.', ARRAY['Standaard'], '/images/shop/kenteken.jpg', 'kentekens', true, 11),
  ('kent_3', 'Takkenteken Kapoenen', 1.50, 'Het officiële takkenteken voor de Kapoenen.', ARRAY['Standaard'], '/images/shop/kenteken.jpg', 'kentekens', true, 12),
  ('kent_4', 'Takkenteken Welpen', 1.50, 'Het officiële takkenteken voor de Welpen.', ARRAY['Standaard'], '/images/shop/kenteken.jpg', 'kentekens', true, 13),
  ('kent_5', 'Takkenteken Jonggivers', 1.50, 'Het officiële takkenteken voor de Jonggivers.', ARRAY['Standaard'], '/images/shop/kenteken.jpg', 'kentekens', true, 14),
  ('kent_6', 'Takkenteken Givers', 1.50, 'Het officiële takkenteken voor de Givers.', ARRAY['Standaard'], '/images/shop/kenteken.jpg', 'kentekens', true, 15),
  ('kent_7', 'Beloftekenteken (Scoutsbelofte)', 2.00, 'Gekregen/vervanging bij het afleggen van de scoutsbelofte.', ARRAY['Standaard'], '/images/shop/kenteken.jpg', 'kentekens', true, 16),
  ('kent_8', 'Vlaamse Leeuw Kenteken', 1.50, 'Kenteken van de Vlaamse Leeuw voor de linkermouw.', ARRAY['Standaard'], '/images/shop/kenteken.jpg', 'kentekens', true, 17),
  ('kent_9', 'Internationaal Kenteken WOSM', 2.00, 'Wereldteken WOSM (paars met lelie) voor de linkerborst.', ARRAY['Standaard'], '/images/shop/kenteken.jpg', 'kentekens', true, 18),
  ('kent_10', 'Internationaal Kenteken WAGGGS', 2.00, 'Wereldteken WAGGGS (blauw met klaver) voor de linkerborst.', ARRAY['Standaard'], '/images/shop/kenteken.jpg', 'kentekens', true, 19),
  ('kent_11', 'Districtskenteken Land van Waas', 1.50, 'Geborduurd districtskenteken Land van Waas.', ARRAY['Standaard'], '/images/shop/kenteken.jpg', 'kentekens', true, 20),
  ('kent_12', 'Groepsembleem Lindeworm', 2.00, 'Extra geborduurd Kriko-M groepsembleem.', ARRAY['Standaard'], '/images/shop/kenteken.jpg', 'kentekens', true, 21);
