import type { Metadata } from 'next'
import { getShopProducts } from '@/lib/db'
import ShopProductCard from '@/components/shop/ShopProductCard'
import KentekenCard from '@/components/shop/KentekenCard'
import CartDrawer from '@/components/shop/CartDrawer'
import EditableText from '@/components/editing/EditableText'
import { Product } from '@/lib/types'

export const metadata: Metadata = { title: 'Webshop' }

export default async function ShopPage() {
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
            defaultValue="Webshop"
            as="h1"
            className="tak-hero-title"
          />
        </div>
      </section>

      <section className="section container section--no-top">

        {/* Informatiestrook over Hopper vs Kriko-M Webshop */}
        <div style={{
          background: 'hsla(29,57%,46%,0.08)',
          border: '1.5px solid var(--color-accent, #C9963A)',
          borderRadius: 'var(--border-radius-lg, 16px)',
          padding: '24px 28px',
          marginBottom: 40,
          display: 'flex',
          gap: 20,
          alignItems: 'flex-start',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <i className="fa-solid fa-circle-info" style={{ fontSize: '1.5rem', color: 'var(--color-primary-dark)', marginTop: 2, flexShrink: 0 }} />
          <div>
            <EditableText
              blockKey="shop.info.title"
              page="shop"
              section="info"
              field="title"
              defaultValue="Waar koop je wat? (Hopper vs. Kriko-M Webshop)"
              as="h3"
              style={{ color: 'var(--color-primary-dark, #3a0710)', fontSize: '1.15rem', margin: '0 0 6px', fontWeight: 800 }}
            />
            <p style={{ fontSize: '0.94rem', color: 'var(--color-text-dark)', lineHeight: 1.55, margin: 0 }}>
              <EditableText
                blockKey="shop.info.content"
                page="shop"
                section="info"
                field="content"
                defaultValue="Standaard scoutskledij zoals de officiële scoutsbroek of -rok en het scoutshemd schaf je aan via de Hopper winkel of webshop. Via onze eigen Kriko-M webshop bestel je onze unieke groepskledij (T-shirt, trui en groepsdas). Kentekens zijn eveneens te bestellen via Hopper, maar bieden we voor het gemak ook rechtstreeks aan in onze webshop!"
                as="span"
                multiline
              />
            </p>
          </div>
        </div>

        {/* 1. HOOFDARTIKELEN (T-Shirt, Trui, Groepsdas) */}
        <div style={{ marginBottom: 50 }}>
          <div style={{ marginBottom: 20, borderBottom: '2px solid var(--color-bg-linen)', paddingBottom: 10 }}>
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

          <div className="shop-grid">
            {mainProducts.map((product: Product) => (
              <ShopProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* 2. KENTEKENS */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ marginBottom: 20, borderBottom: '2px solid var(--color-bg-linen)', paddingBottom: 10 }}>
            <EditableText
              blockKey="shop.kentekens.title"
              page="shop"
              section="kentekens"
              field="title"
              defaultValue="Kentekens"
              as="h3"
              style={{ fontSize: '1.4rem', color: 'var(--color-primary-dark)', margin: 0, fontFamily: 'var(--font-heading, Nunito, sans-serif)', fontWeight: 900 }}
            />
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

          {/* Richtlijnen opnaaien kentekens */}
          <div style={{
            background: '#fff',
            border: '1.5px solid #C2D9C9',
            borderRadius: 'var(--border-radius-md, 12px)',
            padding: '12px 18px',
            marginTop: 24,
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <i className="fa-solid fa-compass" style={{ fontSize: '1.2rem', color: 'var(--color-primary-dark)', flexShrink: 0 }} />
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-dark)', margin: 0, lineHeight: 1.45 }}>
              <EditableText
                blockKey="shop.kentekens.instructions"
                page="shop"
                section="kentekens"
                defaultValue="Weet je niet waar de kentekens horen op je hemd? Bekijk hier de opnaai-instructies van Scouts & Gidsen Vlaanderen »"
                as="span"
              />
            </p>
          </div>
        </div>

      </section>

      <CartDrawer />
    </>
  )
}
