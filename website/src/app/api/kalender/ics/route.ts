import { NextRequest } from 'next/server'
import { getCalendarEvents, getKampen } from '@/lib/db'
import { Kamp } from '@/lib/types'

const CAL_TZ = 'Europe/Brussels'

interface DatabaseEvent {
  id: string
  title: string
  date: string
  time: string
  location: string
  description: string
  tak: string
}

function escapeIcsText(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n').replace(/\r/g, '\\n')
}

function toUtcIcsString(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

// VTIMEZONE voor Europe/Brussels (CET/CEST). Zo interpreteren agenda's de
// lokale wandkloktijd correct, ongeacht de tijdzone van de server.
const VTIMEZONE = [
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

function parseEventDates(event: DatabaseEvent) {
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
      allDay: false,
      startLocal: toLocalIcsString(dateStr, sh, sm),
      endLocal: toLocalIcsString(dateStr, eh, em),
    }
  }
  // Hele dag (DTEND is exclusief → +1 dag).
  const start = new Date(`${dateStr}T00:00:00Z`)
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
  return {
    allDay: true,
    startYmd: start.toISOString().slice(0, 10).replace(/-/g, ''),
    endYmd: end.toISOString().slice(0, 10).replace(/-/g, ''),
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const singleId = searchParams.get('event')
    const takkenParam = searchParams.get('takken')

    // Parse filters
    const allTakken = ['groep', 'kapoenen', 'welpen', 'jonggivers', 'givers']
    let selectedTakken = allTakken
    if (takkenParam) {
      selectedTakken = takkenParam.split(',').map(t => t.trim().toLowerCase()).filter(t => allTakken.includes(t))
    }

    let calendarEvents = (await getCalendarEvents()) as DatabaseEvent[]
    let camps = (await getKampen()) as Kamp[]

    // If a single event is requested
    if (singleId) {
      calendarEvents = calendarEvents.filter(e => e.id === singleId)
      camps = []
    } else {
      // Filter calendar events by branch (tak)
      calendarEvents = calendarEvents.filter(e => {
        const tak = e.tak || 'groep'
        return selectedTakken.includes(tak)
      })
    }

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Scouts Kriko-M//Kalender//NL',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Scouts Kriko-M',
      'X-WR-TIMEZONE:' + CAL_TZ,
      ...VTIMEZONE,
    ]

    const nowStr = toUtcIcsString(new Date())

    // 1. Process regular calendar events
    for (const event of calendarEvents) {
      const ev = parseEventDates(event)
      const uid = `${event.id}@kriko-m.be`

      lines.push('BEGIN:VEVENT')
      lines.push(`UID:${escapeIcsText(uid)}`)
      lines.push(`DTSTAMP:${nowStr}`)

      if (ev.allDay) {
        lines.push(`DTSTART;VALUE=DATE:${ev.startYmd}`)
        lines.push(`DTEND;VALUE=DATE:${ev.endYmd}`)
      } else {
        lines.push(`DTSTART;TZID=${CAL_TZ}:${ev.startLocal}`)
        lines.push(`DTEND;TZID=${CAL_TZ}:${ev.endLocal}`)
      }

      // Add tak prefix for better readability in parents' calendar feed (if it's not a group event)
      const prefix = event.tak && event.tak !== 'groep' ? `[${event.tak.charAt(0).toUpperCase() + event.tak.slice(1)}] ` : ''
      lines.push(`SUMMARY:${escapeIcsText(prefix + (event.title ?? 'Activiteit'))}`)
      if (event.description) {
        lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`)
      }
      if (event.location) {
        lines.push(`LOCATION:${escapeIcsText(event.location)}`)
      }
      lines.push('END:VEVENT')
    }

    // 2. Process camps (camps are multi-day, all-day events)
    if (!singleId) {
      const activeCamps = camps.filter(c => {
        if (!c.open_voor_inschrijving) return false
        if (c.tak === 'alle') return true // General camp/weekend matches any filter
        return selectedTakken.includes(c.tak)
      })

      for (const camp of activeCamps) {
        const uid = `${camp.id}@kriko-m.be`
        
        // Parse dates: datum_van and datum_tot are YYYY-MM-DD
        const startYmd = camp.datum_van.replace(/-/g, '')
        
        // Add 1 day to end date since DTEND is exclusive in ICS for all-day events
        const endDate = new Date(camp.datum_tot + 'T00:00:00')
        endDate.setDate(endDate.getDate() + 1)
        const endYmd = endDate.toISOString().slice(0, 10).replace(/-/g, '')

        lines.push('BEGIN:VEVENT')
        lines.push(`UID:${escapeIcsText(uid)}`)
        lines.push(`DTSTAMP:${nowStr}`)
        lines.push(`DTSTART;VALUE=DATE:${startYmd}`)
        lines.push(`DTEND;VALUE=DATE:${endYmd}`)

        const takName = camp.tak === 'alle' ? 'Groep' : camp.tak.charAt(0).toUpperCase() + camp.tak.slice(1)
        lines.push(`SUMMARY:${escapeIcsText(`🏕️ Weekend/Kamp [${takName}]: ${camp.naam}`)}`)

        let desc = camp.beschrijving || ''
        if (camp.prijs > 0) {
          desc += `\n\nPrijs: €${camp.prijs.toFixed(2).replace('.', ',')}`
        }
        if (camp.briefadres) {
          desc += `\n\nBriefadres:\n${camp.briefadres}`
        }
        if (camp.contact_info) {
          desc += `\n\nContact leiding:\n${camp.contact_info}`
        }
        
        lines.push(`DESCRIPTION:${escapeIcsText(desc)}`)
        if (camp.locatie) {
          lines.push(`LOCATION:${escapeIcsText(camp.locatie)}`)
        }
        lines.push('END:VEVENT')
      }
    }

    lines.push('END:VCALENDAR')

    const icsContent = lines.join('\r\n') + '\r\n'
    const filename = singleId ? `kriko-m-event-${singleId}.ics` : 'kriko-m-kalender.ics'

    return new Response(icsContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, must-revalidate',
      },
    })
  } catch (error) {
    console.error('ICS export error:', error)
    return new Response('Server Error', { status: 500 })
  }
}
