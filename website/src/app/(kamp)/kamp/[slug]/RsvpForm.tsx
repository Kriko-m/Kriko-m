'use client'
import { useState } from 'react'
import { TAKKEN, TAK_LABELS } from '@/lib/constants'

interface KindRij {
  kind_naam: string
  tak: string
  status: '' | 'ja' | 'nee'
  opmerking: string
}

function leegKind(defaultTak: string): KindRij {
  return { kind_naam: '', tak: defaultTak, status: '', opmerking: '' }
}

export default function RsvpForm({ slug, kampTak }: { slug: string; kampTak: string }) {
  const defaultTak = TAKKEN.includes(kampTak as never) ? kampTak : ''
  const [rijen, setRijen] = useState<KindRij[]>([leegKind(defaultTak)])
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const [error, setError] = useState('')
  const [website, setWebsite] = useState('')

  function update(i: number, patch: Partial<KindRij>) {
    setRijen(prev => prev.map((r, idx) => idx === i ? { ...r, ...patch } : r))
  }
  function voegToe() {
    setRijen(prev => [...prev, leegKind(defaultTak)])
  }
  function verwijder(i: number) {
    setRijen(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    for (const r of rijen) {
      if (!r.kind_naam.trim()) return setError('Vul voor elk kind een naam in.')
      if (!r.tak) return setError('Selecteer voor elk kind een tak.')
      if (!r.status) return setError('Geef voor elk kind ja of nee op.')
    }
    setStatus('sending')
    const res = await fetch(`/api/kamp/${slug}/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ website, antwoorden: rijen }),
    })
    if (res.ok) {
      setStatus('done')
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Er ging iets mis. Probeer het opnieuw.')
      setStatus('idle')
    }
  }

  if (status === 'done') {
    return (
      <div style={{ background: 'hsl(145,55%,95%)', border: '2px solid hsl(145,50%,72%)', borderRadius: 'var(--border-radius-md)', padding: '24px' }}>
        <strong style={{ display: 'block', color: 'hsl(145,60%,26%)', fontSize: '1.1rem', marginBottom: 8 }}>✓ Bedankt!</strong>
        <p style={{ color: 'hsl(145,45%,32%)', margin: '0 0 16px', lineHeight: 1.55, fontSize: '.9rem' }}>
          Je antwoord is genoteerd. Wil je iets wijzigen? Open gewoon <strong>dezelfde link</strong> opnieuw — je laatste antwoord telt.
        </p>
        <button onClick={() => { setRijen([leegKind(defaultTak)]); setStatus('idle') }}
          style={{ padding: '8px 16px', background: 'none', border: '1.5px solid hsl(145,45%,55%)', borderRadius: 8, color: 'hsl(145,55%,30%)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '.83rem' }}>
          Nog een kind doorgeven
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-md)', padding: '22px', boxShadow: 'var(--shadow-sm)' }}>
      <h2 style={{ fontSize: '1.15rem', color: 'var(--color-primary-dark)', marginBottom: 4, fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Komt je kind mee?</h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '.83rem', marginBottom: 18, lineHeight: 1.5 }}>
        Meerdere kinderen? Gebruik &ldquo;+ nog een kind&rdquo;.
      </p>

      {error && (
        <div style={{ background: 'hsla(4,75%,48%,0.08)', border: '1.5px solid var(--color-error)', color: 'var(--color-error)', padding: '11px 14px', borderRadius: 'var(--border-radius-sm)', marginBottom: 16, fontWeight: 600, fontSize: '.85rem' }}>
          {error}
        </div>
      )}

      {/* Honeypot */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
        <label htmlFor="website">Laat dit veld leeg</label>
        <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {rijen.map((r, i) => (
          <div key={i} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-sm)', padding: '14px', position: 'relative', background: 'var(--color-bg-linen)' }}>
            {rijen.length > 1 && (
              <button type="button" onClick={() => verwijder(i)} aria-label="Verwijder"
                style={{ position: 'absolute', top: 8, right: 10, background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', lineHeight: 1 }}>×</button>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>Naam van het kind</label>
                <input type="text" className="form-control" placeholder="Voornaam Achternaam" maxLength={120}
                  value={r.kind_naam} onChange={e => update(i, { kind_naam: e.target.value })} required
                  style={{ fontSize: '.9rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>Tak</label>
                <select className="form-control" value={r.tak} onChange={e => update(i, { tak: e.target.value })} required style={{ fontSize: '.85rem' }}>
                  <option value="" disabled>Kies tak</option>
                  {TAKKEN.map(t => <option key={t} value={t}>{TAK_LABELS[t]}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>Komt mee?</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {(['ja', 'nee'] as const).map(opt => (
                  <button key={opt} type="button" onClick={() => update(i, { status: opt })}
                    style={{
                      padding: '11px 8px', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer',
                      fontWeight: 700, fontFamily: 'inherit', fontSize: '.95rem',
                      border: `2px solid ${r.status === opt ? (opt === 'ja' ? '#3F7D5A' : '#B23A4D') : 'var(--color-border)'}`,
                      background: r.status === opt ? (opt === 'ja' ? 'hsl(145,42%,94%)' : 'hsl(350,55%,96%)') : 'var(--color-bg-white)',
                      color: r.status === opt ? (opt === 'ja' ? '#2C5A40' : '#8A2433') : 'var(--color-text-muted)',
                      transition: 'all .15s',
                    }}>
                    {opt === 'ja' ? '✓ Ja' : '✗ Nee'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>Opmerking (optioneel)</label>
              <textarea className="form-control" rows={2} maxLength={500}
                placeholder="Bv. allergie, komt later toe…"
                value={r.opmerking} onChange={e => update(i, { opmerking: e.target.value })}
                style={{ resize: 'vertical', fontSize: '.85rem' }} />
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={voegToe}
        style={{ marginTop: 12, padding: '8px 14px', background: 'none', border: '1.5px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text-muted)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '.83rem' }}>
        + nog een kind
      </button>

      <button type="submit" disabled={status === 'sending'}
        style={{ display: 'block', width: '100%', padding: '13px', fontSize: '1rem', marginTop: 14, background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--border-radius-sm)', fontFamily: 'inherit', fontWeight: 700, cursor: status === 'sending' ? 'wait' : 'pointer', opacity: status === 'sending' ? .7 : 1, transition: 'opacity .15s' }}>
        {status === 'sending' ? 'Bezig…' : 'Antwoord doorgeven'}
      </button>

      <p style={{ fontSize: '.75rem', color: 'var(--color-text-muted)', marginTop: 12, lineHeight: 1.5 }}>
        Dit is een opgave, geen definitieve inschrijving — leiding bevestigt via e-mail.
        Wijzigen kan altijd via dezelfde link.
      </p>
    </form>
  )
}
