import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getSettings, getSiteContent } from '@/lib/db'
import CopyButton from '@/components/CopyButton'
import EditableBlock from '@/components/editing/EditableBlock'
import InschrijvenClient from './InschrijvenClient'

export const metadata: Metadata = {
  title: 'Inschrijven | Scouts Kriko-M',
  description: 'Schrijf je nu in bij Scouts Kriko-M. Duidelijk stappenplan voor nieuwe en bestaande leden via de Groepsadministratie van Scouts en Gidsen Vlaanderen, steekkaart en lidgeld.',
}

export default async function InschrijvenPage() {
  const [settings, siteContent] = await Promise.all([
    getSettings(),
    getSiteContent(),
  ])

  const fee1 = settings?.reg_fee_first ?? 50
  const fee2 = settings?.reg_fee_extra ?? 45
  const year = settings?.scouts_year ?? '2026-2027'
  const email = settings?.contact_email ?? 'groepsleiding@kriko-m.be'

  const heroBlock = siteContent['inschrijven.hero'] || {}
  const heroTitle = heroBlock.title || 'Inschrijven bij Kriko-M'
  const heroContent = heroBlock.content || 'Welkom bij de Kriko-M familie! Hieronder vind je een heel duidelijk en overzichtelijk stappenplan om je kind in te schrijven of te herinschrijven.'

  return (
    <>
      {/* Hero Banner */}
      <section className="tak-hero primair hero-inschrijven">
        <div className="container">
          <div className="hero-content-wrapper" style={{ maxWidth: 800 }}>
            <span
              style={{
                textTransform: 'uppercase',
                letterSpacing: '2px',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: 'var(--color-accent-light)',
                display: 'block',
                marginBottom: '8px',
              }}
            >
              SCHRIJF JE NU IN
            </span>

            <Suspense fallback={null}>
              <EditableBlock
                blockKey="inschrijven.hero"
                page="inschrijven"
                section="hero"
                initialTitle={heroTitle}
                initialContent={heroContent}
              >
                <h1 className="tak-hero-title" style={{ marginTop: 0 }}>
                  {heroTitle}
                </h1>
                <p
                  style={{
                    fontSize: '1.15rem',
                    lineHeight: '1.6',
                    color: 'rgba(255, 255, 255, 0.95)',
                    marginTop: '12px',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {heroContent}
                </p>
              </EditableBlock>
            </Suspense>
          </div>
        </div>
      </section>

      {/* Main Content & Sidebar Layout */}
      <section className="section container section--no-top">
        <div className="register-layout">
          
          {/* Main Left Column (Interactive Stappenplan) */}
          <InschrijvenClient fee1={fee1} fee2={fee2} year={year} email={email} siteContent={siteContent} />

          {/* Right Sidebar */}
          <div>
            <div
              className="side-card"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-bg-white)',
                border: 'none',
                position: 'sticky',
                top: 100,
              }}
            >
              <h3 style={{ color: 'var(--color-accent-light)', borderBottom: '1px dashed rgba(255,255,255,0.2)', paddingBottom: 12, marginTop: 0 }}>
                Jaarlijks Lidgeld ({year})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, margin: '20px 0' }}>
                {[
                  { label: '1e Kind', sub: 'Eerste gezinslid', price: fee1 },
                  { label: 'Extra Kind', sub: 'Zelfde gezin', price: fee2 },
                ].map(({ label, sub, price }) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderRadius: 'var(--border-radius-md)',
                      padding: 14,
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.95rem' }}>{label}:</strong>
                      <span style={{ fontSize: '0.8rem', opacity: 0.75 }}>{sub}</span>
                    </div>
                    <span
                      style={{
                        fontSize: '1.6rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-outfit), sans-serif',
                        color: 'var(--color-accent-light)',
                      }}
                    >
                      €{price}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ margin: 0 }}>
                  <strong>Verdeling van het lidgeld (€{fee1}):</strong>
                </p>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  <li><strong>€38:</strong> Verzekering Scouts &amp; Gidsen Vlaanderen</li>
                  <li><strong>€12:</strong> Lokale werking (spelmateriaal, drukkosten, etc.)</li>
                </ul>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.15)', margin: '20px 0' }} />

              <div>
                <h4 style={{ color: '#fff', margin: '0 0 8px 0', fontSize: '0.95rem' }}>Vragen over inschrijven?</h4>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', marginBottom: 14 }}>
                  De groepsleiding helpt je graag verder!
                </p>
                <CopyButton
                  text={email}
                  className="btn btn-secondary"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: '0.85rem' }}
                >
                  <i className="fas fa-envelope"></i> {email}
                </CopyButton>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  )
}

