'use client'
import { useState } from 'react'
import { CalendarEvent } from '@/lib/types'
import { AUDIENCE_NAMEN, AUDIENCE_KLEUREN } from '@/lib/constants'

const MONTHS_NL = ['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December']
const MONTHS_SHORT: Record<number, string> = {1:'Jan',2:'Feb',3:'Mrt',4:'Apr',5:'Mei',6:'Jun',7:'Jul',8:'Aug',9:'Sep',10:'Okt',11:'Nov',12:'Dec'}
const WEEKDAYS = ['zondag','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag']

function googleCalUrl(event: CalendarEvent) {
  const d = event.date.replace(/-/g, '')
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${d}/${d}&details=${encodeURIComponent(event.description ?? '')}&location=${encodeURIComponent(event.location ?? '')}`
}

export function EventDetailDialog({ event, todayMs, onClose, onEdit }: { event: CalendarEvent; todayMs: number; onClose: () => void; onEdit?: () => void }) {
  const [yy, mm, dd] = event.date.split('-').map(Number)
  const d = new Date(yy, (mm ?? 1) - 1, dd ?? 1)
  const weekday = WEEKDAYS[d.getDay()]
  const dateStr = `${d.getDate()} ${MONTHS_NL[d.getMonth()]} ${d.getFullYear()}`

  let formattedFullDate = `${weekday} ${dateStr}`
  if (event.datum_tot && event.datum_tot !== event.date) {
    const [tY, tM, tD] = event.datum_tot.split('-').map(Number)
    const dTot = new Date(tY, (tM ?? 1) - 1, tD ?? 1)
    const endStr = `${dTot.getDate()} ${MONTHS_NL[dTot.getMonth()]} ${dTot.getFullYear()}`
    formattedFullDate = `${d.getDate()} ${MONTHS_SHORT[d.getMonth() + 1]} - ${endStr}`
  }

  const diff = Math.round((d.getTime() - todayMs) / 86400000)
  const countdown = diff === 0 ? 'Vandaag' : diff === 1 ? 'Morgen' : diff > 1 ? `Nog ${diff} dagen` : 'Afgelopen'

  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(10,0,5,0.5)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', zIndex: 2000 }}
        onClick={onClose}
      />
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2001, padding: '16px', pointerEvents: 'none' }}>
        <div
          style={{ position: 'relative', pointerEvents: 'auto', background: '#fff', borderRadius: 22, boxShadow: '0 40px 100px rgba(58,7,16,0.26), 0 0 0 1px rgba(0,0,0,0.04)', width: '100%', maxWidth: 822, maxHeight: '90vh', overflow: 'auto', display: 'flex', flexDirection: 'column' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Banner / Cover Image */}
          {event.banner_image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.banner_image} alt={event.title} style={{ width: '100%', maxHeight: 260, objectFit: 'cover', borderRadius: '22px 22px 0 0', display: 'block' }} />
          )}

          {/* Edit button for leiding */}
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose()
                onEdit()
              }}
              style={{
                position: 'absolute',
                top: 16,
                right: 60,
                height: 36,
                padding: '0 14px',
                borderRadius: 18,
                border: 'none',
                background: '#1A3D2A',
                color: '#fff',
                fontSize: '.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                zIndex: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              <i className="fa-solid fa-pen"></i> Bewerken
            </button>
          )}

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            style={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: '50%', border: 'none', background: event.banner_image ? 'rgba(0,0,0,0.45)' : 'rgba(240,236,228,0.9)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', color: event.banner_image ? '#fff' : '#555', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}
            aria-label="Sluiten"
          >
            ✕
          </button>

          <div style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Title, Audience Tags & Countdown Badge */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingRight: onEdit ? 120 : 40 }}>
              {event.audience && event.audience.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {event.audience.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: '2px 10px',
                        borderRadius: 20,
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        background: `${AUDIENCE_KLEUREN[tag] || '#1A3D2A'}18`,
                        color: AUDIENCE_KLEUREN[tag] || '#1A3D2A',
                        border: `1px solid ${AUDIENCE_KLEUREN[tag] || '#1A3D2A'}40`,
                      }}
                    >
                      {AUDIENCE_NAMEN[tag] || tag}
                    </span>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <h3 style={{ margin: 0, color: 'var(--color-primary-dark, #3a0710)', fontSize: '1.8rem', fontWeight: 900, lineHeight: 1.15 }}>
                  {event.title}
                </h3>
                <span style={{ fontSize: '.78rem', fontWeight: 700, padding: '4px 12px', borderRadius: 99, background: 'var(--color-accent-light, #E2C58D)', color: '#3a0710', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {countdown}
                </span>
              </div>
            </div>

            {/* Key Details Meta Box */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: '#faf9f7', border: '1px solid #ede9e1', borderRadius: 14, padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '.95rem', color: '#222' }}>
                <i className="fa-regular fa-calendar" style={{ color: 'var(--color-accent)', width: 16, textAlign: 'center' }}></i>
                <span style={{ fontWeight: 700 }}>{formattedFullDate}</span>
              </div>
              {event.time && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '.95rem', color: '#222' }}>
                  <i className="fa-regular fa-clock" style={{ color: 'var(--color-accent)', width: 16, textAlign: 'center' }}></i>
                  <span><strong>Tijdstip:</strong> {event.time}</span>
                </div>
              )}
              {event.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '.95rem', color: '#222' }}>
                  <i className="fa-solid fa-location-dot" style={{ color: 'var(--color-accent)', width: 16, textAlign: 'center' }}></i>
                  <span><strong>Locatie:</strong> {event.location}</span>
                </div>
              )}
            </div>

            {/* Main Action Buttons */}
            {(event.external_link_url || event.document_url || event.facebook_event_url) && (
              <div className="cal-modal-action-row">
                {event.external_link_url && (
                  <a
                    href={event.external_link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary cal-modal-action-btn"
                  >
                    <i className="fa-solid fa-pen-to-square"></i> Inschrijven / Formulier
                  </a>
                )}
                {event.document_url && (
                  <a
                    href={event.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline cal-modal-action-btn"
                  >
                    <i className="fa-solid fa-file-pdf" style={{ color: '#d32f2f' }}></i> Uitnodiging bekijken
                  </a>
                )}
                {event.facebook_event_url && (
                  <a
                    href={event.facebook_event_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline cal-modal-action-btn cal-modal-btn-fb"
                  >
                    <i className="fa-brands fa-facebook"></i> Facebook Evenement
                  </a>
                )}
              </div>
            )}

            {/* Description */}
            {event.description && (
              <div style={{ background: '#fff', fontSize: '.95rem', color: '#333', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {event.description}
              </div>
            )}

            {/* Facebook Post Embed if present */}
            {event.facebook_post_url && (
              <div style={{ borderRadius: 12, border: '1px solid #ede9e1', overflow: 'hidden', background: '#f0f2f5' }}>
                <iframe
                  src={`https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(event.facebook_post_url)}&show_text=true&width=750`}
                  width="750"
                  height="720"
                  style={{ border: 'none', display: 'block', width: '100%' }}
                  scrolling="no"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                />
              </div>
            )}

            {/* Agenda Footer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 18, borderTop: '1px solid #ede9e1' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '.75rem', fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: 4 }}>
                  Zet in je agenda:
                </span>
                <a href={googleCalUrl(event)} className="cal-add-btn" target="_blank" rel="noopener noreferrer">
                  <i className="fa-brands fa-google"></i> Google Calendar
                </a>
                <button
                  type="button"
                  className="cal-add-btn"
                  onClick={() => { window.location.href = `webcal://${window.location.host}/api/kalender/ics?event=${event.id}` }}
                >
                  <i className="fa-brands fa-apple"></i> Apple Calendar
                </button>
                <a href={`/api/kalender/ics?event=${event.id}`} download className="cal-add-btn">
                  <i className="fa-solid fa-download"></i> Download .ics
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function UpcomingEvent({ event, todayMs, featured, compact }: { event: CalendarEvent; todayMs: number; featured?: boolean; compact?: boolean }) {
  const [open, setOpen] = useState(false)

  // Lokaal parsen
  const [yy, mm, dd] = event.date.split('-').map(Number)
  const d = new Date(yy, (mm ?? 1) - 1, dd ?? 1)
  const day = String(d.getDate()).padStart(2, '0')
  const month = MONTHS_SHORT[d.getMonth() + 1]
  const weekday = WEEKDAYS[d.getDay()]
  const dateStr = `${d.getDate()} ${MONTHS_NL[d.getMonth()]} ${d.getFullYear()}`
  
  let formattedFullDate = `${weekday} ${dateStr}`
  if (event.datum_tot && event.datum_tot !== event.date) {
    const [tY, tM, tD] = event.datum_tot.split('-').map(Number)
    const dTot = new Date(tY, (tM ?? 1) - 1, tD ?? 1)
    const endStr = `${dTot.getDate()} ${MONTHS_NL[dTot.getMonth()]} ${dTot.getFullYear()}`
    formattedFullDate = `${d.getDate()} ${MONTHS_SHORT[d.getMonth() + 1]} - ${endStr}`
  }

  const diff = Math.round((d.getTime() - todayMs) / 86400000)
  const countdown = diff === 0 ? 'Vandaag' : diff === 1 ? 'Morgen' : diff > 1 ? `${diff} dagen` : 'Afgelopen'
  const isNoMeeting = event.title.toLowerCase().includes('geen vergadering')

  const card = compact ? (
    <article
      className={`event-card-compact${event.is_evenement ? ' event-card-compact--featured' : ''}${isNoMeeting ? ' event-card-compact--nomeeting' : ''}`}
      id={`event-${event.id}`}
      onClick={() => setOpen(true)}
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(true) } }}
    >
      <div className="event-card-compact-datebox">
        <span className="event-card-compact-day">{day}</span>
        <span className="event-card-compact-month">{month}</span>
      </div>
      <div className="event-card-compact-info">
        <div className="event-card-compact-header">
          <h4 className="event-card-compact-title">{event.title}</h4>
          <span className={`event-card-compact-badge ${event.is_evenement ? 'badge-star' : isNoMeeting ? 'badge-neutral' : 'badge-primary'}`}>
            <i className="fa-regular fa-clock"></i> {countdown}
          </span>
        </div>
        <div className="event-card-compact-meta">
          <span><i className="fa-regular fa-calendar"></i> {weekday} {d.getDate()} {month}</span>
          {event.time && <span><i className="fa-regular fa-clock"></i> {event.time}</span>}
        </div>
      </div>
      <div className="event-card-compact-action">
        <i className="fa-solid fa-chevron-right"></i>
      </div>
    </article>
  ) : (
    <article
      className={`event-card-v2${featured ? ' event-card-v2--hero' : ''}${event.is_evenement ? ' event-card-v2--featured' : ''}${isNoMeeting ? ' event-card-v2--nomeeting' : ''}`}
      id={`event-${event.id}`}
      data-date={event.date}
      onClick={() => setOpen(true)}
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(true) } }}
    >
      {event.banner_image && (
        <div className="event-card-v2-banner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={event.banner_image} alt={event.title} />
        </div>
      )}

      <div className="event-card-v2-content">
        <div className="event-card-v2-top">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, minWidth: 0, flex: 1 }}>
            <div className="event-card-v2-datebox" aria-hidden="true">
              <span className="event-card-v2-day">{day}</span>
              <span className="event-card-v2-month">{month}</span>
            </div>
            <div className="event-card-v2-header-info">
              <div className="event-card-v2-weekday">{weekday}</div>
              <h3 className="event-card-v2-title" style={{ fontSize: featured ? '1.3rem' : '1.15rem' }}>{event.title}</h3>
            </div>
          </div>
          <span className={`event-card-v2-badge ${event.is_evenement ? 'badge-star' : isNoMeeting ? 'badge-neutral' : 'badge-primary'}`} style={{ flexShrink: 0, marginTop: 2 }}>
            <i className="fa-regular fa-clock"></i> {countdown}
          </span>
        </div>

        <div className="event-card-v2-meta">
          <span className="event-card-v2-meta-item">
            <i className="fa-regular fa-calendar"></i> {formattedFullDate}
          </span>
          {event.time && (
            <span className="event-card-v2-meta-item">
              <i className="fa-regular fa-clock"></i> {event.time}
            </span>
          )}
          {event.location && (
            <span className="event-card-v2-meta-item">
              <i className="fa-solid fa-location-dot"></i> {event.location}
            </span>
          )}
        </div>

        {event.description && (
          <p className="event-card-v2-desc" style={featured ? { WebkitLineClamp: 3 } : undefined}>
            {event.description}
          </p>
        )}

        <div className="event-card-v2-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {event.external_link_url && (
              <span className="event-card-v2-btn-pill">
                <i className="fa-solid fa-pen-to-square"></i> Inschrijven
              </span>
            )}
            {event.document_url && (
              <span className="event-card-v2-btn-pill">
                <i className="fa-solid fa-file-pdf"></i> Uitnodiging
              </span>
            )}
          </div>
          <span style={{ fontSize: '.9rem', fontWeight: 800, color: 'var(--color-primary-dark)', marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', padding: '6px 2px' }}>
            <i className="fa-solid fa-chevron-right"></i>
          </span>
        </div>
      </div>
    </article>
  )

  return (
    <>
      {card}
      {open && <EventDetailDialog event={event} todayMs={todayMs} onClose={() => setOpen(false)} />}
    </>
  )
}

