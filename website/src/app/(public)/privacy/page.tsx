import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Privacyverklaring | Scouts Kriko-M' }

export default function PrivacyPage() {
  return (
    <>
      <section className="tak-hero primair">
        <div className="container">
          <h1 className="tak-hero-title">Privacyverklaring</h1>
        </div>
      </section>
      <section className="section container">
        <div style={{ maxWidth: 800, background: 'var(--color-bg-white)', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-md)', padding: '40px 48px', border: '1px solid var(--color-border)' }}>
          <h2 style={{ marginBottom: 16 }}>Privacyverklaring Scouts Kriko-M</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>Laatste update: juni 2026</p>
          {[
            { title: '1. Wie zijn wij?', text: 'Scouts Kriko-M vzw, Industriepark-Noord 33, 9100 Sint-Niklaas. Wij verwerken persoonsgegevens in overeenstemming met de AVG (GDPR).' },
            { title: '2. Welke gegevens verzamelen wij?', text: 'Wij bewaren minimale gegevens: naam, e-mailadres, naam en tak van je kind. Medische en persoonlijke informatie van leden wordt nooit lokaal opgeslagen — dit wordt live opgehaald uit de beveiligde S&G Groepsadmin.' },
            { title: '3. Waarvoor gebruiken wij je gegevens?', text: 'Uitsluitend voor het verwerken van kampinschrijvingen, webshopbestellingen en het versturen van noodzakelijke informatie over onze werking. Wij verkopen of delen je gegevens nooit met derden.' },
            { title: '4. Hoe lang bewaren wij je gegevens?', text: 'Gegevens worden bewaard zolang noodzakelijk voor de afhandeling van je kampdeelname of webshopbestelling, en worden daarna verwijderd. Je kan op elk moment vragen om je gegevens te verwijderen.' },
            { title: '5. Jouw rechten', text: 'Je hebt recht op inzage, correctie en verwijdering van je persoonsgegevens. Contacteer ons via groepsleiding@kriko-m.be.' },
            { title: '6. Cookies', text: 'Wij gebruiken enkel functionele cookies (winkelmandje, voorkeurinstellingen). Er worden geen tracking- of analytische cookies gebruikt.' },
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
