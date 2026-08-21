'use client'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CalendarEvent } from '@/lib/types'
import { AUDIENCE_NAMEN, AUDIENCE_KLEUREN, PORTAAL_AUDIENCE_KLEUREN } from '@/lib/constants'

const MONTHS_NL = ['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December']
const MONTHS_SHORT: Record<number, string> = {1:'Jan',2:'Feb',3:'Mrt',4:'Apr',5:'Mei',6:'Jun',7:'Jul',8:'Aug',9:'Sep',10:'Okt',11:'Nov',12:'Dec'}
const WEEKDAYS = ['zondag','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag']
const WEEKDAYS_SHORT = ['zo','ma','di','wo','do','vr','za']

export function getEventDateDetails(event: CalendarEvent) {
  const [yy, mm, dd] = event.date.split('-').map(Number)
  const dStart = new Date(yy, (mm ?? 1) - 1, dd ?? 1)
  const wStart = WEEKDAYS[dStart.getDay()]
  const dayStart = dStart.getDate()
  const monthStart = MONTHS_NL[dStart.getMonth()]
  const yearStart = dStart.getFullYear()

  const isMultiDay = !!(event.datum_tot && event.datum_tot !== event.date)

  if (isMultiDay) {
    const [tY, tM, tD] = event.datum_tot!.split('-').map(Number)
    const dEnd = new Date(tY, (tM ?? 1) - 1, tD ?? 1)
    const wEnd = WEEKDAYS[dEnd.getDay()]
    const dayEnd = dEnd.getDate()
    const monthEnd = MONTHS_NL[dEnd.getMonth()]

    const parts = event.time ? event.time.split(/\s*[-–]\s*/) : []
    const tStart = parts[0]?.trim()
    const tEnd = parts[1]?.trim()

    const startLine = tStart ? `${tStart} ${wStart} ${dayStart} ${monthStart}` : `${wStart} ${dayStart} ${monthStart}`
    const endLine = tEnd ? `${tEnd} ${wEnd} ${dayEnd} ${monthEnd}` : `${wEnd} ${dayEnd} ${monthEnd}`

    const wStartShort = WEEKDAYS_SHORT[dStart.getDay()]
    const mStartShort = MONTHS_SHORT[dStart.getMonth() + 1]
    const wEndShort = WEEKDAYS_SHORT[dEnd.getDay()]
    const mEndShort = MONTHS_SHORT[dEnd.getMonth() + 1]

    const cardSummary = tStart && tEnd
      ? `${tStart} ${wStartShort} ${dayStart} ${mStartShort} - ${tEnd} ${wEndShort} ${dayEnd} ${mEndShort}`
      : `${wStartShort} ${dayStart} ${mStartShort} - ${wEndShort} ${dayEnd} ${mEndShort}`

    return {
      isMultiDay: true,
      startLine,
      endLine,
      cardSummary
    }
  }

  // Single day
  const singleDateStr = `${wStart} ${dayStart} ${monthStart} ${yearStart}`
  const cardSummary = `${wStart} ${dayStart} ${MONTHS_SHORT[dStart.getMonth() + 1]}`

  return {
    isMultiDay: false,
    singleDateStr,
    timeStr: event.time || null,
    cardSummary
  }
}

function googleCalUrl(event: CalendarEvent) {
  const d = event.date.replace(/-/g, '')
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${d}/${d}&details=${encodeURIComponent(event.description ?? '')}&location=${encodeURIComponent(event.location ?? '')}`
}

export function EventDetailDialog({ event, todayMs, onClose, onEdit, isPortal }: { event: CalendarEvent; todayMs: number; onClose: () => void; onEdit?: () => void; isPortal?: boolean }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  const [yy, mm, dd] = event.date.split('-').map(Number)
  const d = new Date(yy, (mm ?? 1) - 1, dd ?? 1)
  const dateInfo = getEventDateDetails(event)

  const diff = Math.round((d.getTime() - todayMs) / 86400000)
  const countdown = diff === 0 ? 'Vandaag' : diff === 1 ? 'Morgen' : diff > 1 ? `Nog ${diff} dagen` : 'Afgelopen'

  const titleColor = isPortal ? '#162544' : 'var(--color-primary-dark, #40050E)'
  const metaBg = isPortal ? '#EBF0F9' : '#FAF6EE'
  const metaBorder = isPortal ? '1.5px solid #D0DCEE' : '1.5px solid #EADECC'
  const metaIconColor = isPortal ? '#243B6B' : 'var(--color-primary, #650B19)'
  const metaTextColor = isPortal ? '#162544' : 'var(--color-primary-dark, #40050E)'
  const countdownBg = isPortal ? '#EBF0F9' : '#FAF6EE'
  const countdownBorder = isPortal ? '1px solid #D0DCEE' : '1px solid #EADECC'
  const countdownColor = isPortal ? '#162544' : 'var(--color-primary-dark, #40050E)'

  if (!mounted || typeof document === 'undefined') return null

  return createPortal(
    <>
      <div
        className="portaal-modal-overlay kalender-modal-overlay event-modal-overlay"
        style={{ position: 'fixed', inset: 0, background: 'rgba(10,0,5,0.5)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', zIndex: 3500 }}
        onClick={onClose}
      />
      <div className="portaal-modal-overlay kalender-modal-overlay event-modal-overlay" style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3501, padding: '36px 16px', pointerEvents: 'none' }}>
        <div
          style={{ position: 'relative', pointerEvents: 'auto', background: '#fff', borderRadius: 22, boxShadow: '0 40px 100px rgba(58,7,16,0.26), 0 0 0 1px rgba(0,0,0,0.04)', width: '95%', maxWidth: 960, maxHeight: 'calc(100vh - 90px)', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Banner / Cover Image */}
          {event.banner_image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.banner_image} alt={event.title} style={{ width: '100%', maxHeight: 290, objectFit: 'cover', borderRadius: '22px 22px 0 0', display: 'block' }} />
          )}

          <div className="cal-modal-content-inner">
            {/* Header: Linksboven (Titel + Tags inline) en Rechtsboven (Klok/Dagen + Bewerken + Sluiten) */}
            <div className="cal-modal-title-wrap" style={{ paddingRight: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                {/* Linksboven: Titel + Tags inline */}
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: 0, color: titleColor, fontSize: '1.75rem', fontWeight: 900, lineHeight: 1.2, fontFamily: 'var(--font-heading, Nunito, sans-serif)' }}>
                    {event.title}
                  </h3>
                  {event.audience && event.audience.length > 0 && (
                    <div style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      {event.audience.map((tag) => {
                        const isYellow = tag === 'kapoenen'
                        const tagBg = isYellow ? '#FEF3D6' : `${(isPortal ? PORTAAL_AUDIENCE_KLEUREN[tag] : AUDIENCE_KLEUREN[tag]) || '#1A3D2A'}1E`
                        const tagColor = isYellow ? '#8C6700' : ((isPortal ? PORTAAL_AUDIENCE_KLEUREN[tag] : AUDIENCE_KLEUREN[tag]) || '#1A3D2A')
                        return (
                          <span
                            key={tag}
                            style={{
                              padding: '3px 10px',
                              borderRadius: 20,
                              fontSize: '11px',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: '0.4px',
                              background: isPortal ? tagBg : `${AUDIENCE_KLEUREN[tag] || '#1A3D2A'}18`,
                              color: isPortal ? tagColor : (AUDIENCE_KLEUREN[tag] || '#1A3D2A'),
                              border: isPortal ? 'none' : `1px solid ${AUDIENCE_KLEUREN[tag] || '#1A3D2A'}40`,
                              lineHeight: 1.3,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {AUDIENCE_NAMEN[tag] || tag}
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Rechtsboven: (klokicoon x dagen) (bewerken) (x) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: '.8rem', fontWeight: 700, padding: '5px 12px', borderRadius: 99, background: countdownBg, color: countdownColor, border: countdownBorder, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <i className="fa-regular fa-clock" style={{ fontSize: '.76rem' }}></i> {countdown}
                  </span>

                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose()
                        onEdit()
                      }}
                      style={{
                        height: 32,
                        padding: '0 14px',
                        borderRadius: 16,
                        border: 'none',
                        background: '#243B6B',
                        color: '#fff',
                        fontSize: '.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        boxShadow: '0 2px 6px rgba(36,59,107,0.2)',
                        fontFamily: 'inherit',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <i className="fa-solid fa-pen" style={{ fontSize: '.75rem' }}></i> Bewerken
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      border: 'none',
                      background: isPortal ? '#EBF0F9' : '#F0ECE4',
                      color: isPortal ? '#162544' : '#555',
                      fontSize: '.85rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease',
                    }}
                    aria-label="Sluiten"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            {/* Key Details Meta Box */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: metaBg, border: metaBorder, borderRadius: 14, padding: '16px 20px' }}>
              {dateInfo.isMultiDay ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '.95rem', color: metaTextColor }}>
                    <i className="fa-regular fa-calendar-check" style={{ color: metaIconColor, width: 16, textAlign: 'center' }}></i>
                    <span style={{ fontWeight: 700 }}>{dateInfo.startLine}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '.95rem', color: metaTextColor }}>
                    <i className="fa-solid fa-flag-checkered" style={{ color: metaIconColor, width: 16, textAlign: 'center' }}></i>
                    <span style={{ fontWeight: 700 }}>{dateInfo.endLine}</span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '.95rem', color: metaTextColor }}>
                    <i className="fa-regular fa-calendar" style={{ color: metaIconColor, width: 16, textAlign: 'center' }}></i>
                    <span style={{ fontWeight: 700 }}>{dateInfo.singleDateStr}</span>
                  </div>
                  {dateInfo.timeStr && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '.95rem', color: metaTextColor }}>
                      <i className="fa-regular fa-clock" style={{ color: metaIconColor, width: 16, textAlign: 'center' }}></i>
                      <span><strong>Tijdstip:</strong> {dateInfo.timeStr}</span>
                    </div>
                  )}
                </>
              )}
              {event.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '.95rem', color: metaTextColor }}>
                  <i className="fa-solid fa-location-dot" style={{ color: metaIconColor, width: 16, textAlign: 'center' }}></i>
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
              <div style={{ background: '#fff', fontSize: '1.08rem', color: '#2B2B2B', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
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
    </>,
    document.body
  )
}

export default function UpcomingEvent({ event, todayMs, featured, compact }: { event: CalendarEvent; todayMs: number; featured?: boolean; compact?: boolean }) {
  const [open, setOpen] = useState(false)

  // Lokaal parsen
  const [yy, mm, dd] = event.date.split('-').map(Number)
  const d = new Date(yy, (mm ?? 1) - 1, dd ?? 1)
  const day = String(d.getDate()).padStart(2, '0')
  const month = MONTHS_SHORT[d.getMonth() + 1]

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
          <h4 className="event-card-compact-title" style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--color-primary-dark, #40050E)', lineHeight: 1.2 }}>{event.title}</h4>
          <span className={`event-card-compact-badge ${event.is_evenement ? 'badge-star' : isNoMeeting ? 'badge-neutral' : 'badge-primary'}`}>
            <i className="fa-regular fa-clock"></i> {countdown}
          </span>
        </div>
        {event.location && (
          <div className="event-card-compact-meta" style={{ marginTop: 2, fontSize: '.73rem', color: '#777', fontWeight: 600 }}>
            <span>
              <i className="fa-solid fa-location-dot" style={{ fontSize: '.7rem', color: '#999', marginRight: 4 }}></i> {event.location}
            </span>
          </div>
        )}
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
          <div className="event-card-v2-datebox" aria-hidden="true">
            <span className="event-card-v2-day">{day}</span>
            <span className="event-card-v2-month">{month}</span>
          </div>
          <div className="event-card-v2-header-info">
            <div className="event-card-v2-header-top" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
              <span className={`event-card-v2-badge ${event.is_evenement ? 'badge-star' : isNoMeeting ? 'badge-neutral' : 'badge-primary'}`}>
                <i className="fa-regular fa-clock"></i> {countdown}
              </span>
            </div>
            <h3 className="event-card-v2-title" style={{ fontSize: featured ? '1.55rem' : '1.4rem', fontWeight: 900, marginTop: 0, color: 'var(--color-primary-dark, #40050E)' }}>{event.title}</h3>
          </div>
        </div>

        {((featured && event.time) || event.location) && (
          <div className="event-card-v2-meta" style={{ marginTop: 4, marginBottom: 6, fontSize: '.82rem', color: '#777', fontWeight: 600 }}>
            {featured && event.time && (
              <span className="event-card-v2-meta-item">
                <i className="fa-regular fa-clock"></i> {event.time}
              </span>
            )}
            {event.location && (
              <span className="event-card-v2-meta-item">
                <i className="fa-solid fa-location-dot" style={{ fontSize: '.78rem', color: '#999' }}></i> {event.location}
              </span>
            )}
          </div>
        )}

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

