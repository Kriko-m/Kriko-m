'use client'
import { useState } from 'react'

const STATUS_LABELS: Record<string, { label: string; kleur: string }> = {
  pending:          { label: 'Wachten op betaling', kleur: '#BE8A2E' },
  waiting_approval: { label: 'Betaling gemeld',     kleur: '#C9963A' },
  paid:             { label: 'Betaald',              kleur: '#3F7D5A' },
  completed:        { label: 'Geleverd',             kleur: '#8A9A8A' },
  cancelled:        { label: 'Geannuleerd',          kleur: '#B23A4D' },
}

export default function BestellingCard({ order }: { order: any }) {
  const [status, setStatus] = useState(order.status)
  const [loading, setLoading] = useState(false)
  const st = STATUS_LABELS[status] ?? { label: status, kleur: '#888' }
  const isDone = status === 'completed' || status === 'cancelled'
  const date = order.created_at
    ? new Date(order.created_at).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  const items: any[] = order.items ?? []
  const itemsTekst = items.map((i: any) => `${i.quantity}× ${i.name}`).join(', ')

  async function meldBetaling() {
    setLoading(true)
    const res = await fetch(`/api/orders/${order.id}/betaling-melden`, { method: 'POST' })
    if (res.ok) setStatus('waiting_approval')
    setLoading(false)
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #C2D9C9', borderRadius: 16, padding: '20px 24px', opacity: isDone ? .6 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <div>
          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1A3D2A' }}>{order.order_ref}</span>
          <span style={{ marginLeft: 10, fontSize: '.8rem', color: '#6A8A75' }}>{date}</span>
        </div>
        <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: '.78rem', fontWeight: 700, background: `${st.kleur}22`, color: st.kleur }}>
          {st.label}
        </span>
      </div>

      <div style={{ fontSize: '.88rem', color: '#3A5A42', marginBottom: 8 }}>{itemsTekst}</div>
      <div style={{ fontWeight: 700, color: '#1A3D2A', fontSize: '1rem', marginBottom: 12 }}>
        Totaal: €{Number(order.total).toFixed(2).replace('.', ',')}
      </div>

      {status === 'pending' && (
        <div style={{ background: '#fef3c7', border: '1.5px solid #f59e0b', borderRadius: 10, padding: '12px 16px', marginBottom: 12, fontSize: '.85rem' }}>
          <strong style={{ display: 'block', marginBottom: 4 }}>Overschrijving vereist</strong>
          <div>IBAN: <code style={{ fontWeight: 700 }}>{order.bank_iban || '—'}</code></div>
          <div>Bedrag: <strong>€{Number(order.total).toFixed(2).replace('.', ',')}</strong></div>
          <div>Mededeling: <code style={{ fontWeight: 700, color: '#7a1b2e' }}>{order.communication}</code></div>
        </div>
      )}

      {status === 'pending' && (
        <button onClick={meldBetaling} disabled={loading}
          style={{ padding: '8px 18px', background: '#1A3D2A', color: '#fff', border: 'none', borderRadius: 8, fontSize: '.85rem', fontWeight: 700, cursor: 'pointer' }}>
          {loading ? 'Bezig…' : '✓ Ik heb betaald'}
        </button>
      )}
    </div>
  )
}
