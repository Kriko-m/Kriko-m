'use client'
import { useState, useEffect } from 'react'
import { KampRsvp } from '@/lib/types'
import { TAKKEN, TAK_KLEUREN } from '@/lib/constants'

// Kopieerknop voor de privélink (plak in de S&G-mail).
export function CopyLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    let origin = typeof window !== 'undefined' ? window.location.origin : ''
    // Als we lokaal testen, kopieer de productie Vercel URL zodat leiding geen localhost links verstuurt.
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      origin = 'https://kriko-m-indol.vercel.app'
    }
    const url = `${origin}/kamp/${slug}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button onClick={copy} title="Kopieer de privélink om in je S&G-mail te plakken"
      style={{ padding: '6px 12px', border: '1.5px solid #4A7BBF', borderRadius: 8, background: copied ? '#4A7BBF' : 'none', color: copied ? '#fff' : '#4A7BBF', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer' }}>
      {copied ? '✓ Gekopieerd' : '🔗 Privélink kopiëren'}
    </button>
  )
}

// Antwoorden-paneel: tally per tak + inline bewerken/verwijderen per rij.
export function RsvpPanel({ kampId }: { kampId: string }) {
  const [rsvps, setRsvps] = useState<KampRsvp[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{ kind_naam: string; tak: string; status: string; opmerking: string }>({ kind_naam: '', tak: '', status: 'ja', opmerking: '' })

  useEffect(() => {
    let active = true
    setLoading(true)
    fetch(`/api/admin/kampen/${kampId}/rsvp`)
      .then(res => res.ok ? res.json() : [])
      .then(data => { if (active) { setRsvps(data); setLoading(false) } })
      .catch(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [kampId])

  async function saveEdit(id: string) {
    const res = await fetch(`/api/admin/kampen/${kampId}/rsvp`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rsvp_id: id, ...editForm }),
    })
    if (res.ok) {
      const updated = await res.json()
      setRsvps(prev => (prev ?? []).map(r => r.id === id ? updated : r))
      setEditId(null)
    }
  }
  async function del(id: string) {
    if (!confirm('Dit antwoord verwijderen?')) return
    const res = await fetch(`/api/admin/kampen/${kampId}/rsvp`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rsvp_id: id }),
    })
    if (res.ok) setRsvps(prev => (prev ?? []).filter(r => r.id !== id))
  }

  if (loading || rsvps === null) return <div style={{ padding: 16, color: '#6A8A75', fontSize: '.85rem' }}>Antwoorden laden…</div>

  const totJa = rsvps.filter(r => r.status === 'ja').length
  const totNee = rsvps.filter(r => r.status === 'nee').length

  return (
    <div style={{ padding: '6px 0 4px' }}>
      <div style={{ background: '#FFF7E8', border: '1px solid #E2C58D', borderRadius: 8, padding: '8px 12px', fontSize: '.78rem', color: '#7A5A1A', marginBottom: 12 }}>
        ⚠ Deze lijst is <strong>zelf-opgegeven en niet geverifieerd</strong>. Behandel ze als richtinggevend en kruis ze tegen de leden die je kent — niet als sluitende aanwezigheidslijst.
      </div>
      <div style={{ fontWeight: 700, color: '#1A3D2A', fontSize: '.9rem', marginBottom: 12 }}>
        Totaal: <span style={{ color: '#3F7D5A' }}>{totJa}× ja</span> · <span style={{ color: '#B23A4D' }}>{totNee}× nee</span>
      </div>

      {rsvps.length === 0 && <p style={{ color: '#6A8A75', fontSize: '.85rem' }}>Nog geen antwoorden.</p>}

      {TAKKEN.map(tak => {
        const rows = rsvps.filter(r => r.tak === tak)
        if (rows.length === 0) return null
        const ja = rows.filter(r => r.status === 'ja').length
        const nee = rows.filter(r => r.status === 'nee').length
        return (
          <div key={tak} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ padding: '2px 8px', background: `${TAK_KLEUREN[tak]}33`, color: TAK_KLEUREN[tak], borderRadius: 20, fontSize: '.72rem', fontWeight: 800, textTransform: 'uppercase' }}>{tak}</span>
              <span style={{ fontSize: '.78rem', color: '#6A8A75' }}>{ja}× ja · {nee}× nee</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {rows.map(r => editId === r.id ? (
                <div key={r.id} style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', background: '#F8FAF9', padding: 8, borderRadius: 8 }}>
                  <input value={editForm.kind_naam} onChange={e => setEditForm(p => ({ ...p, kind_naam: e.target.value }))}
                    style={{ flex: 1, minWidth: 120, padding: '5px 8px', border: '1px solid #C2D9C9', borderRadius: 6, fontFamily: 'inherit', fontSize: '.82rem' }} />
                  <select value={editForm.tak} onChange={e => setEditForm(p => ({ ...p, tak: e.target.value }))}
                    style={{ padding: '5px 8px', border: '1px solid #C2D9C9', borderRadius: 6, fontFamily: 'inherit', fontSize: '.82rem' }}>
                    {TAKKEN.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <select value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}
                    style={{ padding: '5px 8px', border: '1px solid #C2D9C9', borderRadius: 6, fontFamily: 'inherit', fontSize: '.82rem' }}>
                    <option value="ja">ja</option><option value="nee">nee</option>
                  </select>
                  <button onClick={() => saveEdit(r.id)} style={{ padding: '5px 10px', background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 6, fontSize: '.78rem', fontWeight: 700, cursor: 'pointer' }}>Opslaan</button>
                  <button onClick={() => setEditId(null)} style={{ padding: '5px 10px', background: 'none', border: '1px solid #C2D9C9', borderRadius: 6, fontSize: '.78rem', cursor: 'pointer', color: '#6A8A75' }}>Annuleer</button>
                </div>
              ) : (
                <div key={r.id} style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#fff', border: '1px solid #EEF5F1', borderRadius: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontWeight: 700, color: '#1A3D2A', fontSize: '.86rem' }}>{r.kind_naam}</span>
                    <span style={{ marginLeft: 8, fontSize: '.76rem', fontWeight: 700, color: r.status === 'ja' ? '#3F7D5A' : '#B23A4D' }}>{r.status === 'ja' ? '✓ ja' : '✗ nee'}</span>
                    {r.opmerking && <div style={{ fontSize: '.76rem', color: '#6A8A75', fontStyle: 'italic' }}>{r.opmerking}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => { setEditId(r.id); setEditForm({ kind_naam: r.kind_naam, tak: r.tak, status: r.status, opmerking: r.opmerking }) }}
                      style={{ padding: '4px 8px', border: '1px solid #1A3D2A', borderRadius: 6, background: 'none', color: '#1A3D2A', fontSize: '.74rem', fontWeight: 700, cursor: 'pointer' }}>Bewerk</button>
                    <button onClick={() => del(r.id)}
                      style={{ padding: '4px 8px', border: '1px solid #B23A4D', borderRadius: 6, background: 'none', color: '#B23A4D', fontSize: '.74rem', fontWeight: 700, cursor: 'pointer' }}>×</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
