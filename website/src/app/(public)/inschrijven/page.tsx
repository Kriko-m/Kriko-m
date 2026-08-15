import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getSettings, getSiteContent } from '@/lib/db'
import EditableBlock from '@/components/editing/EditableBlock'
import InschrijvenClient from './InschrijvenClient'

export const metadata: Metadata = {
  title: 'Inschrijven | Scouts Kriko-M',
  description: 'Schrijf je nu elektronisch in bij Scouts Kriko-M. Overzichtelijk stappenplan voor nieuwe en bestaande leden via de Groepsadministratie van Scouts en Gidsen Vlaanderen, steekkaart en lidgeld.',
}

export default async function InschrijvenPage() {
  const [settings, siteContent] = await Promise.all([
    getSettings(),
    getSiteContent(),
  ])

  const email = settings?.contact_email ?? 'groepsleiding@kriko-m.be'
  const year = settings?.scouts_year ?? '2026-2027'

  const heroBlock = siteContent['inschrijven.hero'] || {}
  const heroTitle = heroBlock.title || 'SCHRIJF JE NU IN'
  const heroContent = heroBlock.content || 'Welkom bij de Kriko-m familie! Om de natuur een beetje te sparen en de papierberg te verminderen, kan je je elektronisch inschrijven.'

  return (
    <>
      {/* Hero Banner */}
      <section className="tak-hero primair hero-inschrijven">
        <div className="container">
          <div className="hero-content-wrapper" style={{ maxWidth: 840 }}>
            <Suspense fallback={null}>
              <EditableBlock
                blockKey="inschrijven.hero"
                page="inschrijven"
                section="hero"
                initialTitle={heroTitle}
                initialContent={heroContent}
              >
                <h1 className="tak-hero-title" style={{ marginTop: 0, textTransform: 'uppercase' }}>
                  {heroTitle}
                </h1>
                <p style={{ color: 'var(--color-accent-light)', fontSize: '1.2rem', marginTop: 12, lineHeight: 1.6 }}>
                  {heroContent}
                </p>
              </EditableBlock>
            </Suspense>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="section container section--no-top">
        <InschrijvenClient email={email} year={year} siteContent={siteContent} />
      </section>
    </>
  )
}
