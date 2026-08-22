'use client'
import { useState, useEffect } from 'react'
import { useScrollLock } from '@/lib/useScrollLock'

interface SubscribeCalendarButtonProps {
  feedPath?: string
  calendarName?: string
  buttonClassName?: string
  buttonText?: string
  buttonStyle?: React.CSSProperties
}

export default function SubscribeCalendarButton({
  feedPath = '/api/kalender/ics',
  calendarName = 'Scouts Kriko-M',
  buttonClassName = 'btn btn-secondary cal-actions-btn',
  buttonText = 'Abonneer op onze agenda',
  buttonStyle,
}: SubscribeCalendarButtonProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState('')

  useScrollLock(open)

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const feedUrl = `${origin}${feedPath}`
  const webcalUrl = feedUrl.replace(/^https?:/, 'webcal:')
  const googleUrl = `https://calendar.google.com/calendar/r/settings/addbyurl?url=${encodeURIComponent(feedUrl)}`
  const outlookUrl = `https://outlook.live.com/calendar/0/addcalendar?url=${encodeURIComponent(feedUrl)}&name=${encodeURIComponent(calendarName)}`
  const downloadUrl = `${feedUrl}${feedPath.includes('?') ? '&' : '?'}download=1`

  const handleCopy = () => {
    navigator.clipboard.writeText(feedUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className={buttonClassName} style={buttonStyle}>
        <i className="fa-regular fa-calendar-plus"></i> {buttonText}
      </button>

      {open && (
        <div className="cal-modal-overlay" onClick={() => setOpen(false)} role="dialog" aria-modal="true">
          <div className="cal-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <button type="button" className="cal-modal-close" aria-label="Sluiten" onClick={() => setOpen(false)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
            <div className="cal-modal-body">
              <span className="cal-modal-eyebrow" style={{ color: '#243B6B' }}>
                <i className="fa-solid fa-calendar-days"></i> Kalender koppelen
              </span>
              <h3 className="cal-modal-title" style={{ color: '#162544', fontFamily: 'var(--font-heading, Nunito, sans-serif)', fontWeight: 900 }}>Abonneer op de agenda</h3>
              <p className="cal-modal-desc" style={{ fontSize: '0.9rem', marginBottom: '18px', color: '#555' }}>
                Koppel de agenda van {calendarName} aan jouw persoonlijke agenda-app. Nieuwe activiteiten en wijzigingen worden dan automatisch gesynchroniseerd!
              </p>

              <div className="cal-sub-grid">
                <a href={googleUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline cal-sub-btn" style={{ borderColor: '#D0DCEE', borderRadius: 10 }}>
                  <i className="fa-brands fa-google" style={{ color: '#4285F4' }}></i> Google Agenda
                </a>
                <a href={webcalUrl} className="btn btn-outline cal-sub-btn" style={{ borderColor: '#D0DCEE', borderRadius: 10 }}>
                  <i className="fa-brands fa-apple" style={{ color: '#000' }}></i> Apple / Outlook
                </a>
                <a href={outlookUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline cal-sub-btn" style={{ borderColor: '#D0DCEE', borderRadius: 10 }}>
                  <i className="fa-brands fa-microsoft" style={{ color: '#0078D4' }}></i> Outlook Web
                </a>
                <a href={downloadUrl} className="btn btn-outline cal-sub-btn" style={{ borderColor: '#D0DCEE', borderRadius: 10 }}>
                  <i className="fa-solid fa-download"></i> Download .ics
                </a>
              </div>

              <div className="cal-sub-divider">
                <label className="cal-sub-copy-title" style={{ color: '#162544' }}>Handmatige link (URL kopiëren):</label>
                <div className="cal-sub-copy-box">
                  <input
                    type="text"
                    readOnly
                    value={feedUrl}
                    className="cal-sub-input"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button onClick={handleCopy} style={{ padding: '8px 16px', fontSize: '0.82rem', whiteSpace: 'nowrap', background: '#243B6B', color: '#FFFFFF', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
                    {copied ? 'Gekopieerd!' : 'Kopieer link'}
                  </button>
                </div>
                <p className="cal-sub-info-text">
                  Gebruik je een andere agenda-app (zoals Thunderbird of Yahoo)? Kopieer de bovenstaande link en voeg deze toe onder de optie &ldquo;Nieuw agenda-abonnement&rdquo; of &ldquo;Toevoegen via URL&rdquo;.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
