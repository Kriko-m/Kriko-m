import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Verkoopsvoorwaarden | Scouts Kriko-M' }

export default function VoorwaardenPage() {
  const sections = [
    {
      title: '1. Identiteit van de verkoper',
      text: 'Scouts Kriko-M vzw, gevestigd te Industriepark-Noord 33, 9100 Sint-Niklaas. Ondernemingsnummer (KBO): BE0409.040.288 (niet btw-plichtig). Contact via e-mail: groepsleiding@kriko-m.be.'
    },
    {
      title: '2. Toepasselijkheid',
      text: 'Deze algemene verkoopsvoorwaarden zijn van toepassing op alle bestellingen geplaatst via de online webshop van Scouts Kriko-M vzw.'
    },
    {
      title: '3. Prijzen en Betalingswijze',
      text: 'Alle vermelde prijzen zijn in Euro (€) en vrijgesteld van btw conform het stelsel voor kleine ondernemingen/vzw. Betaling geschiedt via Belgische gestructureerde overschrijving. Na het plaatsen van je bestelling ontvang je een bevestigingsmail met het exacte te betalen bedrag, het rekeningnummer van de vzw en de unieke gestructureerde mededeling. Betalingen dienen binnen 14 kalenderdagen te worden overgemaakt.'
    },
    {
      title: '4. Levering & Afhaling',
      text: 'Bestelde artikelen worden niet per post verzonden. Het afhalen van bestellingen wordt rechtstreeks afgesproken met onze uniformverantwoordelijke (tijdens de wekelijkse scoutsvergaderingen of na afspraak aan de scoutslokalen). Zodra je betaling is ontvangen en verwerkt, ontvang je hierover verdere berichtgeving.'
    },
    {
      title: '5. Herroepingsrecht & Retournering',
      text: 'Voor niet-gepersonaliseerde en ongebruikte artikelen in originele staat heb je het recht om de aankoop binnen 14 kalenderdagen na afhaling te herroepen zonder opgave van reden. Neem voor retournering of omruiling vooraf contact op via groepsleiding@kriko-m.be. Gepersonaliseerde artikelen (indien van toepassing) vallen buiten het herroepingsrecht.'
    },
    {
      title: '6. Voorraad & Annulering',
      text: 'Mocht een besteld artikel onverhoopt uitverkocht of niet leverbaar zijn, dan brengen wij je zo snel mogelijk op de hoogte. Het reeds betaalde bedrag wordt in dat geval volledig teruggestort, of in overleg omgezet naar een alternatief product.'
    },
    {
      title: '7. Klachten & Contact',
      text: 'Heb je vragen, opmerkingen of een klacht over je bestelling? Neem dan gerust contact op met de groepsleiding via groepsleiding@kriko-m.be. We zoeken steeds samen naar een passende oplossing.'
    }
  ]

  return (
    <>
      <section className="tak-hero primair">
        <div className="container">
          <h1 className="tak-hero-title">Verkoopsvoorwaarden</h1>
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
          <h2 style={{ marginBottom: 8 }}>Algemene Verkoopsvoorwaarden</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 24, fontSize: '0.95rem' }}>
            Laatste update: augustus 2026 &middot; Scouts Kriko-M vzw (KBO: BE0409.040.288)
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

