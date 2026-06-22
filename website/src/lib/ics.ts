// Gedeelde iCalendar (.ics) helpers voor de publieke oudercalender-feed en de
// private leiding-feed. Bouwt VEVENT-blokken voor events en kampen.

import { Kamp } from './types'

export const CAL_TZ = 'Europe/Brussels'

export interface IcsEvent {
  id: string
  title: string
  date: string
  time: string
  location: string
  description: string
}

export function foldIcsLine(line: string): string {
  if (line.length <= 75) return line
  const out: string[] = [line.slice(0, 75)]
  let pos = 75
  while (pos < line.length) {
    out.push(line.slice(pos, pos + 74))
    pos += 74
  }
  return out.join('\r\n ')
}

export function escapeIcsText(str: string): string {
  return (str ?? '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n').replace(/\r/g, '\\n')
}

export function toUtcIcsString(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

// VTIMEZONE voor Europe/Brussels (CET/CEST). Zo interpreteren agenda's de
// lokale wandkloktijd correct, ongeacht de tijdzone van de server.
export const VTIMEZONE = [
  'BEGIN:VTIMEZONE',
  'TZID:Europe/Brussels',
  'BEGIN:DAYLIGHT',
  'TZOFFSETFROM:+0100',
  'TZOFFSETTO:+0200',
  'TZNAME:CEST',
  'DTSTART:19700329T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
  'END:DAYLIGHT',
  'BEGIN:STANDARD',
  'TZOFFSETFROM:+0200',
  'TZOFFSETTO:+0100',
  'TZNAME:CET',
  'DTSTART:19701025T030000',
  'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
  'END:STANDARD',
  'END:VTIMEZONE',
]

// Lokale wandkloktijd → ICS-string (geen tijdzone-conversie).
function toLocalIcsString(dateStr: string, hh: number, mm: number): string {
  const ymd = dateStr.replace(/-/g, '')
  return `${ymd}T${String(hh).padStart(2, '0')}${String(mm).padStart(2, '0')}00`
}

export function parseEventDates(event: IcsEvent) {
  const dateStr = event.date // YYYY-MM-DD
  const timeStr = event.time?.trim() ?? ''

  const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/g)
  if (timeMatch && timeMatch.length >= 1) {
    const [sh, sm] = timeMatch[0].split(':').map(Number)
    let eh: number, em: number
    if (timeMatch.length >= 2) {
      ;[eh, em] = timeMatch[1].split(':').map(Number)
    } else {
      eh = (sh + 1) % 24
      em = sm
    }
    return {
      allDay: false as const,
      startLocal: toLocalIcsString(dateStr, sh, sm),
      endLocal: toLocalIcsString(dateStr, eh, em),
    }
  }
  // Hele dag (DTEND is exclusief → +1 dag).
  const start = new Date(`${dateStr}T00:00:00Z`)
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
  return {
    allDay: true as const,
    startYmd: start.toISOString().slice(0, 10).replace(/-/g, ''),
    endYmd: end.toISOString().slice(0, 10).replace(/-/g, ''),
  }
}

// Start een VCALENDAR met de juiste headers en tijdzone.
export function icsHeader(calName: string): string[] {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Scouts Kriko-M//Kalender//NL',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:' + escapeIcsText(calName),
    'X-WR-TIMEZONE:' + CAL_TZ,
    ...VTIMEZONE,
  ]
}

// Bouwt één VEVENT-blok voor een gewoon kalender-event.
export function buildEventVevent(event: IcsEvent, nowStr: string, summaryPrefix = ''): string[] {
  const ev = parseEventDates(event)
  const uid = `${event.id}@kriko-m.be`
  const lines: string[] = ['BEGIN:VEVENT', `UID:${escapeIcsText(uid)}`, `DTSTAMP:${nowStr}`]

  if (ev.allDay) {
    lines.push(`DTSTART;VALUE=DATE:${ev.startYmd}`)
    lines.push(`DTEND;VALUE=DATE:${ev.endYmd}`)
  } else {
    lines.push(`DTSTART;TZID=${CAL_TZ}:${ev.startLocal}`)
    lines.push(`DTEND;TZID=${CAL_TZ}:${ev.endLocal}`)
  }

  lines.push(`SUMMARY:${escapeIcsText(summaryPrefix + (event.title ?? 'Activiteit'))}`)
  if (event.description) lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`)
  if (event.location) lines.push(`LOCATION:${escapeIcsText(event.location)}`)
  lines.push('END:VEVENT')
  return lines
}

// Bouwt één VEVENT-blok (meerdaags, hele dag) voor een kamp/weekend.
export function buildKampVevent(kamp: Kamp, nowStr: string): string[] {
  const uid = `${kamp.id}@kriko-m.be`
  const startYmd = kamp.datum_van.replace(/-/g, '')
  // DTEND is exclusief voor hele-dag-events → +1 dag.
  const endDate = new Date(kamp.datum_tot + 'T00:00:00')
  endDate.setDate(endDate.getDate() + 1)
  const endYmd = endDate.toISOString().slice(0, 10).replace(/-/g, '')

  const lines: string[] = ['BEGIN:VEVENT', `UID:${escapeIcsText(uid)}`, `DTSTAMP:${nowStr}`]
  lines.push(`DTSTART;VALUE=DATE:${startYmd}`)
  lines.push(`DTEND;VALUE=DATE:${endYmd}`)

  const takName = kamp.tak === 'alle' ? 'Groep' : kamp.tak.charAt(0).toUpperCase() + kamp.tak.slice(1)
  lines.push(`SUMMARY:${escapeIcsText(`🏕️ Weekend/Kamp [${takName}]: ${kamp.naam}`)}`)

  let desc = kamp.beschrijving || ''
  if (kamp.prijs > 0) desc += `\n\nPrijs: €${kamp.prijs.toFixed(2).replace('.', ',')}`
  if (kamp.briefadres) desc += `\n\nBriefadres:\n${kamp.briefadres}`
  if (kamp.contact_info) desc += `\n\nContact leiding:\n${kamp.contact_info}`
  lines.push(`DESCRIPTION:${escapeIcsText(desc)}`)
  if (kamp.locatie) lines.push(`LOCATION:${escapeIcsText(kamp.locatie)}`)
  lines.push('END:VEVENT')
  return lines
}
