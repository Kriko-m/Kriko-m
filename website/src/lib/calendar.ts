import { CalendarEvent, CalendarEntry } from './types'

export const PRESET_EVENT_ICONS = [
  { id: 'fa-star', label: 'Groot Event' },
  { id: 'fa-house', label: 'Lokaal / Huis' },
  { id: 'fa-champagne-glasses', label: 'Feest / Party' },
  { id: 'fa-cake-candles', label: 'Verjaardag / Taart' },
  { id: 'fa-campground', label: 'Kamp / Weekend' },
  { id: 'fa-fire', label: 'Kampvuur' },
  { id: 'fa-utensils', label: 'Eten / BBQ' },
  { id: 'fa-beer-mug-empty', label: 'Bar / Café' },
  { id: 'fa-music', label: 'Muziek / Party' },
  { id: 'fa-gift', label: 'Sint / Cadeau' },
  { id: 'fa-ghost', label: 'Griezel' },
  { id: 'fa-person-hiking', label: 'Dropping / Tocht' },
  { id: 'fa-lightbulb', label: 'Quiz' },
  { id: 'fa-masks-theater', label: 'Bonte Avond' },
  { id: 'fa-coins', label: 'Verkoop' },
  { id: 'fa-ban', label: 'Geen vergadering' },
]

export function getEventIcon(event: CalendarEvent): string {
  return event.icon || ''
}

// Zet een echt kalender-event om naar een CalendarEntry.
export function eventToEntry(ev: CalendarEvent): CalendarEntry {
  return { ...ev, source: 'event' }
}

export const AUDIENCE_PRIORITY: ('groep' | 'leiding' | 'kapoenen' | 'welpen' | 'jonggivers' | 'givers')[] = [
  'groep',
  'leiding',
  'kapoenen',
  'welpen',
  'jonggivers',
  'givers',
]

export function getPrimaryAudienceTag(audience?: string[]): 'groep' | 'leiding' | 'kapoenen' | 'welpen' | 'jonggivers' | 'givers' {
  if (!audience || audience.length === 0) return 'leiding'
  for (const tag of AUDIENCE_PRIORITY) {
    if (audience.includes(tag)) return tag
  }
  return (audience[0] as any) || 'leiding'
}

