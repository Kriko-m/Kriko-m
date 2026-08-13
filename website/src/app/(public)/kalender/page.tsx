import { getPublicCalendarEvents } from '@/lib/db'
import type { Metadata } from 'next'
import UpcomingEvent from '@/components/EventDetailModal'
import SubscribeCalendarButton from '@/components/SubscribeCalendarButton'
import CalendarMonthGrid from '@/components/CalendarMonthGrid'
import { CalendarEvent } from '@/lib/types'

export const metadata: Metadata = { title: 'Kalender | Scouts Kriko-M' }

export default async function KalenderPage() {
  const events = (await getPublicCalendarEvents()) as CalendarEvent[]
  const today = new Date(); today.setHours(0,0,0,0)
  // Datum als string vergelijken (vermijdt UTC-verschuiving).
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const upcoming = events.filter((e: CalendarEvent) => (e.datum_tot || e.date) >= todayStr)
  const topEvents = upcoming.slice(0, 3)

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
          <div className="cal-2col-layout">
            {/* Column 1: Month Grid Calendar + Small Sync Actions */}
            <div className="cal-col-main">
              <CalendarMonthGrid events={events} todayMs={today.getTime()} />
              <div className="cal-grid-sub-actions">
                <SubscribeCalendarButton
                  buttonClassName="btn btn-outline cal-sub-action-btn"
                  buttonText="Kalender synchroniseren"
                />
                <a href="/api/kalender/ics?download=true" className="btn btn-outline cal-sub-action-btn">
                  <i className="fa-solid fa-download"></i> .ics downloaden
                </a>
              </div>
            </div>

            {/* Column 2: Top Upcoming Events */}
            <div className="cal-col-sidebar">
              <div className="cal-sidebar-events">
                {topEvents.map((event, index) => (
                  <UpcomingEvent
                    key={event.id}
                    event={event}
                    todayMs={today.getTime()}
                    featured={index === 0}
                    compact={index > 0}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  )
}
