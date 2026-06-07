import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Verkoopsvoorwaarden | Scouts Kriko-M' }

export default function VoorwaardenPage() {
  return (
    <>
      <section className="tak-hero primair">
        <div className="container">
          <h1 className="tak-hero-title">Verkoopsvoorwaarden</h1>
        </div>
      </section>
      <section className="section container">
        <div style={{ maxWidth: 800, background: 'var(--color-bg-white)', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-md)', padding: '40px 48px', border: '1px solid var(--color-border)' }}>
          <h2 style={{ marginBottom: 16 }}>Algemene Verkoopsvoorwaarden</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>Laatste update: juni 2026</p>
          {[
            { title: '1. Betalingswijze', text: 'Alle bestellingen worden betaald via Belgische gestructureerde overschrijving. Na je bestelling ontvang je een bevestiging per e-mail met het rekeningnummer en de mededeling. Je bestelling wordt verwerkt na ontvangst van de betaling.' },
            { title: '2. Levering', text: 'Bestellingen worden afgehaald op de scoutsvergadering of na afspraak aan de scoutslokalen. Verzending is niet van toepassing.' },
            { title: '3. Herroepingsrecht', text: 'Gezien de aard van onze producten (groepsspecifiek kledij) is herroeping enkel mogelijk voor niet-gepersonaliseerde artikelen en mits voorafgaand overleg.' },
            { title: '4. Stockbeheer', text: 'Bij uitverkoop nemen wij contact met je op. Je betaling wordt dan teruggestort of omgezet naar een alternatief product.' },
            { title: '5. Contactgegevens', text: 'Scouts Kriko-M vzw — groepsleiding@kriko-m.be — Industriepark-Noord 33, 9100 Sint-Niklaas.' },
          ].map(({ title, text }) => (
            <div key={title} style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: 8 }}>{title}</h3>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7 }}>{text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
