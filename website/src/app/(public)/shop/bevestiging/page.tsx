'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface OrderData {
  order_ref: string
  communication: string
  total: number
  items: Array<{ name: string; size: string; quantity: number; price: number }>
  bank_iban: string
  bank_holder: string
}

export default function BevestigingPage() {
  const [order, setOrder] = useState<OrderData | null>(null)

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('kriko_last_order')
      if (stored) {
        setOrder(JSON.parse(stored))
        sessionStorage.removeItem('kriko_last_order')
      }
    } catch {}
  }, [])

  if (!order) {
    return (
      <section className="section container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Geen bestellingsgegevens gevonden.</p>
        <Link href="/shop" className="btn btn-secondary" style={{ marginTop: 24, display: 'inline-block' }}>
          Naar de webshop
        </Link>
      </section>
    )
  }

  return (
    <>
      <section className="tak-hero primair hero-checkout">
        <div className="container">
          <span className="hero-eyebrow">Bestelling geplaatst!</span>
          <h2 className="tak-hero-title">Bedankt voor je bestelling</h2>
          <p style={{ fontSize: '1.2rem', color: 'hsla(0,0%,100%,0.9)', marginTop: 8 }}>
            We verwerken je bestelling zodra de overschrijving ontvangen is.
          </p>
        </div>
      </section>

      <section className="section container">
        <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Bevestigingsbadge */}
          <div style={{ background: 'hsl(145,63%,95%)', border: '2px solid hsl(145,63%,70%)', borderRadius: 'var(--border-radius-lg)', padding: '24px 28px' }}>
            <strong style={{ display: 'block', color: 'hsl(145,63%,25%)', fontSize: '1.1rem', marginBottom: 4 }}>
              ✓ Bestelling ontvangen — {order.order_ref}
            </strong>
            <span style={{ color: 'hsl(145,63%,30%)', fontSize: '0.95rem' }}>
              Je bestelling is geregistreerd. Voltooi de betaling via overschrijving met de gegevens hieronder.
            </span>
          </div>

          {/* Overschrijvingsgegevens */}
          <div className="checkout-card" style={{ background: 'var(--color-bg-white)' }}>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--color-primary-dark)', marginBottom: 20, paddingBottom: 12, borderBottom: '2px solid var(--color-bg-linen)' }}>
              💳 Overschrijvingsgegevens
            </h3>
            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>Begunstigde:</span>
                <span>{order.bank_holder}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>IBAN:</span>
                <code style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>{order.bank_iban}</code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>Bedrag:</span>
                <strong style={{ color: 'var(--color-secondary)', fontSize: '1.1rem' }}>
                  €{order.total.toFixed(2).replace('.', ',')}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, background: 'var(--color-bg-linen)', padding: '14px 18px', borderRadius: 'var(--border-radius-md)' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>Gestructureerde mededeling:</span>
                <code style={{ fontWeight: 'bold', color: 'var(--color-primary-dark)', fontSize: '1.15rem', letterSpacing: '0.05em' }}>
                  {order.communication}
                </code>
              </div>
            </div>
            <p style={{ marginTop: 16, fontSize: '0.85rem', color: 'var(--color-text-muted)', background: 'hsla(4,75%,48%,0.08)', padding: '10px 14px', borderRadius: 8 }}>
              ⚠ Vermeld de gestructureerde mededeling exact zoals hierboven, anders kan de leiding je betaling niet automatisch verwerken.
            </p>
          </div>

          {/* Bestelde artikelen */}
          <div className="checkout-card" style={{ background: 'var(--color-bg-white)' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary-dark)', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid var(--color-bg-linen)' }}>
              Bestelde artikelen
            </h3>
            {order.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--color-border)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.quantity}× {item.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Maat: {item.size}</div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--color-secondary)' }}>
                  €{(item.price * item.quantity).toFixed(2).replace('.', ',')}
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.15rem', color: 'var(--color-primary-dark)', marginTop: 8, paddingTop: 12, borderTop: '2px solid var(--color-bg-linen)' }}>
              <span>Totaal:</span>
              <span>€{order.total.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>

          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Zodra we de betaling ontvangen, ligt de bestelling de <strong>eerstvolgende zondag</strong> na de meeting klaar aan de lokalen!
          </p>

          <Link href="/" className="btn btn-outline" style={{ textAlign: 'center' }}>
            ← Terug naar de website
          </Link>
        </div>
      </section>
    </>
  )
}
