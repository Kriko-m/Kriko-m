'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const TAKKEN = [
  { value: 'kapoenen', label: 'Kapoenen (6–8j)' },
  { value: 'welpen', label: 'Welpen (8–11j)' },
  { value: 'jonggivers', label: 'Jonggivers (11–14j)' },
  { value: 'givers', label: 'Givers (14–17j)' },
]

const TAK_KLEUREN: Record<string, string> = {
  kapoenen: '#F4C842', welpen: '#5D9E6C', jonggivers: '#4A7BBF', givers: '#C9963A',
}

interface Kind {
  id: string
  voornaam: string
  tak: string
  ga_id?: string
}

export default function KinderenBeheer({ kinderen: initial }: { kinderen: Kind[]; parentId: string }) {
  const [kinderen, setKinderen] = useState<Kind[]>(initial)
  const [adding, setAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [flash, setFlash] = useState('')
  const router = useRouter()

  function showFlash(msg: string) {
    setFlash(msg)
    setTimeout(() => setFlash(''), 3000)
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const res = await fetch('/api/portaal/kinderen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voornaam: fd.get('voornaam'), tak: fd.get('tak') }),
    })
    if (res.ok) {
      const kind = await res.json()
      setKinderen(prev => [...prev, kind])
      setAdding(false)
      showFlash('Lid toegevoegd!')
      router.refresh()
    }
    setLoading(false)
  }

  async function handleVerwijder(id: string, naam: string) {
    if (!confirm(`${naam} verwijderen van jouw account?`)) return
    const res = await fetch(`/api/portaal/kinderen/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setKinderen(prev => prev.filter(k => k.id !== id))
      showFlash('Lid verwijderd.')
      router.refresh()
    }
  }

  return (
    <div>
      {flash && (
        <div style={{ background: 'hsla(145,33%,36%,.1)', border: '1.5px solid #3F7D5A', color: '#2C5A40', padding: '12px 18px', borderRadius: 12, marginBottom: 20, fontWeight: 600, fontSize: '.88rem' }}>{flash}</div>
      )}

      <div style={{ background: '#fff8e1', border: '1.5px solid #f59e0b', borderRadius: 'var(--border-radius-md)', padding: '16px 20px', marginBottom: 24, fontSize: '.88rem', color: '#92400e', lineHeight: 1.6 }}>
        <strong>📋 Info:</strong> Voeg hier de kinderen toe die bij jouw account horen. Naam en tak worden gebruikt voor kamp-inschrijvingen. Zodra S&amp;G OAuth actief is, worden leden automatisch gesynchroniseerd.
      </div>

      {kinderen.length === 0 && !adding && (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: '#6A8A75' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>👶</div>
          <p style={{ fontWeight: 500 }}>Nog geen leden gekoppeld aan jouw account.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
        {kinderen.map(kind => {
          const kleur = TAK_KLEUREN[kind.tak] ?? '#888'
          return (
            <div key={kind.id} className="portal-item-row" style={{ '--kleur': kleur } as React.CSSProperties}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${kleur}18`, border: `2px solid ${kleur}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem', color: kleur, flexShrink: 0 }}>
                  {(kind.voornaam?.[0] ?? '?').toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1A3D2A' }}>{kind.voornaam}</div>
                  <div style={{ fontSize: '.8rem', color: '#6A8A75', textTransform: 'capitalize', fontWeight: 600 }}>{kind.tak}</div>
                </div>
              </div>
              <button onClick={() => handleVerwijder(kind.id, kind.voornaam)} className="btn btn-outline"
                style={{ padding: '6px 14px', fontSize: '0.8rem', color: 'var(--color-error)', borderColor: 'var(--color-error)', boxShadow: 'none' }}>
                Verwijderen
              </button>
            </div>
          )
        })}
      </div>

      {adding ? (
        <form onSubmit={handleAdd} className="portal-sub-card" style={{ borderStyle: 'dashed', borderColor: 'var(--color-primary-light)', gap: 16 }}>
          <strong style={{ color: '#1A3D2A', fontSize: '1.15rem' }}>Lid toevoegen</strong>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label className="form-label" style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, color: '#1A3D2A', marginBottom: 6 }}>Voornaam</label>
              <input name="voornaam" required placeholder="Voornaam" autoFocus className="form-control" />
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label className="form-label" style={{ display: 'block', fontSize: '.82rem', fontWeight: 700, color: '#1A3D2A', marginBottom: 6 }}>Tak</label>
              <select name="tak" required defaultValue="" className="form-control">
                <option value="" disabled>Kies tak</option>
                {TAKKEN.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '10px 24px' }}>
              {loading ? 'Bezig…' : 'Toevoegen'}
            </button>
            <button type="button" onClick={() => setAdding(false)} className="btn btn-outline" style={{ padding: '10px 24px' }}>
              Annuleer
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="btn btn-outline"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', padding: '16px', borderStyle: 'dashed', borderColor: 'var(--color-secondary)', color: 'var(--color-secondary)', background: 'transparent' }}>
          <span style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>+</span> Lid toevoegen
        </button>
      )}
    </div>
  )
}
