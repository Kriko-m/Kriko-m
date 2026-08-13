-- ── SUPABASE CLEANUP: OUDE KAMPEN TABELLEN VERWIJDEREN ─────────────────────────
-- Run dit SQL-script in Supabase → SQL Editor om de oude ongebruikte
-- kamp-tabellen te verwijderen.
--
-- Kampen en weekends worden nu als normale (meerdere dagen durende)
-- kalenderevenementen geregistreerd via de `calendar` tabel (met `datum_tot`).

DROP TABLE IF EXISTS kamp_rsvp CASCADE;
DROP TABLE IF EXISTS kamp_bestanden CASCADE;
DROP TABLE IF EXISTS kampen CASCADE;
DROP TABLE IF EXISTS kampinschrijvingen CASCADE;
