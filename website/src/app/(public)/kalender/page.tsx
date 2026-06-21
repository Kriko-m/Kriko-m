import { getPublicCalendarEvents } from '@/lib/db'
import type { Metadata } from 'next'
import CalendarGrid from '@/components/CalendarGrid'
import UpcomingEvent from '@/components/EventDetailModal'
import { CalendarEvent } from '@/lib/types'

export const metadata: Metadata = { title: 'Kalender | Scouts Kriko-M' }

export default async function KalenderPage() {
  const events = (await getPublicCalendarEvents()) as CalendarEvent[]
  const today = new Date(); today.setHours(0,0,0,0)
  const upcoming = events.filter((e: CalendarEvent) => new Date(e.date) >= today)
  const gridEvents = events.map((e: CalendarEvent) => ({ id: e.id, date: e.date, title: e.title, time: e.time, evenement: e.is_evenement }))

  return (
    <>
      <section className="tak-hero primair hero-kalender">
        <div className="container">
          <span className="hero-eyebrow">Activiteiten &amp; evenementen</span>
          <h1 className="tak-hero-title">Kalender</h1>
        </div>
      </section>

      <section className="section container section--no-top">
        {events.length === 0 ? (
          <div className="cal-empty">
            <p>Er staan momenteel geen activiteiten gepland. Kom snel eens terug kijken!</p>
          </div>
        ) : (
          <div className="cal-layout">
            <div className="cal-left-col">
              <CalendarGrid events={gridEvents} />
              <div className="cal-actions">
                <div className="cal-actions-group">
                  <a href="/api/kalender/ics" className="btn btn-secondary cal-actions-btn">
                    <i className="fa-regular fa-calendar-plus"></i> Abonneer op onze agenda
                  </a>
                  <a href="/api/kalender/ics" download className="btn btn-outline cal-actions-btn">
                    <i className="fa-solid fa-download"></i> Download (.ics)
                  </a>
                </div>
              </div>
              <p className="cal-actions-hint">
                <i className="fa-solid fa-circle-info"></i>
                &ldquo;Abonneren&rdquo; zet onze hele kalender in jouw agenda-app &mdash; nieuwe activiteiten verschijnen dan automatisch.
              </p>
            </div>

            <div className="cal-upcoming">
              <h3 className="cal-upcoming-title">Aankomende activiteiten</h3>
              {upcoming.length === 0 ? (
                <p className="cal-upcoming-empty">Er zijn momenteel geen aankomende activiteiten gepland.</p>
              ) : (
                upcoming.map((event: CalendarEvent) => (
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
