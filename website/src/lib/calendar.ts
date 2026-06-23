// Gedeelde, pure kalender-helpers (geen server-only imports → bruikbaar in
// client components én server components).

import { CalendarEvent, CalendarEntry, Kamp } from './types'

// Zet een echt kalender-event om naar een CalendarEntry.
export function eventToEntry(ev: CalendarEvent): CalendarEntry {
  return { ...ev, source: 'event' }
}

// Zet een kamp/weekend om naar een read-only CalendarEntry voor de leidingcalender.
export function kampToEntry(kamp: Kamp): CalendarEntry {
  return {
    id: kamp.id,
    title: kamp.naam,
    date: kamp.datum_van,
    datum_tot: kamp.datum_tot,
    time: '',
    location: kamp.locatie,
    description: kamp.beschrijving,
    audience: kamp.audience ?? [],
    is_evenement: false,
    cover_image: '',
    document_url: '',
    werkjaar: kamp.werkjaar,
    source: 'kamp',
    slug: kamp.slug,
  }
}

// Voegt events + kampen samen tot één gesorteerde lijst voor de leidingcalender.
export function mergeCampsIntoCalendar(events: CalendarEvent[], kampen: Kamp[]): CalendarEntry[] {
  const merged: CalendarEntry[] = [
    ...events.map(eventToEntry),
    ...kampen.map(kampToEntry),
  ]
  return merged.sort((a, b) => a.date.localeCompare(b.date))
}
