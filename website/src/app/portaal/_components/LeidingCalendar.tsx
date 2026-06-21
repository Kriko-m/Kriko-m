'use client'
import { useMemo, useState } from 'react'
import { CalendarEvent, CalendarEntry, Kamp, AudienceTag } from '@/lib/types'
import { AUDIENCE_TAGS, AUDIENCE_NAMEN, AUDIENCE_KLEUREN } from '@/lib/constants'
import { mergeCampsIntoCalendar } from '@/lib/calendar'
import SubscribeCalendarButton from '@/components/SubscribeCalendarButton'

const MAANDEN = ['', 'januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']

interface Props {
  initialCalendar: CalendarEvent[]
  kampen: Kamp[]
  highlightTak?: string          // audience-tag die op deze pagina extra benadrukt wordt
  canPublish: boolean            // groepsleiding mag publiceren naar 'ouders' + evenementen
  icsToken: string
  readOnly?: boolean             // bv. dashboard-overzicht zonder bewerken
}

type FormState = {
  title: string; date: string; time: string; location: string; description: string
  audience: AudienceTag[]; is_evenement: boolean; cover_image: string; document_url: string
}

const emptyForm = (prefill?: string): FormState => ({
  title: '', date: '', time: '', location: '', description: '',
  audience: prefill && AUDIENCE_TAGS.includes(prefill as AudienceTag) ? [prefill as AudienceTag] : [],
  is_evenement: false, cover_image: '', document_url: '',
})

export default function LeidingCalendar({ initialCalendar, kampen, highlightTak, canPublish, icsToken, readOnly }: Props) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialCalendar)
  const [filter, setFilter] = useState<Set<string>>(new Set())
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm(highlightTak))
  const [editId, setEditId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [flash, setFlash] = useState('')

  // Welke audience-tags mag deze gebruiker toekennen?
  const selectableTags: AudienceTag[] = canPublish
    ? [...AUDIENCE_TAGS]
    : AUDIENCE_TAGS.filter(t => t !== 'ouders')

  function showFlash(msg: string) { setFlash(msg); setTimeout(() => setFlash(''), 3000) }

  // Events + kampen samenvoegen en filteren.
  const entries: CalendarEntry[] = useMemo(() => {
    const merged = mergeCampsIntoCalendar(events, kampen)
    if (filter.size === 0) return merged
    return merged.filter(e => e.audience.some(a => filter.has(a)))
  }, [events, kampen, filter])

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
    setForm({
      title: ev.title, date: ev.date, time: ev.time, location: ev.location, description: ev.description,
      audience: ev.audience, is_evenement: ev.is_evenement, cover_image: ev.cover_image, document_url: ev.document_url,
    })
    setShowForm(true)
  }

  function resetForm() {
    setForm(emptyForm(highlightTak)); setEditId(null); setShowForm(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const payload = {
      title: form.title, date: form.date, time: form.time, location: form.location, description: form.description,
      audience: form.audience, is_evenement: form.is_evenement,
      cover_image: form.cover_image, document_url: form.document_url,
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

  const inputStyle = { width: '100%', padding: '9px 12px', border: '1.5px solid #C2D9C9', borderRadius: 8, fontFamily: 'inherit', fontSize: '.9rem', boxSizing: 'border-box' as const }
  const labelStyle = { display: 'block', fontSize: '.8rem', fontWeight: 700, color: '#1A3D2A', marginBottom: 5 }

  function TagChips({ tags }: { tags: AudienceTag[] }) {
    return (
      <span style={{ display: 'inline-flex', gap: 5, flexWrap: 'wrap' }}>
        {tags.map(t => (
          <span key={t} style={{ padding: '1px 8px', borderRadius: 20, fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase',
            background: `${AUDIENCE_KLEUREN[t]}22`, color: AUDIENCE_KLEUREN[t] }}>
            {AUDIENCE_NAMEN[t]}
          </span>
        ))}
      </span>
    )
  }

  return (
    <div>
      {flash && (
        <div style={{ background: 'hsla(145,33%,36%,.1)', border: '1.5px solid #3F7D5A', color: '#2C5A40', padding: '10px 16px', borderRadius: 10, marginBottom: 16, fontWeight: 600 }}>
          {flash}
        </div>
      )}

      {/* Filter + abonneer + toevoegen */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {AUDIENCE_TAGS.map(tag => (
            <button key={tag} type="button" onClick={() => toggleFilter(tag)}
              style={{ padding: '4px 12px', borderRadius: 20, border: `1.5px solid ${AUDIENCE_KLEUREN[tag]}`, cursor: 'pointer', fontSize: '.76rem', fontWeight: 700,
                background: filter.has(tag) ? AUDIENCE_KLEUREN[tag] : 'transparent', color: filter.has(tag) ? '#fff' : AUDIENCE_KLEUREN[tag] }}>
              {AUDIENCE_NAMEN[tag]}
            </button>
          ))}
        </div>
        <SubscribeCalendarButton
          feedPath={`/api/leiding/ics/${icsToken}`}
          calendarName="Scouts Kriko-M — Leiding"
          buttonText="Abonneer (in agenda)"
          buttonClassName=""
          buttonStyle={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#fff', border: '1.5px solid #1A3D2A', borderRadius: 8, color: '#1A3D2A', fontSize: '.8rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
        />
      </div>

      {!readOnly && !showForm && (
        <button onClick={() => { setForm(emptyForm(highlightTak)); setEditId(null); setShowForm(true) }}
          style={{ marginBottom: 18, padding: '9px 18px', background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'inherit', fontWeight: 700, fontSize: '.88rem', cursor: 'pointer' }}>
          + Activiteit toevoegen
        </button>
      )}

      {!readOnly && showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#EEF5F133', border: '1.5px dashed #2A5C3F', borderRadius: 14, padding: 20, marginBottom: 24 }}>
          <h4 style={{ margin: '0 0 16px', color: '#1A3D2A', fontWeight: 800 }}>{editId ? 'Activiteit bewerken' : 'Nieuwe activiteit'}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div><label style={labelStyle}>Titel</label><input style={inputStyle} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="bijv. Groeps-BBQ" /></div>
            <div><label style={labelStyle}>Datum</label><input type="date" style={inputStyle} value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required /></div>
            <div><label style={labelStyle}>Tijdstip</label><input style={inputStyle} value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} placeholder="bijv. 14:00 - 17:00" /></div>
            <div><label style={labelStyle}>Locatie</label><input style={inputStyle} value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="bijv. Scoutslokalen" /></div>
          </div>
          <div style={{ marginBottom: 14 }}><label style={labelStyle}>Omschrijving</label><textarea style={inputStyle} rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Korte uitleg..." /></div>

          {/* Audience-tags (voor wie?) */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Voor wie? (tags)</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {selectableTags.map(tag => {
                const on = form.audience.includes(tag)
                return (
                  <button key={tag} type="button" onClick={() => toggleAudience(tag)}
                    style={{ padding: '5px 14px', borderRadius: 20, border: `1.5px solid ${AUDIENCE_KLEUREN[tag]}`, cursor: 'pointer', fontSize: '.78rem', fontWeight: 700,
                      background: on ? AUDIENCE_KLEUREN[tag] : 'transparent', color: on ? '#fff' : AUDIENCE_KLEUREN[tag] }}>
                    {on ? '✓ ' : ''}{AUDIENCE_NAMEN[tag]}
                  </button>
                )
              })}
            </div>
            {form.audience.includes('ouders') && (
              <span style={{ display: 'block', marginTop: 6, fontSize: '.74rem', color: '#9A6B12', fontWeight: 600 }}>
                ⚠️ Met de tag &ldquo;Ouders&rdquo; wordt dit zichtbaar op de publieke website.
              </span>
            )}
          </div>

          {/* Evenement (enkel groepsleiding) */}
          {canPublish && (
            <div style={{ marginBottom: 14, padding: 14, background: '#fff', border: '1.5px solid #E2C58D', borderRadius: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 700, color: '#1A3D2A', fontSize: '.88rem' }}>
                <input type="checkbox" checked={form.is_evenement} onChange={e => setForm(p => ({ ...p, is_evenement: e.target.checked }))} />
                ⭐ Uitlichten als evenement (groot ding, met coverfoto &amp; uitnodiging)
              </label>
              {form.is_evenement && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                  <div>
                    <label style={labelStyle}>Coverfoto</label>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverChange} style={{ fontSize: '.8rem' }} />
                    {form.cover_image && /* eslint-disable-next-line @next/next/no-img-element */ <img src={form.cover_image} alt="cover" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 8, marginTop: 6 }} />}
                  </div>
                  <div>
                    <label style={labelStyle}>Uitnodiging (PDF)</label>
                    <input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={handleDocChange} style={{ fontSize: '.8rem' }} />
                    {form.document_url && <span style={{ display: 'block', marginTop: 6, fontSize: '.76rem', color: '#3F7D5A', fontWeight: 600 }}>✓ Uitnodiging geüpload</span>}
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" disabled={loading} style={{ padding: '8px 16px', background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 8, fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer' }}>
              {loading ? 'Bezig…' : editId ? 'Opslaan' : 'Toevoegen'}
            </button>
            <button type="button" onClick={resetForm} style={{ padding: '8px 16px', background: 'none', border: '1.5px solid #C2D9C9', borderRadius: 8, fontFamily: 'inherit', fontWeight: 600, color: '#6A8A75', cursor: 'pointer' }}>
              Annuleren
            </button>
          </div>
        </form>
      )}

      {/* Lijst */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {entries.length === 0 && <p style={{ color: '#6A8A75', fontSize: '.88rem' }}>Geen activiteiten gevonden.</p>}
        {entries.map(ev => {
          const dateObj = new Date(ev.date)
          const dateStr = `${dateObj.getDate()} ${MAANDEN[dateObj.getMonth() + 1]} ${dateObj.getFullYear()}`
          const isKamp = ev.source === 'kamp'
          const highlighted = highlightTak ? ev.audience.includes(highlightTak as AudienceTag) : false
          return (
            <div key={`${ev.source}-${ev.id}`} style={{
              background: '#fff', borderRadius: 12, padding: 16,
              border: highlighted ? '2px solid #C9963A' : '1.5px solid #C2D9C9',
              boxShadow: highlighted ? '0 2px 10px rgba(201,150,58,.18)' : 'none',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    {ev.is_evenement && <span title="Evenement" style={{ color: '#C9963A' }}>⭐</span>}
                    {isKamp && <span style={{ padding: '1px 8px', borderRadius: 20, fontSize: '.68rem', fontWeight: 800, background: '#1A3D2A18', color: '#1A3D2A' }}>🏕️ KAMP</span>}
                    <TagChips tags={ev.audience} />
                  </div>
                  <strong style={{ fontSize: '1.05rem', color: '#1A3D2A', display: 'block' }}>{ev.title}</strong>
                  <span style={{ fontSize: '.82rem', color: '#6A8A75', fontWeight: 600 }}>
                    📅 {dateStr}{ev.datum_tot && ev.datum_tot !== ev.date ? ` – ${new Date(ev.datum_tot).getDate()} ${MAANDEN[new Date(ev.datum_tot).getMonth() + 1]}` : ''}
                    {ev.time && ` · 🕒 ${ev.time}`}{ev.location && ` · 📍 ${ev.location}`}
                  </span>
                  {ev.description && <p style={{ fontSize: '.86rem', color: '#3A5A42', margin: '8px 0 0', lineHeight: 1.4 }}>{ev.description}</p>}
                </div>
                {!readOnly && (
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {isKamp ? (
                      <span style={{ fontSize: '.72rem', color: '#9AB0A2', alignSelf: 'center' }}>via Kampen-beheer</span>
                    ) : (
                      <>
                        <button onClick={() => startEdit(ev)} style={{ padding: '6px 12px', border: '1.5px solid #C9963A', borderRadius: 8, background: 'none', color: '#C9963A', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer' }}>Bewerken</button>
                        <button onClick={() => handleDelete(ev.id, ev.title)} style={{ padding: '6px 12px', border: '1.5px solid #B23A4D', borderRadius: 8, background: 'none', color: '#B23A4D', fontSize: '.75rem', cursor: 'pointer' }}>✕</button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
