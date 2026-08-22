import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '404 — Pagina niet gevonden' }

export default function NotFound() {
  return (
    <>
      <section className="tak-hero primair" style={{ minHeight: 340, display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="hero-eyebrow">Scouts Kriko-M</span>
          <h1 className="tak-hero-title" style={{ fontSize: 'clamp(3.5rem, 12vw, 8rem)', lineHeight: 1 }}>404</h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', marginTop: 8 }}>
            Deze pagina is op verkenning gegaan en niet teruggekomen.
          </p>
        </div>
      </section>

      <section className="section container" style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
        <div style={{ fontSize: '4rem', marginBottom: 16 }}>🧭</div>
        <h2 style={{ marginBottom: 12 }}>Verkeerd spoor gevolgd?</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 32, lineHeight: 1.7 }}>
          De pagina die je zoekt bestaat niet (meer), of het pad klopt niet.
          Gebruik de kaart hieronder om de weg terug te vinden.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn btn-primary">
            Terug naar home
          </Link>
          <Link href="/kalender" className="btn btn-outline">
            Kalender
          </Link>
          <Link href="/takken" className="btn btn-outline">
            Onze takken
          </Link>
        </div>
      </section>
    </>
  )
}
