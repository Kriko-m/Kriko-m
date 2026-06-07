import type { Metadata } from 'next'
import { getShopProducts } from '@/lib/db'
import ShopProductCard from '@/components/shop/ShopProductCard'
import CartDrawer from '@/components/shop/CartDrawer'

export const metadata: Metadata = { title: 'Webshop – Scouts Kriko-M' }

const CATEGORIES: Record<string, string> = {
  kledij: 'Kriko-M Kledij',
  uniform: 'Scouts Uniform',
  accessoires: 'Accessoires & Kentekens',
}

export default async function ShopPage() {
  const products = await getShopProducts()

  const grouped = Object.entries(CATEGORIES)
    .map(([key, label]) => ({
      key,
      label,
      items: products.filter((p: any) => p.category === key),
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
                  {items.map((product: any) => (
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
