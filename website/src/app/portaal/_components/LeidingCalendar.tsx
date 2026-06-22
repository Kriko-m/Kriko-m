'use client'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CalendarEvent, CalendarEntry, Kamp, AudienceTag } from '@/lib/types'
import { AUDIENCE_TAGS, AUDIENCE_NAMEN, AUDIENCE_KLEUREN } from '@/lib/constants'
import { mergeCampsIntoCalendar } from '@/lib/calendar'
import SubscribeCalendarButton from '@/components/SubscribeCalendarButton'

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

type FormState = {
  title: string; date: string; datum_tot: string; timeStart: string; timeEnd: string; location: string; description: string
  audience: AudienceTag[]; is_evenement: boolean; cover_image: string; document_url: string; facebook_event_url: string; external_link_url: string
}

const emptyForm = (prefill?: string): FormState => ({
  title: '', date: '', datum_tot: '', timeStart: '', timeEnd: '', location: '', description: '',
  audience: prefill && AUDIENCE_TAGS.includes(prefill as AudienceTag) ? [prefill as AudienceTag] : [],
  is_evenement: false, cover_image: '', document_url: '', facebook_event_url: '', external_link_url: '',
})

function parseTime(time: string): { timeStart: string; timeEnd: string } {
  const parts = time.split(/\s*[-–]\s*/)
  return { timeStart: parts[0]?.trim() ?? '', timeEnd: parts[1]?.trim() ?? '' }
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
  const [form, setForm] = useState<FormState>(emptyForm(highlightTak))
  const [editId, setEditId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [flash, setFlash] = useState('')
  const [validationErrors, setValidationErrors] = useState<Set<string>>(new Set())
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set())
  const [facebookLinkOpen, setFacebookLinkOpen] = useState(false)
  const [externalLinkOpen, setExternalLinkOpen] = useState(false)

  // Calendar grid state
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth()) // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const selectableTags: AudienceTag[] = canPublish
    ? [...AUDIENCE_TAGS]
    : AUDIENCE_TAGS.filter(t => t !== 'ouders')

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

  function toggleAudience(tag: AudienceTag) {
    setForm(p => {
      const has = p.audience.includes(tag)
      return { ...p, audience: has ? p.audience.filter(a => a !== tag) : [...p.audience, tag] }
    })
  }

  async function uploadMedia(file: File, type: 'evenement-cover' | 'evenement-document'): Promise<string | null> {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('type', type)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    if (!res.ok) { showFlash('Fout bij uploaden van bestand.'); return null }
    const data = await res.json()
    return data.url as string
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setLoading(true)
    const url = await uploadMedia(file, 'evenement-cover')
    if (url) setForm(p => ({ ...p, cover_image: url }))
    setLoading(false)
  }
  async function handleDocChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setLoading(true)
    const url = await uploadMedia(file, 'evenement-document')
    if (url) setForm(p => ({ ...p, document_url: url }))
    setLoading(false)
  }

  function startEdit(ev: CalendarEntry) {
    setEditId(ev.id)
    const fbUrl = (ev as any).facebook_event_url ?? ''
    const extUrl = (ev as any).external_link_url ?? ''
    setForm({
      title: ev.title, date: ev.date, datum_tot: ev.datum_tot ?? '', ...parseTime(ev.time),
      location: ev.location, description: ev.description,
      audience: ev.audience, is_evenement: ev.is_evenement, cover_image: ev.cover_image, document_url: ev.document_url,
      facebook_event_url: fbUrl,
      external_link_url: extUrl,
    })
    setFacebookLinkOpen(fbUrl !== '')
    setExternalLinkOpen(extUrl !== '')
    setShowForm(true)
  }

  function resetForm() {
    setForm(emptyForm(highlightTak)); setEditId(null); setShowForm(false); setFacebookLinkOpen(false); setExternalLinkOpen(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errors = new Set<string>()
    if (!form.title.trim()) errors.add('title')
    if (!form.date) errors.add('date')
    if (!form.timeStart && !form.timeEnd) errors.add('time')
    if (form.audience.length === 0) errors.add('audience')

    if (errors.size > 0) {
      setValidationErrors(errors)
      setTimeout(() => setValidationErrors(new Set()), 3000)
      return
    }
    setValidationErrors(new Set())
    setLoading(true)
    const payload = {
      title: form.title, date: form.date, datum_tot: form.datum_tot || null,
      time: [form.timeStart, form.timeEnd].filter(Boolean).join(' - '), location: form.location, description: form.description,
      audience: form.audience, is_evenement: form.is_evenement,
      cover_image: form.cover_image, document_url: form.document_url,
      facebook_event_url: form.facebook_event_url || null,
      external_link_url: form.external_link_url || null,
    }
    const url = editId ? `/api/admin/calendar/${editId}` : '/api/admin/calendar'
    const method = editId ? 'PATCH' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (res.ok) {
      const saved = await res.json()
      setEvents(prev => {
        const next = editId ? prev.map(ev => ev.id === editId ? saved : ev) : [...prev, saved]
        return next.sort((a, b) => a.date.localeCompare(b.date))
      })
      showFlash(editId ? 'Activiteit bijgewerkt!' : 'Activiteit toegevoegd!')
      resetForm()
    } else {
      const err = await res.json().catch(() => ({}))
      showFlash(err.error || 'Fout bij het opslaan.')
    }
    setLoading(false)
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Weet je zeker dat je "${title}" wilt verwijderen uit de kalender?`)) return
    const res = await fetch(`/api/admin/calendar/${id}`, { method: 'DELETE' })
    if (res.ok) { setEvents(prev => prev.filter(ev => ev.id !== id)); showFlash('Activiteit verwijderd.') }
    else showFlash('Fout bij verwijderen.')
  }

  function formatTimeInput(value: string): string {
    if (!value) return ''
    const num = value.replace(/\D/g, '')
    if (num.length === 1 || num.length === 2) return num.padStart(2, '0') + ':00'
    if (num.length === 3) return num[0] + num.slice(1, 3).padStart(2, '0') + ':' + '00'
    if (num.length >= 4) return num.slice(0, 2) + ':' + num.slice(2, 4)
    return value
  }

  const inputStyle = { width: '100%', padding: '9px 12px', border: '1.5px solid #C2D9C9', borderRadius: 8, fontFamily: 'inherit', fontSize: '.9rem', boxSizing: 'border-box' as const }
  const labelStyle = { display: 'block', fontSize: '.8rem', fontWeight: 700, color: '#1A3D2A', marginBottom: 5 }
  const errorOutline = (fieldName: string): React.CSSProperties => validationErrors.has(fieldName)
    ? { boxShadow: '0 0 0 2px #e74c3c, 0 0 10px rgba(231, 76, 60, 0.35)', borderRadius: 8, transition: 'box-shadow 0.2s ease' }
    : { boxShadow: 'none', transition: 'box-shadow 0.2s ease' }

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
            const dotColors = Array.from(new Set(dayEvents.flatMap(e => e.audience))).slice(0, 4).map(a => AUDIENCE_KLEUREN[a as AudienceTag]).filter(Boolean)

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
                  <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {dotColors.map((color, i) => (
                      <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: isSelected ? 'rgba(255,255,255,.7)' : color, flexShrink: 0 }} />
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
                  {!readOnly && !isKamp && !(!canPublish && ev.audience.includes('ouders')) && (
                    <button onClick={() => startEdit(ev)} title="Bewerken" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: '#f0f0f0', color: '#999', fontSize: '.9rem', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                      <i className="fas fa-pen"></i>
                    </button>
                  )}
                  {(ev as any).facebook_event_url && (
                    <a href={(ev as any).facebook_event_url} target="_blank" rel="noopener noreferrer" title="Facebook evenement" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: '#f0f0f0', color: '#1877F2', fontSize: '1rem', textDecoration: 'none', flexShrink: 0 }}>
                      <i className="fab fa-facebook-f"></i>
                    </a>
                  )}
                  {(ev as any).external_link_url && (
                    <a href={(ev as any).external_link_url} target="_blank" rel="noopener noreferrer" title="Externe link" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: '#f0f0f0', color: '#666', fontSize: '.9rem', textDecoration: 'none', flexShrink: 0 }}>
                      <i className="fas fa-link"></i>
                    </a>
                  )}
                  {isKamp && (
                    <a href={`/portaal/leiding/kampen/${ev.id}`} style={{ fontSize: '.7rem', color: '#1A3D2A', fontWeight: 600, textDecoration: 'none', padding: '4px 10px', background: '#EEF5F1', border: '1.5px solid #C2D9C9', borderRadius: 7, cursor: 'pointer', whiteSpace: 'nowrap' }}>
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

  // ─── Add/Edit Form Modal ──────────────────────────────────────────────────
  function AddEditForm() {
    if (!showForm) return null
    return (
      <>
        {/* Backdrop */}
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.4)', zIndex: 999 }} onClick={resetForm} />
        {/* Modal */}
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'auto', width: '95%', maxWidth: 800, maxHeight: '92vh', overflow: 'auto', background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, color: '#1A3D2A', fontWeight: 800, fontSize: '1.3rem' }}>{editId ? 'Activiteit bewerken' : 'Nieuwe activiteit'}</h3>
              <button type="button" onClick={resetForm} style={{ background: 'none', border: 'none', color: '#999', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1, padding: 0 }}>×</button>
            </div>
            {flash && (
              <div style={{ background: 'hsla(145,33%,36%,.1)', border: '1.5px solid #3F7D5A', color: '#2C5A40', padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontWeight: 600, fontSize: '.9rem' }}>
                {flash}
              </div>
            )}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Tags */}
              <div style={{ ...errorOutline('audience'), borderRadius: 8, padding: validationErrors.has('audience') ? 12 : 0 }}>
                <label style={labelStyle}>Voor wie? (tags)</label>
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                  {selectableTags.map(tag => {
                    const on = form.audience.includes(tag)
                    return (
                      <button key={tag} type="button" onClick={() => toggleAudience(tag)}
                        style={{ padding: '4px 12px', borderRadius: 20, border: `1.5px solid ${AUDIENCE_KLEUREN[tag]}`, cursor: 'pointer', fontSize: '.75rem', fontWeight: 700,
                          background: on ? AUDIENCE_KLEUREN[tag] : 'transparent', color: on ? '#fff' : AUDIENCE_KLEUREN[tag] }}>
                        {on ? '✓ ' : ''}{AUDIENCE_NAMEN[tag]}
                      </button>
                    )
                  })}
                </div>
                {form.audience.includes('ouders') && (
                  <span style={{ display: 'block', marginTop: 5, fontSize: '.73rem', color: '#9A6B12', fontWeight: 600 }}>
                    ⚠️ Met de tag &ldquo;Ouders&rdquo; wordt dit zichtbaar op de publieke website.
                  </span>
                )}
              </div>

              {/* Titel */}
              <div><label style={labelStyle}>Titel</label><input style={{ ...inputStyle, ...errorOutline('title') }} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} onBlur={e => setForm(p => ({ ...p, title: p.title.trim() }))} placeholder="bijv. Groeps-BBQ" /></div>

              {/* Time & Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.5fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Tijdstip</label>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', ...errorOutline('time') }}>
                    <input type="time" style={{ ...inputStyle, flex: 1, border: 'none' }} value={form.timeStart} onChange={e => setForm(p => ({ ...p, timeStart: e.target.value }))} onBlur={e => setForm(p => ({ ...p, timeStart: formatTimeInput(e.target.value) }))} />
                    <span style={{ color: '#6A8A75', fontWeight: 600, fontSize: '.85rem', flexShrink: 0 }}>–</span>
                    <input type="time" style={{ ...inputStyle, flex: 1, border: 'none' }} value={form.timeEnd} onChange={e => setForm(p => ({ ...p, timeEnd: e.target.value }))} onBlur={e => setForm(p => ({ ...p, timeEnd: formatTimeInput(e.target.value) }))} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Datum</label>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <input type="date" style={{ ...inputStyle, width: '100%', ...errorOutline('date') }} value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                    </div>
                    {form.datum_tot ? (
                      <>
                        <span style={{ color: '#c9c9c9', fontWeight: 400, fontSize: '.75rem', flexShrink: 0 }}>–</span>
                        <div style={{ flex: 1 }}>
                          <input type="date" style={{ ...inputStyle, width: '100%', background: '#fafaf8', color: '#999', fontSize: '.85rem' }} value={form.datum_tot}
                            onChange={e => setForm(p => ({ ...p, datum_tot: e.target.value }))} />
                        </div>
                        <button type="button" title="Einddatum verwijderen"
                          onClick={() => setForm(p => ({ ...p, datum_tot: '' }))}
                          style={{ flexShrink: 0, background: 'none', border: 'none', color: '#ddd', cursor: 'pointer', fontSize: '.9rem', lineHeight: 1, padding: '0 2px' }}>×</button>
                      </>
                    ) : (
                      <button type="button" title="Meerdaagse activiteit"
                        onClick={() => {
                          const defaultDate = new Date().toISOString().split('T')[0]
                          setForm(p => ({ ...p, datum_tot: p.date || defaultDate }))
                        }}
                        style={{ flexShrink: 0, background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '.7rem', fontWeight: 500, padding: '5px 6px', whiteSpace: 'nowrap', textDecoration: 'underline' }}>
                        + einddatum
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Location & Description */}
              <div><label style={labelStyle}>Locatie</label><input style={inputStyle} value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} onBlur={e => setForm(p => ({ ...p, location: p.location.trim() }))} placeholder="bijv. Scoutslokalen" /></div>
              <div><label style={labelStyle}>Omschrijving</label><textarea style={inputStyle} rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} onBlur={e => setForm(p => ({ ...p, description: p.description.trim() }))} placeholder="Korte uitleg..." /></div>

              {/* Facebook & External Link & Document toggles */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, color: '#1A3D2A', fontSize: '.85rem', flex: '0 1 auto' }}>
                  <input type="checkbox" checked={facebookLinkOpen} onChange={e => setFacebookLinkOpen(e.target.checked)} style={{ cursor: 'pointer' }} />
                  Facebook evenement?
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, color: '#1A3D2A', fontSize: '.85rem', flex: '0 1 auto' }}>
                  <input type="checkbox" checked={externalLinkOpen} onChange={e => setExternalLinkOpen(e.target.checked)} style={{ cursor: 'pointer' }} />
                  Externe link?
                </label>
                {canPublish && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, color: '#1A3D2A', fontSize: '.85rem', flex: '0 1 auto' }}>
                    <input type="checkbox" checked={form.is_evenement} onChange={e => setForm(p => ({ ...p, is_evenement: e.target.checked }))} style={{ cursor: 'pointer' }} />
                    Bestand aan toevoegen?
                  </label>
                )}
              </div>

              {/* Facebook URL input */}
              {facebookLinkOpen && (
                <div><label style={labelStyle}>Facebook evenement link</label><input style={inputStyle} value={form.facebook_event_url} onChange={e => setForm(p => ({ ...p, facebook_event_url: e.target.value }))} onBlur={e => setForm(p => ({ ...p, facebook_event_url: p.facebook_event_url.trim() }))} placeholder="https://facebook.com/events/..." /></div>
              )}

              {/* External link input */}
              {externalLinkOpen && (
                <div><label style={labelStyle}>Externe link</label><input style={inputStyle} value={form.external_link_url} onChange={e => setForm(p => ({ ...p, external_link_url: e.target.value }))} onBlur={e => setForm(p => ({ ...p, external_link_url: p.external_link_url.trim() }))} placeholder="https://example.com/form" /></div>
              )}

              {/* Document upload (only for canPublish) */}
              {canPublish && form.is_evenement && (
                <div style={{ padding: 12, background: '#f9f9f9', border: '1.5px solid #E2C58D', borderRadius: 10 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Coverfoto</label>
                      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverChange} style={{ fontSize: '.78rem' }} />
                      {form.cover_image && /* eslint-disable-next-line @next/next/no-img-element */ <img src={form.cover_image} alt="cover" style={{ width: '100%', height: 70, objectFit: 'cover', borderRadius: 7, marginTop: 8 }} />}
                    </div>
                    <div>
                      <label style={labelStyle}>Uitnodiging (PDF)</label>
                      <input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={handleDocChange} style={{ fontSize: '.78rem' }} />
                      {form.document_url && <span style={{ display: 'block', marginTop: 5, fontSize: '.74rem', color: '#3F7D5A', fontWeight: 600 }}>✓ Uitnodiging geüpload</span>}
                    </div>
                  </div>
                </div>
              )}

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button type="submit" disabled={loading} style={{ padding: '10px 18px', background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 8, fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer', fontSize: '.9rem', flex: 1 }}>
                {loading ? 'Bezig…' : editId ? 'Opslaan' : 'Toevoegen'}
              </button>
              <button type="button" onClick={resetForm} style={{ padding: '10px 18px', background: '#f5f5f5', border: 'none', borderRadius: 8, fontFamily: 'inherit', fontWeight: 600, color: '#6A8A75', cursor: 'pointer', fontSize: '.9rem' }}>
                Annuleren
              </button>
            </div>
            </form>
          </div>
        </div>
      </>
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
          {(['ouders', 'leiding'] as const).map(tag => (
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
            <CalendarGrid />
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
                <button onClick={() => { setForm(emptyForm(highlightTak)); setEditId(null); setShowForm(true) }}
                  style={{ padding: '7px 14px', background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 9, fontFamily: 'inherit', fontWeight: 700, fontSize: '.82rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  + Toevoegen
                </button>
              )}
            </div>
            <ActivityList listEntries={rightEntries} />
          </div>
        </div>
      ) : (
        // Single-column layout (dashboard widget etc.)
        <div>
          {!readOnly && (
            <button onClick={() => { setForm(emptyForm(highlightTak)); setEditId(null); setShowForm(true) }}
              style={{ marginBottom: 16, padding: '9px 18px', background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'inherit', fontWeight: 700, fontSize: '.88rem', cursor: 'pointer' }}>
              + Activiteit toevoegen
            </button>
          )}
          <ActivityList listEntries={entries} />
        </div>
      )}

      {!readOnly && AddEditForm()}
    </div>
  )
}
