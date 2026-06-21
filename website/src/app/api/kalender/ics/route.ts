import { NextRequest } from 'next/server'
import { getPublicCalendarEvents, getKampen } from '@/lib/db'
import { Kamp } from '@/lib/types'
import { IcsEvent, icsHeader, buildEventVevent, buildKampVevent, toUtcIcsString } from '@/lib/ics'

// Publieke oudercalender-feed: enkel events met de 'ouders'-tag, plus open
// kampen/weekenden. Interne leiding-events verschijnen hier nooit.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const singleId = searchParams.get('event')
    const download = searchParams.get('download') === '1' || searchParams.get('download') === 'true'

    let calendarEvents = (await getPublicCalendarEvents()) as IcsEvent[]
    let camps = (await getKampen()) as Kamp[]

    if (singleId) {
      calendarEvents = calendarEvents.filter(e => e.id === singleId)
      camps = []
    }

    const lines = icsHeader('Scouts Kriko-M')
    const nowStr = toUtcIcsString(new Date())

    // 1. Gewone (publieke) kalender-events
    for (const event of calendarEvents) {
      lines.push(...buildEventVevent(event, nowStr))
    }

    // 2. Kampen/weekenden die openstaan voor inschrijving (ouder-relevant)
    if (!singleId) {
      const activeCamps = camps.filter(c => c.open_voor_inschrijving)
      for (const camp of activeCamps) {
        lines.push(...buildKampVevent(camp, nowStr))
      }
    }

    lines.push('END:VCALENDAR')

    const icsContent = lines.join('\r\n') + '\r\n'
    const filename = singleId ? `kriko-m-event-${singleId}.ics` : 'kriko-m-kalender.ics'

    const headers: Record<string, string> = {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Cache-Control': 'no-cache, must-revalidate',
    }

    if (download) {
      headers['Content-Disposition'] = `attachment; filename="${filename}"`
    } else {
      headers['Content-Disposition'] = 'inline'
    }

    return new Response(icsContent, { headers })
  } catch (error) {
    console.error('ICS export error:', error)
    return new Response('Server Error', { status: 500 })
  }
}
