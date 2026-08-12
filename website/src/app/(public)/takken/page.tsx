import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Onze Takken | Scouts Kriko-M' }

const TAKKEN = [
  { slug: 'kapoenen',   name: 'Kapoenen' },
  { slug: 'welpen',     name: 'Welpen' },
  { slug: 'jonggivers', name: 'Jonggivers' },
  { slug: 'givers',     name: 'Givers' },
]

export default function TakkenOverzicht() {
  return (
    <>
      <section className="tak-hero primair hero-takken">
        <div className="container">
          <h1 className="tak-hero-title">Onze Takken</h1>
        </div>
      </section>

      <section className="vic-takken-section vic-takken-section--full">
        <div className="vic-takken-grid">
          {TAKKEN.map(({ slug, name }) => (
            <Link
              key={slug}
              href={`/takken/${slug}`}
              className={`vic-tak-card tak-${slug}`}
              style={{ backgroundImage: `url(/images/tak_${slug}.jpg)` }}
            >
              <span className="vic-tak-name">{name}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
