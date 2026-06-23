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
      <div className="rsvp-success">
        <span className="rsvp-success-icon">🎒</span>
        <h2 className="rsvp-success-title">Bedankt!</h2>
        <p className="rsvp-success-text">
          Je antwoord is genoteerd. Wil je iets wijzigen? Open gewoon <strong>dezelfde link</strong> opnieuw — je laatste antwoord telt.
        </p>
        <button onClick={() => { setRijen([leegKind(defaultTak)]); setStatus('idle') }}
          className="rsvp-success-btn">
          Nog een kind doorgeven
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>

      {/* Honeypot */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
        <label htmlFor="website">Laat dit veld leeg</label>
        <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} />
      </div>

      <div className="rsvp-header">
        <h2 className="rsvp-titel">Schrijf je in!</h2>
        <p className="rsvp-sub">Meerdere kinderen? Voeg er meer toe onderaan.</p>
      </div>

      {error && <div className="rsvp-error">{error}</div>}

      <div className="rsvp-rijen">
        {rijen.map((r, i) => (
          <div key={i} className={`rsvp-rij${r.status === 'ja' ? ' rsvp-rij--ja' : r.status === 'nee' ? ' rsvp-rij--nee' : ''}`}>
            {rijen.length > 1 && (
              <button type="button" onClick={() => verwijder(i)} className="rsvp-verwijder" aria-label="Verwijder">×</button>
            )}

            <div className="rsvp-naam-row">
              <div className="rsvp-field">
                <label className="rsvp-label">Naam van het kind</label>
                <input type="text" className="form-control" placeholder="Voornaam" maxLength={120}
                  value={r.kind_naam} onChange={e => update(i, { kind_naam: e.target.value })} required />
              </div>
              <div className="rsvp-field">
                <label className="rsvp-label">Tak</label>
                <select className="form-control" value={r.tak} onChange={e => update(i, { tak: e.target.value })} required>
                  <option value="" disabled>Kies tak</option>
                  {TAKKEN.map(t => <option key={t} value={t}>{TAK_LABELS[t]}</option>)}
                </select>
              </div>
            </div>

            <div className="rsvp-keuze">
              <label className="rsvp-label">Komt mee op kamp?</label>
              <div className="rsvp-keuze-btns">
                <button type="button" onClick={() => update(i, { status: 'ja' })}
                  className={`rsvp-keuze-btn rsvp-keuze-btn--ja${r.status === 'ja' ? ' is-active' : ''}`}>
                  ✓ Ja!
                </button>
                <button type="button" onClick={() => update(i, { status: 'nee' })}
                  className={`rsvp-keuze-btn rsvp-keuze-btn--nee${r.status === 'nee' ? ' is-active' : ''}`}>
                  ✗ Nee
                </button>
              </div>
            </div>

            <div className="rsvp-field rsvp-opmerking">
              <label className="rsvp-label">Opmerking (optioneel)</label>
              <textarea className="form-control" rows={2} maxLength={500}
                placeholder="Bv. allergie, komt later toe…"
                value={r.opmerking} onChange={e => update(i, { opmerking: e.target.value })}
                style={{ resize: 'vertical' }} />
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={voegToe} className="rsvp-add-kind">
        + nog een kind toevoegen
      </button>

      <button type="submit" disabled={status === 'sending'} className="rsvp-submit">
        {status === 'sending' ? 'Bezig…' : 'Antwoord doorgeven →'}
      </button>

      <p className="rsvp-disclaimer">
        Dit is een opgave, geen definitieve inschrijving — leiding bevestigt via e-mail.
      </p>
    </form>
  )
}
