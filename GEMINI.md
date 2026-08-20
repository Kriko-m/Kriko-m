# Project Rules & AI Assistant Guidelines

## Official VZW Information
- **Naam:** Scouts Kriko-M vzw
- **Ondernemingsnummer (KBO):** BE0409.040.288
- **Btw-status:** Niet btw-plichtig (vrijgesteld van btw)
- **Adres:** Industriepark-Noord 33, 9100 Sint-Niklaas
- **E-mail:** groepsleiding@kriko-m.be

## Site Scope & Functional Rules
- **GEEN kamp- of weekendinschrijvingen / RSVP op de site:** Kamp- en weekendinschrijvingen worden NIET op deze website verwerkt of opgeslagen. Dit verloopt via S&G Groepsadmin of rechtstreeks via leiding.
- **GEEN ouder-accounts:** Inloggen (`/portaal`) is uitsluitend voor leiding. De webshop is accountloos (naam + e-mail bij checkout).
- **GEEN medische fiches / S&G persoonsgegevens:** Medische en persoonlijke gegevens van leden blijven in de officiële S&G Groepsadmin.
- **GEEN online betalingsgateways (Mollie/Stripe):** Betalingen voor de webshop en lidgeld verlopen via Belgische gestructureerde bankoverschrijving (`BE59 7360 6413 2626`).
- **GEEN lokaal verhuurformulier op de site:** Verhuuraanvragen verwijzen door naar Kampas.be.

## Database & SQL Execution
- Wanneer er een SQL-query of migratie moet worden uitgevoerd (zoals in Supabase), dient de AI assistant **altijd expliciet de exacte SQL-code en duidelijke instructies** aan de gebruiker te geven om dit uit te voere in de Supabase SQL Editor.
- Geef altijd aan *waarom* het SQL-script uitgevoerd moet worden en *welke stappen* de gebruiker moet volgen (bv. **Supabase → SQL Editor → New query**).

