import { NextRequest } from 'next/server'
import { getCalendarEvents } from '@/lib/db'

const CAL_TZ = 'Europe/Brussels'

interface DatabaseEvent {
  id: string
  title: string
  date: string
  time: string
  location: string
  description: string
}

function escapeIcsText(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n').replace(/\r/g, '\\n')
}

function toUtcIcsString(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

function parseEventDates(event: DatabaseEvent) {
  const dateStr = event.date // YYYY-MM-DD
  const timeStr = event.time?.trim() ?? ''
  
  let start: Date
  let end: Date
  let allDay = true

  const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/g)
  if (timeMatch && timeMatch.length >= 1) {
    allDay = false
    const startTimeParts = timeMatch[0].split(':')
    start = new Date(`${dateStr}T${startTimeParts[0].padStart(2, '0')}:${startTimeParts[1].padStart(2, '0')}:00`)
    if (timeMatch.length >= 2) {
      const endTimeParts = timeMatch[1].split(':')
      end = new Date(`${dateStr}T${endTimeParts[0].padStart(2, '0')}:${endTimeParts[1].padStart(2, '0')}:00`)
    } else {
      end = new Date(start.getTime() + 60 * 60 * 1000) // +1 hour
    }
  } else {
    // All day event
    start = new Date(`${dateStr}T00:00:00`)
    end = new Date(start.getTime() + 24 * 60 * 60 * 1000) // +1 day (exclusive DTEND)
  }

  return { start, end, allDay }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const singleId = searchParams.get('event')

    let events = (await getCalendarEvents()) as DatabaseEvent[]
    if (singleId) {
      events = events.filter(e => e.id === singleId)
    }

    // Sort chronologically
    events.sort((a, b) => a.date.localeCompare(b.date))

    const nowStr = toUtcIcsString(new Date())
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Scouts Kriko-M//Kalender//NL',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Scouts Kriko-M',
      'X-WR-TIMEZONE:' + CAL_TZ,
    ]

    for (const event of events) {
      const { start, end, allDay } = parseEventDates(event)
      const uid = `${event.id}@kriko-m.be`

      lines.push('BEGIN:VEVENT')
      lines.push(`UID:${escapeIcsText(uid)}`)
      lines.push(`DTSTAMP:${nowStr}`)

      if (allDay) {
        // Format: YYYYMMDD
        const startYmd = start.toISOString().slice(0, 10).replace(/-/g, '')
        const endYmd = end.toISOString().slice(0, 10).replace(/-/g, '')
        lines.push(`DTSTART;VALUE=DATE:${startYmd}`)
        lines.push(`DTEND;VALUE=DATE:${endYmd}`)
      } else {
        lines.push(`DTSTART:${toUtcIcsString(start)}`)
        lines.push(`DTEND:${toUtcIcsString(end)}`)
      }

      lines.push(`SUMMARY:${escapeIcsText(event.title ?? 'Activiteit')}`)
      if (event.description) {
        lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`)
      }
      if (event.location) {
        lines.push(`LOCATION:${escapeIcsText(event.location)}`)
      }
      lines.push('END:VEVENT')
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
