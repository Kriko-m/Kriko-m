import type { Metadata } from 'next'
import CheckoutForm from './CheckoutForm'

export const metadata: Metadata = { title: 'Afrekenen – Scouts Kriko-M' }

export default function CheckoutPage() {
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
