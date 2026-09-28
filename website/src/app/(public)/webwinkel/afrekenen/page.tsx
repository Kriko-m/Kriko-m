import type { Metadata } from 'next'
import CheckoutForm from '@/components/shop/CheckoutForm'
import { getSettings } from '@/lib/db'

export const metadata: Metadata = { title: 'Afrekenen — Webwinkel' }

export default async function AfrekenenPage() {
  const settings = await getSettings()

  return (
    <>
      <section className="tak-hero primair hero-checkout">
        <div className="container">
          <h2 className="tak-hero-title">Bestelling afronden</h2>
        </div>
      </section>
      <CheckoutForm webshopPhone={settings?.webshop_phone} />
    </>
  )
}
