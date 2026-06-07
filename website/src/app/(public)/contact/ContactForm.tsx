'use client'

import { useState } from 'react'

export default function ContactForm() {
  const [status, setStatus] = useState<'idle'|'sending'|'ok'|'error'>('idle')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    const data = Object.fromEntries(new FormData(e.currentTarget))
    const res = await fetch('/api/contact', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) })
    setStatus(res.ok ? 'ok' : 'error')
  }

  if (status === 'ok') {
    return (
      <div style={{ background: 'hsl(145,63%,95%)', border: '1px solid hsl(145,63%,70%)', borderRadius: 12, padding: '24px 28px', color: 'hsl(145,63%,25%)' }}>
        <strong>✓ Bericht verzonden!</strong><br />
        We antwoorden zo snel mogelijk. Bedankt!
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Naam *</label>
          <input name="name" required className="form-control" placeholder="Jouw naam" />
        </div>
        <div className="form-group">
          <label className="form-label">E-mail *</label>
          <input name="email" type="email" required className="form-control" placeholder="jouw@email.be" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Onderwerp</label>
        <input name="subject" className="form-control" placeholder="Waarover gaat je vraag?" />
      </div>
      <div className="form-group">
        <label className="form-label">Bericht *</label>
        <textarea name="message" required className="form-control" rows={6} placeholder="Stel hier je vraag…" style={{ resize: 'vertical' }} />
      </div>
      {status === 'error' && (
        <p style={{ color: 'var(--color-error)', marginBottom: 16 }}>Er ging iets mis. Probeer het opnieuw of stuur een e-mail.</p>
      )}
      <button type="submit" className="btn btn-secondary" disabled={status === 'sending'} style={{ width: '100%' }}>
        {status === 'sending' ? 'Bezig…' : 'Verstuur bericht'}
      </button>
    </form>
  )
}
