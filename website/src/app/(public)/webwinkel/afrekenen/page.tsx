import type { Metadata } from 'next'
import CheckoutForm from '@/components/shop/CheckoutForm'

export const metadata: Metadata = { title: 'Afrekenen — Webwinkel' }

export default function AfrekenenPage() {
  return (
    <>
      <section className="tak-hero primair hero-checkout">
        <div className="container">
          <h2 className="tak-hero-title">Bestelling afronden</h2>
        </div>
      </section>
      <CheckoutForm />
    </>
  )
}
