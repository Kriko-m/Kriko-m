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

                {(key === 'uniform' || key === 'accessoires') && (
                  <div style={{
                    background: '#fff',
                    border: '1.5px solid #C2D9C9',
                    borderRadius: 'var(--border-radius-lg)',
                    padding: '24px 28px',
                    marginTop: 24,
                    display: 'flex',
                    gap: 20,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <span style={{ fontSize: '2.5rem', display: 'block', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.04))' }}>🪡</span>
                    <div style={{ flex: 1, minWidth: 240 }}>
                      <h4 style={{ color: 'var(--color-primary-dark)', fontSize: '1.1rem', margin: '0 0 6px', fontFamily: 'var(--font-heading, Nunito, sans-serif)', fontWeight: 800 }}>
                        Waar horen deze kentekens op het hemd?
                      </h4>
                      <p style={{ fontSize: '0.88rem', color: 'var(--color-text-dark)', margin: 0, lineHeight: 1.5 }}>
                        Niet helemaal zeker waar je het jaarkenteken, de belofte badge of het takkenteken moet opnaaien? 
                        Bekijk de officiële richtlijnen en schematische tekeningen op de website van{' '}
                        <a 
                          href="https://www.scoutsengidsenvlaanderen.be/scoutskentekens" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ color: 'var(--color-accent)', fontWeight: 700, textDecoration: 'underline' }}
                        >
                          Scouts &amp; Gidsen Vlaanderen
                        </a>. Zo zit elk schildje meteen op de juiste plek!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      <CartDrawer />
    </>
  )
}
