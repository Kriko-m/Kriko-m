'use client'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CalendarEvent, CalendarEntry, Kamp, AudienceTag } from '@/lib/types'
import { AUDIENCE_TAGS, AUDIENCE_NAMEN, AUDIENCE_KLEUREN } from '@/lib/constants'
import { mergeCampsIntoCalendar } from '@/lib/calendar'
import SubscribeCalendarButton from '@/components/SubscribeCalendarButton'
import ConfirmDialog from './ConfirmDialog'
import KalenderActiviteitModal from './KalenderActiviteitModal'

const MAANDEN = ['', 'januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']
const MAANDEN_KORT = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']
const DAG_LETTERS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']

interface Props {
  initialCalendar: CalendarEvent[]
  kampen: Kamp[]
  highlightTak?: string
  canPublish: boolean
  icsToken: string
  readOnly?: boolean
  twoColumn?: boolean
}

// Monday-first: returns 0=Mon … 6=Sun
function dayOfWeekMon(d: Date): number {
  return (d.getDay() + 6) % 7
}

export default function LeidingCalendar({ initialCalendar, kampen, highlightTak, canPublish, icsToken, readOnly, twoColumn = false }: Props) {
  const today = new Date()
  const searchParams = useSearchParams()
  const [events, setEvents] = useState<CalendarEvent[]>(initialCalendar)
  const [filter, setFilter] = useState<Set<string>>(() => {
    const tag = searchParams.get('filter')
    return tag && AUDIENCE_TAGS.includes(tag as AudienceTag) ? new Set([tag]) : new Set()
  })
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [flash, setFlash] = useState('')
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set())
  const [confirmDialog, setConfirmDialog] = useState<{ message: string; onConfirm: () => void } | null>(null)

  // Calendar grid state
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth()) // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  function showFlash(msg: string) { setFlash(msg); setTimeout(() => setFlash(''), 3000) }

  const entries: CalendarEntry[] = useMemo(() => {
    const merged = mergeCampsIntoCalendar(events, kampen)
    if (filter.size === 0) return merged
    return merged.filter(e => e.audience.some(a => filter.has(a)))
  }, [events, kampen, filter])

  // Map date string → entries for that day (for calendar dots)
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEntry[]>()
    for (const e of entries) {
      const key = e.date
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(e)
      // Also fill intermediate days for multi-day events
      if (e.datum_tot && e.datum_tot !== e.date) {
        const start = new Date(e.date)
        const end = new Date(e.datum_tot)
        const cur = new Date(start)
        cur.setDate(cur.getDate() + 1)
        while (cur <= end) {
          const k = cur.toISOString().slice(0, 10)
          if (!map.has(k)) map.set(k, [])
          map.get(k)!.push(e)
          cur.setDate(cur.getDate() + 1)
        }
      }
    }
    return map
  }, [entries])

  const todayDate = new Date().toISOString().slice(0, 10)

  // Right column: only upcoming when no day selected; all entries for a selected day
  const rightEntries = useMemo(() => {
    if (selectedDate) {
      return entries.filter(e => {
        if (e.date === selectedDate) return true
        if (e.datum_tot && e.datum_tot >= selectedDate && e.date <= selectedDate) return true
        return false
      })
    }
    return entries.filter(e => (e.datum_tot ?? e.date) >= todayDate)
  }, [entries, selectedDate, todayDate])

  // Calendar grid computation
  const calGrid = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1)
    const lastDay = new Date(calYear, calMonth + 1, 0)
    const startOffset = dayOfWeekMon(firstDay)
    const cells: Array<{ date: Date | null; key: string }> = []
    // leading empty cells
    for (let i = 0; i < startOffset; i++) {
      const d = new Date(calYear, calMonth, 1 - (startOffset - i))
      cells.push({ date: d, key: `prev-${i}` })
    }
    // days of month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      cells.push({ date: new Date(calYear, calMonth, d), key: `${calYear}-${calMonth}-${d}` })
    }
    // trailing empty cells to complete the grid (always 6 rows)
    const remaining = 42 - cells.length
    for (let i = 1; i <= remaining; i++) {
      cells.push({ date: new Date(calYear, calMonth + 1, i), key: `next-${i}` })
    }
    return cells
  }, [calYear, calMonth])

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) }
    else setCalMonth(m => m - 1)
    setSelectedDate(null)
  }
  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) }
    else setCalMonth(m => m + 1)
    setSelectedDate(null)
  }
  function goToToday() {
    setCalYear(today.getFullYear())
    setCalMonth(today.getMonth())
    setSelectedDate(null)
  }

  function toggleFilter(tag: string) {
    setFilter(prev => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag); else next.add(tag)
      return next
    })
  }

  function closeModal() { setEditId(null); setShowForm(false) }

  function TagChips({ tags }: { tags: AudienceTag[] }) {
    return (
      <span style={{ display: 'inline-flex', gap: 5, flexWrap: 'wrap' }}>
        {tags.map(t => (
          <span key={t} style={{ padding: '1px 8px', borderRadius: 20, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px',
            background: `${AUDIENCE_KLEUREN[t]}18`, color: AUDIENCE_KLEUREN[t] }}>
            {AUDIENCE_NAMEN[t]}
          </span>
        ))}
      </span>
    )
  }

  // ─── Calendar Grid Component ───────────────────────────────────────────────
  function CalendarGrid() {
    const todayStr = today.toISOString().slice(0, 10)

    return (
      <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #C2D9C9', overflow: 'hidden' }}>
        {/* Month navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#1A3D2A', color: '#fff' }}>
          <button onClick={prevMonth} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', padding: '2px 8px', borderRadius: 6, lineHeight: 1 }}>‹</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontWeight: 800, fontSize: '1.05rem', fontFamily: 'var(--font-heading, Nunito, sans-serif)' }}>
              {MAANDEN[calMonth + 1]} {calYear}
            </span>
            <button onClick={goToToday} style={{ background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.3)', color: '#fff', fontSize: '.7rem', fontWeight: 700, cursor: 'pointer', padding: '3px 9px', borderRadius: 12 }}>
              Vandaag
            </button>
          </div>
          <button onClick={nextMonth} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', padding: '2px 8px', borderRadius: 6, lineHeight: 1 }}>›</button>
        </div>

        {/* Day-of-week headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #E8F0EA' }}>
          {DAG_LETTERS.map(d => (
            <div key={d} style={{ textAlign: 'center', padding: '8px 2px', fontSize: '.72rem', fontWeight: 800, color: '#6A8A75', textTransform: 'uppercase', letterSpacing: '.04em' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {calGrid.map((cell) => {
            const isCurrentMonth = cell.date!.getMonth() === calMonth
            const dateStr = cell.date!.toISOString().slice(0, 10)
            const isToday = dateStr === todayStr
            const isSelected = dateStr === selectedDate
            const dayEvents = eventsByDate.get(dateStr) || []
            const hasEvents = dayEvents.length > 0

            // Gather up to 3 distinct audience colors for dots
            const dotColors = dayEvents.slice(0, 6).map(e => AUDIENCE_KLEUREN[e.audience[0] as AudienceTag] || '#1A3D2A')

            return (
              <div
                key={cell.key}
                onClick={() => {
                  if (!isCurrentMonth) return
                  setSelectedDate(prev => prev === dateStr ? null : dateStr)
                }}
                style={{
                  minHeight: 80,
                  padding: '8px 4px 6px',
                  borderRight: '1px solid #E8F0EA',
                  borderBottom: '1px solid #E8F0EA',
                  cursor: isCurrentMonth ? 'pointer' : 'default',
                  background: isSelected ? '#1A3D2A' : isToday ? '#EEF5F1' : 'transparent',
                  transition: 'background .15s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  position: 'relative',
                }}
              >
                <span style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 26, height: 26, borderRadius: '50%',
                  fontSize: '.78rem', fontWeight: isToday || isSelected ? 800 : 500,
                  color: isSelected ? '#fff' : isCurrentMonth ? (isToday ? '#1A3D2A' : '#2C3E35') : '#C2D9C9',
                  background: isToday && !isSelected ? 'rgba(26,61,42,.1)' : 'transparent',
                }}>
                  {cell.date!.getDate()}
                </span>
                {hasEvents && isCurrentMonth && (
                  <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {dotColors.map((color, i) => (
                      <span key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: isSelected ? 'rgba(255,255,255,.7)' : color, flexShrink: 0 }} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        {filter.size === 0 && (
          <div style={{ padding: '10px 14px', borderTop: '1px solid #E8F0EA', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {AUDIENCE_TAGS.map(tag => (
              <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.7rem', color: '#6A8A75', fontWeight: 600 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: AUDIENCE_KLEUREN[tag], display: 'inline-block' }} />
                {AUDIENCE_NAMEN[tag]}
              </span>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ─── Date box widget (left column of each activity card) ─────────────────
  function DateBox({ date, datumTot }: { date: string; datumTot?: string }) {
    const start = new Date(date)
    const startDay = start.getDate()
    const startMaand = MAANDEN_KORT[start.getMonth()].toLowerCase()
    const isMultiDay = !!datumTot && datumTot !== date

    const boxStyle: React.CSSProperties = {
      flexShrink: 0, width: 54, background: '#EEF5F1', borderRadius: 10,
      border: '1.5px solid #C2D9C9', padding: '10px 6px 8px',
      textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
    }

    if (!isMultiDay) {
      return (
        <div style={boxStyle}>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#1A3D2A', lineHeight: 1 }}>
            {String(startDay).padStart(2, '0')}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#6A8A75', lineHeight: 1 }}>{startMaand}</span>
        </div>
      )
    }

    const end = new Date(datumTot!)
    const endDay = end.getDate()
    const endMaand = MAANDEN_KORT[end.getMonth()].toLowerCase()
    const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()

    return (
      <div style={boxStyle}>
        {sameMonth ? (
          <>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#1A3D2A', lineHeight: 1.1, letterSpacing: '-0.5px' }}>
              {startDay}–{endDay}
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#6A8A75', lineHeight: 1 }}>{startMaand}</span>
          </>
        ) : (
          <>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#1A3D2A', lineHeight: 1.25 }}>
              {startDay} {startMaand}
            </span>
            <span style={{ fontSize: 11, fontWeight: 500, color: '#6A8A75', lineHeight: 1.25 }}>
              – {endDay} {endMaand}
            </span>
          </>
        )}
      </div>
    )
  }

  // ─── Activity list (right column or standalone) ───────────────────────────
  function ActivityList({ listEntries }: { listEntries: CalendarEntry[] }) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {listEntries.length === 0 && (
          <p style={{ color: '#6A8A75', fontSize: '.88rem', textAlign: 'center', padding: '24px 0' }}>
            {selectedDate ? 'Geen activiteiten op deze dag.' : 'Geen activiteiten gevonden.'}
          </p>
        )}
        {listEntries.map(ev => {
          const isKamp = ev.source === 'kamp'
          const highlighted = highlightTak ? ev.audience.includes(highlightTak as AudienceTag) : false
          return (
            <div key={`${ev.source}-${ev.id}`} style={{
              background: '#fff', borderRadius: 12, padding: '12px 14px',
              border: highlighted ? '2px solid #C9963A' : '1.5px solid #C2D9C9',
              boxShadow: highlighted ? '0 2px 10px rgba(201,150,58,.18)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <DateBox date={ev.date} datumTot={ev.datum_tot || undefined} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                    {ev.is_evenement && <span title="Evenement" style={{ color: '#C9963A', fontSize: '.85rem' }}>⭐</span>}
                    {isKamp && <span style={{ padding: '1px 7px', borderRadius: 20, fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', background: '#1A3D2A15', color: '#1A3D2A' }}>🏕️ KAMP</span>}
                    <TagChips tags={ev.audience} />
                  </div>
                  <strong style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1a1a1a', display: 'block', marginBottom: 8 }}>{ev.title}</strong>
                  {(ev.time || ev.location) && (
                    <span style={{ fontSize: '.82rem', color: '#6b6b6b', fontWeight: 400 }}>
                      {[ev.time, ev.location].filter(Boolean).join(' · ')}
                    </span>
                  )}
                  {ev.description && (
                    <div style={{ marginTop: 6 }}>
                      <p style={{
                        fontSize: '.82rem', color: '#888', fontStyle: 'italic', margin: 0, lineHeight: 1.4,
                        whiteSpace: 'pre-wrap',
                        display: '-webkit-box',
                        WebkitLineClamp: expandedDescriptions.has(`${ev.source}-${ev.id}`) ? 'unset' : 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: expandedDescriptions.has(`${ev.source}-${ev.id}`) ? 'visible' : 'hidden',
                        textOverflow: 'ellipsis',
                        transition: 'all 0.2s ease'
                      }}>
                        {ev.description}
                      </p>
                      {ev.description.split('\n').length > 3 || ev.description.length > 200 ? (
                        <button
                          type="button"
                          onClick={() => {
                            const key = `${ev.source}-${ev.id}`
                            setExpandedDescriptions(prev => {
                              const next = new Set(prev)
                              if (next.has(key)) next.delete(key); else next.add(key)
                              return next
                            })
                          }}
                          style={{
                            background: 'none', border: 'none', color: '#1A3D2A', cursor: 'pointer',
                            fontSize: '.78rem', fontWeight: 600, padding: 0, marginTop: 4, textDecoration: 'underline'
                          }}>
                          {expandedDescriptions.has(`${ev.source}-${ev.id}`) ? 'Toon minder' : 'Toon meer'}
                        </button>
                      ) : null}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0, alignItems: 'center' }}>
                  {!readOnly && !isKamp && !(!canPublish && ev.audience.includes('groep')) && (
                    <button onClick={() => { setEditId(ev.id); setShowForm(true) }} title="Bewerken" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: '#f0f0f0', color: '#999', fontSize: '.9rem', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                      <i className="fas fa-pen"></i>
                    </button>
                  )}
                  {ev.facebook_event_url && (
                    <a href={ev.facebook_event_url} target="_blank" rel="noopener noreferrer" title="Facebook evenement" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: '#f0f0f0', color: '#1877F2', fontSize: '1rem', textDecoration: 'none', flexShrink: 0 }}>
                      <i className="fab fa-facebook-f"></i>
                    </a>
                  )}
                  {ev.external_link_url && (
                    <a href={ev.external_link_url} target="_blank" rel="noopener noreferrer" title="Externe link" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: '#f0f0f0', color: '#666', fontSize: '.9rem', textDecoration: 'none', flexShrink: 0 }}>
                      <i className="fas fa-link"></i>
                    </a>
                  )}
                  {isKamp && ev.slug && (
                    <a href={`/kamp/${ev.slug}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '.7rem', color: '#1A3D2A', fontWeight: 600, textDecoration: 'none', padding: '4px 10px', background: '#EEF5F1', border: '1.5px solid #C2D9C9', borderRadius: 7, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      Bekijk kamp →
                    </a>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div>
      {flash && !showForm && (
        <div style={{ background: 'hsla(145,33%,36%,.1)', border: '1.5px solid #3F7D5A', color: '#2C5A40', padding: '10px 16px', borderRadius: 10, marginBottom: 14, fontWeight: 600 }}>
          {flash}
        </div>
      )}

      {/* Top bar: tag filters + actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '.75rem', fontWeight: 700, color: '#6A8A75', marginRight: 2 }}>Filter:</span>
          {(['groep', 'leiding'] as const).map(tag => (
            <button key={tag} type="button" onClick={() => toggleFilter(tag)}
              style={{ padding: '4px 12px', borderRadius: 20, border: `1.5px solid ${AUDIENCE_KLEUREN[tag]}`, cursor: 'pointer', fontSize: '.75rem', fontWeight: 700,
                background: filter.has(tag) ? AUDIENCE_KLEUREN[tag] : 'transparent', color: filter.has(tag) ? '#fff' : AUDIENCE_KLEUREN[tag] }}>
              {AUDIENCE_NAMEN[tag]}
            </button>
          ))}
          <span style={{ width: 1, height: 18, background: '#C2D9C9', alignSelf: 'center', margin: '0 2px', flexShrink: 0 }} />
          {(['kapoenen', 'welpen', 'jonggivers', 'givers'] as const).map(tag => (
            <button key={tag} type="button" onClick={() => toggleFilter(tag)}
              style={{ padding: '4px 12px', borderRadius: 20, border: `1.5px solid ${AUDIENCE_KLEUREN[tag]}`, cursor: 'pointer', fontSize: '.75rem', fontWeight: 700,
                background: filter.has(tag) ? AUDIENCE_KLEUREN[tag] : 'transparent', color: filter.has(tag) ? '#fff' : AUDIENCE_KLEUREN[tag] }}>
              {AUDIENCE_NAMEN[tag]}
            </button>
          ))}
          {filter.size > 0 && (
            <button onClick={() => setFilter(new Set())} style={{ padding: '4px 10px', borderRadius: 20, border: '1.5px solid #C2D9C9', cursor: 'pointer', fontSize: '.73rem', fontWeight: 600, color: '#6A8A75', background: 'transparent' }}>
              ✕ Wis
            </button>
          )}
        </div>
        <SubscribeCalendarButton
          feedPath={`/api/leiding/ics/${icsToken}`}
          calendarName="Scouts Kriko-M — Leiding"
          buttonText="Abonneer (in agenda)"
          buttonClassName=""
          buttonStyle={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#fff', border: '1.5px solid #1A3D2A', borderRadius: 8, color: '#1A3D2A', fontSize: '.8rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
        />
      </div>

      {twoColumn ? (
        // Two-column: calendar grid left, activity list right
        <div className="portal-agenda-layout">
          {/* Left: calendar grid */}
          <div>
            {CalendarGrid()}
            {selectedDate && (
              <div style={{ marginTop: 10, padding: '6px 12px', background: '#EEF5F1', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: '.8rem', fontWeight: 700, color: '#1A3D2A' }}>
                  {(() => { const d = new Date(selectedDate); return `${d.getDate()} ${MAANDEN[d.getMonth() + 1]} ${d.getFullYear()}` })()}
                </span>
                <button onClick={() => setSelectedDate(null)} style={{ background: 'none', border: 'none', color: '#6A8A75', cursor: 'pointer', fontSize: '.75rem', fontWeight: 600 }}>× Alle tonen</button>
              </div>
            )}
          </div>

          {/* Right: activity list */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 8 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1A3D2A', margin: 0 }}>
                {selectedDate ? 'Activiteiten op deze dag' : 'Alle activiteiten'}
                {rightEntries.length > 0 && <span style={{ marginLeft: 6, fontSize: '.8rem', fontWeight: 600, color: '#6A8A75' }}>({rightEntries.length})</span>}
              </h3>
              {!readOnly && !showForm && (
                <button onClick={() => { setEditId(null); setShowForm(true) }}
                  style={{ padding: '7px 14px', background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 9, fontFamily: 'inherit', fontWeight: 700, fontSize: '.82rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  + Toevoegen
                </button>
              )}
            </div>
            {ActivityList({ listEntries: rightEntries })}
          </div>
        </div>
      ) : (
        // Single-column layout (dashboard widget etc.)
        <div>
          {!readOnly && (
            <button onClick={() => { setEditId(null); setShowForm(true) }}
              style={{ marginBottom: 16, padding: '9px 18px', background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'inherit', fontWeight: 700, fontSize: '.88rem', cursor: 'pointer' }}>
              + Activiteit toevoegen
            </button>
          )}
          {ActivityList({ listEntries: entries })}
        </div>
      )}

      {!readOnly && showForm && (
        <KalenderActiviteitModal
          canPublish={canPublish}
          initialAudience={!editId && highlightTak && AUDIENCE_TAGS.includes(highlightTak as AudienceTag) ? [highlightTak as AudienceTag] : []}
          editEvent={editId ? events.find(e => e.id === editId) : undefined}
          onClose={closeModal}
          onSaved={(saved, isNew) => {
            setEvents(prev => {
              const next = isNew ? [...prev, saved] : prev.map(e => e.id === editId ? saved : e)
              return next.sort((a, b) => a.date.localeCompare(b.date))
            })
            showFlash(isNew ? 'Activiteit toegevoegd!' : 'Activiteit bijgewerkt!')
            closeModal()
          }}
          onDeleted={(id) => {
            setEvents(prev => prev.filter(e => e.id !== id))
            showFlash('Activiteit verwijderd.')
            closeModal()
          }}
        />
      )}
      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  )
}
