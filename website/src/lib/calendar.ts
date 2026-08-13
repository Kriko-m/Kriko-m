import { CalendarEvent, CalendarEntry } from './types'

export const PRESET_EVENT_ICONS = [
  { id: '', label: 'Geen icoon' },
  { id: 'fa-star', label: 'Groot Event' },
  { id: 'fa-campground', label: 'Kamp / Weekend' },
  { id: 'fa-fire', label: 'Kampvuur' },
  { id: 'fa-utensils', label: 'Eten / BBQ' },
  { id: 'fa-beer-mug-empty', label: 'Bar / Café' },
  { id: 'fa-music', label: 'Muziek / Party' },
  { id: 'fa-gift', label: 'Sint / Feest' },
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

