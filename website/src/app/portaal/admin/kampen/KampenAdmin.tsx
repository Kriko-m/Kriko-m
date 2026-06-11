'use client'
import { useState } from 'react'
import { Kamp } from '@/lib/types'
import { CopyLinkButton, RsvpPanel } from '../../_components/CampRsvpPanel'

const TAKKEN = ['kapoenen', 'welpen', 'jonggivers', 'givers', 'alle']
const TAK_KLEUREN: Record<string, string> = {
  kapoenen: '#F4C842', welpen: '#5D9E6C', jonggivers: '#4A7BBF', givers: '#C9963A', alle: '#1A3D2A',
}

interface KampFormState {
  id?: string
  naam: string
  tak: string
  datum_van: string
  datum_tot: string
  locatie: string
  beschrijving: string
  open_voor_inschrijving: boolean
  prijs: string | number
}

const LEEG_KAMP: KampFormState = { naam: '', tak: 'welpen', datum_van: '', datum_tot: '', locatie: '', beschrijving: '', open_voor_inschrijving: false, prijs: '' }

export default function KampenAdmin({ kampen: initial }: { kampen: Kamp[] }) {
  const [kampen, setKampen] = useState<Kamp[]>(initial)
  const [form, setForm] = useState<KampFormState>(LEEG_KAMP)
  const [editId, setEditId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [flash, setFlash] = useState('')
  const [openRsvp, setOpenRsvp] = useState<string | null>(null)

  function showFlash(msg: string) { setFlash(msg); setTimeout(() => setFlash(''), 3500) }

  function startEdit(kamp: Kamp) {
    setForm({ ...kamp, prijs: kamp.prijs ?? '' })
    setEditId(kamp.id)
    setShowForm(true)
  }

  function startNew() {
    setForm(LEEG_KAMP)
    setEditId(null)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const body = { ...form, prijs: form.prijs === '' ? 0 : Number(form.prijs) }

    if (editId) {
      const res = await fetch(`/api/admin/kampen/${editId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) {
        const updated = await res.json()
        setKampen(prev => prev.map(k => k.id === editId ? updated : k))
        showFlash('Kamp bijgewerkt.')
      }
    } else {
      const res = await fetch('/api/admin/kampen', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) {
        const created = await res.json()
        setKampen(prev => [...prev, created])
        showFlash('Kamp aangemaakt.')
      }
    }
    setShowForm(false)
    setLoading(false)
  }

  async function togglePubliek(id: string, current: boolean) {
    const res = await fetch(`/api/admin/kampen/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ open_voor_inschrijving: !current }) })
    if (res.ok) {
      setKampen(prev => prev.map(k => k.id === id ? { ...k, open_voor_inschrijving: !current } : k))
      showFlash(!current ? 'Kamp gepubliceerd.' : 'Kamp op privé gezet.')
    }
  }

  async function verwijder(id: string, naam: string) {
    if (!confirm(`"${naam}" verwijderen?`)) return
    await fetch(`/api/admin/kampen/${id}`, { method: 'DELETE' })
    setKampen(prev => prev.filter(k => k.id !== id))
    showFlash('Kamp verwijderd.')
  }

  const inputStyle = { width: '100%', padding: '9px 12px', border: '1.5px solid #C2D9C9', borderRadius: 8, fontFamily: 'inherit', fontSize: '.9rem', boxSizing: 'border-box' as const }
  const labelStyle = { display: 'block', fontSize: '.8rem', fontWeight: 700, color: '#1A3D2A', marginBottom: 5 }

  return (
    <div>
      {flash && <div style={{ background: 'hsla(145,33%,36%,.1)', border: '1.5px solid #3F7D5A', color: '#2C5A40', padding: '10px 16px', borderRadius: 10, marginBottom: 20, fontWeight: 600 }}>{flash}</div>}

      <button onClick={startNew} style={{ marginBottom: 24, padding: '10px 22px', background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'inherit', fontWeight: 700, fontSize: '.95rem', cursor: 'pointer' }}>
        + Nieuw kamp aanmaken
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1.5px solid #2A5C3F', borderRadius: 16, padding: '24px 26px', marginBottom: 28 }}>
          <h3 style={{ margin: '0 0 20px', color: '#1A3D2A', fontFamily: 'var(--font-heading, Nunito, sans-serif)' }}>{editId ? 'Kamp bewerken' : 'Nieuw kamp'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
             <div><label style={labelStyle}>Naam</label><input style={inputStyle} value={form.naam} onChange={e => setForm(p => ({...p, naam: e.target.value}))} required /></div>
            <div>
              <label style={labelStyle}>Tak</label>
              <select style={inputStyle} value={form.tak} onChange={e => setForm(p => ({...p, tak: e.target.value}))}>
                {TAKKEN.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Datum van</label><input type="date" style={inputStyle} value={form.datum_van} onChange={e => setForm(p => ({...p, datum_van: e.target.value}))} required /></div>
            <div><label style={labelStyle}>Datum tot</label><input type="date" style={inputStyle} value={form.datum_tot} onChange={e => setForm(p => ({...p, datum_tot: e.target.value}))} required /></div>
            <div><label style={labelStyle}>Locatie</label><input style={inputStyle} value={form.locatie} onChange={e => setForm(p => ({...p, locatie: e.target.value}))} /></div>
            <div><label style={labelStyle}>Prijs (€)</label><input type="number" min="0" step="0.01" style={inputStyle} value={form.prijs} onChange={e => setForm(p => ({...p, prijs: e.target.value}))} placeholder="0" /></div>
            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Beschrijving</label><textarea style={{...inputStyle, resize: 'vertical'}} rows={3} value={form.beschrijving} onChange={e => setForm(p => ({...p, beschrijving: e.target.value}))} /></div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, fontSize: '.88rem', color: '#1A3D2A' }}>
                <input type="checkbox" checked={form.open_voor_inschrijving} onChange={e => setForm(p => ({...p, open_voor_inschrijving: e.target.checked}))} />
                Meteen openstellen voor inschrijving
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button type="submit" disabled={loading} style={{ padding: '10px 24px', background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 8, fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer' }}>
              {loading ? 'Bezig…' : editId ? 'Opslaan' : 'Aanmaken'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 20px', background: 'none', border: '1.5px solid #C2D9C9', borderRadius: 8, fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', color: '#6A8A75' }}>Annuleer</button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {kampen.length === 0 && <p style={{ color: '#6A8A75' }}>Nog geen kampen aangemaakt.</p>}
        {kampen.map(kamp => {
          const kleur = TAK_KLEUREN[kamp.tak] ?? '#888'
          const van = new Date(kamp.datum_van)
          const tot = new Date(kamp.datum_tot)
          const periode = `${van.getDate()}/${van.getMonth()+1} – ${tot.getDate()}/${tot.getMonth()+1}/${tot.getFullYear()}`
          return (
            <div key={kamp.id} style={{ background: '#fff', border: `1.5px solid ${kleur}55`, borderRadius: 14, padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ padding: '2px 8px', background: `${kleur}33`, color: kleur, borderRadius: 20, fontSize: '.72rem', fontWeight: 800, textTransform: 'uppercase' }}>{kamp.tak}</span>
                    {kamp.open_voor_inschrijving && <span style={{ padding: '2px 8px', background: 'hsla(145,33%,36%,.12)', color: '#3F7D5A', borderRadius: 20, fontSize: '.72rem', fontWeight: 700 }}>✓ Open</span>}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1A3D2A' }}>{kamp.naam}</div>
                  <div style={{ fontSize: '.82rem', color: '#6A8A75', marginTop: 3 }}>📅 {periode} &nbsp;·&nbsp; 📍 {kamp.locatie}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <CopyLinkButton slug={kamp.slug} />
                  <button onClick={() => setOpenRsvp(openRsvp === kamp.id ? null : kamp.id)}
                    style={{ padding: '6px 12px', border: '1.5px solid #3F7D5A', borderRadius: 8, background: openRsvp === kamp.id ? '#3F7D5A' : 'none', color: openRsvp === kamp.id ? '#fff' : '#3F7D5A', fontSize: '.78rem', fontWeight: 700, cursor: 'pointer' }}>
                    {openRsvp === kamp.id ? 'Antwoorden verbergen' : '📋 Antwoorden'}
                  </button>
                  <a href={`/api/admin/kampen/${kamp.id}/export`} download
                    style={{ padding: '6px 12px', border: '1.5px solid #C9963A', borderRadius: 8, background: '#C9963A', color: '#fff', fontSize: '.78rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                    Exporteren (CSV)
                  </a>
                  <button onClick={() => togglePubliek(kamp.id, kamp.open_voor_inschrijving)}
                    style={{ padding: '6px 12px', border: `1.5px solid ${kamp.open_voor_inschrijving ? '#B23A4D' : '#3F7D5A'}`, borderRadius: 8, background: 'none', color: kamp.open_voor_inschrijving ? '#B23A4D' : '#3F7D5A', fontSize: '.78rem', fontWeight: 700, cursor: 'pointer' }}>
                    {kamp.open_voor_inschrijving ? 'Verbergen' : 'Publiceren'}
                  </button>
                  <button onClick={() => startEdit(kamp)} style={{ padding: '6px 12px', border: '1.5px solid #1A3D2A', borderRadius: 8, background: 'none', color: '#1A3D2A', fontSize: '.78rem', fontWeight: 700, cursor: 'pointer' }}>Bewerken</button>
                  <button onClick={() => verwijder(kamp.id, kamp.naam)} style={{ padding: '6px 12px', border: '1.5px solid #B23A4D', borderRadius: 8, background: 'none', color: '#B23A4D', fontSize: '.78rem', fontWeight: 700, cursor: 'pointer' }}>Verwijder</button>
                </div>
              </div>
              {openRsvp === kamp.id && <RsvpPanel kampId={kamp.id} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
