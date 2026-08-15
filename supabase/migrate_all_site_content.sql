-- SQL Migration: Seed initial default data into settings and site_content
-- Run this in Supabase -> SQL Editor -> New query

-- 1. Ensure settings record has all takken default leaders & photos if not set
UPDATE public.settings
SET takken = jsonb_build_object(
  'kapoenen', jsonb_build_object(
    'name', 'Kapoenen',
    'email', COALESCE(takken->'kapoenen'->>'email', 'kapoenen@kriko-m.be'),
    'whatsapp_url', COALESCE(takken->'kapoenen'->>'whatsapp_url', ''),
    'photo', COALESCE(takken->'kapoenen'->>'photo', '/images/leiding_kapoenen.jpg'),
    'description', 'Kapoenen zijn onze jongste leden van 6 tot 8 jaar. Ze ontdekken al spelend wat het is om scout of gids te zijn.',
    'leaders', jsonb_build_array(
      jsonb_build_object('name', 'Marthe Isik', 'totem', 'Dageraad rode doortastende Drongo', 'role', 'Leidster', 'phone', '+32 470 34 37 20'),
      jsonb_build_object('name', 'Lies Osselaer', 'totem', '', 'role', 'Leidster', 'phone', ''),
      jsonb_build_object('name', 'Pieter Room', 'totem', 'Lapis Lazuli Blauw Goud Levenslustige Lori', 'role', 'Leider', 'phone', '+32 479 26 38 48')
    )
  ),
  'welpen', jsonb_build_object(
    'name', 'Welpen',
    'email', COALESCE(takken->'welpen'->>'email', 'welpen@kriko-m.be'),
    'whatsapp_url', COALESCE(takken->'welpen'->>'whatsapp_url', ''),
    'photo', COALESCE(takken->'welpen'->>'photo', '/images/leiding_welpen.jpg'),
    'description', 'Welpen hebben veel energie. Hun enthousiasme kent soms geen grenzen. Ze bouwen graag kampen, verzinnen een geheime taal en halen kattenkwaad uit.',
    'leaders', jsonb_build_array(
      jsonb_build_object('name', 'Vic Verhaegen', 'totem', 'Wasabigroene Vindingrijke Mus', 'role', 'Leider', 'phone', '+32 477 21 36 53'),
      jsonb_build_object('name', 'Lotte Waeckens', 'totem', 'Asterlila Aimabele Antilope', 'role', 'Leidster', 'phone', '+32 479 36 93 14'),
      jsonb_build_object('name', 'Lotte Cerpentier', 'totem', 'Ringoogparelmoer Gele Ruimhartige Rayador', 'role', 'Leidster', 'phone', '+32 495 99 29 57'),
      jsonb_build_object('name', 'Yenthe Scholiers', 'totem', 'Diepspinel Roze Dromerige Dolfijn', 'role', 'Leidster', 'phone', '+32 493 96 76 90')
    )
  ),
  'jonggivers', jsonb_build_object(
    'name', 'Jonggivers',
    'email', COALESCE(takken->'jonggivers'->>'email', 'jonggivers@kriko-m.be'),
    'whatsapp_url', COALESCE(takken->'jonggivers'->>'whatsapp_url', ''),
    'photo', COALESCE(takken->'jonggivers'->>'photo', '/images/leiding_jonggivers.jpg'),
    'description', 'Jonggivers houden van avontuur en steken graag de handen uit de mouwen. Ze vinden het leuk om inspraak te hebben en gaan graag nieuwe uitdagingen aan.',
    'leaders', jsonb_build_array(
      jsonb_build_object('name', 'Jelle Scholiers', 'totem', 'Blijmoedige Beo', 'role', 'Leider', 'phone', '+32 491 91 99 90'),
      jsonb_build_object('name', 'Sara Meyten', 'totem', 'Wavellietgroene Wilskrachtige Waterwolf', 'role', 'Leidster', 'phone', '+32 468 58 09 01'),
      jsonb_build_object('name', 'Marie Vanesbroek', 'totem', 'Karmozijn rode karaktervolle Kavka', 'role', 'Leidster', 'phone', '+32 468 53 49 81')
    )
  ),
  'givers', jsonb_build_object(
    'name', 'Givers',
    'email', COALESCE(takken->'givers'->>'email', 'givers@kriko-m.be'),
    'whatsapp_url', COALESCE(takken->'givers'->>'whatsapp_url', ''),
    'photo', COALESCE(takken->'givers'->>'photo', '/images/leiding_givers.jpg'),
    'description', 'De givers zijn de oudste leden van onze scouts en zijn 14 tot 17 jaar oud. Giver zijn is vooral ook plezier maken met je vrienden, samen leuke ervaringen delen en groeien in de scouts.',
    'leaders', jsonb_build_array(
      jsonb_build_object('name', 'Thomas Meyten', 'totem', 'Attente Agoeti', 'role', 'Leider', 'phone', '+32 468 25 88 92'),
      jsonb_build_object('name', 'Eve Bonza', 'totem', 'Vulkaanpyriet goud Vurige Vlinder', 'role', 'Leidster', 'phone', '+32 465 31 18 81'),
      jsonb_build_object('name', 'Lucas Van Cleemput', 'totem', 'Kiene Kia', 'role', 'Leider', 'phone', '+32 468 41 95 02')
    )
  )
)
WHERE id = 1 AND (takken IS NULL OR jsonb_array_length(COALESCE(takken->'kapoenen'->'leaders', '[]'::jsonb)) = 0);

-- 2. Seed initial site_content blocks if not present
INSERT INTO public.site_content (key, page, section, title, content, image_url)
VALUES
  ('home.welcome_title', 'home', 'welcome', 'Welkom bij Kriko-M!', 'Wat fijn dat je een kijkje komt nemen! Bij Kriko-M draait alles om avontuur, vriendschap en samen ontdekken. Elke week staat onze enthousiaste leidingsploeg klaar om onze leden een onvergetelijke tijd vol uitdagende spelen, bosrafels en fantastische herinneringen te bezorgen. Of je nu voor het eerst komt proeven van scouting of al jaren meegaat: bij ons is iedereen welkom!', '/images/leiding_25-26.jpg'),
  ('home.join_title', 'home', 'join', 'Zin om mee te doen?', 'Wil je lid worden of kom je graag een keertje proberen? Neem een kijkje op onze inschrijvingspagina om je aan te melden! Benieuwd waar en wanneer jouw tak afspreekt? De maandelijkse planningen en verzamelplekken vind je overzichtelijk in onze Kriko Echo.', NULL),
  ('verhuur.intro_title', 'verhuur', 'intro', 'Lokaal Verhuur Scouts Kriko-M', 'Onze lokalen zijn te huur voor weekenden, kampen en verenigingen. Gelegen in het groen te Sint-Niklaas met uitstekende voorzieningen.', '/images/verhuur/lokaal-04.jpg')
ON CONFLICT (key) DO NOTHING;
