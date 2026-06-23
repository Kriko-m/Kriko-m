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
            style={{ position: 'fixed', inset: 0, background: 'rgba(10,0,5,0.5)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', zIndex: 2000 }}
            onClick={() => setOpen(false)}
          />
          <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2001, padding: '16px', pointerEvents: 'none' }}>
            <div
              style={{ position: 'relative', pointerEvents: 'auto', background: '#fff', borderRadius: 22, boxShadow: '0 40px 100px rgba(58,7,16,0.26), 0 0 0 1px rgba(0,0,0,0.04)', width: '100%', maxWidth: 860, maxHeight: '90vh', overflow: 'auto', display: 'flex', flexDirection: 'column' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Banner image */}
              {event.banner_image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={event.banner_image} alt="" style={{ width: '100%', maxHeight: 260, objectFit: 'cover', borderRadius: '22px 22px 0 0', display: 'block' }} />
              )}

              {/* Close button — always top-right, floats over banner if present */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: '50%', border: 'none', background: event.banner_image ? 'rgba(0,0,0,0.35)' : 'rgba(240,236,228,0.9)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', color: event.banner_image ? '#fff' : '#555', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}
                aria-label="Sluiten"
              >
                ✕
              </button>

              <div style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Title */}
                <div style={{ paddingRight: 24 }}>
                  {event.is_evenement && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.7rem', fontWeight: 700, color: 'var(--color-accent)', marginBottom: 8, letterSpacing: '0.07em', textTransform: 'uppercase' as const }}>
                      <i className="fa-solid fa-star"></i> Uitgelicht evenement
                    </span>
                  )}
                  <h3 style={{ margin: 0, color: 'var(--color-primary-dark, #3a0710)', fontSize: '1.75rem', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.01em' }}>{event.title}</h3>
                </div>

                {/* Meta card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9, background: '#faf9f7', border: '1px solid #ede9e1', borderRadius: 12, padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '.88rem', color: '#333' }}>
                    <i className="fa-regular fa-calendar" style={{ color: 'var(--color-accent)', width: 14, textAlign: 'center' as const }}></i>
                    <span style={{ fontWeight: 600 }}>{weekday} {dateStr}</span>
                  </div>
                  {event.time && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '.88rem', color: '#333' }}>
                      <i className="fa-regular fa-clock" style={{ color: 'var(--color-accent)', width: 14, textAlign: 'center' as const }}></i>
                      <span>{event.time}</span>
                    </div>
                  )}
                  {event.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '.88rem', color: '#333' }}>
                      <i className="fa-solid fa-location-dot" style={{ color: 'var(--color-accent)', width: 14, textAlign: 'center' as const }}></i>
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>

                {/* Hero image */}
                {event.cover_image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={event.cover_image} alt={event.title} style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 12, display: 'block' }} />
                )}

                {/* Sub-header */}
                {event.header && (
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-primary-dark, #3a0710)', lineHeight: 1.4 }}>{event.header}</p>
                )}

                {/* Body / description */}
                {(event.body || event.description) && (
                  <p style={{ margin: 0, fontSize: '.92rem', color: '#444', lineHeight: 1.72, whiteSpace: 'pre-wrap' }}>
                    {event.body || event.description}
                  </p>
                )}

                {/* Facebook post embed */}
                {event.facebook_post_url && (
                  <div style={{ display: 'flex', justifyContent: 'center', borderRadius: 12, border: '1px solid #ede9e1', overflow: 'hidden', background: '#f0f2f5' }}>
                    <iframe
                      src={`https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(event.facebook_post_url)}&show_text=true&width=500`}
                      width="500"
                      height="500"
                      style={{ border: 'none', display: 'block' }}
                      scrolling="no"
                      allowFullScreen
                      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    />
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingTop: 16, borderTop: '1px solid #ede9e1' }}>
                  {event.document_url && (
                    <a href={event.document_url} target="_blank" rel="noopener" className="cal-add-btn cal-add-btn--primary">
                      <i className="fa-solid fa-file-arrow-down"></i> Uitnodiging
                    </a>
                  )}
                  <a href={googleCalUrl(event)} className="cal-add-btn" target="_blank" rel="noopener">
                    <i className="fa-brands fa-google"></i> Google
                  </a>
                  <button
                    type="button"
                    className="cal-add-btn"
                    onClick={() => { window.location.href = `webcal://${window.location.host}/api/kalender/ics?event=${event.id}` }}
                  >
                    <i className="fa-brands fa-apple"></i> Apple
                  </button>
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
