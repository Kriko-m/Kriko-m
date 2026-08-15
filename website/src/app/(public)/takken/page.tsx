import { Suspense } from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getSiteContent } from '@/lib/db'
import EditableBlock from '@/components/editing/EditableBlock'

export const metadata: Metadata = { title: 'Onze Takken | Scouts Kriko-M' }

const TAKKEN = [
  { slug: 'kapoenen',   name: 'Kapoenen' },
  { slug: 'welpen',     name: 'Welpen' },
  { slug: 'jonggivers', name: 'Jonggivers' },
  { slug: 'givers',     name: 'Givers' },
]

export default async function TakkenOverzicht() {
  const siteContent = await getSiteContent()
  const heroBlock = siteContent['takken.hero'] || {}
  const heroTitle = heroBlock.title || 'Onze Takken'
  const heroContent = heroBlock.content || 'Bij Scouts Kriko-M worden onze leden verdeeld volgens leeftijd in vier takken.'

  return (
    <>
      <section className="tak-hero primair hero-takken">
        <div className="container">
          <Suspense fallback={null}>
            <EditableBlock
              blockKey="takken.hero"
              page="takken"
              section="hero"
              initialTitle={heroTitle}
              initialContent={heroContent}
            >
              <h1 className="tak-hero-title">{heroTitle}</h1>
              <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '1.1rem', marginTop: 10 }}>{heroContent}</p>
            </EditableBlock>
          </Suspense>
        </div>
      </section>

      <section className="vic-takken-section vic-takken-section--full">
        <div className="vic-takken-grid">
          {TAKKEN.map(({ slug, name }) => {
            const blockKey = `takken.${slug}.card`
            const cardBlock = siteContent[blockKey] || {}
            const cardTitle = cardBlock.title || name
            const imgUrl = cardBlock.image_url || `/images/tak_${slug}.jpg`

            return (
              <Suspense key={slug} fallback={null}>
                <EditableBlock
                  blockKey={blockKey}
                  page="takken"
                  section="card"
                  initialTitle={cardTitle}
                  initialImageUrl={imgUrl}
                  style={{ display: 'flex', height: '100%' }}
                >
                  <Link
                    href={`/takken/${slug}`}
                    className={`vic-tak-card tak-${slug}`}
                    style={{ backgroundImage: `url(${imgUrl})`, width: '100%' }}
                  >
                    <span className="vic-tak-name">{cardTitle}</span>
                  </Link>
                </EditableBlock>
              </Suspense>
            )
          })}
        </div>
      </section>
    </>
  )
}

