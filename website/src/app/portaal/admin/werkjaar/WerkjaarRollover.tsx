'use client'
import { useState } from 'react'
import { TAKKEN, TAK_NAMEN, TAK_KLEUREN } from '@/lib/constants'
import { TakConfig, WerkjaarConcept } from '@/lib/types'

type LeidingMap = Record<string, { naam: string; rol: string }[]>

function buildInitial(takken: Record<string, TakConfig>, concept: WerkjaarConcept | null): { werkjaar: string; leiding: LeidingMap } {
  if (concept?.werkjaar) {
    const leiding: LeidingMap = {}
    for (const tak of TAKKEN) leiding[tak] = concept.leiding[tak] ?? []
    return { werkjaar: concept.werkjaar, leiding }
  }
  // Prefill vanuit de huidige takken-config (leiders van dit jaar).
  const leiding: LeidingMap = {}
  for (const tak of TAKKEN) {
    leiding[tak] = (takken[tak]?.leaders ?? []).map(l => ({ naam: l.name, rol: l.role }))
  }
  return { werkjaar: '', leiding }
}

export default function WerkjaarRollover({ actief, takken, concept }: {
  actief: string
  takken: Record<string, TakConfig>
  concept: WerkjaarConcept | null
}) {
  const init = buildInitial(takken, concept)
  const [werkjaar, setWerkjaar] = useState(init.werkjaar)
  const [leiding, setLeiding] = useState<LeidingMap>(init.leiding)
  const [busy, setBusy] = useState(false)
  const [flash, setFlash] = useState('')
  const [error, setError] = useState('')

  function show(msg: string) { setFlash(msg); setTimeout(() => setFlash(''), 3500) }

  function addRow(tak: string) {
    setLeiding(p => ({ ...p, [tak]: [...(p[tak] ?? []), { naam: '', rol: '' }] }))
  }
  function updateRow(tak: string, i: number, patch: Partial<{ naam: string; rol: string }>) {
    setLeiding(p => ({ ...p, [tak]: p[tak].map((r, idx) => idx === i ? { ...r, ...patch } : r) }))
  }
  function removeRow(tak: string, i: number) {
    setLeiding(p => ({ ...p, [tak]: p[tak].filter((_, idx) => idx !== i) }))
  }

  async function saveConcept() {
    if (!werkjaar.trim()) { setError('Geef het nieuwe werkjaar een naam (bv. 2027-2028).'); return }
    setBusy(true); setError('')
    const res = await fetch('/api/admin/werkjaar', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ werkjaar, leiding }),
    })
    setBusy(false)
    if (res.ok) show('Concept opgeslagen.')
    else setError((await res.json().catch(() => ({}))).error ?? 'Opslaan mislukt.')
  }

  async function publish() {
    if (!werkjaar.trim()) { setError('Geef eerst het nieuwe werkjaar een naam.'); return }
    if (!confirm(`Werkjaar "${werkjaar}" publiceren?\n\nHet huidige jaar (${actief}) wordt gearchiveerd en "${werkjaar}" wordt het actieve werkjaar. Bestaande kampen/echo's blijven bewaard onder hun werkjaar.`)) return
    setBusy(true); setError('')
    // Sla eerst het concept op, publiceer dan.
    const put = await fetch('/api/admin/werkjaar', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ werkjaar, leiding }),
    })
    if (!put.ok) { setBusy(false); setError('Concept opslaan mislukt.'); return }
    const res = await fetch('/api/admin/werkjaar', { method: 'POST' })
    setBusy(false)
    if (res.ok) {
      const data = await res.json()
      show(`Werkjaar ${data.nieuwWerkjaar} is live!`)
      setTimeout(() => window.location.reload(), 1200)
    } else {
      setError((await res.json().catch(() => ({}))).error ?? 'Publiceren mislukt.')
    }
  }

  return (
    <div>
      {flash && <div style={{ background: 'hsla(145,33%,36%,.1)', border: '1.5px solid #3F7D5A', color: '#2C5A40', padding: '10px 16px', borderRadius: 10, marginBottom: 20, fontWeight: 600 }}>{flash}</div>}
      {error && <div style={{ background: 'hsla(349,51%,47%,.1)', border: '1.5px solid #B23A4D', color: '#B23A4D', padding: '10px 16px', borderRadius: 10, marginBottom: 20, fontWeight: 600 }}>{error}</div>}

      <div style={{ background: '#EEF5F1', borderRadius: 12, padding: '14px 18px', marginBottom: 24, fontSize: '.9rem', color: '#3A5A42' }}>
        Actief werkjaar: <strong style={{ color: '#1A3D2A' }}>{actief || '—'}</strong>. Zet hieronder het nieuwe werkjaar klaar als <strong>concept</strong>.
        Niets gaat live tot je op <strong>Publiceer</strong> klikt; dan wordt het huidige jaar gearchiveerd.
      </div>

      <div style={{ background: '#fff', border: '1.5px solid #C2D9C9', borderRadius: 14, padding: 20, marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, color: '#1A3D2A', marginBottom: 6 }}>Naam nieuw werkjaar</label>
        <input value={werkjaar} onChange={e => setWerkjaar(e.target.value)} placeholder="bv. 2027-2028" maxLength={20}
          style={{ width: 200, padding: '9px 12px', border: '1.5px solid #C2D9C9', borderRadius: 8, fontFamily: 'inherit', fontSize: '.95rem' }} />
      </div>

      <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#1A3D2A', marginBottom: 14 }}>Leiding per tak</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {TAKKEN.map(tak => (
          <div key={tak} style={{ background: '#fff', border: `1.5px solid ${TAK_KLEUREN[tak]}55`, borderRadius: 14, padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ padding: '3px 10px', background: `${TAK_KLEUREN[tak]}22`, color: TAK_KLEUREN[tak], borderRadius: 20, fontSize: '.78rem', fontWeight: 800 }}>{TAK_NAMEN[tak]}</span>
              <button onClick={() => addRow(tak)} style={{ padding: '5px 12px', border: '1.5px solid #1A3D2A', borderRadius: 8, background: 'none', color: '#1A3D2A', fontSize: '.78rem', fontWeight: 700, cursor: 'pointer' }}>+ leiding</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(leiding[tak] ?? []).length === 0 && <p style={{ color: '#6A8A75', fontSize: '.82rem', margin: 0 }}>Nog geen leiding toegewezen.</p>}
              {(leiding[tak] ?? []).map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input value={r.naam} onChange={e => updateRow(tak, i, { naam: e.target.value })} placeholder="Naam"
                    style={{ flex: 2, minWidth: 0, padding: '7px 10px', border: '1px solid #C2D9C9', borderRadius: 6, fontFamily: 'inherit', fontSize: '.85rem' }} />
                  <input value={r.rol} onChange={e => updateRow(tak, i, { rol: e.target.value })} placeholder="Rol (optioneel)"
                    style={{ flex: 1, minWidth: 0, padding: '7px 10px', border: '1px solid #C2D9C9', borderRadius: 6, fontFamily: 'inherit', fontSize: '.85rem' }} />
                  <button onClick={() => removeRow(tak, i)} style={{ padding: '5px 9px', border: '1px solid #B23A4D', borderRadius: 6, background: 'none', color: '#B23A4D', fontSize: '.8rem', fontWeight: 700, cursor: 'pointer' }}>×</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
        <button onClick={saveConcept} disabled={busy}
          style={{ padding: '12px 24px', background: 'none', border: '1.5px solid #1A3D2A', borderRadius: 10, color: '#1A3D2A', fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer' }}>
          {busy ? 'Bezig…' : 'Concept opslaan'}
        </button>
        <button onClick={publish} disabled={busy}
          style={{ padding: '12px 24px', background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer' }}>
          {busy ? 'Bezig…' : '🚀 Publiceer nieuw werkjaar'}
        </button>
      </div>
    </div>
  )
}
