-- ============================================================
--  Scouts Kriko-M — Supabase SQL Query voor Kalender & Banners
--  Voer dit uit in Supabase → SQL Editor → New query (optioneel)
-- ============================================================

-- 1. Kolommen toevoegen (indien nog niet aanwezig)
ALTER TABLE calendar
  ADD COLUMN IF NOT EXISTS datum_tot          TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS banner_image       TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS facebook_event_url TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS facebook_post_url  TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS external_link_url  TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS document_url       TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS icon               TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_evenement       BOOLEAN NOT NULL DEFAULT false;

-- 2. Bestaande evenementen updaten met alle afbeeldingen & info
UPDATE calendar 
SET 
  title = 'Overgang & Feestelijke Start',
  banner_image = 'https://www.kriko-m.be/wp-content/uploads/2025/06/GROEPSUITSTAP-2025-724x1024.png',
  description = 'De traditionele overgang naar de nieuwe takken om het werkjaar feestelijk te starten! We verwelkomen alle leden in hun nieuwe tak met een spectaculair overgangsspel en een gezellig samenzijn.',
  time = '14:00 - 17:30',
  location = 'Scoutslokalen Kriko-M, VP-Plein',
  is_evenement = true
WHERE id = 'cal_f9827fef-e398-49e3-bb5c-cf8697e9f72d' OR title LIKE '%Overgang%';

UPDATE calendar 
SET 
  title = 'Groeps BBQ & KUBB-Toernooi',
  banner_image = 'https://www.kriko-m.be/wp-content/uploads/2025/08/528193945_1109483500529325_5681295269648299945_n-1024x403.jpg',
  description = 'Kriko-M organiseert weer zijn jaarlijkse BBQ en we hebben jou daar heel graag bij! Om 16u start het KUBB-toernooi (spelplezier voor jong en oud) en het speeldorp van de givers. Om 18u start de BBQ met aansluitend een gezellig kampvuur, leidingsactjes en feest met DJ Benny!',
  time = '16:00 - 23:30',
  location = 'Scoutslokalen Kriko-M, VP-Plein',
  facebook_event_url = 'https://www.facebook.com/events/1109483500529325',
  facebook_post_url = 'https://www.facebook.com/ScoutsKrikoM/posts/1109483500529325',
  document_url = 'https://www.kriko-m.be/wp-content/uploads/2025/08/528193945_1109483500529325_5681295269648299945_n.jpg',
  external_link_url = 'https://www.kriko-m.be/',
  is_evenement = true
WHERE id = 'cal_fdc37fda-9fb8-4077-8e66-fb5831151b3d' OR title LIKE '%Groeps BBQ%';

UPDATE calendar 
SET 
  title = 'Souphé 2027 (Nieuwjaarsdrink)',
  banner_image = 'https://www.kriko-m.be/wp-content/uploads/2026/01/611180469_886620700982324_567087133102833330_n-1-819x1024.png',
  description = 'Naar goede gewoonte zetten we het nieuwe jaar gezellig in met onze Souphé, olé! Heerlijke soep à volonté bereid door ouders en oud-leiding. Giverbar met drankjes en kleine versnaperingen. We verzamelen om 12u voor een halfuurtje pleinspelletjes en klinken vanaf 12u30 bij een knapperend vuurtje met een warm kopje soep (€2 à volonté, breng je eigen tas mee!).',
  time = '12:00 - 16:30',
  location = 'VP-Plein & Scoutslokalen',
  document_url = 'https://www.kriko-m.be/wp-content/uploads/2026/01/WIJ-ZOEKEN-NOG-SOEPMAKERS-819x1024.png',
  is_evenement = true
WHERE id = 'cal_19409e88-e6da-41a1-a180-6c98d387f692' OR title LIKE '%Souphé%';

UPDATE calendar 
SET 
  title = 'Bidongfeesten 2027 (Ratatouille)',
  banner_image = 'https://www.kriko-m.be/wp-content/uploads/2025/02/BIDONG-2025-1024x529.png',
  description = 'De leiding en groepsleiding staan klaar met ons gezellig Ratatouille Eetfestijn! Van 18u tot 20u kan je genieten van Stoofvlees, Vol-au-vent of Vegetarisch stoofpotje met frietjes (€19 volw. / €15 kids). Om 20u volgt het dessertenbuffet & givers-bingo. Vanaf 21u sfeervolle buitenbar met streekbieren, en om 23u draaien de DJ''s feestmuziek!',
  time = '18:00 - 03:00',
  location = 'Feestzaal & Scoutslokalen Kriko-M',
  external_link_url = 'https://forms.gle/Tbqk2BAku4zFQbrM9',
  is_evenement = true
WHERE id = 'cal_afe413ea-5650-4a0c-a48f-fdd1ca13d65b' OR title LIKE '%Bidong%';
