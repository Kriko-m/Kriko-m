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
  // Als het kamp voor één tak is, gebruik die als default; anders leeg.
  const defaultTak = TAKKEN.includes(kampTak as never) ? kampTak : ''
  const [rijen, setRijen] = useState<KindRij[]>([leegKind(defaultTak)])
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const [error, setError] = useState('')
  const [website, setWebsite] = useState('') // honeypot

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
      <div style={{ background: 'hsl(145,63%,95%)', border: '2px solid hsl(145,63%,70%)', borderRadius: 'var(--border-radius-lg)', padding: '24px 28px' }}>
        <strong style={{ display: 'block', color: 'hsl(145,63%,25%)', fontSize: '1.15rem', marginBottom: 6 }}>✓ Bedankt, je antwoord is genoteerd!</strong>
        <p style={{ color: 'hsl(145,63%,30%)', margin: 0, lineHeight: 1.5 }}>
          Wil je je antwoord nog wijzigen? Open gewoon <strong>dezelfde link</strong> opnieuw en dien je antwoord nog eens in — je laatste antwoord telt.
        </p>
        <button onClick={() => { setRijen([leegKind(defaultTak)]); setStatus('idle') }}
          className="btn btn-outline" style={{ marginTop: 16, fontSize: '.85rem' }}>
          Nog een antwoord doorgeven
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="checkout-card">
      <h2 style={{ fontSize: '1.4rem', color: 'var(--color-primary-dark)', marginBottom: 6 }}>Komt je kind mee?</h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '.9rem', marginBottom: 20 }}>
        Antwoord hieronder. Heb je meerdere kinderen? Gebruik &ldquo;+ nog een kind&rdquo;.
      </p>

      {error && (
        <div style={{ background: 'hsla(4,75%,48%,0.1)', border: '2px solid var(--color-error)', color: 'var(--color-error)', padding: 14, borderRadius: 'var(--border-radius-md)', marginBottom: 20, fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* Honeypot */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
        <label htmlFor="website">Laat dit veld leeg</label>
        <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {rijen.map((r, i) => (
          <div key={i} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-md)', padding: 16, position: 'relative' }}>
            {rijen.length > 1 && (
              <button type="button" onClick={() => verwijder(i)} aria-label="Verwijder dit kind"
                style={{ position: 'absolute', top: 8, right: 10, background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem' }}>×</button>
            )}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Naam van het kind</label>
                <input type="text" className="form-control" placeholder="Voornaam + Achternaam" maxLength={120}
                  value={r.kind_naam} onChange={e => update(i, { kind_naam: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Tak</label>
                <select className="form-control" value={r.tak} onChange={e => update(i, { tak: e.target.value })} required>
                  <option value="" disabled>Selecteer tak</option>
                  {TAKKEN.map(t => <option key={t} value={t}>{TAK_LABELS[t]}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Komt mee?</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {(['ja', 'nee'] as const).map(opt => (
                  <button key={opt} type="button" onClick={() => update(i, { status: opt })}
                    style={{
                      flex: 1, padding: '12px', borderRadius: 'var(--border-radius-md)', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit', fontSize: '1rem',
                      border: `2px solid ${r.status === opt ? (opt === 'ja' ? '#3F7D5A' : '#B23A4D') : 'var(--color-border)'}`,
                      background: r.status === opt ? (opt === 'ja' ? 'hsl(145,40%,95%)' : 'hsl(350,55%,96%)') : 'var(--color-bg-white)',
                      color: r.status === opt ? (opt === 'ja' ? '#2C5A40' : '#8A2433') : 'var(--color-text-muted)',
                    }}>
                    {opt === 'ja' ? '✓ Ja, komt mee' : '✗ Kan niet'}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Opmerking (optioneel)</label>
              <textarea className="form-control" rows={2} maxLength={500} placeholder="Bv. komt later toe, allergie te bespreken, ..."
                value={r.opmerking} onChange={e => update(i, { opmerking: e.target.value })} style={{ resize: 'vertical' }} />
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={voegToe} className="btn btn-outline" style={{ marginTop: 16, fontSize: '.88rem' }}>
        + nog een kind
      </button>

      <button type="submit" disabled={status === 'sending'} className="btn btn-secondary"
        style={{ width: '100%', padding: '14px', fontSize: '1.05rem', marginTop: 20 }}>
        {status === 'sending' ? 'Bezig…' : 'Antwoord doorgeven'}
      </button>

      <p style={{ fontSize: '.8rem', color: 'var(--color-text-muted)', marginTop: 14, lineHeight: 1.5 }}>
        Je antwoord is een opgave, geen definitieve inschrijving — de leiding bevestigt verder via e-mail.
        Wijzigen kan altijd via dezelfde link (je laatste antwoord telt).
      </p>
    </form>
  )
}
