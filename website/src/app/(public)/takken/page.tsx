import Link from 'next/link'
import type { Metadata } from 'next'
import { getSiteContent } from '@/lib/db'
import EditableText from '@/components/editing/EditableText'

export const metadata: Metadata = { title: 'Onze Takken' }

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

  return (
    <>
      <section className="tak-hero primair hero-takken">
        <div className="container">
          <EditableText
            blockKey="takken.hero"
            page="takken"
            section="hero"
            field="title"
            defaultValue={heroTitle}
            as="h1"
            className="tak-hero-title"
          />
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
              <Link
                key={slug}
                href={`/takken/${slug}`}
                className={`vic-tak-card tak-${slug}`}
                style={{ backgroundImage: `url(${imgUrl})`, width: '100%' }}
              >
                <EditableText
                  blockKey={blockKey}
                  page="takken"
                  section="card"
                  field="title"
                  defaultValue={cardTitle}
                  as="span"
                  className="vic-tak-name"
                />
              </Link>
            )
          })}
        </div>
      </section>
    </>
  )
}
