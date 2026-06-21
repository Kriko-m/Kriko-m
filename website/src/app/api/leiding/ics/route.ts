import { NextRequest } from 'next/server'
import { getAllCalendarEvents, getKampen, getLeidingIcsToken } from '@/lib/db'
import { CalendarEvent, Kamp } from '@/lib/types'
import { AUDIENCE_NAMEN } from '@/lib/constants'
import { IcsEvent, icsHeader, buildEventVevent, buildKampVevent, toUtcIcsString } from '@/lib/ics'

// Private leiding-feed: ALLE events + ALLE kampen. Beveiligd met een geheim
// token in de URL (agenda-apps pollen anoniem, dus geen login-cookie mogelijk).
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token') ?? ''

    const validToken = await getLeidingIcsToken()
    if (!validToken || token !== validToken) {
      return new Response('Geen toegang', { status: 403 })
    }

    const events = (await getAllCalendarEvents()) as CalendarEvent[]
    const camps = (await getKampen()) as Kamp[]

    const lines = icsHeader('Scouts Kriko-M — Leiding')
    const nowStr = toUtcIcsString(new Date())

    for (const event of events) {
      // Prefix met de audience-tags zodat leiding in hun agenda meteen ziet
      // voor wie het bedoeld is.
      const tags = (event.audience ?? []).map(a => AUDIENCE_NAMEN[a] ?? a)
      const prefix = tags.length ? `[${tags.join(', ')}] ` : ''
      lines.push(...buildEventVevent(event as IcsEvent, nowStr, prefix))
    }

    for (const camp of camps) {
      lines.push(...buildKampVevent(camp, nowStr))
    }

    lines.push('END:VCALENDAR')

    const icsContent = lines.join('\r\n') + '\r\n'

    return new Response(icsContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="kriko-m-leiding-kalender.ics"',
        'Cache-Control': 'no-cache, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Leiding ICS export error:', error)
    return new Response('Server Error', { status: 500 })
  }
}
