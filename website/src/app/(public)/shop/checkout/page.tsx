import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase'
import CheckoutForm from './CheckoutForm'

export const metadata: Metadata = { title: 'Afrekenen – Scouts Kriko-M' }

export default async function CheckoutPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const ingelogd = !!user

  return (
    <>
      <section className="tak-hero primair hero-checkout">
        <div className="container">
          <span className="hero-eyebrow">Bijna klaar</span>
          <h2 className="tak-hero-title">Bestelling afronden</h2>
          <p style={{ fontSize: '1.2rem', color: 'hsla(0,0%,100%,0.9)', marginTop: 8 }}>
            Vul je gegevens in om de bestelling via overschrijving te plaatsen.
          </p>
        </div>
      </section>
      <CheckoutForm ingelogd={ingelogd} />
    </>
  )
}
