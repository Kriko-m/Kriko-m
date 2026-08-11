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

            {/* 1. Waarom Kriko-M? */}
            <div className="info-card-block" style={{ backgroundColor: 'var(--color-bg-white)', borderRadius: 'var(--border-radius-lg)', padding: 36, border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--color-primary-dark)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <i className="fa-solid fa-compass" style={{ color: 'var(--color-secondary)' }}></i> Waarom Kriko-M?
              </h2>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--color-text-dark)', marginBottom: 16 }}>
                Wij zijn <strong>Scouts Kriko-M</strong>, een kleine en gezellige scoutsgroep uit Sint-Niklaas. Onze super geëngageerde leidingsploeg staat elk weekend klaar om uw kleine of iets grotere schavuit de tijd van hun leven te bezorgen. Van een zoektocht naar een verloren piratenschat tot een grote kom soep koken, niets is te zot en iedereen is welkom!
              </p>
              
              <div style={{ backgroundColor: 'var(--color-bg-linen)', borderRadius: 'var(--border-radius-md)', padding: 20, border: '1px solid var(--color-border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)', marginBottom: 6 }}>
                    <i className="fa-solid fa-clock" style={{ marginRight: 8, color: 'var(--color-secondary)' }}></i> Wanneer?
                  </h4>
                  <p style={{ fontSize: '0.92rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    Elke zondagochtend van <strong>9:45 tot 12:30</strong> stipt.
                  </p>
                </div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)', marginBottom: 6 }}>
                    <i className="fa-solid fa-location-dot" style={{ marginRight: 8, color: 'var(--color-secondary)' }}></i> Waar?
                  </h4>
                  <p style={{ fontSize: '0.92rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    Op ons VP-plein (Industriepark-Noord 33, naast drankenhandel De Vidts).
                  </p>
                </div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)', marginBottom: 6 }}>
                    <i className="fa-solid fa-campground" style={{ marginRight: 8, color: 'var(--color-secondary)' }}></i> Weekends &amp; Kamp
                  </h4>
                  <p style={{ fontSize: '0.92rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    2x per jaar op weekend (herfst- &amp; paasvakantie). Kamp in het eerste deel van augustus!
                  </p>
                </div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)', marginBottom: 6 }}>
                    <i className="fa-solid fa-user-plus" style={{ marginRight: 8, color: 'var(--color-secondary)' }}></i> Proberen?
                  </h4>
                  <p style={{ fontSize: '0.92rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    Nieuwe leden mogen <strong>3 keer gratis proberen</strong> voor definitieve inschrijving.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Takkenoverzicht */}
            <div className="info-card-block" style={{ backgroundColor: 'var(--color-bg-white)', borderRadius: 'var(--border-radius-lg)', padding: 36, border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--color-primary-dark)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <i className="fa-solid fa-users" style={{ color: 'var(--color-secondary)' }}></i> Takken, wat is dat?
              </h2>
              <p style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--color-text-dark)', marginBottom: 20 }}>
                Bij de scouts speel je niet in één grote groep maar in leeftijdsgroepjes. Dat noemen we takken. We hebben er vier:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { slug: 'kapoenen', name: 'Kapoenen', age: '6 tot 8 jaar (1e & 2e leerjaar)', desc: 'Spel, fantasie & 5 dagen kamp' },
                  { slug: 'welpen', name: 'Welpen', age: '8 tot 11 jaar (3e, 4e & 5e leerjaar)', desc: 'Ravotten, nesten & 7 dagen kamp' },
                  { slug: 'jonggivers', name: 'Jonggivers', age: '11 tot 14 jaar', desc: 'Sjorren, patrouilles & 11 dagen tentenkamp' },
                  { slug: 'givers', name: 'Givers', age: '14 tot 17 jaar', desc: 'Zelfstandigheid & 1x/3j buitenlands kamp' },
                ].map((tak) => (
                  <Link key={tak.slug} href={`/takken/${tak.slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{ backgroundColor: 'var(--color-bg-linen)', padding: 18, borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-border)', height: '100%', transition: 'transform 0.15s ease' }}>
                      <h3 style={{ fontSize: '1.15rem', color: `var(--color-${tak.slug})`, marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {tak.name} <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.8em' }}></i>
                      </h3>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-dark)', marginBottom: 6 }}>{tak.age}</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>{tak.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* 3. Uniform & Webshop (Help Katrien) */}
            <div className="info-card-block" style={{ backgroundColor: 'var(--color-bg-white)', borderRadius: 'var(--border-radius-lg)', padding: 36, border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--color-primary-dark)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <i className="fa-solid fa-shirt" style={{ color: 'var(--color-secondary)' }}></i> Uniform &amp; Aankoop (Onze Webshop)
              </h2>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--color-text-dark)', marginBottom: 20 }}>
                Het uniform toont de verbondenheid van onze scouts. Voor kapoenen en welpen zijn speelkleren die vuil mogen worden ideaal, samen met de officiële <strong>Kriko-M groepsdas</strong>. Vanaf de jonggivers bestaat het uniform uit een das, hemd en groene broek/rok.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ backgroundColor: 'var(--color-bg-linen)', padding: 22, borderRadius: 'var(--border-radius-md)', border: '2px solid var(--color-secondary)' }}>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary-dark)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <i className="fa-solid fa-bag-shopping" style={{ color: 'var(--color-secondary)' }}></i> Onze Webshop
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: 12 }}>
                    Om uniformouder <strong>Katrien Vanhandenhoven</strong> te helpen, kan je de officiële <strong>groepsdas (rood-geel)</strong>, Kriko T-shirts/truien en tweedehands uniformstukken rechtstreeks via onze webshop bestellen!
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-dark)', marginBottom: 14 }}>
                    <i className="fa-solid fa-envelope" style={{ marginRight: 6 }}></i> Contact Katrien: <a href="mailto:kat_vh@hotmail.com">kat_vh@hotmail.com</a><br />
                    <i className="fa-solid fa-phone" style={{ marginRight: 6 }}></i> 0476/89.57.47
                  </p>
                  <Link href="/shop" className="btn btn-secondary" style={{ fontSize: '0.9rem', width: '100%', justifyContent: 'center' }}>
                    <i className="fa-solid fa-cart-shopping" style={{ marginRight: 8 }}></i> Naar onze Webshop &raquo;
                  </Link>
                </div>

                <div style={{ backgroundColor: 'var(--color-bg-linen)', padding: 22, borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-border)' }}>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary-dark)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <i className="fa-solid fa-shop" style={{ color: 'var(--color-primary)' }}></i> Hopper Scoutswinkel
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: 14 }}>
                    Het beige scoutshemd, de groene broek/rok en de kentekens koop je in een officiële Hopper winkel of online.
                  </p>
                  <a href="https://www.hopper.be" target="_blank" rel="noopener" className="btn btn-outline" style={{ fontSize: '0.85rem', width: '100%', justifyContent: 'center', marginTop: 32 }}>
                    Bezoek Hopper.be &raquo;
                  </a>
                </div>
              </div>
            </div>

            {/* 4. Scouting op Maat / Verminderd Lidgeld */}
            <div className="info-card-block" style={{ backgroundColor: 'var(--color-bg-white)', borderRadius: 'var(--border-radius-lg)', padding: 36, border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--color-primary-dark)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <i className="fa-solid fa-hand-holding-heart" style={{ color: 'var(--color-secondary)' }}></i> Scouting op Maat (Financiële Hulp)
              </h2>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--color-text-dark)', marginBottom: 16 }}>
                Een jaar scouting kost €45 (inclusief verzekering en wekelijkse werking). We vinden dat geld nooit een reden mag zijn om thuis te blijven. Daarom bieden wij en Scouts &amp; Gidsen Vlaanderen ondersteuning op maat:
              </p>
              
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                <li style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <i className="fa-solid fa-check-circle" style={{ color: 'var(--color-secondary)', marginTop: 4 }}></i>
                  <div>
                    <strong>Verminderd lidgeld (€10 / €5 na 1 maart):</strong> Voor gezinnen die het financieel moeilijk hebben kan het lidgeld verlaagd worden.
                  </div>
                </li>
                <li style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <i className="fa-solid fa-check-circle" style={{ color: 'var(--color-secondary)', marginTop: 4 }}></i>
                  <div>
                    <strong>Fonds op Maat (kampen &amp; weekends):</strong> Financiële tussenkomst voor het kampgeld of de aankoop van een uniform/materiaal.
                  </div>
                </li>
                <li style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <i className="fa-solid fa-receipt" style={{ color: 'var(--color-secondary)', marginTop: 4 }}></i>
                  <div>
                    <strong>Ziekenfondsen &amp; Fiscaal attest:</strong> De meeste mutualiteiten betalen een deel van het lidgeld/kampgeld terug. Voor kinderen onder 12 jaar kan het kampgeld fiscaal afgetrokken worden.
                  </div>
                </li>
                <li style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <i className="fa-solid fa-shield-halved" style={{ color: 'var(--color-primary)', marginTop: 4 }}></i>
                  <div>
                    <strong>100% Discreet:</strong> Aanvragen worden in alle rust en discretie behandeld door de groepsleiding.
                  </div>
                </li>
              </ul>

              <div style={{ backgroundColor: 'rgba(101,11,25,0.06)', borderRadius: 'var(--border-radius-md)', padding: 18, borderLeft: '4px solid var(--color-primary)' }}>
                <p style={{ fontSize: '0.92rem', color: 'var(--color-primary-dark)', margin: 0 }}>
                  Spreek gerust een (groeps)leid(st)er aan of stuur in alle discretie een mailtje naar <CopyButton text={email}>{email}</CopyButton>.
                </p>
              </div>
            </div>

            {/* 5. Veelgestelde Vragen */}
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

