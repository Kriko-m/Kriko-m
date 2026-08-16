'use client'
import { useState } from 'react'
import { TAKKEN, PORTAAL_TAKKEN, TAK_NAMEN, TAK_KLEUREN } from '@/lib/constants'

interface Leader { name: string; role: string }
interface TakForm { email: string; whatsapp_url: string; leaders: Leader[] }
type TakConfig = { email?: string; whatsapp_url?: string; leaders?: Leader[] } & Record<string, unknown>

const inputStyle = { width: '100%', padding: '8px 11px', border: '1.5px solid #C2D9C9', borderRadius: 8, fontFamily: 'inherit', fontSize: '.88rem', boxSizing: 'border-box' as const }
const labelStyle = { display: 'block', fontSize: '.74rem', fontWeight: 700, color: '#1A3D2A', marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: '.04em' }

export default function WebsiteContentEditor({
  takConfigs,
  onClose,
}: {
  takConfigs: Record<string, TakConfig>
  onClose: () => void
}) {
  const [forms, setForms] = useState<Record<string, TakForm>>(() => {
    const init: Record<string, TakForm> = {}
    for (const tak of PORTAAL_TAKKEN) {
      const c = takConfigs[tak] ?? {}
      init[tak] = {
        email: c.email ?? '',
        whatsapp_url: c.whatsapp_url ?? '',
        leaders: Array.isArray(c.leaders) ? c.leaders.map(l => ({ name: l.name ?? '', role: l.role ?? '' })) : [],
      }
    }
    return init
  })
  const [activeTak, setActiveTak] = useState<string>(PORTAAL_TAKKEN[0])
  const [saving, setSaving] = useState(false)
  const [flash, setFlash] = useState('')
  const [error, setError] = useState('')

  function patch(tak: string, p: Partial<TakForm>) {
    setForms(prev => ({ ...prev, [tak]: { ...prev[tak], ...p } }))
  }
  function patchLeader(tak: string, i: number, p: Partial<Leader>) {
    setForms(prev => ({ ...prev, [tak]: { ...prev[tak], leaders: prev[tak].leaders.map((l, idx) => idx === i ? { ...l, ...p } : l) } }))
  }
  function addLeader(tak: string) {
    setForms(prev => ({ ...prev, [tak]: { ...prev[tak], leaders: [...prev[tak].leaders, { name: '', role: '' }] } }))
  }
  function removeLeader(tak: string, i: number) {
    setForms(prev => ({ ...prev, [tak]: { ...prev[tak], leaders: prev[tak].leaders.filter((_, idx) => idx !== i) } }))
  }

  async function save() {
    setSaving(true); setError(''); setFlash('')
    // Stuur enkel de bewerkbare velden; server merge't veilig op de bestaande config.
    const payload: Record<string, TakForm> = {}
    for (const tak of PORTAAL_TAKKEN) {
      payload[tak] = {
        email: forms[tak].email,
        whatsapp_url: forms[tak].whatsapp_url,
        leaders: forms[tak].leaders.filter(l => l.name.trim()),
      }
    }
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ takken: payload }),
    })
    if (res.ok) {
      setFlash('Opgeslagen! De takpagina’s zijn bijgewerkt.')
      setTimeout(() => setFlash(''), 3000)
    } else {
      setError('Opslaan mislukt. Probeer opnieuw.')
    }
    setSaving(false)
  }

  const f = forms[activeTak]

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 999 }} onClick={onClose} />
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, pointerEvents: 'none', padding: 16 }}>
        <div style={{ pointerEvents: 'auto', width: '96%', maxWidth: 620, maxHeight: '92vh', background: '#fff', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.22)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Header */}
          <div style={{ padding: '18px 24px', borderBottom: '1.5px solid #E8F0EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, color: '#1A3D2A', fontWeight: 900, fontSize: '1.2rem' }}>Website-content</h3>
              <p style={{ margin: '2px 0 0', color: '#6A8A75', fontSize: '.82rem' }}>Pas de leiding-contactgegevens op de publieke takpagina’s aan.</p>
            </div>
            <button onClick={onClose} type="button" style={{ width: 34, height: 34, border: '1.5px solid #C2D9C9', borderRadius: 8, background: 'none', color: '#6A8A75', fontSize: '1.1rem', cursor: 'pointer' }}>✕</button>
          </div>

          {/* Tak tabs */}
          <div style={{ display: 'flex', gap: 6, padding: '12px 24px 0', flexWrap: 'wrap' }}>
            {PORTAAL_TAKKEN.map(tak => (
              <button
                key={tak}
                onClick={() => setActiveTak(tak)}
                style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: '.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  border: activeTak === tak ? `2px solid ${TAK_KLEUREN[tak]}` : '1.5px solid #C2D9C9',
                  background: activeTak === tak ? '#EEF5F1' : '#fff', color: '#1A3D2A',
                }}
              >
                {TAK_NAMEN[tak]}
              </button>
            ))}
          </div>

          {/* Body */}
          <div style={{ overflow: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && <div style={{ background: '#fdf0f2', border: '1.5px solid #e0c0c4', color: '#B23A4D', padding: '8px 12px', borderRadius: 8, fontSize: '.82rem', fontWeight: 600 }}>{error}</div>}
            {flash && <div style={{ background: 'hsla(145,33%,36%,.1)', border: '1.5px solid #3F7D5A', color: '#2C5A40', padding: '8px 12px', borderRadius: 8, fontSize: '.82rem', fontWeight: 600 }}>{flash}</div>}

            <div>
              <label style={labelStyle}>Contact e-mail</label>
              <input type="email" style={inputStyle} value={f.email} onChange={e => patch(activeTak, { email: e.target.value })} placeholder="tak@kriko-m.be" />
            </div>

            <div>
              <label style={labelStyle}>WhatsApp-groep URL</label>
              <input type="url" style={inputStyle} value={f.whatsapp_url} onChange={e => patch(activeTak, { whatsapp_url: e.target.value })} placeholder="https://chat.whatsapp.com/…" />
            </div>

            <div>
              <label style={labelStyle}>Leiding</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {f.leaders.length === 0 && <p style={{ color: '#6A8A75', fontSize: '.82rem', margin: 0 }}>Nog geen leiding toegevoegd.</p>}
                {f.leaders.map((l, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, alignItems: 'center' }}>
                    <input style={inputStyle} value={l.name} onChange={e => patchLeader(activeTak, i, { name: e.target.value })} placeholder="Naam" />
                    <input style={inputStyle} value={l.role} onChange={e => patchLeader(activeTak, i, { role: e.target.value })} placeholder="Rol" />
                    <button onClick={() => removeLeader(activeTak, i)} type="button" title="Verwijder" style={{ width: 32, height: 32, border: '1.5px solid #e0c0c4', borderRadius: 8, background: 'none', color: '#B23A4D', cursor: 'pointer', flexShrink: 0 }}>✕</button>
                  </div>
                ))}
                <button onClick={() => addLeader(activeTak)} type="button" style={{ alignSelf: 'flex-start', marginTop: 2, padding: '6px 14px', background: 'none', border: '1.5px dashed #C2D9C9', borderRadius: 8, color: '#6A8A75', fontSize: '.82rem', fontWeight: 700, cursor: 'pointer' }}>+ leiding toevoegen</button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '14px 24px', borderTop: '1.5px solid #E8F0EB', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button onClick={onClose} type="button" style={{ padding: '9px 16px', background: 'none', border: '1.5px solid #C2D9C9', borderRadius: 8, fontWeight: 600, color: '#6A8A75', cursor: 'pointer', fontSize: '.88rem' }}>Sluiten</button>
            <button onClick={save} disabled={saving} type="button" style={{ padding: '9px 24px', background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '.88rem' }}>{saving ? 'Opslaan…' : 'Alles opslaan'}</button>
          </div>
        </div>
      </div>
    </>
  )
}
