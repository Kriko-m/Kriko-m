'use client'
import { useState } from 'react'
import { CalendarEvent, AudienceTag } from '@/lib/types'
import { AUDIENCE_TAGS, AUDIENCE_NAMEN, AUDIENCE_KLEUREN } from '@/lib/constants'

type FormState = {
  title: string; date: string; datum_tot: string; timeStart: string; timeEnd: string
  location: string; description: string; audience: AudienceTag[]
  is_evenement: boolean; cover_image: string; document_url: string
  banner_image: string; header: string; body: string
  facebook_event_url: string; external_link_url: string
}

function parseTime(time: string) {
  const parts = time.split(/\s*[-–]\s*/)
  return { timeStart: parts[0]?.trim() ?? '', timeEnd: parts[1]?.trim() ?? '' }
}

function emptyForm(preAudience: AudienceTag[]): FormState {
  return {
    title: '', date: '', datum_tot: '', timeStart: '', timeEnd: '',
    location: '', description: '', audience: preAudience,
    is_evenement: false, cover_image: '', document_url: '',
    banner_image: '', header: '', body: '',
    facebook_event_url: '', external_link_url: '',
  }
}

export default function KalenderActiviteitModal({
  canPublish,
  initialAudience = [],
  editEvent,
  onClose,
  onSaved,
  onDeleted,
}: {
  canPublish: boolean
  initialAudience?: AudienceTag[]
  editEvent?: CalendarEvent
  onClose: () => void
  onSaved: (event: CalendarEvent, isNew: boolean) => void
  onDeleted?: (id: string) => void
}) {
  const [form, setForm] = useState<FormState>(() =>
    editEvent
      ? { title: editEvent.title, date: editEvent.date, datum_tot: '',
          location: editEvent.location, description: editEvent.description, audience: editEvent.audience,
          is_evenement: editEvent.is_evenement, cover_image: editEvent.cover_image, document_url: editEvent.document_url,
          banner_image: editEvent.banner_image ?? '', header: editEvent.header ?? '', body: editEvent.body ?? '',
          facebook_event_url: editEvent.facebook_event_url ?? '', external_link_url: editEvent.external_link_url ?? '',
          ...parseTime(editEvent.time) }
      : emptyForm(initialAudience)
  )
  const [loading, setLoading] = useState(false)
  const [flash, setFlash] = useState('')
  const [validationErrors, setValidationErrors] = useState<Set<string>>(new Set())
  const [facebookLinkOpen, setFacebookLinkOpen] = useState(!!(editEvent?.facebook_event_url))
  const [externalLinkOpen, setExternalLinkOpen] = useState(!!(editEvent?.external_link_url))

  const selectableTags: AudienceTag[] = canPublish ? [...AUDIENCE_TAGS] : AUDIENCE_TAGS.filter(t => t !== 'groep')

  function toggleAudience(tag: AudienceTag) {
    setForm(p => {
      const has = p.audience.includes(tag)
      return { ...p, audience: has ? p.audience.filter(a => a !== tag) : [...p.audience, tag] }
    })
  }

  async function uploadMedia(file: File, type: 'evenement-cover' | 'evenement-banner' | 'evenement-document'): Promise<string | null> {
    const fd = new FormData(); fd.append('file', file); fd.append('type', type)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    if (!res.ok) { setFlash('Fout bij uploaden van bestand.'); return null }
    return ((await res.json()).url) as string
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setLoading(true); const url = await uploadMedia(file, 'evenement-cover')
    if (url) setForm(p => ({ ...p, cover_image: url })); setLoading(false)
  }
  async function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setLoading(true); const url = await uploadMedia(file, 'evenement-banner')
    if (url) setForm(p => ({ ...p, banner_image: url })); setLoading(false)
  }
  async function handleDocChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setLoading(true); const url = await uploadMedia(file, 'evenement-document')
    if (url) setForm(p => ({ ...p, document_url: url })); setLoading(false)
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
      time: [form.timeStart, form.timeEnd].filter(Boolean).join(' - '),
      location: form.location, description: form.description,
      audience: form.audience, is_evenement: form.is_evenement,
      cover_image: form.cover_image, document_url: form.document_url,
      banner_image: form.banner_image, header: form.header, body: form.body,
      facebook_event_url: form.facebook_event_url || null,
      external_link_url: form.external_link_url || null,
    }
    const isNew = !editEvent
    const url = editEvent ? `/api/admin/calendar/${editEvent.id}` : '/api/admin/calendar'
    const method = editEvent ? 'PATCH' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (res.ok) {
      onSaved(await res.json(), isNew)
    } else {
      const err = await res.json().catch(() => ({}))
      setFlash(err.error || 'Fout bij het opslaan.')
    }
    setLoading(false)
  }

  async function handleDelete() {
    if (!editEvent) return
    setLoading(true)
    const res = await fetch(`/api/admin/calendar/${editEvent.id}`, { method: 'DELETE' })
    if (res.ok) { onDeleted?.(editEvent.id) }
    else setFlash('Fout bij verwijderen.')
    setLoading(false)
  }

  const inputStyle = { width: '100%', padding: '9px 12px', border: '1.5px solid #C2D9C9', borderRadius: 8, fontFamily: 'inherit', fontSize: '.9rem', boxSizing: 'border-box' as const }
  const labelStyle = { display: 'block', fontSize: '.8rem', fontWeight: 700, color: '#1A3D2A', marginBottom: 5 }
  const errorOutline = (f: string): React.CSSProperties => validationErrors.has(f)
    ? { boxShadow: '0 0 0 2px #e74c3c, 0 0 10px rgba(231,76,60,.35)', borderRadius: 8 }
    : {}

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999 }} onClick={onClose} />
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto', width: '95%', maxWidth: 800, maxHeight: '92vh', overflow: 'auto', background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ margin: 0, color: '#1A3D2A', fontWeight: 800, fontSize: '1.3rem' }}>
              {editEvent ? 'Activiteit bewerken' : 'Nieuwe activiteit'}
            </h3>
            <div style={{ display: 'flex', gap: 8 }}>
              {editEvent && (
                <button type="button" onClick={handleDelete}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'none', border: '1.5px solid #e0c0c4', borderRadius: 8, color: '#B23A4D', fontSize: '.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  <i className="fas fa-trash" style={{ fontSize: '.72rem' }}></i> Verwijderen
                </button>
              )}
              <button type="button" onClick={onClose}
                style={{ width: 32, height: 32, border: '1.5px solid #C2D9C9', borderRadius: 8, background: 'none', color: '#6A8A75', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ✕
              </button>
            </div>
          </div>

          {flash && (
            <div style={{ background: 'hsla(145,33%,36%,.1)', border: '1.5px solid #3F7D5A', color: '#2C5A40', padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontWeight: 600, fontSize: '.9rem' }}>
              {flash}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Audience tags */}
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
              {form.audience.includes('groep') && (
                <span style={{ display: 'block', marginTop: 5, fontSize: '.73rem', color: '#9A6B12', fontWeight: 600 }}>
                  ⚠️ Met de tag &ldquo;Groep&rdquo; wordt dit zichtbaar op de publieke website.
                </span>
              )}
            </div>

            {/* Title */}
            <div>
              <label style={labelStyle}>Titel</label>
              <input style={{ ...inputStyle, ...errorOutline('title') }} value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                onBlur={() => setForm(p => ({ ...p, title: p.title.trim() }))}
                placeholder="bijv. Groeps-BBQ" />
            </div>

            {/* Time & Dates */}
            <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.5fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Tijdstip</label>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', ...errorOutline('time') }}>
                  <input type="time" style={{ ...inputStyle, flex: 1, border: 'none' }} value={form.timeStart} onChange={e => setForm(p => ({ ...p, timeStart: e.target.value }))} />
                  <span style={{ color: '#6A8A75', fontWeight: 600, fontSize: '.85rem', flexShrink: 0 }}>–</span>
                  <input type="time" style={{ ...inputStyle, flex: 1, border: 'none' }} value={form.timeEnd} onChange={e => setForm(p => ({ ...p, timeEnd: e.target.value }))} />
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
                        <input type="date" style={{ ...inputStyle, width: '100%', background: '#fafaf8', color: '#999', fontSize: '.85rem' }} value={form.datum_tot} onChange={e => setForm(p => ({ ...p, datum_tot: e.target.value }))} />
                      </div>
                      <button type="button" onClick={() => setForm(p => ({ ...p, datum_tot: '' }))}
                        style={{ flexShrink: 0, background: 'none', border: 'none', color: '#ddd', cursor: 'pointer', fontSize: '.9rem', lineHeight: 1, padding: '0 2px' }}>×</button>
                    </>
                  ) : (
                    <button type="button" onClick={() => setForm(p => ({ ...p, datum_tot: p.date || new Date().toISOString().split('T')[0] }))}
                      style={{ flexShrink: 0, background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '.7rem', fontWeight: 500, padding: '5px 6px', whiteSpace: 'nowrap', textDecoration: 'underline' }}>
                      + einddatum
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Location & Description */}
            <div>
              <label style={labelStyle}>Locatie</label>
              <input style={inputStyle} value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                onBlur={() => setForm(p => ({ ...p, location: p.location.trim() }))} placeholder="bijv. Scoutslokalen" />
            </div>
            <div>
              <label style={labelStyle}>Omschrijving</label>
              <textarea style={inputStyle} rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                onBlur={() => setForm(p => ({ ...p, description: p.description.trim() }))} placeholder="Korte uitleg..." />
            </div>

            {/* Optional toggles */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, color: '#1A3D2A', fontSize: '.85rem' }}>
                <input type="checkbox" checked={facebookLinkOpen} onChange={e => setFacebookLinkOpen(e.target.checked)} style={{ cursor: 'pointer' }} />
                Facebook evenement?
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, color: '#1A3D2A', fontSize: '.85rem' }}>
                <input type="checkbox" checked={externalLinkOpen} onChange={e => setExternalLinkOpen(e.target.checked)} style={{ cursor: 'pointer' }} />
                Externe link?
              </label>
              {canPublish && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, color: '#1A3D2A', fontSize: '.85rem' }}>
                  <input type="checkbox" checked={form.is_evenement} onChange={e => setForm(p => ({ ...p, is_evenement: e.target.checked }))} style={{ cursor: 'pointer' }} />
                  ⭐ Uitlichten op kalender (ster + highlight)
                </label>
              )}
            </div>

            {facebookLinkOpen && (
              <div>
                <label style={labelStyle}>Facebook evenement link</label>
                <input style={inputStyle} value={form.facebook_event_url} onChange={e => setForm(p => ({ ...p, facebook_event_url: e.target.value }))} placeholder="https://facebook.com/events/..." />
              </div>
            )}

            {externalLinkOpen && (
              <div>
                <label style={labelStyle}>Externe link</label>
                <input style={inputStyle} value={form.external_link_url} onChange={e => setForm(p => ({ ...p, external_link_url: e.target.value }))} placeholder="https://example.com/form" />
              </div>
            )}

            {canPublish && form.audience.includes('groep') && (
              <div style={{ padding: 14, background: '#f9f9f9', border: '1.5px solid #E2C58D', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <span style={{ fontSize: '.78rem', fontWeight: 700, color: '#9A6B12' }}>
                  ✨ Extra info voor de publieke kalender (klapt open bij klik)
                </span>

                <div>
                  <label style={labelStyle}>Tussentitel / header</label>
                  <input style={inputStyle} value={form.header} onChange={e => setForm(p => ({ ...p, header: e.target.value }))} placeholder="bijv. Iedereen welkom!" />
                </div>

                <div>
                  <label style={labelStyle}>Uitnodigingstekst</label>
                  <textarea style={inputStyle} rows={4} value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} placeholder="Volledige uitnodiging / alle details…" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Hero-foto</label>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverChange} style={{ fontSize: '.74rem' }} />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {form.cover_image && <img src={form.cover_image} alt="hero" style={{ width: '100%', height: 56, objectFit: 'cover', borderRadius: 7, marginTop: 8 }} />}
                  </div>
                  <div>
                    <label style={labelStyle}>Banner</label>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleBannerChange} style={{ fontSize: '.74rem' }} />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {form.banner_image && <img src={form.banner_image} alt="banner" style={{ width: '100%', height: 56, objectFit: 'cover', borderRadius: 7, marginTop: 8 }} />}
                  </div>
                  <div>
                    <label style={labelStyle}>Uitnodiging (PDF)</label>
                    <input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={handleDocChange} style={{ fontSize: '.74rem' }} />
                    {form.document_url && <span style={{ display: 'block', marginTop: 5, fontSize: '.74rem', color: '#3F7D5A', fontWeight: 600 }}>✓ Geüpload</span>}
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button type="submit" disabled={loading}
                style={{ padding: '10px 18px', background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 8, fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer', fontSize: '.9rem', flex: 1 }}>
                {loading ? 'Bezig…' : editEvent ? 'Opslaan' : 'Toevoegen'}
              </button>
              <button type="button" onClick={onClose}
                style={{ padding: '10px 18px', background: '#f5f5f5', border: 'none', borderRadius: 8, fontFamily: 'inherit', fontWeight: 600, color: '#6A8A75', cursor: 'pointer', fontSize: '.9rem' }}>
                Annuleren
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  )
}
