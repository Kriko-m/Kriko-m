import type { Metadata } from 'next'
import Link from 'next/link'
import { getSettings } from '@/lib/db'
import CopyButton from '@/components/CopyButton'

export const metadata: Metadata = {
  title: 'Inschrijven | Scouts Kriko-M',
  description: 'Schrijf je nu in bij Scouts Kriko-M. Informatie voor nieuwe en bestaande leden, de groepsadministratie, steekkaart en lidgeld.',
}

export default async function InschrijvenPage() {
  const settings = await getSettings()
  const fee1 = settings?.reg_fee_first ?? 50
  const fee2 = settings?.reg_fee_extra ?? 45
  const year = settings?.scouts_year ?? '2026-2027'
  const email = settings?.contact_email ?? 'groepsleiding@kriko-m.be'

  return (
    <>
      {/* Hero Banner */}
      <section className="tak-hero primair hero-inschrijven">
        <div className="container">
          <div className="hero-content-wrapper" style={{ maxWidth: 800 }}>
            <span
              style={{
                textTransform: 'uppercase',
                letterSpacing: '2px',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: 'var(--color-accent-light)',
                display: 'block',
                marginBottom: '8px',
              }}
            >
              SCHRIJF JE NU IN
            </span>
            <h1 className="tak-hero-title" style={{ marginTop: 0 }}>
              Inschrijven bij Kriko-M
            </h1>
            <p
              style={{
                fontSize: '1.15rem',
                lineHeight: '1.6',
                color: 'rgba(255, 255, 255, 0.95)',
                marginTop: '12px',
              }}
            >
              <strong>Welkom bij de Kriko-M familie!</strong> Om de natuur een beetje te sparen en de papierberg te verminderen, kan je je elektronisch inschrijven.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content & Sidebar Layout */}
      <section className="section container section--no-top">
        <div className="register-layout">
          
          {/* Main Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

            {/* Proefproberen highlight card */}
            <div
              style={{
                backgroundColor: 'rgba(101, 11, 25, 0.04)',
                border: '1px solid rgba(101, 11, 25, 0.15)',
                borderLeft: '5px solid var(--color-primary)',
                borderRadius: 'var(--border-radius-md)',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  flexShrink: 0,
                }}
              >
                <i className="fa-solid fa-star"></i>
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-primary-dark)' }}>
                  Eerst 3 keer gratis proberen?
                </h4>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.95rem', color: 'var(--color-text-dark)', lineHeight: 1.5 }}>
                  Nieuwe leden zijn altijd welkom om eerst <strong>3 keer gratis te proberen</strong>! Kom gerust eens langs op zondagochtend om <strong>9:45 stipt</strong> bij ons lokaal op het VP-plein (Industriepark-Noord 33).
                </p>
              </div>
            </div>

            {/* Block 1: Nieuw lid bij Kriko-M */}
            <div className="step-card" style={{ flexDirection: 'column', gap: 16, padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="step-number" style={{ width: 40, height: 40, fontSize: '1.1rem' }}>
                  1
                </div>
                <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--color-primary-dark)' }}>
                  Nieuw lid bij Kriko-m
                </h3>
              </div>
              
              <p style={{ color: 'var(--color-text-dark)', lineHeight: 1.6, margin: 0, fontSize: '0.98rem' }}>
                Als je een nieuw lid bent, vul je de inschrijvingsfiche via de knop hieronder in. Daarna zal je na overschrijving van het lidgeld via mail je lidnummer ontvangen. Hiermee kan je ook een persoonlijk account maken op de{' '}
                <a
                  href="https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/client/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline' }}
                >
                  groepsadministratie
                </a>
                . De groepsadministratie is het platform waar je de persoonlijke steekkaart van je kind invult. Verdere uitleg vind je bij ‘Aanmelden en invullen van de steekkaart op groepsadministratie’ hieronder.
              </p>

              <div style={{ marginTop: 4 }}>
                <a
                  href="https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/client/formulier.html#/lidworden?groep=O3108G"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 22px',
                    fontWeight: 700,
                  }}
                >
                  <i className="fa-solid fa-user-plus"></i> Inschrijvingsformulier invullen (Nieuw Lid) &raquo;
                </a>
              </div>
            </div>

            {/* Block 2: Reeds lid bij Kriko-M */}
            <div className="step-card" style={{ flexDirection: 'column', gap: 16, padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="step-number" style={{ width: 40, height: 40, fontSize: '1.1rem', backgroundColor: 'var(--color-primary-dark)' }}>
                  2
                </div>
                <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--color-primary-dark)' }}>
                  Reeds lid bij Kriko-m
                </h3>
              </div>

              <p style={{ color: 'var(--color-text-dark)', lineHeight: 1.6, margin: 0, fontSize: '0.98rem' }}>
                Ben je al lid bij Kriko-m, meld je dan aan op de{' '}
                <a
                  href="https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/client/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline' }}
                >
                  groepsadministratie
                </a>{' '}
                en betaal vervolgens je lidgeld.
              </p>

              <div
                style={{
                  backgroundColor: 'var(--color-bg-linen)',
                  borderLeft: '4px solid var(--color-secondary)',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '16px 20px',
                  fontSize: '0.92rem',
                  color: 'var(--color-text-dark)',
                  lineHeight: 1.55,
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="fa-solid fa-circle-info" style={{ color: 'var(--color-secondary)' }}></i>
                  Eerste keer inloggen op deze website / Groepsadmin?
                </div>
                Indien het de eerste keer is dat u inlogt op deze website moet je je kind eerst registreren. Voor elk kind maak je apart een login aan, het is immers de bedoeling dat ze hun gegevens zelf beheren als ze oud genoeg zijn. Hiervoor heb je het persoonlijk lidnummer van je kind nodig. Deze worden in september doorgemaild door de groepsleiding of vind je op de lidkaart van je kind.
              </div>

              <div style={{ marginTop: 4 }}>
                <a
                  href="https://groepsadmin.scoutsengidsenvlaanderen.be/groepsadmin/client/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 22px',
                    fontWeight: 700,
                  }}
                >
                  <i className="fa-solid fa-right-to-bracket"></i> Aanmelden op Groepsadministratie &raquo;
                </a>
              </div>
            </div>

            {/* Block 3: Aanmelden en invullen van de steekkaart */}
            <div className="step-card" style={{ flexDirection: 'column', gap: 16, padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="step-number" style={{ width: 40, height: 40, fontSize: '1.1rem', backgroundColor: 'var(--color-accent)' }}>
                  3
                </div>
                <h3 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--color-primary-dark)' }}>
                  Aanmelden en invullen van de steekkaart op groepsadministratie
                </h3>
              </div>

              <p style={{ color: 'var(--color-text-dark)', lineHeight: 1.6, margin: 0, fontSize: '0.98rem' }}>
                Met deze individuele steekkaart geven ouders jaarlijks aan de takleiding alle noodzakelijke inlichtingen over hun kind(eren). Deze informatie draagt bij aan een veilige en persoonlijke begeleiding van alle leden en wordt vertrouwelijk behandeld door de leidingsploeg. Wanneer er wijzigingen zijn in deze gegevens is het belangrijk om deze ten allen tijde aan te passen in de groepsadministratie (via je persoonlijk account).
              </p>

              <div
                style={{
                  backgroundColor: 'var(--color-bg-white)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--border-radius-md)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <i className="fa-solid fa-file-pdf" style={{ fontSize: '1.5rem', color: '#d9381e' }}></i>
                  <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-primary-dark)' }}>
                    Handleiding &amp; Stappenplan Steekkaart
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                  Hieronder vind je een stappenplan voor het aanmelden op de groepsadministratie en het invullen van de steekkaart.
                </p>
                <div>
                  <a
                    href="https://www.scoutsengidsenvlaanderen.be/files/paginas/2015.09.21_handleiding_ouders_steekkaart.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: '0.9rem',
                      padding: '8px 18px',
                    }}
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square"></i> Bekijk Stappenplan (PDF)
                  </a>
                </div>
              </div>
            </div>

            {/* Block 4: Lidgeld Details & Scouting op Maat */}
            <div className="step-card" style={{ flexDirection: 'column', gap: 16, padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="step-number" style={{ width: 40, height: 40, fontSize: '1.1rem', backgroundColor: 'var(--color-primary)' }}>
                  4
                </div>
                <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--color-primary-dark)' }}>
                  Lidgeld
                </h3>
              </div>

              <p style={{ color: 'var(--color-text-dark)', lineHeight: 1.6, margin: 0, fontSize: '0.98rem' }}>
                Het inschrijvingsgeld bedraagt <strong>50 euro</strong>. Dit geld gaat naar de verzekering (38 euro) en andere kosten (12 euro) zoals spelmateriaal en drukkosten. Gelieve dit bedrag te storten op het rekeningnummer <code>BE59 7360 6413 2626</code> met vermelding van naam en tak.
              </p>

              {/* Bank Transfer Box */}
              <div
                style={{
                  backgroundColor: 'var(--color-bg-linen)',
                  borderRadius: 'var(--border-radius-md)',
                  padding: '18px 20px',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.95rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <strong>Rekeningnummer:</strong> <code style={{ fontSize: '1.05rem', fontWeight: 700 }}>BE59 7360 6413 2626</code>
                  </div>
                  <CopyButton text="BE59736064132626" className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>
                    <i className="fas fa-copy"></i> Kopiëer IBAN
                  </CopyButton>
                </div>
                <div>
                  <strong>Begunstigde:</strong> Scouts Kriko-M
                </div>
                <div>
                  <strong>Mededeling:</strong> <code>Lidgeld [Naam Kind] + [Tak]</code>
                </div>
              </div>

              {/* Scouting op maat */}
              <div
                style={{
                  backgroundColor: 'rgba(235, 178, 55, 0.12)',
                  borderLeft: '4px solid var(--color-accent-light)',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '16px 20px',
                  marginTop: 8,
                }}
              >
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="fa-solid fa-hand-holding-heart" style={{ color: 'var(--color-primary)' }}></i>
                  Scouting op Maat
                </h4>
                <p style={{ margin: '0 0 12px 0', fontSize: '0.92rem', color: 'var(--color-text-dark)', lineHeight: 1.55 }}>
                  We weten dat de prijs van een jaar scouting voor uw kind(eren) een belangrijke hap uit uw gezinsbudget kan zijn. Maar we vinden ook dat dit voor niemand een reden mag zijn om thuis te blijven. Meer informatie rond scouting op maat vind je op onze infopagina.
                </p>
                <Link
                  href="/info?tab=op-maat"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <i className="fa-solid fa-arrow-right"></i> Bekijk Scouting op Maat op Infopagina &raquo;
                </Link>
              </div>

            </div>

          </div>

          {/* Right Sidebar */}
          <div>
            <div
              className="side-card"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-bg-white)',
                border: 'none',
                position: 'sticky',
                top: 100,
              }}
            >
              <h3 style={{ color: 'var(--color-accent-light)', borderBottom: '1px dashed rgba(255,255,255,0.2)', paddingBottom: 12, marginTop: 0 }}>
                Jaarlijks Lidgeld ({year})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, margin: '20px 0' }}>
                {[
                  { label: '1e Kind', sub: 'Eerste gezinslid', price: fee1 },
                  { label: 'Extra Kind', sub: 'Zelfde gezin', price: fee2 },
                ].map(({ label, sub, price }) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderRadius: 'var(--border-radius-md)',
                      padding: 14,
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.95rem' }}>{label}:</strong>
                      <span style={{ fontSize: '0.8rem', opacity: 0.75 }}>{sub}</span>
                    </div>
                    <span
                      style={{
                        fontSize: '1.6rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-outfit), sans-serif',
                        color: 'var(--color-accent-light)',
                      }}
                    >
                      €{price}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ margin: 0 }}>
                  <strong>Verdeling van het lidgeld (€50):</strong>
                </p>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  <li><strong>€38:</strong> Verzekering Scouts &amp; Gidsen Vlaanderen</li>
                  <li><strong>€12:</strong> Lokale werking (spelmateriaal, drukkosten, etc.)</li>
                </ul>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.15)', margin: '20px 0' }} />

              <div>
                <h4 style={{ color: '#fff', margin: '0 0 8px 0', fontSize: '0.95rem' }}>Vragen over inschrijven?</h4>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', marginBottom: 14 }}>
                  De groepsleiding helpt je graag verder!
                </p>
                <CopyButton
                  text={email}
                  className="btn btn-secondary"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: '0.85rem' }}
                >
                  <i className="fas fa-envelope"></i> {email}
                </CopyButton>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  )
}

