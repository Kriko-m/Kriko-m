'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/components/shop/CartProvider'

const TAKKEN = [
  { value: 'kapoenen', label: 'Kapoenen (6–8j)' },
  { value: 'welpen', label: 'Welpen (8–11j)' },
  { value: 'jonggivers', label: 'Jonggivers (11–14j)' },
  { value: 'givers', label: 'Givers (14–17j)' },
]

export default function CheckoutForm({ ingelogd }: { ingelogd: boolean }) {
  const { items, totalPrice, clearCart } = useCart()
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'sending'>('idle')
  const [error, setError] = useState('')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => { setHydrated(true) }, [])

  useEffect(() => {
    if (hydrated && items.length === 0) router.push('/shop')
  }, [hydrated, items.length, router])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    setError('')
    const fd = new FormData(e.currentTarget)
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: fd.get('customer_name'),
        child_name: fd.get('child_name'),
        child_tak: fd.get('child_tak'),
        email: fd.get('email'),
        cart: items,
      }),
    })
    if (res.ok) {
      const data = await res.json()
      clearCart()
      sessionStorage.setItem('kriko_last_order', JSON.stringify(data))
      router.push('/shop/bevestiging')
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Er ging iets mis. Probeer het opnieuw.')
      setStatus('idle')
    }
  }

  if (!hydrated) return null

  return (
    <section className="section container">
      <div className="checkout-layout">

        {/* Links: formulier */}
        <div className="checkout-card">
          <h3 style={{ fontSize: '1.6rem', borderBottom: '2px solid var(--color-bg-linen)', paddingBottom: 12, marginBottom: 24, color: 'var(--color-primary-dark)' }}>
            Contact & Bestelgegevens
          </h3>

          {!ingelogd && (
            <div style={{ background: 'var(--color-bg-white)', border: '2px dashed var(--color-accent)', borderRadius: 'var(--border-radius-md)', padding: '18px 20px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <strong style={{ display: 'block', color: 'var(--color-primary-dark)', fontSize: '0.98rem', marginBottom: 2 }}>Afrekenen als gast</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>Je bent niet ingelogd. Log in om deze bestelling automatisch aan je account te koppelen, of ga door als gast.</span>
              </div>
              <a href="/portaal?login_vereist=webshop&redirect=/shop/checkout" className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '8px 16px', textDecoration: 'none' }}>
                Inloggen
              </a>
            </div>
          )}

          {error && (
            <div style={{ background: 'hsla(4,75%,48%,0.1)', border: '2px solid var(--color-error)', color: 'var(--color-error)', padding: 16, borderRadius: 'var(--border-radius-md)', marginBottom: 24, fontWeight: 600 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="customer_name">Naam Ouder / Voogd:</label>
              <input type="text" id="customer_name" name="customer_name" className="form-control" placeholder="Voornaam + Achternaam" required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="child_name">Naam Lid (Kind):</label>
                <input type="text" id="child_name" name="child_name" className="form-control" placeholder="Voornaam + Achternaam" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="child_tak">Tak van Lid:</label>
                <select id="child_tak" name="child_tak" className="form-control" required defaultValue="">
                  <option value="" disabled>Selecteer Tak</option>
                  {TAKKEN.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">E-mailadres:</label>
              <input type="email" id="email" name="email" className="form-control" placeholder="ouder@domein.be" required />
            </div>

            <div style={{ background: 'var(--color-bg-linen)', borderRadius: 'var(--border-radius-md)', padding: 20, border: '1px solid var(--color-border)', margin: '24px 0 30px' }}>
              <strong style={{ display: 'block', color: 'var(--color-primary-dark)', marginBottom: 6 }}>Betalingsinformatie</strong>
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.4, display: 'block' }}>
                Door op &apos;Bestelling plaatsen&apos; te klikken, stem je in met de{' '}
                <a href="/voorwaarden" style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>verkoopsvoorwaarden</a> en de{' '}
                <a href="/privacy" style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>privacyverklaring</a>.
                Je ontvangt direct een unieke gestructureerde mededeling. Zodra we de overschrijving ontvangen, wordt je bestelling verwerkt!
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-secondary"
              style={{ width: '100%', padding: '14px 28px', fontSize: '1.1rem' }}
              disabled={status === 'sending' || items.length === 0}
            >
              {status === 'sending' ? 'Bezig…' : 'Bestelling plaatsen (Handmatige Overschrijving)'}
            </button>
          </form>
        </div>

        {/* Rechts: mandje-overzicht */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="checkout-card" style={{ background: 'var(--color-bg-white)' }}>
            <h3 style={{ fontSize: '1.4rem', borderBottom: '2px solid var(--color-bg-linen)', paddingBottom: 8, marginBottom: 16, color: 'var(--color-primary-dark)' }}>
              Jouw Mandje
            </h3>
            {items.map(item => (
              <div key={`${item.id}-${item.size}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--color-border)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Maat: {item.size} | Aantal: {item.quantity}</div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--color-secondary)' }}>
                  €{(item.price * item.quantity).toFixed(2).replace('.', ',')}
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--color-primary-dark)', marginTop: 20, paddingTop: 16, borderTop: '2px solid var(--color-bg-linen)' }}>
              <span>Totaal:</span>
              <span>€{totalPrice.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>

          <a href="/shop" className="btn btn-outline" style={{ width: '100%', textAlign: 'center' }}>
            ← Verder winkelen
          </a>
        </div>

      </div>
    </section>
  )
}
