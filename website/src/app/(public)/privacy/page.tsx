import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Privacyverklaring | Scouts Kriko-M' }

export default function PrivacyPage() {
  const sections = [
    {
      title: '1. Wie zijn wij?',
      text: 'Scouts Kriko-M vzw is gevestigd te Industriepark-Noord 33, 9100 Sint-Niklaas met ondernemingsnummer (KBO) BE0409.040.288. Wij verwerken persoonsgegevens in overeenstemming met de Algemene Verordening Gegevensbescherming (AVG / GDPR).'
    },
    {
      title: '2. Welke gegevens verzamelen wij?',
      text: 'Wij verwerken uitsluitend gegevens die noodzakelijk zijn voor onze scoutswerking en webshop: naam, e-mailadres, telefoonnummer, en naam/tak van je kind bij kamp- of weekendinschrijvingen. Medische en gevoelige persoonsgegevens van leden worden nooit lokaal op onze servers opgeslagen; deze blijven uitsluitend beveiligd beheerd via de officiële Groepsadministratie van Scouts & Gidsen Vlaanderen.'
    },
    {
      title: '3. Waarvoor gebruiken wij je gegevens?',
      text: 'Je gegevens worden uitsluitend gebruikt voor het afhandelen van webshopbestellingen, de organisatie van kampen en weekenden, en het versturen van noodzakelijke communicatie over onze scoutswerking. Wij verkopen, verhuren of delen je persoonsgegevens nooit met commerciële derden.'
    },
    {
      title: '4. Bewaartermijn',
      text: 'Persoonsgegevens worden niet langer bewaard dan noodzakelijk voor het doel waarvoor ze zijn verzameld (zoals het afhandelen van de bestelling of het lopende werkjaar) of om te voldoen aan wettelijke en administratieve verplichtingen van de vzw.'
    },
    {
      title: '5. Cookies & Functionele Opslag',
      text: 'Onze website maakt uitsluitend gebruik van functionele cookies en lokale opslag (zoals het bewaren van artikelen in je winkelmandje). Wij gebruiken geen tracking-, marketing- of analytische cookies van derden.'
    },
    {
      title: '6. Externe platformen',
      text: 'Reserveringen en verhuuraanvragen van ons scoutslokaal verlopen via het externe platform Kampas (Kampas.be). Bij het boeken gelden de privacyvoorwaarden van Kampas.'
    },
    {
      title: '7. Jouw rechten',
      text: 'Je hebt recht op inzage, correctie, beperking of verwijdering van je persoonsgegevens. Ook kan je bezwaar maken tegen de verwerking. Neem hiervoor contact met ons op via groepsleiding@kriko-m.be.'
    }
  ]

  return (
    <>
      <section className="tak-hero primair">
        <div className="container">
          <h1 className="tak-hero-title">Privacyverklaring</h1>
        </div>
      </section>
      <section className="section container">
        <div
          style={{
            maxWidth: 800,
            margin: '0 auto',
            background: 'var(--color-bg-white)',
            borderRadius: 'var(--border-radius-lg)',
            boxShadow: 'var(--shadow-md)',
            padding: '40px 48px',
            border: '1px solid var(--color-border)'
          }}
        >
          <h2 style={{ marginBottom: 8 }}>Privacyverklaring Scouts Kriko-M vzw</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 24, fontSize: '0.95rem' }}>
            Laatste update: augustus 2026 &middot; KBO: BE0409.040.288
          </p>

          {sections.map(({ title, text }) => (
            <div key={title} style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: 8, color: 'var(--color-primary)' }}>{title}</h3>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7 }}>{text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

