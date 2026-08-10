import type { Metadata } from 'next'
import Link from 'next/link'
import { getSettings } from '@/lib/db'
import CopyButton from '@/components/CopyButton'

export const metadata: Metadata = { title: 'Algemene Info | Scouts Kriko-M' }

export default async function InfoPage() {
  const settings = await getSettings()
  const email = settings?.contact_email ?? 'groepsleiding@kriko-m.be'
  const address = settings?.contact_address ?? 'Industriepark-Noord 33, 9100 Sint-Niklaas'

  return (
    <>
      <section className="tak-hero primair hero-info">
        <div className="container">
          <h1 className="tak-hero-title">Algemene Info</h1>
        </div>
      </section>

      <section className="section container section--no-top">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 40, alignItems: 'start' }}>
          
          {/* Main content column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>

            {/* 1. Uniform & Kledij */}
            <div className="info-card-block" style={{ backgroundColor: 'var(--color-bg-white)', borderRadius: 'var(--border-radius-lg)', padding: 36, border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--color-primary-dark)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <i className="fa-solid fa-shirt" style={{ color: 'var(--color-secondary)' }}></i> Uniform &amp; Kledij
              </h2>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--color-text-dark)', marginBottom: 20 }}>
                Bij Scouts Kriko-M dragen we met trots ons scoutsuniform. Het uniform zorgt voor samenhorigheid, gelijkheid en mag vuil worden tijdens het spelen!
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ backgroundColor: 'var(--color-bg-linen)', padding: 20, borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-border)' }}>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary-dark)', marginBottom: 8 }}>
                    <i className="fa-solid fa-store" style={{ marginRight: 8, color: 'var(--color-primary)' }}></i> Onze Webshop
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: 14 }}>
                    De officiële <strong>Kriko-M groepsdas</strong> (rood-geel) en het <strong>Kriko-M T-shirt</strong> koop je rechtstreeks op onze site.
                  </p>
                  <Link href="/shop" className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
                    Naar de webshop &raquo;
                  </Link>
                </div>

                <div style={{ backgroundColor: 'var(--color-bg-linen)', padding: 20, borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-border)' }}>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary-dark)', marginBottom: 8 }}>
                    <i className="fa-solid fa-shop" style={{ marginRight: 8, color: 'var(--color-primary)' }}></i> Hopper Scoutswinkel
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: 14 }}>
                    Het beige scoutshemd, groene broek/rok en officiële kentekens koop je bij de Hopper winkels of online.
                  </p>
                  <a href="https://www.hopper.be" target="_blank" rel="noopener" className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
                    Bezoek Hopper &raquo;
                  </a>
                </div>
              </div>
            </div>

            {/* 2. Fonds op Maat / Verminderd Lidgeld */}
            <div className="info-card-block" style={{ backgroundColor: 'var(--color-bg-white)', borderRadius: 'var(--border-radius-lg)', padding: 36, border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--color-primary-dark)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <i className="fa-solid fa-hand-holding-heart" style={{ color: 'var(--color-secondary)' }}></i> Scouting voor Iedereen (Fonds op Maat)
              </h2>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--color-text-dark)', marginBottom: 16 }}>
                Financiële drempels mogen nooit een reden zijn om niet naar de scouts te komen. Scouts &amp; Gidsen Vlaanderen en Kriko-M bieden ondersteuning voor elk gezin:
              </p>
              
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                <li style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <i className="fa-solid fa-check-circle" style={{ color: 'var(--color-secondary)', marginTop: 4 }}></i>
                  <div>
                    <strong>Verminderd lidgeld (€11,60):</strong> Voor gesubsidieerde gezinnen of gezinnen in financieel moeilijke situaties kan het jaarlijkse lidgeld verlaagd worden.
                  </div>
                </li>
                <li style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <i className="fa-solid fa-check-circle" style={{ color: 'var(--color-secondary)', marginTop: 4 }}></i>
                  <div>
                    <strong>Fonds op Maat (kampen &amp; uniform):</strong> Een bijdrage voor het kampgeld of de aankoop van een scoutshemd is steeds mogelijk via ons steunfonds.
                  </div>
                </li>
                <li style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <i className="fa-solid fa-shield-halved" style={{ color: 'var(--color-primary)', marginTop: 4 }}></i>
                  <div>
                    <strong>100% Discreet:</strong> Aanvragen worden in alle discretie behandeld door de groepsleiding.
                  </div>
                </li>
              </ul>

              <div style={{ backgroundColor: 'rgba(101,11,25,0.06)', borderRadius: 'var(--border-radius-md)', padding: 18, borderLeft: '4px solid var(--color-primary)' }}>
                <p style={{ fontSize: '0.92rem', color: 'var(--color-primary-dark)', margin: 0 }}>
                  Aarzel niet om contact op te nemen met de groepsleiding via <CopyButton text={email}>{email}</CopyButton>. We helpen met plezier!
                </p>
              </div>
            </div>

            {/* 3. Veelgestelde Vragen */}
            <div className="info-card-block" style={{ backgroundColor: 'var(--color-bg-white)', borderRadius: 'var(--border-radius-lg)', padding: 36, border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--color-primary-dark)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                <i className="fa-solid fa-circle-question" style={{ color: 'var(--color-secondary)' }}></i> Veelgestelde Vragen
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {[
                  {
                    q: 'Wanneer vallen de vergaderingen?',
                    a: 'Elke zondagochtend van 9:45 tot 12:30 aan ons lokaal op het VP-plein in Sint-Niklaas.'
                  },
                  {
                    q: 'Mag mijn kind eerst eens komen proberen?',
                    a: 'Absoluut! Nieuwe leden mogen 3 keer gratis proberen voor ze definitief inschrijven.'
                  },
                  {
                    q: 'Wat moet mijn kind meebrengen naar de vergadering?',
                    a: 'Kledij die vuil mag worden, stevige schoenen (of laarzen bij regen) en speelkleren die passen bij het weer.'
                  },
                  {
                    q: 'Waar vind ik het maandprogramma?',
                    a: 'In de Kriko Echo (het maandelijkse programmaboekje)! Download de nieuwste editie op de Kriko Echo pagina.'
                  }
                ].map(({ q, a }, idx) => (
                  <div key={idx} style={{ borderBottom: idx < 3 ? '1px solid var(--color-bg-linen)' : 'none', paddingBottom: idx < 3 ? 16 : 0 }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary-dark)', marginBottom: 6 }}>
                      <i className="fa-solid fa-angle-right" style={{ color: 'var(--color-secondary)', marginRight: 8 }}></i> {q}
                    </h3>
                    <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', margin: 0, paddingLeft: 22 }}>
                      {a}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ backgroundColor: 'var(--color-primary)', color: '#fff', padding: 28, borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-md)' }}>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--color-accent-light)', marginBottom: 12 }}>
                Snel naar inschrijven
              </h3>
              <p style={{ fontSize: '0.9rem', opacity: 0.9, lineHeight: 1.5, marginBottom: 20 }}>
                Klaar om lid te worden van Kriko-M? Lees de stappen en schrijf je in via de Groepsadministratie van Scouts &amp; Gidsen Vlaanderen.
              </p>
              <Link href="/inschrijven" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                Inschrijven &raquo;
              </Link>
            </div>

            <div style={{ backgroundColor: 'var(--color-bg-white)', padding: 28, borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary-dark)', marginBottom: 12 }}>
                Contact &amp; Adres
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: 16 }}>
                <strong>Lokaal:</strong><br />
                {address}
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.5, margin: 0 }}>
                <strong>Vragen voor de leiding?</strong><br />
                <CopyButton text={email}>{email}</CopyButton>
              </p>
            </div>
          </div>

        </div>
      </section>
    </>
  )
}
