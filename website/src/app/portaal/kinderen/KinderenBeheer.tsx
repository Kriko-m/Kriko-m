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

export default function KinderenBeheer({ kinderen: initial, parentId }: { kinderen: Kind[]; parentId: string }) {
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
        <div style={{ background: 'hsla(145,33%,36%,.1)', border: '1.5px solid #3F7D5A', color: '#2C5A40', padding: '10px 16px', borderRadius: 10, marginBottom: 20, fontWeight: 600, fontSize: '.88rem' }}>{flash}</div>
      )}

      <div style={{ background: '#fff8e1', border: '1.5px solid #f59e0b', borderRadius: 12, padding: '14px 18px', marginBottom: 24, fontSize: '.85rem', color: '#92400e', lineHeight: 1.5 }}>
        <strong>📋 Info:</strong> Voeg hier de kinderen toe die bij jouw account horen. Naam en tak worden gebruikt voor kamp-inschrijvingen. Zodra S&G OAuth actief is, worden leden automatisch gesynchroniseerd.
      </div>

      {kinderen.length === 0 && !adding && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6A8A75' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>👶</div>
          <p>Nog geen leden gekoppeld aan jouw account.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {kinderen.map(kind => {
          const kleur = TAK_KLEUREN[kind.tak] ?? '#888'
          return (
            <div key={kind.id} style={{ background: '#fff', border: '1px solid #C2D9C9', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${kleur}33`, border: `2px solid ${kleur}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem', color: kleur, flexShrink: 0 }}>
                  {(kind.voornaam?.[0] ?? '?').toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1A3D2A' }}>{kind.voornaam}</div>
                  <div style={{ fontSize: '.8rem', color: '#6A8A75', textTransform: 'capitalize' }}>{kind.tak}</div>
                </div>
              </div>
              <button onClick={() => handleVerwijder(kind.id, kind.voornaam)}
                style={{ background: 'none', border: '1.5px solid #B23A4D', color: '#B23A4D', padding: '5px 12px', borderRadius: 8, fontSize: '.78rem', fontWeight: 600, cursor: 'pointer' }}>
                Verwijder
              </button>
            </div>
          )
        })}
      </div>

      {adding ? (
        <form onSubmit={handleAdd} style={{ background: '#fff', border: '1.5px dashed #2A5C3F', borderRadius: 14, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <strong style={{ color: '#1A3D2A' }}>Lid toevoegen</strong>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 700, color: '#1A3D2A', marginBottom: 5 }}>Voornaam</label>
              <input name="voornaam" required placeholder="Voornaam" autoFocus
                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #C2D9C9', borderRadius: 8, fontFamily: 'inherit', fontSize: '.9rem', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={{ display: 'block', fontSize: '.8rem', fontWeight: 700, color: '#1A3D2A', marginBottom: 5 }}>Tak</label>
              <select name="tak" required defaultValue=""
                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #C2D9C9', borderRadius: 8, fontFamily: 'inherit', fontSize: '.9rem', boxSizing: 'border-box' }}>
                <option value="" disabled>Kies tak</option>
                {TAKKEN.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" disabled={loading}
              style={{ padding: '9px 20px', background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 8, fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer' }}>
              {loading ? 'Bezig…' : 'Toevoegen'}
            </button>
            <button type="button" onClick={() => setAdding(false)}
              style={{ padding: '9px 20px', background: 'none', border: '1.5px solid #C2D9C9', borderRadius: 8, fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', color: '#6A8A75' }}>
              Annuleer
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setAdding(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '14px 18px', background: 'none', border: '1.5px dashed #C9963A', borderRadius: 14, cursor: 'pointer', color: '#C9963A', fontWeight: 700, fontSize: '.92rem' }}>
          <span style={{ fontSize: '1.3rem' }}>+</span> Lid toevoegen
        </button>
      )}
    </div>
  )
}
