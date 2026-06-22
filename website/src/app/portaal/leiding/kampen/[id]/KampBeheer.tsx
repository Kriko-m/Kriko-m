'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Kamp, KampBestand } from '@/lib/types'
import { TAK_NAMEN, TAK_KLEUREN } from '@/lib/constants'
import {
  parsePackingList, formatPackingList, PAKLIJST_TEMPLATES,
  BESTAND_TYPES, BESTAND_LABELS,
} from '@/lib/kamp'
import { CopyLinkButton, RsvpPanel } from '../../../_components/CampRsvpPanel'

const inputStyle = { width: '100%', padding: '9px 12px', border: '1.5px solid #C2D9C9', borderRadius: 8, fontFamily: 'inherit', fontSize: '.9rem', boxSizing: 'border-box' as const }
const labelStyle = { display: 'block', fontSize: '.8rem', fontWeight: 700, color: '#1A3D2A', marginBottom: 5 }
const cardStyle = { background: '#fff', border: '1.5px solid #C2D9C9', borderRadius: 16, padding: 22, marginBottom: 20 }
const sectionTitle = { margin: '0 0 16px', color: '#1A3D2A', fontWeight: 800, fontSize: '1.05rem' }

export default function KampBeheer({ initialKamp, canPublish }: { initialKamp: Kamp; canPublish: boolean }) {
  const router = useRouter()
  const [kamp, setKamp] = useState<Kamp>(initialKamp)
  const [loading, setLoading] = useState(false)
  const [flash, setFlash] = useState('')

  const templateKey = kamp.tak === 'alle' ? 'groep' : kamp.tak

  const [form, setForm] = useState({
    naam: kamp.naam, locatie: kamp.locatie, datum_van: kamp.datum_van, datum_tot: kamp.datum_tot,
    prijs: String(kamp.prijs ?? ''), contact_info: kamp.contact_info ?? '', briefadres: kamp.briefadres ?? '',
    beschrijving: kamp.beschrijving ?? '', paklijstText: formatPackingList(kamp.paklijst),
  })

  // Link-bijlage (bv. Google Slides) toevoegen.
  const [linkType, setLinkType] = useState<string>('presentatie')
  const [linkNaam, setLinkNaam] = useState('')
  const [linkUrl, setLinkUrl] = useState('')

  function showFlash(msg: string) {
    setFlash(msg)
    setTimeout(() => setFlash(''), 3000)
  }

  const kleur = TAK_KLEUREN[kamp.tak] ?? '#1A3D2A'
  const van = new Date(kamp.datum_van)
  const tot = new Date(kamp.datum_tot)
  const periode = `${van.getDate()}/${van.getMonth() + 1} – ${tot.getDate()}/${tot.getMonth() + 1}/${tot.getFullYear()}`
  const bestanden = kamp.kamp_bestanden ?? []

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const payload = {
      naam: form.naam, locatie: form.locatie, datum_van: form.datum_van, datum_tot: form.datum_tot,
      prijs: form.prijs ? Number(form.prijs) : 0, contact_info: form.contact_info, briefadres: form.briefadres,
      beschrijving: form.beschrijving, paklijst: parsePackingList(form.paklijstText),
    }
    const res = await fetch(`/api/admin/kampen/${kamp.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    })
    if (res.ok) {
      const updated = await res.json()
      setKamp(prev => ({ ...prev, ...updated }))
      showFlash('Gegevens opgeslagen!')
    } else {
      showFlash('Fout bij opslaan.')
    }
    setLoading(false)
  }

  async function handleTogglePubliek() {
    const next = !kamp.open_voor_inschrijving
    const res = await fetch(`/api/admin/kampen/${kamp.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ open_voor_inschrijving: next }),
    })
    if (res.ok) {
      setKamp(prev => ({ ...prev, open_voor_inschrijving: next }))
      showFlash(next ? 'Kamp gepubliceerd!' : 'Kamp op privé gezet.')
    }
  }

  async function handleDelete() {
    if (!confirm(`Weet je zeker dat je "${kamp.naam}" en alle inschrijvingen wilt verwijderen?`)) return
    const res = await fetch(`/api/admin/kampen/${kamp.id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/portaal/leiding')
    } else {
      showFlash('Fout bij verwijderen.')
    }
  }

  async function handleUploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('type', 'kamp-foto')
    fd.append('kampId', kamp.id)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    if (res.ok) {
      const updated = await res.json()
      setKamp(prev => ({ ...prev, foto: updated.foto }))
      showFlash('Omslagfoto geüpload!')
    } else {
      showFlash('Fout bij uploaden foto.')
    }
    setLoading(false)
  }

  async function handleUploadBestand(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formEl = e.currentTarget
    const data = new FormData(formEl)
    const file = data.get('bestand') as File
    if (!file || !file.size) { showFlash('Selecteer eerst een bestand.'); return }
    setLoading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('type', 'kamp-bestand')
    fd.append('kampId', kamp.id)
    fd.append('bestandType', data.get('bestandType') as string)
    fd.append('bestandNaam', data.get('bestandNaam') as string)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    if (res.ok) {
      const nieuw = await res.json()
      setKamp(prev => ({ ...prev, kamp_bestanden: [...(prev.kamp_bestanden ?? []), nieuw] }))
      formEl.reset()
      showFlash('Bestand geüpload!')
    } else {
      const err = await res.json().catch(() => ({}))
      showFlash(err.error || 'Fout bij uploaden bestand.')
    }
    setLoading(false)
  }

  async function handleAddLink(e: React.FormEvent) {
    e.preventDefault()
    if (!linkNaam.trim() || !linkUrl.trim()) { showFlash('Geef een label én een link op.'); return }
    setLoading(true)
    const res = await fetch(`/api/admin/kampen/${kamp.id}/bestanden`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: linkType, naam: linkNaam.trim(), url: linkUrl.trim() }),
    })
    if (res.ok) {
      const nieuw = await res.json()
      setKamp(prev => ({ ...prev, kamp_bestanden: [...(prev.kamp_bestanden ?? []), nieuw] }))
      setLinkNaam(''); setLinkUrl('')
      showFlash('Link toegevoegd!')
    } else {
      const err = await res.json().catch(() => ({}))
      showFlash(err.error || 'Fout bij toevoegen link.')
    }
    setLoading(false)
  }

  async function handleDeleteBestand(bestandId: string) {
    if (!confirm('Dit item verwijderen?')) return
    const res = await fetch(`/api/admin/kampen/${kamp.id}/bestanden/${bestandId}`, { method: 'DELETE' })
    if (res.ok) {
      setKamp(prev => ({ ...prev, kamp_bestanden: (prev.kamp_bestanden ?? []).filter(b => b.id !== bestandId) }))
      showFlash('Verwijderd.')
    }
  }

  return (
    <div style={{ maxWidth: 920, margin: '0 auto' }}>
      {/* Terug + flash */}
      <Link href="/portaal/leiding" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#6A8A75', fontSize: '.85rem', fontWeight: 700, textDecoration: 'none', marginBottom: 16 }}>
        ← Terug naar overzicht
      </Link>
      {flash && (
        <div style={{ background: 'hsla(145,33%,36%,.1)', border: '1.5px solid #3F7D5A', color: '#2C5A40', padding: '12px 18px', borderRadius: 10, marginBottom: 20, fontWeight: 600 }}>
          {flash}
        </div>
      )}

      {/* Header */}
      <div style={{ ...cardStyle, borderTop: `5px solid ${kleur}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ padding: '2px 10px', background: `${kleur}22`, color: kleur, borderRadius: 20, fontSize: '.72rem', fontWeight: 800, textTransform: 'uppercase' }}>{TAK_NAMEN[kamp.tak] ?? kamp.tak}</span>
          {kamp.open_voor_inschrijving
            ? <span style={{ padding: '2px 10px', background: 'hsla(145,33%,36%,.1)', color: '#3F7D5A', borderRadius: 20, fontSize: '.72rem', fontWeight: 700 }}>✓ Gepubliceerd</span>
            : <span style={{ padding: '2px 10px', background: '#F0ECE4', color: '#8A6A2A', borderRadius: 20, fontSize: '.72rem', fontWeight: 700 }}>Privé (concept)</span>}
        </div>
        <h1 style={{ fontSize: '1.6rem', color: '#1A3D2A', margin: '0 0 4px', fontWeight: 900 }}>{kamp.naam}</h1>
        <div style={{ fontSize: '.88rem', color: '#6A8A75' }}>📅 {periode} · 📍 {kamp.locatie || '—'}</div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
          <CopyLinkButton slug={kamp.slug} />
          <a href={`/kamp/${kamp.slug}`} target="_blank" rel="noopener" style={{ padding: '6px 12px', border: '1.5px solid #1A3D2A', borderRadius: 8, background: 'none', color: '#1A3D2A', fontSize: '.75rem', fontWeight: 700, textDecoration: 'none' }}>
            👁 Bekijk publieke versie ↗
          </a>
          <button onClick={handleTogglePubliek}
            style={{ padding: '6px 12px', border: `1.5px solid ${kamp.open_voor_inschrijving ? '#B23A4D' : '#3F7D5A'}`, borderRadius: 8, background: 'none', color: kamp.open_voor_inschrijving ? '#B23A4D' : '#3F7D5A', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer' }}>
            {kamp.open_voor_inschrijving ? 'Verbergen' : 'Publiceren'}
          </button>
          <a href={`/api/admin/kampen/${kamp.id}/export`} download
            style={{ padding: '6px 12px', border: '1.5px solid #C9963A', borderRadius: 8, background: '#C9963A', color: '#fff', fontSize: '.75rem', fontWeight: 700, textDecoration: 'none' }}>
            Exporteren (CSV)
          </a>
          <button onClick={handleDelete}
            style={{ padding: '6px 12px', border: '1.5px solid #B23A4D', borderRadius: 8, background: 'none', color: '#B23A4D', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', marginLeft: 'auto' }}>
            🗑 Verwijderen
          </button>
        </div>
        {!canPublish && (
          <p style={{ fontSize: '.74rem', color: '#8A6A2A', margin: '10px 0 0' }}>Publiceren is voorbehouden aan de groepsleiding.</p>
        )}
      </div>

      {/* Gegevens bewerken */}
      <form onSubmit={handleSave} style={cardStyle}>
        <h2 style={sectionTitle}>✏️ Gegevens</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div><label style={labelStyle}>Naam</label><input style={inputStyle} value={form.naam} onChange={e => setForm(p => ({ ...p, naam: e.target.value }))} required /></div>
          <div><label style={labelStyle}>Locatie</label><input style={inputStyle} value={form.locatie} onChange={e => setForm(p => ({ ...p, locatie: e.target.value }))} /></div>
          <div><label style={labelStyle}>Startdatum</label><input type="date" style={inputStyle} value={form.datum_van} onChange={e => setForm(p => ({ ...p, datum_van: e.target.value }))} required /></div>
          <div><label style={labelStyle}>Einddatum</label><input type="date" style={inputStyle} value={form.datum_tot} onChange={e => setForm(p => ({ ...p, datum_tot: e.target.value }))} required /></div>
          <div><label style={labelStyle}>Prijs (€)</label><input type="number" min="0" step="0.01" style={inputStyle} value={form.prijs} onChange={e => setForm(p => ({ ...p, prijs: e.target.value }))} /></div>
          <div><label style={labelStyle}>Contact info (telefoon leiding)</label><input style={inputStyle} value={form.contact_info} onChange={e => setForm(p => ({ ...p, contact_info: e.target.value }))} placeholder="bijv. Takleiding: +32 470 12 34 56" /></div>
        </div>
        <div style={{ marginBottom: 14 }}><label style={labelStyle}>Briefadres (voor post op kamp)</label><input style={inputStyle} value={form.briefadres} onChange={e => setForm(p => ({ ...p, briefadres: e.target.value }))} placeholder="t.a.v. [Naam kind], Kampplaats …" /></div>
        <div style={{ marginBottom: 14 }}><label style={labelStyle}>Beschrijving</label><textarea style={inputStyle} rows={3} value={form.beschrijving} onChange={e => setForm(p => ({ ...p, beschrijving: e.target.value }))} /></div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Interactieve inpaklijst</label>
            <button type="button" onClick={() => setForm(p => ({ ...p, paklijstText: PAKLIJST_TEMPLATES[templateKey] || '' }))}
              style={{ border: '1px solid #C9963A', color: '#C9963A', background: 'none', borderRadius: 6, padding: '3px 8px', fontSize: '.75rem', cursor: 'pointer', fontWeight: 700 }}>
              Standaard sjabloon laden
            </button>
          </div>
          <textarea style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '.8rem' }} rows={5} value={form.paklijstText} onChange={e => setForm(p => ({ ...p, paklijstText: e.target.value }))} placeholder="Slapen: Slaapzak, Matje, Pyjama&#10;Kleding: Hemd, T-shirts, Sokken" />
          <span style={{ fontSize: '.72rem', color: '#6A8A75' }}>Formaat: Categorie: Item1, Item2, Item3 (1 categorie per regel)</span>
        </div>

        <button type="submit" disabled={loading} style={{ padding: '9px 20px', background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 8, fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer' }}>
          {loading ? 'Bezig…' : 'Opslaan'}
        </button>
      </form>

      {/* Omslagfoto */}
      <div style={cardStyle}>
        <h2 style={sectionTitle}>🖼️ Omslagfoto</h2>
        {kamp.foto && (
          <div style={{ width: '100%', maxWidth: 360, height: 150, borderRadius: 12, overflow: 'hidden', marginBottom: 12, border: '1px solid #C2D9C9' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/kamp-fotos/${kamp.foto}`} alt="Omslagfoto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUploadPhoto} style={{ fontSize: '.85rem' }} />
      </div>

      {/* Bijlagen */}
      <div style={cardStyle}>
        <h2 style={sectionTitle}>📎 Bijlagen (uitnodiging, presentatie, paklijst …)</h2>

        {bestanden.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
            {bestanden.map((b: KampBestand) => (
              <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAF9', padding: '10px 14px', borderRadius: 10, border: '1px solid #C2D9C9' }}>
                <span style={{ fontSize: '.85rem', fontWeight: 600, color: '#1A3D2A', minWidth: 0 }}>
                  {BESTAND_LABELS[b.type] ?? '📎 Bijlage'} — {b.naam} {b.url ? <span style={{ color: '#6A8A75', fontWeight: 500 }}>(link)</span> : ''}
                </span>
                <button onClick={() => handleDeleteBestand(b.id)} style={{ background: 'none', border: 'none', color: '#B23A4D', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', flexShrink: 0 }}>✕</button>
              </div>
            ))}
          </div>
        )}

        {/* Bestand uploaden */}
        <form onSubmit={handleUploadBestand} style={{ background: '#EEF5F133', padding: 14, borderRadius: 12, border: '1px dashed #C2D9C9', marginBottom: 14 }}>
          <strong style={{ display: 'block', fontSize: '.82rem', color: '#1A3D2A', marginBottom: 10 }}>Bestand uploaden (PDF of PowerPoint)</strong>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            <div>
              <label style={labelStyle}>Label</label>
              <input name="bestandNaam" required placeholder="bijv. Infoavond presentatie" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Type</label>
              <select name="bestandType" required defaultValue="presentatie" style={inputStyle}>
                {BESTAND_TYPES.map(t => <option key={t} value={t}>{BESTAND_LABELS[t]}</option>)}
              </select>
            </div>
          </div>
          <input type="file" name="bestand" accept="application/pdf,.pdf,.pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation" required style={{ fontSize: '.8rem', margin: '4px 0 10px' }} />
          <button type="submit" disabled={loading} style={{ padding: '7px 16px', background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 7, fontWeight: 700, cursor: 'pointer', fontSize: '.82rem' }}>Uploaden</button>
        </form>

        {/* Link toevoegen (Google Slides e.d.) */}
        <form onSubmit={handleAddLink} style={{ background: '#EEF5F133', padding: 14, borderRadius: 12, border: '1px dashed #C2D9C9' }}>
          <strong style={{ display: 'block', fontSize: '.82rem', color: '#1A3D2A', marginBottom: 10 }}>Link toevoegen (Google Slides of andere URL)</strong>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            <div>
              <label style={labelStyle}>Label</label>
              <input value={linkNaam} onChange={e => setLinkNaam(e.target.value)} placeholder="bijv. Presentatie infoavond" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Type</label>
              <select value={linkType} onChange={e => setLinkType(e.target.value)} style={inputStyle}>
                {BESTAND_TYPES.map(t => <option key={t} value={t}>{BESTAND_LABELS[t]}</option>)}
              </select>
            </div>
          </div>
          <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://docs.google.com/presentation/d/…" style={{ ...inputStyle, marginBottom: 10 }} />
          <button type="submit" disabled={loading} style={{ padding: '7px 16px', background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 7, fontWeight: 700, cursor: 'pointer', fontSize: '.82rem' }}>Link toevoegen</button>
        </form>
      </div>

      {/* Antwoorden */}
      <div style={cardStyle}>
        <h2 style={sectionTitle}>📋 Antwoorden (wie komt mee?)</h2>
        <RsvpPanel kampId={kamp.id} />
      </div>
    </div>
  )
}
