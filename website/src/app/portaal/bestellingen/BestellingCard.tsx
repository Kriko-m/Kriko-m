'use client'
import { useState } from 'react'
import { Order, OrderItem } from '@/lib/types'

const STATUS_LABELS: Record<string, { label: string; kleur: string }> = {
  pending:          { label: 'Wachten op betaling', kleur: '#BE8A2E' },
  waiting_approval: { label: 'Betaling gemeld',     kleur: '#C9963A' },
  paid:             { label: 'Betaald',              kleur: '#3F7D5A' },
  completed:        { label: 'Geleverd',             kleur: '#8A9A8A' },
  cancelled:        { label: 'Geannuleerd',          kleur: '#B23A4D' },
}

export default function BestellingCard({ order }: { order: Order }) {
  const [status, setStatus] = useState(order.status)
  const [loading, setLoading] = useState(false)
  const st = STATUS_LABELS[status] ?? { label: status, kleur: '#888' }
  const isDone = status === 'completed' || status === 'cancelled'
  const date = order.created_at
    ? new Date(order.created_at).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  const items: OrderItem[] = order.items ?? []
  const itemsTekst = items.map((i: OrderItem) => `${i.quantity}× ${i.name}`).join(', ')

  async function meldBetaling() {
    setLoading(true)
    const res = await fetch(`/api/orders/${order.id}/betaling-melden`, { method: 'POST' })
    if (res.ok) setStatus('waiting_approval')
    setLoading(false)
  }

  return (
    <div className="portal-sub-card" style={{ opacity: isDone ? .6 : 1, gap: 12 } as React.CSSProperties}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1A3D2A' }}>{order.order_ref}</span>
          <span style={{ marginLeft: 10, fontSize: '.85rem', color: '#6A8A75' }}>{date}</span>
        </div>
        <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: '.78rem', fontWeight: 700, background: `${st.kleur}18`, color: st.kleur }}>
          {st.label}
        </span>
      </div>

      <div style={{ fontSize: '.92rem', color: '#3A5A42', fontWeight: 500 }}>{itemsTekst}</div>
      <div style={{ fontWeight: 800, color: '#1A3D2A', fontSize: '1.1rem' }}>
        Totaal: €{Number(order.total).toFixed(2).replace('.', ',')}
      </div>

      {status === 'pending' && (
        <div style={{ background: '#fff8e1', border: '1.5px solid #f59e0b', borderRadius: 'var(--border-radius-md)', padding: '16px 20px', fontSize: '.88rem', color: '#92400e', lineHeight: 1.6 }}>
          <strong style={{ display: 'block', marginBottom: 6, fontSize: '0.92rem' }}>Overschrijving vereist</strong>
          <div style={{ marginBottom: 2 }}>IBAN: <code style={{ fontWeight: 700, fontSize: '0.9rem' }}>{order.bank_iban || '—'}</code></div>
          <div style={{ marginBottom: 2 }}>Bedrag: <strong>€{Number(order.total).toFixed(2).replace('.', ',')}</strong></div>
          <div>Mededeling: <code style={{ fontWeight: 700, color: '#7a1b2e', fontSize: '0.9rem' }}>{order.communication}</code></div>
        </div>
      )}

      {status === 'pending' && (
        <button onClick={meldBetaling} disabled={loading} className="btn btn-primary"
          style={{ padding: '10px 24px', fontSize: '.85rem', alignSelf: 'flex-start' }}>
          {loading ? 'Bezig…' : '✓ Ik heb betaald'}
        </button>
      )}
    </div>
  )
}
