'use client'
import { useState, useEffect } from 'react'
import { CalendarEvent, Kamp } from '@/lib/types'

const TAK_NAMEN: Record<string, string> = {
  groep: 'Groep (Algemeen)',
  kapoenen: 'Kapoenen',
  welpen: 'Welpen',
  jonggivers: 'Jonggivers',
  givers: 'Givers',
}

const TAK_KLEUREN: Record<string, string> = {
  groep: '#1A3D2A',
  kapoenen: '#F4C842',
  welpen: '#5D9E6C',
  jonggivers: '#4A7BBF',
  givers: '#C9963A',
}

const MAANDEN_NL = [
  'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
  'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
]

interface Kind {
  id: string
  voornaam: string
  tak: string
}

interface OuderKalenderViewProps {
  initialEvents: CalendarEvent[]
  initialCamps: Kamp[]
  kinderen: Kind[]
}

interface UnifiedEvent {
  id: string
  title: string
  date: string
  endDate?: string
  time?: string
  location?: string
  description?: string
  tak: string
  type: 'event' | 'camp'
  prijs?: number
}

export default function OuderKalenderView({ initialEvents, initialCamps, kinderen }: OuderKalenderViewProps) {
  const [selectedTakken, setSelectedTakken] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState('')

  // Initialize selected branches
  useEffect(() => {
    setOrigin(window.location.origin)
    try {
      const saved = localStorage.getItem('kriko_selected_cal_takken')
      if (saved) {
        setSelectedTakken(JSON.parse(saved))
      } else {
        // Default: Group + children's branches
        const defaults = Array.from(new Set(['groep', ...kinderen.map(k => k.tak.toLowerCase())]))
        setSelectedTakken(defaults)
        localStorage.setItem('kriko_selected_cal_takken', JSON.stringify(defaults))
      }
    } catch (e) {
      setSelectedTakken(['groep'])
    }
  }, [kinderen])

  // Handle filter changes
  function toggleTak(tak: string) {
    const next = selectedTakken.includes(tak)
      ? selectedTakken.filter(t => t !== tak)
      : [...selectedTakken, tak]
    
    // Always keep at least one selected, or allow empty but warn
    setSelectedTakken(next)
    try {
      localStorage.setItem('kriko_selected_cal_takken', JSON.stringify(next))
    } catch {}
  }

  // Handle Copy to Clipboard
  function copyLink(url: string) {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Construct Subscription URLs
  const queryStr = selectedTakken.join(',')
  const httpUrl = `${origin}/api/kalender/ics?takken=${queryStr}`
  const webcalUrl = origin ? httpUrl.replace(/^http/, 'webcal') : ''

  // Filter and unify events
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const unified: UnifiedEvent[] = []

  // 1. Process regular calendar events
  for (const ev of initialEvents) {
    const tak = ev.tak || 'groep'
    if (selectedTakken.includes(tak)) {
      const evDate = new Date(ev.date + 'T00:00:00')
      if (evDate >= today) {
        unified.push({
          id: ev.id,
          title: ev.title,
          date: ev.date,
          time: ev.time,
          location: ev.location,
          description: ev.description,
          tak,
          type: 'event',
        })
      }
    }
  }

  // 2. Process camps/weekends
  for (const camp of initialCamps) {
    if (!camp.open_voor_inschrijving) continue
    
    // Matches if it's general ('alle') or if the specific tak is selected
    const matchesTak = camp.tak === 'alle' || selectedTakken.includes(camp.tak)
    if (matchesTak) {
      const endDate = new Date(camp.datum_tot + 'T23:59:59')
      if (endDate >= today) {
        unified.push({
          id: camp.id,
          title: camp.naam,
          date: camp.datum_van,
          endDate: camp.datum_tot,
          location: camp.locatie,
          description: camp.beschrijving,
          tak: camp.tak === 'alle' ? 'groep' : camp.tak,
          type: 'camp',
          prijs: camp.prijs,
        })
      }
    }
  }

  // Sort unified events chronologically
  unified.sort((a, b) => a.date.localeCompare(b.date))

  // Group events by Month/Year
  const groups: { monthKey: string; monthLabel: string; events: UnifiedEvent[] }[] = []
  
  for (const ev of unified) {
    const d = new Date(ev.date + 'T00:00:00')
    const year = d.getFullYear()
    const month = d.getMonth()
    const monthKey = `${year}-${String(month).padStart(2, '0')}`
    const monthLabel = `${MAANDEN_NL[month]} ${year}`

    let gr = groups.find(g => g.monthKey === monthKey)
    if (!gr) {
      gr = { monthKey, monthLabel, events: [] }
      groups.push(gr)
    }
    gr.events.push(ev)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      
      {/* Filters Box */}
      <section style={{ background: '#fff', border: '1px solid #C2D9C9', borderRadius: 20, padding: '24px 28px', boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: '#6A8A75', margin: '0 0 16px' }}>
          Selecteer jouw Takken
        </h3>
        
        {/* Selector checkboxes styled nicely */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {Object.entries(TAK_NAMEN).map(([key, label]) => {
            const isSelected = selectedTakken.includes(key)
            const color = TAK_KLEUREN[key]
            return (
              <button
                key={key}
                onClick={() => toggleTak(key)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  borderRadius: 50,
                  border: '2px solid',
                  borderColor: isSelected ? color : '#C2D9C9',
                  background: isSelected ? `${color}11` : 'transparent',
                  color: '#1A3D2A',
                  fontWeight: 700,
                  fontSize: '.85rem',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <span style={{
                  width: 12, height: 12, borderRadius: '50%', background: color, display: 'inline-block',
                  border: isSelected ? '1px solid #fff' : 'none'
                }} />
                {label}
                {isSelected && <span style={{ color, fontSize: '.8rem' }}>✓</span>}
              </button>
            )
          })}
        </div>
      </section>

      {/* Subscription Callout */}
      {selectedTakken.length > 0 && origin && (
        <section style={{ background: 'hsla(29,57%,46%,0.07)', border: '2px dashed var(--color-accent)', borderRadius: 20, padding: '24px 28px' }}>
          <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '2rem', flexShrink: 0 }}>📅</span>
            <div style={{ flex: 1, minWidth: 260 }}>
              <h4 style={{ color: 'var(--color-primary-dark)', fontSize: '1.15rem', margin: '0 0 6px', fontFamily: 'var(--font-heading, Nunito, sans-serif)', fontWeight: 800 }}>
                Abonneer op jouw selectie
              </h4>
              <p style={{ fontSize: '.88rem', color: 'var(--color-text-dark)', margin: '0 0 16px', lineHeight: 1.5 }}>
                Koppel deze gefilterde agenda live aan je eigen agenda-app (zoals Google Calendar of Apple Calendar). 
                Nieuwe weekenden, kampen of tak-activiteiten verschijnen dan automatisch in je agenda!
              </p>
              
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', width: '100%' }}>
                <input
                  type="text"
                  readOnly
                  value={httpUrl}
                  style={{
                    flex: 1,
                    minWidth: 200,
                    padding: '10px 14px',
                    border: '1.5px solid #C2D9C9',
                    borderRadius: 10,
                    fontSize: '.8rem',
                    background: '#fff',
                    fontFamily: 'monospace'
                  }}
                  onClick={e => (e.target as HTMLInputElement).select()}
                />
                <button
                  onClick={() => copyLink(httpUrl)}
                  className="btn btn-secondary"
                  style={{ padding: '10px 18px', fontSize: '.85rem' }}
                >
                  {copied ? 'Gekopieerd! ✓' : 'Kopieer Link'}
                </button>
                <a
                  href={webcalUrl}
                  className="btn btn-outline"
                  style={{
                    padding: '10px 18px',
                    fontSize: '.85rem',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <i className="fa-regular fa-calendar-plus"></i> Abonneer direct
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Events Timeline */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {groups.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', border: '1px solid #C2D9C9', borderRadius: 20 }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: 12 }}>⛺</span>
            <p style={{ color: '#6A8A75', fontWeight: 600 }}>Er zijn geen geplande activiteiten voor de geselecteerde takken.</p>
          </div>
        ) : (
          groups.map(group => (
            <div key={group.monthKey} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              
              {/* Month Header */}
              <h3 style={{
                fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em',
                color: '#1A3D2A', borderBottom: '1.5px solid #C2D9C9', paddingBottom: 6, margin: '12px 0 6px'
              }}>
                {group.monthLabel}
              </h3>

              {/* Month Events List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {group.events.map(ev => {
                  const color = TAK_KLEUREN[ev.tak] || '#888'
                  
                  // Format date display
                  const startD = new Date(ev.date + 'T00:00:00')
                  let dateDisplay = `${startD.getDate()} ${MAANDEN_NL[startD.getMonth()].slice(0, 3)}`
                  
                  if (ev.endDate) {
                    const endD = new Date(ev.endDate + 'T00:00:00')
                    if (startD.getMonth() === endD.getMonth()) {
                      dateDisplay = `${startD.getDate()} – ${endD.getDate()} ${MAANDEN_NL[startD.getMonth()].slice(0, 3)}`
                    } else {
                      dateDisplay = `${startD.getDate()} ${MAANDEN_NL[startD.getMonth()].slice(0, 3)} – ${endD.getDate()} ${MAANDEN_NL[endD.getMonth()].slice(0, 3)}`
                    }
                  }

                  return (
                    <article
                      key={ev.id}
                      style={{
                        background: '#fff',
                        border: '1px solid #C2D9C9',
                        borderRadius: 16,
                        padding: '18px 24px',
                        borderLeft: `5px solid ${color}`,
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        gap: 20,
                        alignItems: 'flex-start',
                        flexWrap: 'wrap'
                      }}
                    >
                      {/* Left: Date pill */}
                      <div style={{
                        background: '#EEF5F1',
                        borderRadius: 12,
                        padding: '8px 14px',
                        minWidth: 80,
                        textAlign: 'center',
                        fontWeight: 800,
                        color: '#1A3D2A',
                        fontSize: '.9rem',
                        fontFamily: 'Outfit, sans-serif'
                      }}>
                        {dateDisplay}
                      </div>

                      {/* Right: Info */}
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                          <span style={{
                            padding: '2px 8px', borderRadius: 20, background: `${color}18`, color,
                            fontSize: '.7rem', fontWeight: 800, textTransform: 'uppercase'
                          }}>
                            {TAK_NAMEN[ev.tak] || ev.tak}
                          </span>
                          {ev.type === 'camp' && (
                            <span style={{
                              padding: '2px 8px', borderRadius: 20, background: '#FEF3C7', color: '#B8862F',
                              fontSize: '.7rem', fontWeight: 800, textTransform: 'uppercase', border: '1px solid #F5D0A9'
                            }}>
                              🏕️ Weekend / Kamp
                            </span>
                          )}
                        </div>

                        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1A3D2A', margin: '0 0 6px', fontFamily: 'var(--font-heading, Nunito, sans-serif)' }}>
                          {ev.title}
                        </h4>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: '.82rem', color: '#6A8A75', fontWeight: 600 }}>
                          {ev.time && <span><i className="fa-regular fa-clock"></i> {ev.time}</span>}
                          {ev.location && (
                            <span>
                              <i className="fa-solid fa-location-dot"></i>{' '}
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.location)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'inherit', textDecoration: 'underline' }}
                              >
                                {ev.location}
                              </a>
                            </span>
                          )}
                          {ev.prijs != null && ev.prijs > 0 && <span><i className="fa-solid fa-euro-sign"></i> €{ev.prijs.toFixed(2).replace('.', ',')}</span>}
                        </div>

                        {ev.description && (
                          <p style={{ fontSize: '.88rem', color: '#3A5A42', margin: '10px 0 0', lineHeight: 1.5 }}>
                            {ev.description}
                          </p>
                        )}
                        
                        {ev.type === 'camp' && (
                          <div style={{ marginTop: 14, borderTop: '1px solid #EEF5F1', paddingTop: 12 }}>
                            <a
                              href="/portaal/kampen"
                              style={{
                                color: '#C9963A',
                                fontSize: '.85rem',
                                fontWeight: 700,
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                            >
                              Inschrijven &amp; details bekijken <i className="fa-solid fa-arrow-right" style={{ fontSize: '.75rem' }} />
                            </a>
                          </div>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>

            </div>
          ))
        )}
      </section>

    </div>
  )
}
