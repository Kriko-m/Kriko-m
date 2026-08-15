-- ============================================================
--  Scouts Kriko-M — Website Beheer Update
--  Voer dit script uit in Supabase → SQL Editor → New query
-- ============================================================

-- 1. Voeg home_leiding_foto toe aan settings indien nog niet aanwezig
ALTER TABLE settings ADD COLUMN IF NOT EXISTS home_leiding_foto TEXT NOT NULL DEFAULT '/images/leiding_25-26.jpg';

-- 2. Update takken JSONB met initiële leiding (inclusief totems en telefoonnummers) en fotopad
UPDATE settings
SET takken = jsonb_build_object(
  'kapoenen', jsonb_build_object(
    'name', 'Kapoenen',
    'age_range', '6 - 8 jaar',
    'school_year', '1e & 2e leerjaar',
    'email', 'kapoenenleiding@kriko-m.be',
    'whatsapp_url', '',
    'photo', '/images/leiding_kapoenen.jpg',
    'leaders', jsonb_build_array(
      jsonb_build_object('name', 'Marthe Isik', 'totem', 'Dageraad rode doortastende Drongo', 'role', 'Takleiding', 'phone', '+32 470 34 37 20'),
      jsonb_build_object('name', 'Lies Osselaer', 'totem', '', 'role', 'Leidster', 'phone', ''),
      jsonb_build_object('name', 'Pieter Room', 'totem', 'Lapis Lazuli Blauw Goud Levenslustige Lori', 'role', 'Leider', 'phone', '+32 479 26 38 48')
    )
  ),
  'welpen', jsonb_build_object(
    'name', 'Welpen',
    'age_range', '8 - 11 jaar',
    'school_year', '3e, 4e & 5e leerjaar',
    'email', 'welpenleiding@kriko-m.be',
    'whatsapp_url', '',
    'photo', '/images/leiding_welpen.jpg',
    'leaders', jsonb_build_array(
      jsonb_build_object('name', 'Vic Verhaegen', 'totem', 'Wasabigroene Vindingrijke Mus', 'role', 'Takleiding', 'phone', '+32 477 21 36 53'),
      jsonb_build_object('name', 'Lotte Waeckens', 'totem', 'Asterlila Aimabele Antilope', 'role', 'Leidster', 'phone', '+32 479 36 93 14'),
      jsonb_build_object('name', 'Lotte Cerpentier', 'totem', 'Ringoogparelmoer Gele Ruimhartige Rayador', 'role', 'Leidster', 'phone', '+32 495 99 29 57'),
      jsonb_build_object('name', 'Yenthe Scholiers', 'totem', 'Diepspinel Roze Dromerige Dolfijn', 'role', 'Leidster', 'phone', '+32 493 96 76 90')
    )
  ),
  'jonggivers', jsonb_build_object(
    'name', 'Jonggivers',
    'age_range', '11 - 14 jaar',
    'school_year', '6e leerjaar, 1e & 2e middelbaar',
    'email', 'jonggiverleiding@kriko-m.be',
    'whatsapp_url', '',
    'photo', '/images/leiding_jonggivers.jpg',
    'leaders', jsonb_build_array(
      jsonb_build_object('name', 'Jelle Scholiers', 'totem', 'Blijmoedige Beo', 'role', 'Takleiding', 'phone', '+32 491 91 99 90'),
      jsonb_build_object('name', 'Sara Meyten', 'totem', 'Wavellietgroene Wilskrachtige Waterwolf', 'role', 'Leidster', 'phone', '+32 468 58 09 01'),
      jsonb_build_object('name', 'Marie Vanesbroek', 'totem', 'Karmozijn rode karaktervolle Kavka', 'role', 'Leidster', 'phone', '+32 468 53 49 81')
    )
  ),
  'givers', jsonb_build_object(
    'name', 'Givers',
    'age_range', '14 - 17 jaar',
    'school_year', '3e, 4e & 5e middelbaar',
    'email', 'giverleiding@kriko-m.be',
    'whatsapp_url', '',
    'photo', '/images/leiding_givers.jpg',
    'leaders', jsonb_build_array(
      jsonb_build_object('name', 'Thomas Meyten', 'totem', 'Attente Agoeti', 'role', 'Takleiding', 'phone', '+32 468 25 88 92'),
      jsonb_build_object('name', 'Eve Bonza', 'totem', 'Vulkaanpyriet goud Vurige Vlinder', 'role', 'Leidster', 'phone', '+32 465 31 18 81'),
      jsonb_build_object('name', 'Lucas Van Cleemput', 'totem', 'Kiene Kia', 'role', 'Leider', 'phone', '+32 468 41 95 02')
    )
  )
)
WHERE id = 1 AND (takken->'kapoenen'->'leaders') IS NULL;
