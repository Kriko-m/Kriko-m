import { getPublicCalendarEvents } from '@/lib/db'
import type { Metadata } from 'next'
import UpcomingEvent from '@/components/EventDetailModal'
import SubscribeCalendarButton from '@/components/SubscribeCalendarButton'
import { CalendarEvent } from '@/lib/types'

export const metadata: Metadata = { title: 'Kalender | Scouts Kriko-M' }

export default async function KalenderPage() {
  const events = (await getPublicCalendarEvents()) as CalendarEvent[]
  const today = new Date(); today.setHours(0,0,0,0)
  // Datum als string vergelijken (vermijdt UTC-verschuiving). Een meerdaags event
  // blijft "aankomend" zolang zijn einddatum nog niet voorbij is.
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const upcoming = events.filter((e: CalendarEvent) => (e.datum_tot || e.date) >= todayStr)
  const nextEvent = upcoming[0] ?? null
  const restEvents = upcoming.slice(1)

  return (
    <>
      <section className="tak-hero primair hero-kalender">
        <div className="container">
          <h1 className="tak-hero-title">Kalender</h1>
        </div>
      </section>

      <section className="section container section--no-top">
        {upcoming.length === 0 ? (
          <div className="cal-empty">
            <p>Er staan momenteel geen activiteiten gepland. Kom snel eens terug kijken!</p>
          </div>
        ) : (
          <div className="cal-layout">
            {/* Left col: featured next event + subscribe */}
            <div className="cal-left-col">
              {nextEvent && (
                <>
                  <p className="cal-featured-label">
                    <i className="fa-solid fa-bolt"></i> Eerstvolgende activiteit
                  </p>
                  <UpcomingEvent event={nextEvent} todayMs={today.getTime()} featured={true} />
                </>
              )}
              <div className="cal-actions">
                <div className="cal-actions-group">
                  <SubscribeCalendarButton />
                  <a href="/api/kalender/ics?download=true" className="btn btn-outline cal-actions-btn">
                    <i className="fa-solid fa-download"></i> Download (.ics)
                  </a>
                </div>
              </div>
              <p className="cal-actions-hint">
                <i className="fa-solid fa-circle-info"></i>
                &ldquo;Abonneren&rdquo; zet onze hele kalender in jouw agenda-app &mdash; nieuwe activiteiten verschijnen dan automatisch.
              </p>
            </div>

            {/* Right col: rest of upcoming */}
            <div className="cal-upcoming">
              <h3 className="cal-upcoming-title">Aankomende activiteiten</h3>
              {restEvents.length === 0 ? (
                <p className="cal-upcoming-empty">Geen andere activiteiten gepland.</p>
              ) : (
                restEvents.map((event: CalendarEvent) => (
                  <UpcomingEvent key={event.id} event={event} todayMs={today.getTime()} />
                ))
              )}
            </div>
          </div>
        )}
      </section>
    </>
  )
}
