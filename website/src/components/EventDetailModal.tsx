'use client'
import { useEffect, useState } from 'react'
import { CalendarEvent } from '@/lib/types'

const MONTHS_NL = ['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December']
const MONTHS_SHORT: Record<number, string> = {1:'Jan',2:'Feb',3:'Mrt',4:'Apr',5:'Mei',6:'Jun',7:'Jul',8:'Aug',9:'Sep',10:'Okt',11:'Nov',12:'Dec'}
const WEEKDAYS = ['zondag','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag']

function googleCalUrl(event: CalendarEvent) {
  const d = event.date.replace(/-/g, '')
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${d}/${d}&details=${encodeURIComponent(event.description ?? '')}&location=${encodeURIComponent(event.location ?? '')}`
}

// Eén kaart in "Aankomende activiteiten". Evenementen (is_evenement) krijgen een
// accent + coverfoto-preview en openen bij klik een detailvenster met de
// volledige cover, omschrijving en de uitnodiging.
export default function UpcomingEvent({ event, todayMs }: { event: CalendarEvent; todayMs: number }) {
  const [open, setOpen] = useState(false)
  const isEvenement = event.is_evenement && (!!event.cover_image || !!event.document_url || !!event.description)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open])

  const d = new Date(event.date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = MONTHS_SHORT[d.getMonth() + 1]
  const weekday = WEEKDAYS[d.getDay()]
  const dateStr = `${d.getDate()} ${MONTHS_NL[d.getMonth()]} ${d.getFullYear()}`
  const diff = Math.round((d.getTime() - todayMs) / 86400000)
  const countdown = diff === 0 ? 'Vandaag' : diff === 1 ? 'Morgen' : `Nog ${diff} dagen`

  return (
    <>
      <article
        className={`cal-event${event.is_evenement ? ' cal-event-evenement' : ''}`}
        id={`event-${event.id}`}
        data-date={event.date}
        onClick={isEvenement ? () => setOpen(true) : undefined}
        style={isEvenement ? { cursor: 'pointer' } : undefined}
      >
        <div className="cal-event-date" aria-hidden="true">
          <span className="cal-event-day">{day}</span>
          <span className="cal-event-month">{month}</span>
        </div>
        <div className="cal-event-body">
          <span className="cal-countdown">
            {event.is_evenement && <i className="fa-solid fa-star" style={{ marginRight: 6, color: 'var(--color-accent)' }} />}
            {countdown}
          </span>
          <h4 className="cal-event-title">{event.title}</h4>
          <div className="cal-event-meta">
            <span><i className="fa-regular fa-calendar"></i> {weekday} {dateStr}</span>
            {event.time && <span><i className="fa-regular fa-clock"></i> {event.time}</span>}
            {event.location && <span><i className="fa-solid fa-location-dot"></i> {event.location}</span>}
          </div>
          {event.description && <p className="cal-event-desc">{event.description}</p>}

          {isEvenement && event.cover_image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.cover_image} alt={event.title} className="cal-event-cover-thumb" />
          )}

          {isEvenement ? (
            <div className="cal-event-actions">
              <button type="button" className="cal-add-btn" onClick={(e) => { e.stopPropagation(); setOpen(true) }}>
                <i className="fa-solid fa-circle-info"></i> Meer info
              </button>
            </div>
          ) : (
            <div className="cal-event-actions">
              <span className="cal-add-label">In agenda:</span>
              <a href={googleCalUrl(event)} className="cal-add-btn" target="_blank" rel="noopener" onClick={(e) => e.stopPropagation()}>
                <i className="fa-brands fa-google"></i> Google
              </a>
              <a href={`/api/kalender/ics?event=${event.id}`} className="cal-add-btn" onClick={(e) => e.stopPropagation()}>
                <i className="fa-regular fa-calendar"></i> Apple / Outlook
              </a>
            </div>
          )}
        </div>
      </article>

      {open && (
        <div className="cal-modal-overlay" onClick={() => setOpen(false)} role="dialog" aria-modal="true">
          <div className="cal-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="cal-modal-close" aria-label="Sluiten" onClick={() => setOpen(false)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
            {event.cover_image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={event.cover_image} alt={event.title} className="cal-modal-cover" />
            )}
            <div className="cal-modal-body">
              <span className="cal-modal-eyebrow"><i className="fa-solid fa-star"></i> Evenement</span>
              <h3 className="cal-modal-title">{event.title}</h3>
              <div className="cal-event-meta cal-modal-meta">
                <span><i className="fa-regular fa-calendar"></i> {weekday} {dateStr}</span>
                {event.time && <span><i className="fa-regular fa-clock"></i> {event.time}</span>}
                {event.location && <span><i className="fa-solid fa-location-dot"></i> {event.location}</span>}
              </div>
              {event.description && <p className="cal-modal-desc">{event.description}</p>}
              <div className="cal-modal-actions">
                {event.document_url && (
                  <a href={event.document_url} target="_blank" rel="noopener" className="btn btn-secondary">
                    <i className="fa-solid fa-file-arrow-down"></i> Uitnodiging downloaden
                  </a>
                )}
                <a href={googleCalUrl(event)} className="btn btn-outline" target="_blank" rel="noopener">
                  <i className="fa-brands fa-google"></i> Google Agenda
                </a>
                <a href={`/api/kalender/ics?event=${event.id}`} className="btn btn-outline">
                  <i className="fa-regular fa-calendar"></i> Apple / Outlook
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
