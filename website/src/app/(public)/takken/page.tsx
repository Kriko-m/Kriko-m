import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Onze Takken | Scouts Kriko-M' }

const TAKKEN = [
  { slug: 'kapoenen',   name: 'Kapoenen',   age: '6 – 8 jaar' },
  { slug: 'welpen',     name: 'Welpen',     age: '8 – 11 jaar' },
  { slug: 'jonggivers', name: 'Jonggivers', age: '11 – 14 jaar' },
  { slug: 'givers',     name: 'Givers',     age: '14 – 17 jaar' },
]

export default function TakkenOverzicht() {
  return (
    <>
      <section className="tak-hero primair hero-takken">
        <div className="container">
          <span className="hero-eyebrow">Scouts Kriko-M</span>
          <h1 className="tak-hero-title">Onze Takken</h1>
        </div>
      </section>

      <section className="vic-takken-section vic-takken-section--full">
        <div className="vic-takken-grid">
          {TAKKEN.map(({ slug, name, age }) => (
            <Link
              key={slug}
              href={`/takken/${slug}`}
              className={`vic-tak-card tak-${slug}`}
              style={{ backgroundImage: `url(/images/tak_${slug}.jpg)` }}
            >
              <span className="vic-tak-name">{name}</span>
              <span className="vic-tak-age">{age}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
