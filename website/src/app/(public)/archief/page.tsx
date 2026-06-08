import type { Metadata } from 'next'
import { getEchos } from '@/lib/db'
import { Echo } from '@/lib/types'

export const metadata: Metadata = { title: "Archief | Scouts Kriko-M" }

const MONTHS_NL = ['', 'januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']

export default async function ArchiefPage() {
  const echos = (await getEchos()) as Echo[]

  const items = echos.map(e => ({
    type: 'echo',
    label: 'Kriko Echo',
    title: e.title || `${e.tak.charAt(0).toUpperCase() + e.tak.slice(1)} Echo ${e.month}/${e.year}`,
    dateStr: `${e.year}-${String(e.month).padStart(2, '0')}-01`,
    year: e.year,
    month: e.month,
    link: `/api/echos/download/${e.file_name}`,
    icon: '📰',
  }))

  // Groepeer per jaar
  const grouped: Record<number, typeof items> = {}
  items.forEach(item => {
    grouped[item.year] = grouped[item.year] || []
    grouped[item.year].push(item)
  })

  const years = Object.keys(grouped).map(Number).sort((a, b) => b - a)

  return (
    <>
      <section className="tak-hero primair hero-archief">
        <div className="container">
          <span className="hero-eyebrow">Scouts Kriko-M</span>
          <h1 className="tak-hero-title">Archief</h1>
          <p style={{ color: 'rgba(255,255,255,.85)', marginTop: 8, fontSize: '1.1rem' }}>
            Alle Kriko Echo&apos;s op chronologische volgorde.
          </p>
        </div>
      </section>

      <section className="section container">
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>📦</div>
            <p>Het archief is nog leeg. Kom binnenkort terug!</p>
          </div>
        ) : (
          years.map(year => (
            <div key={year} className="archief-year" style={{ marginBottom: 40 }}>
              <div className="archief-year-title" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary-dark)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                🗓️ {year}
                <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--color-text-muted)' }}>
                  {grouped[year].length} {grouped[year].length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <div className="archief-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {grouped[year].map((item, idx) => (
                  <a
                    key={idx}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="archief-card"
                    style={{
                      background: 'var(--color-bg-white)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--border-radius-md)',
                      padding: 20,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      textDecoration: 'none',
                      color: 'inherit',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                  >
                    <div className="archief-card-type" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {item.label}
                    </div>
                    <div className="archief-card-title" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-primary-dark)', margin: '4px 0' }}>
                      {item.icon} {item.title}
                    </div>
                    <div className="archief-card-date" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: 'auto' }}>
                      {MONTHS_NL[item.month]} {item.year}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </>
  )
}
