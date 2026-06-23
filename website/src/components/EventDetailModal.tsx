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

export default function UpcomingEvent({ event, todayMs }: { event: CalendarEvent; todayMs: number }) {
  const [open, setOpen] = useState(false)

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
        onClick={() => setOpen(true)}
        style={{ cursor: 'pointer' }}
        role="button"
        aria-haspopup="dialog"
      >
        <div className="cal-event-date" aria-hidden="true">
          <span className="cal-event-day">{day}</span>
          <span className="cal-event-month">{month}</span>
        </div>
        <div className="cal-event-body">
          <span className={`cal-countdown${event.is_evenement ? ' cal-countdown--evenement' : ''}`}>
            {event.is_evenement && <i className="fa-solid fa-star" style={{ marginRight: 6 }} />}
            {countdown}
          </span>
          <h4 className="cal-event-title">{event.title}</h4>
          <div className="cal-event-meta">
            <span><i className="fa-regular fa-calendar"></i> {weekday} {dateStr}</span>
            {event.time && <span><i className="fa-regular fa-clock"></i> {event.time}</span>}
            {event.location && <span><i className="fa-solid fa-location-dot"></i> {event.location}</span>}
          </div>
          {event.description && <p className="cal-event-desc">{event.description}</p>}

          <div className="cal-event-actions">
            <button type="button" className="cal-add-btn cal-expand-btn" onClick={(e) => { e.stopPropagation(); setOpen(true) }}>
              <i className="fa-solid fa-circle-info"></i> Meer info
            </button>
          </div>
        </div>
      </article>

      {/* Modal */}
      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 2000 }}
            onClick={() => setOpen(false)}
          />
          <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2001, padding: 16, pointerEvents: 'none' }}>
            <div
              style={{ pointerEvents: 'auto', background: '#fff', borderRadius: 18, boxShadow: '0 24px 72px rgba(0,0,0,0.28)', width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto', display: 'flex', flexDirection: 'column' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Banner image */}
              {event.banner_image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={event.banner_image} alt="" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: '18px 18px 0 0', display: 'block' }} />
              )}

              <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div>
                    {event.is_evenement && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.72rem', fontWeight: 700, color: 'var(--color-accent)', marginBottom: 6 }}>
                        <i className="fa-solid fa-star"></i> Uitgelicht evenement
                      </span>
                    )}
                    <h3 style={{ margin: 0, color: 'var(--color-primary-dark, #3a0710)', fontSize: '1.4rem', fontWeight: 900, lineHeight: 1.2 }}>{event.title}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 8, border: 'none', background: '#F0ECE4', color: '#555', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    aria-label="Sluiten"
                  >
                    ✕
                  </button>
                </div>

                {/* Meta info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '.88rem', color: '#444' }}>
                    <i className="fa-regular fa-calendar" style={{ color: 'var(--color-accent)', width: 16 }}></i>
                    <span>{weekday} {dateStr}</span>
                  </div>
                  {event.time && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '.88rem', color: '#444' }}>
                      <i className="fa-regular fa-clock" style={{ color: 'var(--color-accent)', width: 16 }}></i>
                      <span>{event.time}</span>
                    </div>
                  )}
                  {event.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '.88rem', color: '#444' }}>
                      <i className="fa-solid fa-location-dot" style={{ color: 'var(--color-accent)', width: 16 }}></i>
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>

                {/* Hero image */}
                {event.cover_image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={event.cover_image} alt={event.title} style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 10, display: 'block' }} />
                )}

                {/* Sub-header */}
                {event.header && (
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: 'var(--color-primary-dark, #3a0710)' }}>{event.header}</p>
                )}

                {/* Body / description */}
                {(event.body || event.description) && (
                  <p style={{ margin: 0, fontSize: '.9rem', color: '#333', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {event.body || event.description}
                  </p>
                )}

                {/* Facebook post embed */}
                {event.facebook_post_url && (
                  <div style={{ overflow: 'hidden', borderRadius: 10 }}>
                    <iframe
                      src={`https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(event.facebook_post_url)}&show_text=true&width=500`}
                      width="100%"
                      height="500"
                      style={{ border: 'none', display: 'block' }}
                      scrolling="no"
                      allowFullScreen
                      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    />
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingTop: 4, borderTop: '1px solid #F0ECE4' }}>
                  {event.document_url && (
                    <a href={event.document_url} target="_blank" rel="noopener" className="cal-add-btn cal-add-btn--primary">
                      <i className="fa-solid fa-file-arrow-down"></i> Uitnodiging
                    </a>
                  )}
                  <a href={googleCalUrl(event)} className="cal-add-btn" target="_blank" rel="noopener">
                    <i className="fa-brands fa-google"></i> Google
                  </a>
                  <a href={`/api/kalender/ics?event=${event.id}`} className="cal-add-btn">
                    <i className="fa-regular fa-calendar"></i> Apple / Outlook
                  </a>
                  {event.facebook_event_url && (
                    <a href={event.facebook_event_url} target="_blank" rel="noopener" className="cal-add-btn">
                      <i className="fa-brands fa-facebook"></i> Facebook
                    </a>
                  )}
                  {event.external_link_url && (
                    <a href={event.external_link_url} target="_blank" rel="noopener" className="cal-add-btn">
                      <i className="fa-solid fa-arrow-up-right-from-square"></i> Meer info
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
