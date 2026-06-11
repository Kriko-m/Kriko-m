'use client'
import { useState } from 'react'
import { TAKKEN, TAK_NAMEN, TAK_KLEUREN, MAANDEN } from '@/lib/constants'

interface ArchiefKamp {
  id: string; naam: string; tak: string; datum_van: string; datum_tot: string
  bestanden: { id: string; type: string; naam: string; file_name: string }[]
  ja: number; nee: number
}
interface ArchiefEcho { id: string; title: string; tak: string; month: number; file_name: string }
interface ArchiefLeiding { tak: string; naam: string; rol: string }

export interface ArchiefJaar {
  werkjaar: string
  actief: boolean
  kampen: ArchiefKamp[]
  echos: ArchiefEcho[]
  leiding: ArchiefLeiding[]
}

export default function ArchiefBrowser({ jaren, storageUrl }: { jaren: ArchiefJaar[]; storageUrl: string }) {
  const [sel, setSel] = useState(jaren[0]?.werkjaar ?? '')
  const jaar = jaren.find(j => j.werkjaar === sel)

  if (jaren.length === 0) {
    return <p style={{ color: '#6A8A75' }}>Nog geen gearchiveerde gegevens. Het archief vult zich naarmate werkjaren gepubliceerd worden.</p>
  }

  const kampBase = `${storageUrl}/storage/v1/object/public/kamp-bestanden`
  const echoBase = `${storageUrl}/storage/v1/object/public/echos`

  return (
    <div>
      {/* Jaarkiezer */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {jaren.map(j => (
          <button key={j.werkjaar} onClick={() => setSel(j.werkjaar)}
            style={{ padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '.85rem', fontWeight: 700,
              background: sel === j.werkjaar ? '#1A3D2A' : '#EEF5F1', color: sel === j.werkjaar ? '#fff' : '#3A5A42' }}>
            {j.werkjaar}{j.actief ? ' (actief)' : ''}
          </button>
        ))}
      </div>

      {jaar && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Leiding per tak */}
          <section>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1A3D2A', marginBottom: 12 }}>🛡️ Leiding per tak</h2>
            {jaar.leiding.length === 0 ? (
              <p style={{ color: '#6A8A75', fontSize: '.88rem' }}>{jaar.actief ? 'Wordt vastgelegd bij het publiceren van het volgende werkjaar.' : 'Geen leidinggegevens bewaard voor dit jaar.'}</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 12 }}>
                {TAKKEN.map(tak => {
                  const rows = jaar.leiding.filter(l => l.tak === tak)
                  if (rows.length === 0) return null
                  return (
                    <div key={tak} style={{ background: '#fff', border: `1.5px solid ${TAK_KLEUREN[tak]}55`, borderRadius: 12, padding: 14 }}>
                      <div style={{ fontWeight: 800, color: TAK_KLEUREN[tak], fontSize: '.8rem', marginBottom: 6 }}>{TAK_NAMEN[tak]}</div>
                      {rows.map((r, i) => (
                        <div key={i} style={{ fontSize: '.85rem', color: '#3A5A42' }}>{r.naam}{r.rol ? <span style={{ color: '#6A8A75' }}> — {r.rol}</span> : null}</div>
                      ))}
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Kampen & weekenden */}
          <section>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1A3D2A', marginBottom: 12 }}>🏕️ Kampen & weekenden</h2>
            {jaar.kampen.length === 0 ? <p style={{ color: '#6A8A75', fontSize: '.88rem' }}>Geen kampen dit werkjaar.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {jaar.kampen.map(k => (
                  <div key={k.id} style={{ background: '#fff', border: '1px solid #C2D9C9', borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <span style={{ padding: '2px 8px', background: `${TAK_KLEUREN[k.tak] ?? '#888'}22`, color: TAK_KLEUREN[k.tak] ?? '#888', borderRadius: 20, fontSize: '.7rem', fontWeight: 800, textTransform: 'uppercase' }}>{k.tak}</span>
                        <strong style={{ marginLeft: 8, color: '#1A3D2A' }}>{k.naam}</strong>
                      </div>
                      <span style={{ fontSize: '.82rem', color: '#3A5A42', fontWeight: 700 }}>aanwezig (opgave): {k.ja} ja · {k.nee} nee</span>
                    </div>
                    {k.bestanden.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                        {k.bestanden.map(b => (
                          <a key={b.id} href={`${kampBase}/${b.file_name}`} target="_blank" rel="noopener"
                            style={{ fontSize: '.78rem', color: '#1A3D2A', textDecoration: 'underline' }}>📎 {b.naam}</a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Kriko Echo's */}
          <section>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1A3D2A', marginBottom: 12 }}>📰 Kriko Echo&apos;s</h2>
            {jaar.echos.length === 0 ? <p style={{ color: '#6A8A75', fontSize: '.88rem' }}>Geen echo&apos;s dit werkjaar.</p> : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {jaar.echos.map(e => (
                  <a key={e.id} href={`${echoBase}/${e.file_name}`} target="_blank" rel="noopener"
                    style={{ padding: '6px 12px', background: '#fff', border: `1px solid ${TAK_KLEUREN[e.tak] ?? '#C2D9C9'}55`, borderRadius: 8, fontSize: '.8rem', fontWeight: 600, color: '#1A3D2A', textDecoration: 'none' }}>
                    {MAANDEN[e.month - 1] ?? ''} — {TAK_NAMEN[e.tak] ?? e.tak}
                  </a>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
