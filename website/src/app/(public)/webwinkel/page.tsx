import type { Metadata } from 'next'
import { getShopProducts } from '@/lib/db'
import ShopProductCard from '@/components/shop/ShopProductCard'
import KentekenCard from '@/components/shop/KentekenCard'
import CartDrawer from '@/components/shop/CartDrawer'
import ShopInfoModals from '@/components/shop/ShopInfoModals'
import EditableText from '@/components/editing/EditableText'
import { Product } from '@/lib/types'

export const metadata: Metadata = { title: 'Webwinkel — Uniformen' }

export default async function WebwinkelPage() {
  const products = (await getShopProducts()) as Product[]

  // Main 3 items: T-shirt, Trui, Groepsdas
  const mainProducts = products.filter(p => p.category !== 'kentekens')
  
  // Kentekens collection (~12 badges)
  const kentekens = products.filter(p => p.category === 'kentekens')

  return (
    <>
      <section className="tak-hero primair hero-webshop">
        <div className="container">
          <EditableText
            blockKey="shop.hero.title"
            page="shop"
            section="hero"
            field="title"
            defaultValue="Webwinkel"
            as="h1"
            className="tak-hero-title"
          />
        </div>
      </section>

      <section className="section container section--no-top">
        {/* 3 Info Knoppen met Pop-out Modals (Bestellen, Afhaling, Hopper) */}
        <ShopInfoModals />

        {/* 1. HOOFDARTIKELEN (T-Shirt, Trui, Groepsdas) */}
        <div style={{ marginBottom: 50 }}>
          <div style={{
            marginBottom: 20,
            borderBottom: '2px solid var(--color-bg-linen)',
            paddingBottom: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <EditableText
                blockKey="shop.kledij.title"
                page="shop"
                section="kledij"
                field="title"
                defaultValue="Kriko-M Kledij &amp; Groepsdas"
                as="h3"
                style={{ fontSize: '1.4rem', color: 'var(--color-primary-dark)', margin: 0, fontFamily: 'var(--font-heading, Nunito, sans-serif)', fontWeight: 900 }}
              />
            </div>
          </div>

          <div className="shop-grid">
            {mainProducts.map((product: Product) => (
              <ShopProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* 2. KENTEKENS */}
        <div style={{ marginBottom: 40 }}>
          <div style={{
            marginBottom: 20,
            borderBottom: '2px solid var(--color-bg-linen)',
            paddingBottom: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <EditableText
                blockKey="shop.kentekens.title"
                page="shop"
                section="kentekens"
                field="title"
                defaultValue="Kentekens"
                as="h3"
                style={{ fontSize: '1.4rem', color: 'var(--color-primary-dark)', margin: 0, fontFamily: 'var(--font-heading, Nunito, sans-serif)', fontWeight: 900 }}
              />
              <a
                href="https://www.scoutsengidsenvlaanderen.be/scouts-en-gidsenleden/praktisch/waar-horen-de-kentekens"
                target="_blank"
                rel="noopener noreferrer"
                className="shop-header-pill"
                title="Bekijk de opnaai-instructies op Scouts & Gidsen Vlaanderen"
              >
                <i className="fa-solid fa-compass" style={{ fontSize: '0.95rem' }} aria-hidden="true" />
                <span>Opnaai-instructies</span>
                <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '0.72rem', opacity: 0.8 }} aria-hidden="true" />
              </a>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 16,
          }}>
            {kentekens.map((product: Product) => (
              <KentekenCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <CartDrawer />
    </>
  )
}
