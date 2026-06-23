'use client'
import { useState } from 'react'
import { CalendarEvent } from '@/lib/types'

const MONTHS_NL = ['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December']
const MONTHS_SHORT: Record<number, string> = {1:'Jan',2:'Feb',3:'Mrt',4:'Apr',5:'Mei',6:'Jun',7:'Jul',8:'Aug',9:'Sep',10:'Okt',11:'Nov',12:'Dec'}
const WEEKDAYS = ['zondag','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag']

function googleCalUrl(event: CalendarEvent) {
  const d = event.date.replace(/-/g, '')
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${d}/${d}&details=${encodeURIComponent(event.description ?? '')}&location=${encodeURIComponent(event.location ?? '')}`
}

// Eén kaart in "Aankomende activiteiten". Evenementen (is_evenement) met extra
// content klappen bij klik INLINE open: banner, hero-foto, header, volledige
// uitnodigingstekst en de uitnodiging-download verschijnen in de kaart zelf.
export default function UpcomingEvent({ event, todayMs }: { event: CalendarEvent; todayMs: number }) {
  const [open, setOpen] = useState(false)
  const hasRichContent = !!(event.banner_image || event.cover_image || event.body || event.document_url)
  const canExpand = event.is_evenement && (hasRichContent || !!event.description)

  const d = new Date(event.date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = MONTHS_SHORT[d.getMonth() + 1]
  const weekday = WEEKDAYS[d.getDay()]
  const dateStr = `${d.getDate()} ${MONTHS_NL[d.getMonth()]} ${d.getFullYear()}`
  const diff = Math.round((d.getTime() - todayMs) / 86400000)
  const countdown = diff === 0 ? 'Vandaag' : diff === 1 ? 'Morgen' : `Nog ${diff} dagen`

  return (
    <article
      className={`cal-event${event.is_evenement ? ' cal-event-evenement' : ''}${open ? ' is-open' : ''}`}
      id={`event-${event.id}`}
      data-date={event.date}
      onClick={canExpand ? () => setOpen(o => !o) : undefined}
      style={canExpand ? { cursor: 'pointer' } : undefined}
      aria-expanded={canExpand ? open : undefined}
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
        {event.description && !open && <p className="cal-event-desc">{event.description}</p>}

        {/* Compacte hint dat de kaart uitklapbaar is */}
        {canExpand && !open && event.cover_image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.cover_image} alt={event.title} className="cal-event-cover-thumb" />
        )}

        {/* ── Inline uitgeklapte detailweergave ── */}
        {canExpand && open && (
          <div className="cal-event-detail" onClick={(e) => e.stopPropagation()}>
            {event.banner_image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={event.banner_image} alt="" className="cal-event-banner" />
            )}
            {event.cover_image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={event.cover_image} alt={event.title} className="cal-event-hero" />
            )}
            {event.header && <p className="cal-event-header">{event.header}</p>}
            {event.body
              ? <p className="cal-event-fulltext">{event.body}</p>
              : event.description && <p className="cal-event-fulltext">{event.description}</p>}

            <div className="cal-event-actions">
              {event.document_url && (
                <a href={event.document_url} target="_blank" rel="noopener" className="cal-add-btn cal-add-btn--primary" onClick={(e) => e.stopPropagation()}>
                  <i className="fa-solid fa-file-arrow-down"></i> Uitnodiging
                </a>
              )}
              <a href={googleCalUrl(event)} className="cal-add-btn" target="_blank" rel="noopener" onClick={(e) => e.stopPropagation()}>
                <i className="fa-brands fa-google"></i> Google
              </a>
              <a href={`/api/kalender/ics?event=${event.id}`} className="cal-add-btn" onClick={(e) => e.stopPropagation()}>
                <i className="fa-regular fa-calendar"></i> Apple / Outlook
              </a>
            </div>
          </div>
        )}

        {/* Acties — toggle bij uitklapbare events, anders direct agenda-knoppen */}
        {canExpand ? (
          <div className="cal-event-actions">
            <button type="button" className="cal-add-btn cal-expand-btn" onClick={(e) => { e.stopPropagation(); setOpen(o => !o) }}>
              <i className={`fa-solid fa-chevron-${open ? 'up' : 'down'}`}></i> {open ? 'Minder' : 'Meer info'}
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
  )
}
