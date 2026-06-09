import type { Metadata } from 'next'
import { getShopProducts } from '@/lib/db'
import { createServerSupabaseClient } from '@/lib/supabase'
import ShopProductCard from '@/components/shop/ShopProductCard'
import CartDrawer from '@/components/shop/CartDrawer'
import { Product } from '@/lib/types'

export const metadata: Metadata = { title: 'Webshop – Scouts Kriko-M' }

const CATEGORIES: Record<string, string> = {
  kledij: 'Kriko-M Kledij',
  uniform: 'Scouts Uniform',
  accessoires: 'Accessoires & Kentekens',
}

export default async function ShopPage() {
  const products = (await getShopProducts()) as Product[]
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const ingelogd = !!user

  const grouped = Object.entries(CATEGORIES)
    .map(([key, label]) => ({
      key,
      label,
      items: products.filter((p: Product) => p.category === key),
    }))
    .filter(g => g.items.length > 0)

  return (
    <>
      <section className="tak-hero primair hero-webshop">
        <div className="container">
          <span className="hero-eyebrow">Draag met trots</span>
          <h2 className="tak-hero-title">Onze Scouts Webshop</h2>
          <p style={{ fontSize: '1.2rem', color: 'hsla(0,0%,100%,0.9)', marginTop: 8 }}>
            Kriko-M truien, t-shirts, dassen en kentekens.
          </p>
        </div>
      </section>

      <section className="section container">
        {!ingelogd && (
          <div style={{ backgroundColor: 'hsla(145, 33%, 36%, 0.08)', border: '2px solid var(--color-primary)', borderRadius: 'var(--border-radius-lg)', padding: '22px 24px', marginBottom: 28, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <i className="fa-solid fa-info-circle" style={{ fontSize: '1.6rem', color: 'var(--color-primary)', flexShrink: 0 }}></i>
            <div style={{ flex: 1, minWidth: 220 }}>
              <strong style={{ display: 'block', color: 'var(--color-primary-dark)', fontSize: '1.1rem', marginBottom: 2 }}>Je bekijkt de webshop als gast</strong>
              <span style={{ fontSize: '0.95rem', color: 'var(--color-text-dark)', lineHeight: 1.5 }}>Je kunt artikelen in je winkelmandje leggen en afrekenen als gast, of inloggen om je bestelling direct aan je ouder- of leidingsaccount te koppelen.</span>
            </div>
            <a href="/portaal?login_vereist=webshop&redirect=/shop/checkout" className="btn btn-secondary" style={{ flexShrink: 0, textDecoration: 'none' }}>
              Inloggen met account
            </a>
          </div>
        )}

        <div style={{ background: 'hsla(29,57%,46%,0.1)', border: '2px dashed var(--color-accent)', borderRadius: 'var(--border-radius-lg)', padding: 24, marginBottom: 40, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <i className="fa-solid fa-circle-info" style={{ fontSize: '1.4rem', color: 'var(--color-secondary)', flexShrink: 0, marginTop: 2 }} />
          <div>
            <h4 style={{ color: 'var(--color-primary-dark)', fontSize: '1.15rem', marginBottom: 4 }}>Hoe werkt bestellen bij ons?</h4>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-text-dark)', lineHeight: 1.5 }}>
              Voeg kledingstukken toe aan je winkelmandje en voltooi de checkout. Betaling via{' '}
              <strong>overschrijving</strong> — je ontvangt direct een gestructureerde mededeling. Zodra we de betaling
              ontvangen, ligt de bestelling de <strong>eerstvolgende zondag</strong> klaar aan de lokalen!
            </p>
          </div>
        </div>

        <div className="shop-products">
          {grouped.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '60px 0' }}>
              Er zijn momenteel geen producten beschikbaar. Kom later terug!
            </p>
          ) : (
            grouped.map(({ key, label, items }) => (
              <div key={key} className="shop-cat">
                <h3 className="shop-cat-title">{label}</h3>
                <div className="shop-grid">
                  {items.map((product: Product) => (
                    <ShopProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <CartDrawer />
    </>
  )
}
