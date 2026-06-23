'use client'
import { useState } from 'react'
import { Kamp, KampBestand } from '@/lib/types'
import { TAK_KLEUREN, AUDIENCE_NAMEN, AUDIENCE_KLEUREN } from '@/lib/constants'
import {
  parsePackingList, formatPackingList,
  BESTAND_TYPES, BESTAND_LABELS, PaklijstCategorie,
  KAMP_AGE_TAKKEN, kampPrimaryTak, kampPaklijstTemplateKey,
} from '@/lib/kamp'
import PaklijstEditor from './PaklijstEditor'
import { RsvpPanel } from './CampRsvpPanel'
import ConfirmDialog from './ConfirmDialog'

type Tab = 'gegevens' | 'bijlagen' | 'inpaklijst' | 'antwoorden'

const inputStyle = { width: '100%', padding: '9px 12px', border: '1.5px solid #C2D9C9', borderRadius: 8, fontFamily: 'inherit', fontSize: '.9rem', boxSizing: 'border-box' as const }
const labelStyle = { display: 'block', fontSize: '.8rem', fontWeight: 700, color: '#1A3D2A', marginBottom: 5 }

export default function KampBeheerModal({ kamp: initialKamp, isGroepsleiding = false, onClose, onKampUpdated }: { kamp: Kamp; isGroepsleiding?: boolean; onClose: () => void; onKampUpdated: (kamp: Kamp) => void }) {
  const [kamp, setKamp] = useState<Kamp>(initialKamp)
  const [activeTab, setActiveTab] = useState<Tab>('gegevens')
  const [loading, setLoading] = useState(false)
  const [flash, setFlash] = useState('')
  const [confirmDialog, setConfirmDialog] = useState<{ message: string; onConfirm: () => void } | null>(null)
  const [audience, setAudience] = useState<string[]>(kamp.audience ?? [])

  // Beschikbare tags: leiding = leeftijdstakken; GL ook 'groep' + 'leiding'.
  const beschikbareTags: string[] = isGroepsleiding ? [...KAMP_AGE_TAKKEN, 'groep', 'leiding'] : [...KAMP_AGE_TAKKEN]
  function toggleTag(tag: string) {
    setAudience(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  const templateKey = kampPaklijstTemplateKey(kamp.audience)
  const kleur = TAK_KLEUREN[kampPrimaryTak(kamp.audience)] ?? '#1A3D2A'

  const van = new Date(kamp.datum_van)
  const tot = new Date(kamp.datum_tot)
  const periode = `${van.getDate()}/${van.getMonth() + 1} – ${tot.getDate()}/${tot.getMonth() + 1}/${tot.getFullYear()}`

  const [form, setForm] = useState({
    naam: kamp.naam, locatie: kamp.locatie, datum_van: kamp.datum_van, datum_tot: kamp.datum_tot,
    prijs: String(kamp.prijs ?? ''), contact_info: kamp.contact_info ?? '', briefadres: kamp.briefadres ?? '',
    beschrijving: kamp.beschrijving ?? '',
  })
  const [paklijst, setPaklijst] = useState<PaklijstCategorie[]>(
    Array.isArray(kamp.paklijst) ? kamp.paklijst : parsePackingList(formatPackingList(kamp.paklijst))
  )

  const [linkType, setLinkType] = useState<string>('presentatie')
  const [linkNaam, setLinkNaam] = useState('')
  const [linkUrl, setLinkUrl] = useState('')

  const bestanden = kamp.kamp_bestanden ?? []

  function showFlash(msg: string) {
    setFlash(msg)
    setTimeout(() => setFlash(''), 3000)
  }

  async function handleSaveGegevens(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch(`/api/admin/kampen/${kamp.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        naam: form.naam, locatie: form.locatie, datum_van: form.datum_van, datum_tot: form.datum_tot,
        prijs: form.prijs ? Number(form.prijs) : 0, contact_info: form.contact_info,
        briefadres: form.briefadres, beschrijving: form.beschrijving, audience,
      }),
    })
    if (res.ok) {
      const updated = await res.json()
      setKamp(prev => ({ ...prev, ...updated }))
      onKampUpdated({ ...kamp, ...updated })
      showFlash('Opgeslagen!')
    } else {
      const err = await res.json().catch(() => ({}))
      showFlash(err.error || 'Fout bij opslaan.')
    }
    setLoading(false)
  }

  async function handleSavePaklijst(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch(`/api/admin/kampen/${kamp.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paklijst }),
    })
    if (res.ok) {
      showFlash('Inpaklijst opgeslagen!')
    } else {
      showFlash('Fout bij opslaan.')
    }
    setLoading(false)
  }

  function handleDelete() {
    setConfirmDialog({
      message: `Weet je zeker dat je "${kamp.naam}" en alle inschrijvingen wilt verwijderen?`,
      onConfirm: async () => {
        setConfirmDialog(null)
        const res = await fetch(`/api/admin/kampen/${kamp.id}`, { method: 'DELETE' })
        if (res.ok) { onClose() } else { showFlash('Fout bij verwijderen.') }
      },
    })
  }

  async function handleUploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    const fd = new FormData()
    fd.append('file', file); fd.append('type', 'kamp-foto'); fd.append('kampId', kamp.id)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    if (res.ok) {
      const updated = await res.json()
      setKamp(prev => ({ ...prev, foto: updated.foto }))
      showFlash('Foto geüpload!')
    } else { showFlash('Fout bij uploaden foto.') }
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
    fd.append('file', file); fd.append('type', 'kamp-bestand'); fd.append('kampId', kamp.id)
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
      showFlash(err.error || 'Fout bij uploaden.')
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

  function handleDeleteBestand(bestandId: string) {
    setConfirmDialog({
      message: 'Dit bijlage verwijderen?',
      onConfirm: async () => {
        setConfirmDialog(null)
        const res = await fetch(`/api/admin/kampen/${kamp.id}/bestanden/${bestandId}`, { method: 'DELETE' })
        if (res.ok) {
          setKamp(prev => ({ ...prev, kamp_bestanden: (prev.kamp_bestanden ?? []).filter(b => b.id !== bestandId) }))
          showFlash('Verwijderd.')
        }
      },
    })
  }

  function copyLink() {
    let origin = typeof window !== 'undefined' ? window.location.origin : ''
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) origin = 'https://kriko-m-indol.vercel.app'
    navigator.clipboard.writeText(`${origin}/kamp/${kamp.slug}`)
    showFlash('Uitnodigingslink gekopieerd!')
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'gegevens', label: 'Gegevens' },
    { id: 'bijlagen', label: `Bijlagen${bestanden.length ? ` (${bestanden.length})` : ''}` },
    { id: 'inpaklijst', label: 'Inpaklijst' },
    { id: 'antwoorden', label: 'Antwoorden' },
  ]

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 999 }} onClick={onClose} />
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto', width: '98%', maxWidth: 1100, maxHeight: '92vh', background: '#fff', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* ── Header ── */}
          <div style={{ padding: '20px 28px 0', borderBottom: '1.5px solid #E8F0EB', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <h3 style={{ margin: '0 0 3px', color: '#1A3D2A', fontWeight: 900, fontSize: '1.4rem' }}>{kamp.naam}</h3>
                <span style={{ fontSize: '.82rem', color: '#6A8A75' }}>📅 {periode} · 📍 {kamp.locatie || '—'}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                <button onClick={copyLink} type="button" style={{ padding: '6px 12px', border: '1.5px solid #4A7BBF', borderRadius: 8, background: 'none', color: '#4A7BBF', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer' }}>
                  🔗 Uitnodigingslink
                </button>
                <a href={`/kamp/${kamp.slug}`} target="_blank" rel="noopener" style={{ padding: '6px 12px', border: '1.5px solid #1A3D2A', borderRadius: 8, background: 'none', color: '#1A3D2A', fontSize: '.75rem', fontWeight: 700, textDecoration: 'none' }}>
                  👁 Bekijk
                </a>
                <button onClick={handleDelete} type="button" style={{ padding: '6px 12px', border: '1.5px solid #B23A4D', borderRadius: 8, background: 'none', color: '#B23A4D', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer' }}>
                  🗑
                </button>
                <button onClick={onClose} type="button" style={{ width: 32, height: 32, border: '1.5px solid #C2D9C9', borderRadius: 8, background: 'none', color: '#6A8A75', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ✕
                </button>
              </div>
            </div>

            {/* ── Tabs ── */}
            <div style={{ display: 'flex', gap: 0 }}>
              {tabs.map(t => (
                <button key={t.id} type="button" onClick={() => setActiveTab(t.id)} style={{
                  padding: '9px 20px', background: 'none', border: 'none', borderBottom: activeTab === t.id ? `2.5px solid ${kleur}` : '2.5px solid transparent',
                  color: activeTab === t.id ? kleur : '#6A8A75', fontWeight: activeTab === t.id ? 800 : 600, fontSize: '.85rem', cursor: 'pointer', fontFamily: 'inherit', marginBottom: -1,
                }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Flash ── */}
          {flash && (
            <div style={{ background: 'hsla(145,33%,36%,.1)', borderBottom: '1.5px solid #3F7D5A', color: '#2C5A40', padding: '10px 28px', fontWeight: 600, fontSize: '.85rem', flexShrink: 0 }}>
              {flash}
            </div>
          )}

          {/* ── Tab content ── */}
          <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px' }}>

            {/* Gegevens */}
            {activeTab === 'gegevens' && (
              <form onSubmit={handleSaveGegevens} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div><label style={labelStyle}>Naam</label><input style={inputStyle} value={form.naam} onChange={e => setForm(p => ({ ...p, naam: e.target.value }))} required /></div>
                  <div><label style={labelStyle}>Locatie</label><input style={inputStyle} value={form.locatie} onChange={e => setForm(p => ({ ...p, locatie: e.target.value }))} /></div>
                  <div><label style={labelStyle}>Startdatum</label><input type="date" style={inputStyle} value={form.datum_van} onChange={e => setForm(p => ({ ...p, datum_van: e.target.value }))} required /></div>
                  <div><label style={labelStyle}>Einddatum</label><input type="date" style={inputStyle} value={form.datum_tot} onChange={e => setForm(p => ({ ...p, datum_tot: e.target.value }))} required /></div>
                  <div><label style={labelStyle}>Prijs (€)</label><input type="number" min="0" step="0.01" style={inputStyle} value={form.prijs} onChange={e => setForm(p => ({ ...p, prijs: e.target.value }))} /></div>
                  <div><label style={labelStyle}>Contact info</label><input style={inputStyle} value={form.contact_info} onChange={e => setForm(p => ({ ...p, contact_info: e.target.value }))} placeholder="+32 470 12 34 56" /></div>
                </div>
                <div><label style={labelStyle}>Briefadres</label><input style={inputStyle} value={form.briefadres} onChange={e => setForm(p => ({ ...p, briefadres: e.target.value }))} placeholder="t.a.v. [Naam], Kampplaats…" /></div>
                <div><label style={labelStyle}>Beschrijving</label><textarea style={inputStyle} rows={4} value={form.beschrijving} onChange={e => setForm(p => ({ ...p, beschrijving: e.target.value }))} /></div>
                <div>
                  <button type="submit" disabled={loading} style={{ padding: '9px 24px', background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 8, fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer', fontSize: '.9rem' }}>
                    {loading ? 'Bezig…' : 'Opslaan'}
                  </button>
                </div>
              </form>
            )}

            {/* Bijlagen */}
            {activeTab === 'bijlagen' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* Omslagfoto */}
                <div>
                  <p style={{ margin: '0 0 10px', fontSize: '.8rem', fontWeight: 700, color: '#1A3D2A' }}>OMSLAGFOTO</p>
                  {kamp.foto ? (
                    <div style={{ width: '100%', maxWidth: 400, height: 160, borderRadius: 12, overflow: 'hidden', marginBottom: 10, border: '1.5px solid #C2D9C9' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/kamp-fotos/${kamp.foto}`} alt="Omslagfoto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{ width: '100%', maxWidth: 400, height: 80, borderRadius: 12, border: '1.5px dashed #C2D9C9', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6A8A75', fontSize: '.82rem' }}>
                      Nog geen foto
                    </div>
                  )}
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUploadPhoto} style={{ fontSize: '.82rem' }} />
                </div>

                {/* Bestaande bijlagen */}
                {bestanden.length > 0 && (
                  <div>
                    <p style={{ margin: '0 0 10px', fontSize: '.8rem', fontWeight: 700, color: '#1A3D2A' }}>TOEGEVOEGDE BIJLAGEN</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {bestanden.map((b: KampBestand) => (
                        <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAF9', padding: '10px 14px', borderRadius: 10, border: '1px solid #C2D9C9' }}>
                          <span style={{ fontSize: '.85rem', fontWeight: 600, color: '#1A3D2A' }}>
                            {BESTAND_LABELS[b.type] ?? '📎'} — {b.naam}
                            {b.url && <span style={{ marginLeft: 6, color: '#6A8A75', fontWeight: 400 }}>(link)</span>}
                          </span>
                          <button onClick={() => handleDeleteBestand(b.id)} type="button" style={{ background: 'none', border: 'none', color: '#B23A4D', cursor: 'pointer', fontSize: '1rem', padding: '0 4px' }}>✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload + Link in een 2-kolom grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <form onSubmit={handleUploadBestand} style={{ background: '#F8FAF9', padding: 16, borderRadius: 12, border: '1.5px dashed #C2D9C9', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <strong style={{ fontSize: '.82rem', color: '#1A3D2A' }}>Bestand uploaden</strong>
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
                    <input type="file" name="bestand" accept="application/pdf,.pdf,.pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation" required style={{ fontSize: '.82rem' }} />
                    <button type="submit" disabled={loading} style={{ padding: '8px 16px', background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 7, fontWeight: 700, cursor: 'pointer', fontSize: '.82rem', alignSelf: 'flex-start' }}>Uploaden</button>
                  </form>

                  <form onSubmit={handleAddLink} style={{ background: '#F8FAF9', padding: 16, borderRadius: 12, border: '1.5px dashed #C2D9C9', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <strong style={{ fontSize: '.82rem', color: '#1A3D2A' }}>Link toevoegen</strong>
                    <div>
                      <label style={labelStyle}>Label</label>
                      <input value={linkNaam} onChange={e => setLinkNaam(e.target.value)} placeholder="bijv. Google Slides presentatie" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Type</label>
                      <select value={linkType} onChange={e => setLinkType(e.target.value)} style={inputStyle}>
                        {BESTAND_TYPES.map(t => <option key={t} value={t}>{BESTAND_LABELS[t]}</option>)}
                      </select>
                    </div>
                    <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://docs.google.com/…" style={inputStyle} />
                    <button type="submit" disabled={loading} style={{ padding: '8px 16px', background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 7, fontWeight: 700, cursor: 'pointer', fontSize: '.82rem', alignSelf: 'flex-start' }}>Toevoegen</button>
                  </form>
                </div>
              </div>
            )}

            {/* Inpaklijst */}
            {activeTab === 'inpaklijst' && (
              <form onSubmit={handleSavePaklijst} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <PaklijstEditor value={paklijst} onChange={setPaklijst} templateKey={templateKey} />
                <div>
                  <button type="submit" disabled={loading} style={{ padding: '9px 24px', background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 8, fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer', fontSize: '.9rem' }}>
                    {loading ? 'Bezig…' : 'Opslaan'}
                  </button>
                </div>
              </form>
            )}

            {/* Antwoorden */}
            {activeTab === 'antwoorden' && (
              <RsvpPanel kampId={kamp.id} />
            )}
          </div>
        </div>
      </div>

      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </>
  )
}
