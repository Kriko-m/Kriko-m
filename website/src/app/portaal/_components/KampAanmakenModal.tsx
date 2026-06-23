'use client'
import { useState } from 'react'
import { KAMP_AGE_TAKKEN } from '@/lib/kamp'
import { AUDIENCE_NAMEN, AUDIENCE_KLEUREN } from '@/lib/constants'

const inputStyle = { width: '100%', padding: '9px 12px', border: '1.5px solid #C2D9C9', borderRadius: 8, fontFamily: 'inherit', fontSize: '.9rem', boxSizing: 'border-box' as const }
const labelStyle = { display: 'block', fontSize: '.8rem', fontWeight: 700, color: '#1A3D2A', marginBottom: 5 }

export default function KampAanmakenModal({
  defaultTak,
  isGroepsleiding = false,
  defaultContactEmail = '',
  onClose,
  onCreated,
}: {
  defaultTak: string
  isGroepsleiding?: boolean
  defaultContactEmail?: string
  onClose: () => void
  onCreated: (kamp: unknown) => void
}) {
  // Beschikbare tags: leiding = enkel de leeftijdstakken; GL ook 'groep' + 'leiding'.
  const beschikbareTags: string[] = isGroepsleiding
    ? [...KAMP_AGE_TAKKEN, 'groep', 'leiding']
    : [...KAMP_AGE_TAKKEN]
  // Preselecteer de huidige tab-tak (enkel als het een leeftijdstak is).
  const initAudience = (KAMP_AGE_TAKKEN as readonly string[]).includes(defaultTak) ? [defaultTak] : []

  const [form, setForm] = useState({ naam: '', locatie: '', datum_van: '', datum_tot: '', prijs: '', contact_info: defaultContactEmail, beschrijving: '' })
  const [audience, setAudience] = useState<string[]>(initAudience)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function toggleTag(tag: string) {
    setAudience(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (audience.length === 0) { setError('Selecteer minstens één tag.'); return }
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/kampen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        naam: form.naam,
        locatie: form.locatie,
        datum_van: form.datum_van,
        datum_tot: form.datum_tot,
        prijs: form.prijs ? Number(form.prijs) : 0,
        contact_info: form.contact_info,
        beschrijving: form.beschrijving,
        audience,
      }),
    })
    if (res.ok) {
      const created = await res.json()
      onCreated(created)
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Fout bij aanmaken. Probeer opnieuw.')
    }
    setLoading(false)
  }

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 999 }} onClick={onClose} />
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto', width: '95%', maxWidth: 560, background: '#fff', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', overflow: 'hidden' }}>

          <div style={{ padding: '20px 24px 16px', borderBottom: '1.5px solid #E8F0EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#1A3D2A', fontWeight: 900, fontSize: '1.2rem' }}>Nieuw kamp of weekend</h3>
            <button onClick={onClose} type="button" style={{ width: 32, height: 32, border: '1.5px solid #C2D9C9', borderRadius: 8, background: 'none', color: '#6A8A75', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {error && <div style={{ background: '#fdf0f2', border: '1.5px solid #e0c0c4', color: '#B23A4D', padding: '10px 14px', borderRadius: 8, fontSize: '.85rem', fontWeight: 600 }}>{error}</div>}

            <div>
              <label style={labelStyle}>Voor wie? (tags)</label>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {beschikbareTags.map(tag => {
                  const on = audience.includes(tag)
                  return (
                    <button key={tag} type="button" onClick={() => toggleTag(tag)}
                      style={{ padding: '4px 12px', borderRadius: 20, border: `1.5px solid ${AUDIENCE_KLEUREN[tag]}`, cursor: 'pointer', fontSize: '.78rem', fontWeight: 700,
                        background: on ? AUDIENCE_KLEUREN[tag] : 'transparent', color: on ? '#fff' : AUDIENCE_KLEUREN[tag] }}>
                      {on ? '✓ ' : ''}{AUDIENCE_NAMEN[tag]}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Naam</label>
                <input style={inputStyle} value={form.naam} onChange={e => setForm(p => ({ ...p, naam: e.target.value }))} required placeholder="bijv. Zomerkamp of Groepsweekend" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Locatie</label>
                <input style={inputStyle} value={form.locatie} onChange={e => setForm(p => ({ ...p, locatie: e.target.value }))} placeholder="bijv. Turnhout" />
              </div>
              <div>
                <label style={labelStyle}>Startdatum</label>
                <input type="date" style={inputStyle} value={form.datum_van} onChange={e => setForm(p => ({ ...p, datum_van: e.target.value }))} required />
              </div>
              <div>
                <label style={labelStyle}>Einddatum</label>
                <input type="date" style={inputStyle} value={form.datum_tot} onChange={e => setForm(p => ({ ...p, datum_tot: e.target.value }))} required />
              </div>
              <div>
                <label style={labelStyle}>Prijs (€)</label>
                <input type="number" min="0" step="0.01" style={inputStyle} value={form.prijs} onChange={e => setForm(p => ({ ...p, prijs: e.target.value }))} placeholder="0" />
              </div>
              <div>
                <label style={labelStyle}>Contact e-mail</label>
                <input type="email" style={inputStyle} value={form.contact_info} onChange={e => setForm(p => ({ ...p, contact_info: e.target.value }))} placeholder="tak@kriko-m.be" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Beschrijving</label>
                <textarea style={inputStyle} rows={3} value={form.beschrijving} onChange={e => setForm(p => ({ ...p, beschrijving: e.target.value }))} placeholder="Korte toelichting..." />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
              <button type="submit" disabled={loading} style={{ padding: '9px 24px', background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 8, fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer', fontSize: '.9rem' }}>
                {loading ? 'Bezig…' : 'Aanmaken'}
              </button>
              <button type="button" onClick={onClose} style={{ padding: '9px 16px', background: 'none', border: '1.5px solid #C2D9C9', borderRadius: 8, fontFamily: 'inherit', fontWeight: 600, color: '#6A8A75', cursor: 'pointer', fontSize: '.9rem' }}>
                Annuleren
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
