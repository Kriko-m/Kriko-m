import type { Metadata } from 'next'
import { getShopProducts } from '@/lib/db'
import ShopProductCard from '@/components/shop/ShopProductCard'
import KentekenCard from '@/components/shop/KentekenCard'
import CartDrawer from '@/components/shop/CartDrawer'
import { Product } from '@/lib/types'

export const metadata: Metadata = { title: 'Webshop – Scouts Kriko-M' }

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
          <h2 className="tak-hero-title">Onze Scouts Webshop</h2>
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
            <h3 style={{ color: 'var(--color-primary-dark, #3a0710)', fontSize: '1.15rem', margin: '0 0 6px', fontWeight: 800 }}>
              Waar koop je wat? (Hopper vs. Kriko-M Webshop)
            </h3>
            <p style={{ fontSize: '0.94rem', color: 'var(--color-text-dark)', lineHeight: 1.55, margin: 0 }}>
              Standaard scoutskledij zoals de <strong>officiële scoutsbroek of -rok</strong> en het <strong>scoutshemd</strong> schaf je aan via de{' '}
              <a
                href="https://www.hopper.be/winkel"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--color-primary)', fontWeight: 800, textDecoration: 'underline' }}
              >
                Hopper winkel of webshop
              </a>.<br/>
              Via <strong>onze eigen Kriko-M webshop</strong> bestel je onze unieke groepskledij (T-shirt, trui en groepsdas) én onze officiële kentekens.
            </p>
          </div>
        </div>

        {/* 1. HOOFDARTIKELEN (T-Shirt, Trui, Groepsdas) */}
        <div style={{ marginBottom: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, borderBottom: '2px solid var(--color-bg-linen)', paddingBottom: 10 }}>
            <i className="fa-solid fa-shirt" style={{ fontSize: '1.3rem', color: 'var(--color-primary-dark)' }} />
            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-primary-dark)', margin: 0, fontFamily: 'var(--font-heading, Nunito, sans-serif)', fontWeight: 900 }}>
              Kriko-M Kledij &amp; Groepsdas
            </h3>
          </div>

          <div className="shop-grid">
            {mainProducts.map((product: Product) => (
              <ShopProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* 2. KENTEKENS COLLECTIE */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, borderBottom: '2px solid var(--color-bg-linen)', paddingBottom: 10 }}>
            <i className="fa-solid fa-certificate" style={{ fontSize: '1.3rem', color: 'var(--color-primary-dark)' }} />
            <div>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--color-primary-dark)', margin: 0, fontFamily: 'var(--font-heading, Nunito, sans-serif)', fontWeight: 900 }}>
                Collectie Kentekens &amp; Badges
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                Alle officiële schildjes, tak- en jaarkentekens voor op het hemd.
              </p>
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

          {/* Richtlijnen opnaaien kentekens */}
          <div style={{
            background: '#fff',
            border: '1.5px solid #C2D9C9',
            borderRadius: 'var(--border-radius-lg)',
            padding: '22px 26px',
            marginTop: 28,
            display: 'flex',
            gap: 18,
            alignItems: 'center',
            flexWrap: 'wrap',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <i className="fa-solid fa-compass" style={{ fontSize: '1.6rem', color: 'var(--color-primary-dark)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 240 }}>
              <h4 style={{ color: 'var(--color-primary-dark)', fontSize: '1.05rem', margin: '0 0 4px', fontFamily: 'var(--font-heading, Nunito, sans-serif)', fontWeight: 800 }}>
                Waar horen deze kentekens op het hemd?
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-text-dark)', margin: 0, lineHeight: 1.5 }}>
                Bekijk de schematische tekeningen en opnaai-instructies van de kentekens op de officiële website van{' '}
                <a 
                  href="https://www.scoutsengidsenvlaanderen.be/scoutskentekens" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'underline' }}
                >
                  Scouts &amp; Gidsen Vlaanderen
                </a>.
              </p>
            </div>
          </div>
        </div>

      </section>

      <CartDrawer />
    </>
  )
}
