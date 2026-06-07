'use client'
import { useState } from 'react'

const TAK_KLEUREN: Record<string, string> = {
  kapoenen: '#F4C842', welpen: '#5D9E6C', jonggivers: '#4A7BBF', givers: '#C9963A',
}
const BESTAND_LABELS: Record<string, string> = {
  paklijst_pdf: '🎒 Paklijst', uitnodiging: '📬 Uitnodiging', infobrief: '📋 Infobrief', overige: '📎 Bijlage',
}

interface Kind { id: string; voornaam: string; tak: string; ga_id: string }
interface Kamp {
  id: string; naam: string; tak: string; datum_van: string; datum_tot: string;
  locatie: string; beschrijving: string; foto?: string; prijs?: number;
  kamp_bestanden?: Array<{ id: string; type: string; naam: string; file_name: string }>
}
interface Inschrijving { kamp_id: string; ga_id: string }

export default function KampenView({ kinderen, kampen, inschrijvingen: init }: {
  kinderen: Kind[]
  kampen: Kamp[]
  inschrijvingen: Inschrijving[]
}) {
  const [inschrijvingen, setInschrijvingen] = useState<Inschrijving[]>(init)
  const [loading, setLoading] = useState<string>('')
  const [flash, setFlash] = useState('')
  const [opmerkingen, setOpmerkingen] = useState<Record<string, string>>({})

  function showFlash(msg: string) { setFlash(msg); setTimeout(() => setFlash(''), 3000) }
  function isIn(kamp_id: string, ga_id: string) { return inschrijvingen.some(i => i.kamp_id === kamp_id && i.ga_id === ga_id) }

  async function inschrijven(kamp_id: string, ga_id: string, opmerking: string) {
    const key = `${kamp_id}-${ga_id}`
    setLoading(key)
    const res = await fetch('/api/portaal/inschrijvingen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kamp_id, ga_id, opmerking }),
    })
    if (res.ok) {
      setInschrijvingen(prev => [...prev, { kamp_id, ga_id }])
      showFlash('Inschrijving geregistreerd!')
    }
    setLoading('')
  }

  async function uitschrijven(kamp_id: string, ga_id: string) {
    if (!confirm('Inschrijving annuleren?')) return
    const key = `${kamp_id}-${ga_id}`
    setLoading(key)
    await fetch('/api/portaal/inschrijvingen', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kamp_id, ga_id }),
    })
    setInschrijvingen(prev => prev.filter(i => !(i.kamp_id === kamp_id && i.ga_id === ga_id)))
    showFlash('Inschrijving geannuleerd.')
    setLoading('')
  }

  if (kinderen.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6A8A75' }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>👶</div>
        <p style={{ marginBottom: 16 }}>Voeg eerst je kinderen toe om kampen te zien en in te schrijven.</p>
        <a href="/portaal/kinderen" style={{ display: 'inline-block', padding: '10px 22px', background: '#1A3D2A', color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 700 }}>Leden beheren →</a>
      </div>
    )
  }

  if (kampen.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6A8A75' }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>🏕️</div>
        <p>Er zijn momenteel geen open kampen.</p>
      </div>
    )
  }

  // Filter kampen die relevant zijn voor de kinderen van deze ouder
  const relevanteTakken = new Set(kinderen.map(k => k.tak))
  const relevanteKampen = kampen.filter(k => k.tak === 'alle' || relevanteTakken.has(k.tak))

  return (
    <div>
      {flash && (
        <div style={{ background: 'hsla(145,33%,36%,.1)', border: '1.5px solid #3F7D5A', color: '#2C5A40', padding: '10px 16px', borderRadius: 10, marginBottom: 20, fontWeight: 600, fontSize: '.88rem' }}>{flash}</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {relevanteKampen.map(kamp => {
          const van = new Date(kamp.datum_van)
          const tot = new Date(kamp.datum_tot)
          const periode = `${van.getDate()}/${van.getMonth()+1} – ${tot.getDate()}/${tot.getMonth()+1}/${tot.getFullYear()}`
          const kleur = TAK_KLEUREN[kamp.tak] ?? '#888'
          const kindVoorKamp = kinderen.filter(k => kamp.tak === 'alle' || k.tak === kamp.tak)
          const bestanden = kamp.kamp_bestanden ?? []

          return (
            <div key={kamp.id} style={{ background: '#fff', border: '1px solid #C2D9C9', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
              {/* Header */}
              <div style={{ background: `${kleur}22`, borderBottom: `3px solid ${kleur}`, padding: '18px 22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <span style={{ fontSize: '.7rem', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: kleur }}>{kamp.tak}</span>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1A3D2A', margin: '4px 0 6px', fontFamily: 'var(--font-heading, Nunito, sans-serif)' }}>{kamp.naam}</h2>
                    <div style={{ fontSize: '.85rem', color: '#3A5A42' }}>📅 {periode} &nbsp;·&nbsp; 📍 {kamp.locatie}</div>
                  </div>
                  {kamp.prijs != null && kamp.prijs > 0 && (
                    <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#1A3D2A', alignSelf: 'center' }}>€{kamp.prijs.toFixed(2).replace('.', ',')}</div>
                  )}
                </div>
                {kamp.beschrijving && <p style={{ fontSize: '.88rem', color: '#3A5A42', marginTop: 10, lineHeight: 1.5 }}>{kamp.beschrijving}</p>}
                {bestanden.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                    {bestanden.map(b => (
                      <a key={b.id} href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/kamp-bestanden/${b.file_name}`}
                        target="_blank" rel="noopener"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#fff', border: '1px solid #C2D9C9', borderRadius: 8, fontSize: '.8rem', fontWeight: 600, color: '#1A3D2A', textDecoration: 'none' }}>
                        {BESTAND_LABELS[b.type] ?? '📎 Bijlage'} — {b.naam}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Inschrijvingen per kind */}
              <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {kindVoorKamp.map(kind => {
                  const inschr = isIn(kamp.id, kind.ga_id)
                  const key = `${kamp.id}-${kind.ga_id}`
                  const isLoading = loading === key
                  const kindKleur = TAK_KLEUREN[kind.tak] ?? '#888'
                  return (
                    <div key={kind.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, padding: '12px 16px', background: inschr ? 'hsla(145,33%,36%,.06)' : '#f8faf9', borderRadius: 10, border: `1px solid ${inschr ? '#3F7D5A44' : '#C2D9C9'}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${kindKleur}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: kindKleur, fontSize: '.9rem', flexShrink: 0 }}>
                          {(kind.voornaam?.[0] ?? '?').toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#1A3D2A', fontSize: '.95rem' }}>{kind.voornaam}</div>
                          {inschr && <div style={{ fontSize: '.75rem', color: '#3F7D5A', fontWeight: 700 }}>✓ Ingeschreven</div>}
                        </div>
                      </div>
                      {inschr ? (
                        <button onClick={() => uitschrijven(kamp.id, kind.ga_id)} disabled={isLoading}
                          style={{ padding: '6px 14px', border: '1.5px solid #B23A4D', borderRadius: 8, background: 'none', color: '#B23A4D', fontSize: '.8rem', fontWeight: 700, cursor: 'pointer' }}>
                          {isLoading ? '…' : 'Uitschrijven'}
                        </button>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                          <textarea
                            placeholder="Opmerking voor de leiding (optioneel)"
                            value={opmerkingen[key] ?? ''}
                            onChange={e => setOpmerkingen(prev => ({ ...prev, [key]: e.target.value }))}
                            rows={2}
                            style={{ padding: '6px 10px', border: '1px solid #C2D9C9', borderRadius: 8, fontFamily: 'inherit', fontSize: '.8rem', width: 240, resize: 'none' }}
                          />
                          <button onClick={() => inschrijven(kamp.id, kind.ga_id, opmerkingen[key] ?? '')} disabled={isLoading}
                            style={{ padding: '7px 16px', background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 8, fontSize: '.85rem', fontWeight: 700, cursor: 'pointer' }}>
                            {isLoading ? 'Bezig…' : '✓ Inschrijven'}
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
