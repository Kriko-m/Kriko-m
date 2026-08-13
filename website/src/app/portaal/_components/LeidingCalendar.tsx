'use client'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CalendarEvent, AudienceTag } from '@/lib/types'
import { AUDIENCE_TAGS, AUDIENCE_NAMEN, AUDIENCE_KLEUREN } from '@/lib/constants'
import { getEventIcon } from '@/lib/calendar'
import SubscribeCalendarButton from '@/components/SubscribeCalendarButton'
import ConfirmDialog from './ConfirmDialog'
import KalenderActiviteitModal from './KalenderActiviteitModal'
import { EventDetailDialog } from '@/components/EventDetailModal'

const MAANDEN = ['', 'januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']
const MAANDEN_KORT = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']
const DAG_LETTERS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']

interface Props {
  initialCalendar: CalendarEvent[]
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

// Use local time to avoid UTC offset shifting the date string by one day (e.g. UTC+2 midnight → previous UTC day)
function toLocalDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function LeidingCalendar({ initialCalendar, highlightTak, canPublish, icsToken, readOnly, twoColumn = false }: Props) {
  const today = new Date()
  const searchParams = useSearchParams()
  const [events, setEvents] = useState<CalendarEvent[]>(initialCalendar)
  const [filter, setFilter] = useState<Set<string>>(() => {
    const tag = searchParams.get('filter')
    return tag && AUDIENCE_TAGS.includes(tag as AudienceTag) ? new Set([tag]) : new Set()
  })
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [activeViewEvent, setActiveViewEvent] = useState<CalendarEvent | null>(null)
  const [flash, setFlash] = useState('')
  const [confirmDialog, setConfirmDialog] = useState<{ message: string; onConfirm: () => void } | null>(null)

  // Calendar grid state
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth()) // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  function showFlash(msg: string) { setFlash(msg); setTimeout(() => setFlash(''), 3000) }

  const entries: CalendarEvent[] = useMemo(() => {
    if (filter.size === 0) return events
    return events.filter(e => e.audience.some(a => filter.has(a)))
  }, [events, filter])

  // Map date string → entries for that day (for calendar dots)
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
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

  const todayDate = toLocalDateStr(new Date())

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
    // trailing empty cells to complete the grid (dynamically 4, 5, or 6 weeks depending on month)
    const targetLength = Math.ceil(cells.length / 7) * 7
    const remaining = targetLength - cells.length
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
    const todayStr = toLocalDateStr(today)

    return (
      <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #C2D9C9', overflow: 'hidden', boxShadow: '0 4px 20px rgba(26,61,42,0.06)' }}>
        {/* Month navigation header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#1A3D2A', color: '#fff' }}>
          <button onClick={prevMonth} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', fontSize: '1.1rem', cursor: 'pointer', padding: '4px 10px', borderRadius: 8, lineHeight: 1, transition: 'all 0.15s' }}>‹</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontWeight: 900, fontSize: '1.15rem', fontFamily: 'var(--font-heading, Nunito, sans-serif)', letterSpacing: '0.2px' }}>
              {MAANDEN[calMonth + 1]} {calYear}
            </span>
            <button onClick={goToToday} style={{ background: 'rgba(255,255,255,.18)', border: '1px solid rgba(255,255,255,.3)', color: '#fff', fontSize: '.72rem', fontWeight: 800, cursor: 'pointer', padding: '4px 11px', borderRadius: 14 }}>
              Vandaag
            </button>
          </div>
          <button onClick={nextMonth} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', fontSize: '1.1rem', cursor: 'pointer', padding: '4px 10px', borderRadius: 8, lineHeight: 1, transition: 'all 0.15s' }}>›</button>
        </div>

        {/* Day-of-week headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #E8F0EA', background: '#F4F7F5' }}>
          {DAG_LETTERS.map(d => (
            <div key={d} style={{ textAlign: 'center', padding: '10px 2px', fontSize: '.75rem', fontWeight: 800, color: '#4A6B56', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {calGrid.map((cell) => {
            const isCurrentMonth = cell.date!.getMonth() === calMonth
            const dateStr = toLocalDateStr(cell.date!)
            const isToday = dateStr === todayStr
            const isSelected = dateStr === selectedDate
            const dayEvents = eventsByDate.get(dateStr) || []
            const hasEvents = dayEvents.length > 0

            return (
              <div
                key={cell.key}
                style={{
                  minHeight: 92,
                  padding: '7px 5px',
                  borderRight: '1px solid #E8F0EA',
                  borderBottom: '1px solid #E8F0EA',
                  background: isSelected ? '#EBF5EF' : isToday ? '#F0F7F2' : isCurrentMonth ? '#fff' : '#FAFCFA',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 2 }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isCurrentMonth) return
                      setSelectedDate(prev => prev === dateStr ? null : dateStr)
                    }}
                    style={{
                      background: isToday ? '#1A3D2A' : 'transparent',
                      color: isToday ? '#fff' : isCurrentMonth ? '#1A3D2A' : '#BDD0C3',
                      border: 'none',
                      borderRadius: '50%',
                      width: 24,
                      height: 24,
                      fontSize: '.78rem',
                      fontWeight: isToday ? 800 : 700,
                      cursor: isCurrentMonth ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isToday ? '0 2px 6px rgba(26,61,42,0.25)' : 'none',
                    }}
                    title={hasEvents ? `${dayEvents.length} activiteit(en) op ${dateStr}` : undefined}
                  >
                    {cell.date!.getDate()}
                  </button>
                </div>

                {/* Render event pills inside cell */}
                {hasEvents && isCurrentMonth && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto', maxHeight: 62 }}>
                    {dayEvents.map(ev => {
                      const primaryTag = ev.audience[0] as AudienceTag
                      const isImportant = ev.is_evenement
                      const tagColor = isImportant ? '#D6AB42' : AUDIENCE_KLEUREN[primaryTag] || '#1A3D2A'

                      return (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveViewEvent(ev)
                          }}
                          title={`${ev.title} (${ev.time || 'Hele dag'})`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            width: '100%',
                            padding: '3px 6px',
                            borderRadius: 6,
                            borderLeft: `3.5px solid ${tagColor}`,
                            background: isImportant ? '#FFF8E7' : `${tagColor}15`,
                            color: '#1A3D2A',
                            fontSize: '.72rem',
                            fontWeight: 700,
                            textAlign: 'left',
                            cursor: 'pointer',
                            lineHeight: 1.25,
                            overflow: 'hidden',
                            borderTop: 'none',
                            borderRight: 'none',
                            borderBottom: 'none',
                            fontFamily: 'inherit',
                            transition: 'all 0.12s ease',
                          }}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ev.title}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        {filter.size === 0 && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid #E8F0EA', display: 'flex', gap: 14, flexWrap: 'wrap', background: '#FAFCFA' }}>
            {AUDIENCE_TAGS.map(tag => (
              <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '.72rem', color: '#4A6B56', fontWeight: 700 }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: AUDIENCE_KLEUREN[tag], display: 'inline-block' }} />
                {AUDIENCE_NAMEN[tag]}
              </span>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ─── Date box widget (left column of each activity card) ─────────────────
  function DateBox({ date, datumTot, isImportant }: { date: string; datumTot?: string; isImportant?: boolean }) {
    const start = new Date(date)
    const startDay = start.getDate()
    const startMaand = MAANDEN_KORT[start.getMonth()].toLowerCase()
    const isMultiDay = !!datumTot && datumTot !== date

    const boxStyle: React.CSSProperties = {
      flexShrink: 0, width: 56,
      background: isImportant ? '#FFF9E6' : '#EEF5F1',
      borderRadius: 12,
      border: isImportant ? '1.5px solid #EAD8AB' : '1.5px solid #C2D9C9',
      padding: '10px 6px 8px',
      textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
    }

    if (!isMultiDay) {
      return (
        <div style={boxStyle}>
          <span style={{ fontSize: 22, fontWeight: 900, color: isImportant ? '#A0761C' : '#1A3D2A', lineHeight: 1 }}>
            {String(startDay).padStart(2, '0')}
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: isImportant ? '#B5892D' : '#5A7E68', lineHeight: 1, textTransform: 'lowercase' }}>{startMaand}</span>
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
            <span style={{ fontSize: 15, fontWeight: 900, color: isImportant ? '#A0761C' : '#1A3D2A', lineHeight: 1.1, letterSpacing: '-0.5px' }}>
              {startDay}–{endDay}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: isImportant ? '#B5892D' : '#5A7E68', lineHeight: 1, textTransform: 'lowercase' }}>{startMaand}</span>
          </>
        ) : (
          <>
            <span style={{ fontSize: 13, fontWeight: 900, color: isImportant ? '#A0761C' : '#1A3D2A', lineHeight: 1.25 }}>
              {startDay} {startMaand}
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: isImportant ? '#B5892D' : '#5A7E68', lineHeight: 1.25 }}>
              – {endDay} {endMaand}
            </span>
          </>
        )}
      </div>
    )
  }

  // ─── Activity list (right column or standalone) ───────────────────────────
  function ActivityList({ listEntries }: { listEntries: CalendarEvent[] }) {
    const todayMs = new Date().setHours(0,0,0,0)

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {listEntries.length === 0 && (
          <p style={{ color: '#6A8A75', fontSize: '.9rem', textAlign: 'center', padding: '32px 0', background: '#fff', borderRadius: 14, border: '1.5px solid #C2D9C9' }}>
            {selectedDate ? 'Geen activiteiten op deze dag.' : 'Geen activiteiten gevonden.'}
          </p>
        )}
        {listEntries.map(ev => {
          const highlighted = highlightTak ? ev.audience.includes(highlightTak as AudienceTag) : false
          const isImportant = ev.is_evenement
          const iconClass = getEventIcon(ev)

          // Countdown calculation
          const [yy, mm, dd] = ev.date.split('-').map(Number)
          const evDateObj = new Date(yy, (mm ?? 1) - 1, dd ?? 1)
          const diff = Math.round((evDateObj.getTime() - todayMs) / 86400000)
          const countdownText = diff === 0
            ? 'Vandaag'
            : diff === 1
            ? 'Morgen'
            : diff > 1
            ? `in ${diff} d`
            : 'Afgelopen'

          return (
            <div
              key={ev.id}
              style={{
                background: '#fff',
                borderRadius: 14,
                padding: '14px 16px',
                border: highlighted ? '2px solid #C9963A' : '1.5px solid #C2D9C9',
                boxShadow: highlighted ? '0 4px 14px rgba(201,150,58,.22)' : '0 2px 8px rgba(26,61,42,0.04)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onClick={() => setActiveViewEvent(ev)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <DateBox date={ev.date} datumTot={ev.datum_tot || undefined} isImportant={isImportant} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 5 }}>
                    <TagChips tags={ev.audience} />
                    <span style={{ fontSize: '.72rem', fontWeight: 800, padding: '3px 9px', borderRadius: 12, background: diff === 0 ? '#C9963A25' : '#EEF5F1', color: diff === 0 ? '#C9963A' : '#1A3D2A', whiteSpace: 'nowrap' }}>
                      <i className="fa-regular fa-clock" style={{ fontSize: '.68rem', marginRight: 4 }}></i> {countdownText}
                    </span>
                  </div>

                  <strong style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1A3D2A', fontFamily: 'var(--font-heading, Nunito, sans-serif)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    {iconClass ? <i className={`fa-solid ${iconClass}`} style={{ color: '#1A3D2A', fontSize: '1rem' }}></i> : null}
                    {ev.title}
                  </strong>

                  {(ev.time || ev.location) && (
                    <span style={{ fontSize: '.84rem', color: '#4A6B56', fontWeight: 600, display: 'block' }}>
                      {[ev.time, ev.location].filter(Boolean).join(' · ')}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0, alignItems: 'center', paddingTop: 2 }}>
                  {!readOnly && !(!canPublish && ev.audience.includes('groep')) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditId(ev.id)
                        setShowForm(true)
                      }}
                      title="Bewerken"
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', background: '#EEF5F1', color: '#1A3D2A', fontSize: '.85rem', border: '1.5px solid #C2D9C9', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s ease' }}
                    >
                      <i className="fas fa-pen"></i>
                    </button>
                  )}
                  <span style={{ fontSize: '.85rem', color: '#1A3D2A', fontWeight: 800 }}>
                    <i className="fa-solid fa-chevron-right"></i>
                  </span>
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
      {activeViewEvent && (
        <EventDetailDialog
          event={activeViewEvent}
          todayMs={today.getTime()}
          onClose={() => setActiveViewEvent(null)}
          onEdit={
            !readOnly && !(!canPublish && activeViewEvent.audience.includes('groep'))
              ? () => {
                  setEditId(activeViewEvent.id)
                  setShowForm(true)
                }
              : undefined
          }
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
