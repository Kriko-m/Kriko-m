import Link from 'next/link'
import Image from 'next/image'
import { getPublicCalendarEvents } from '@/lib/db'
import HeroCTA from '@/components/HeroCTA'
import UpcomingEvent from '@/components/EventDetailModal'
import { CalendarEvent } from '@/lib/types'

export default async function HomePage() {
  const allEvents = (await getPublicCalendarEvents()) as CalendarEvent[]
  // Toon enkel aankomende activiteiten (vanaf vandaag), max. 3.
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const events = allEvents
    .filter((e: CalendarEvent) => (e.datum_tot || e.date) >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3)

  return (
    <>
      {/* 1. Hero */}
      <section className="hero">
        <Image
          src="/images/hero-nieuw.webp"
          alt="Scouts Kriko-M"
          className="hero-img"
          fill
          priority
          style={{ objectFit: 'cover' }}
        />
        <div className="hero-overlay">
          <div className="hero-text">
            <span className="hero-sub">Scouts</span>
            <span className="hero-title">Kriko-M</span>
            <HeroCTA />
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* 2. Welkom & Quick Info Cards */}
      <section className="section container" id="welkom">
        <div className="welcome-grid" style={{ alignItems: 'stretch' }}>
          
          {/* Linker kolom: Welkomsttekst */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ marginBottom: 12 }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: '20px',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-accent)',
                fontSize: '0.82rem',
                fontWeight: 800,
                letterSpacing: '0.8px',
                textTransform: 'uppercase'
              }}>
                ⚜️ Scouts Kriko-M Sint-Niklaas
              </span>
            </div>

            <h2 style={{
              fontSize: '2.4rem',
              marginBottom: 18,
              color: 'var(--color-primary-dark)',
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: '-0.5px'
            }}>
              Welkom bij Kriko-M! ✌️
            </h2>

            <p style={{ marginBottom: 16, fontSize: '1.08rem', color: '#2B2B2B', lineHeight: 1.65 }}>
              Ook dit jaar staat onze enthousiaste leidingsploeg weer elke zondag klaar om alle leden een onvergetelijke namiddag vol avontuur, spel en vriendschap te bezorgen op ons terrein aan het VP-plein.
            </p>

            <p style={{ marginBottom: 16, fontSize: '1.05rem', color: '#2B2B2B', lineHeight: 1.65 }}>
              Van onze jongste kapoenen tot onze oudste givers en leiding: met heel wat eigen talenten en zotveel goesting duiken we samen in het nieuwe scoutingjaar!
            </p>

            <p style={{ marginBottom: 24, fontSize: '1rem', color: '#4A4A4A', lineHeight: 1.6 }}>
              Wil je de leiding bereiken of de maandplanning bekijken? De contactgegevens en alle takinfo vind je overzichtelijk in onze maandelijkse Kriko Echo.
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link href="/inschrijven" className="btn btn-secondary" style={{ padding: '12px 24px', fontWeight: 700 }}>
                Hoe werkt het?
              </Link>
              <Link href="/verhuur" className="btn btn-outline" style={{ padding: '12px 24px', fontWeight: 700 }}>
                Ons lokaal
              </Link>
            </div>
          </div>

          {/* Rechter kolom: Quick Stats / Info Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, justifyContent: 'center' }}>
            
            {/* Card 1: Wanneer */}
            <div style={{
              backgroundColor: 'var(--color-bg-white)',
              padding: '22px 24px',
              borderRadius: 'var(--border-radius-md)',
              boxShadow: '0 8px 24px rgba(101, 11, 25, 0.08)',
              border: '1px solid rgba(101, 11, 25, 0.12)',
              borderLeft: '6px solid var(--color-primary)',
              display: 'flex',
              gap: 18,
              alignItems: 'center',
              transition: 'transform 0.2s ease, boxShadow 0.2s ease'
            }}>
              <div style={{
                width: 50,
                height: 50,
                borderRadius: '12px',
                backgroundColor: 'rgba(101, 11, 25, 0.08)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                flexShrink: 0
              }}>
                🕒
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--color-primary-dark)', fontWeight: 800 }}>
                  Wanneer?
                </h4>
                <p style={{ margin: '4px 0 0', fontSize: '0.98rem', color: '#333333', lineHeight: 1.4 }}>
                  Elke zondag van <strong>9:45 tot 12:30</strong> (voormiddag)
                </p>
              </div>
            </div>

            {/* Card 2: Waar */}
            <div style={{
              backgroundColor: 'var(--color-bg-white)',
              padding: '22px 24px',
              borderRadius: 'var(--border-radius-md)',
              boxShadow: '0 8px 24px rgba(101, 11, 25, 0.08)',
              border: '1px solid rgba(101, 11, 25, 0.12)',
              borderLeft: '6px solid var(--color-primary)',
              display: 'flex',
              gap: 18,
              alignItems: 'center'
            }}>
              <div style={{
                width: 50,
                height: 50,
                borderRadius: '12px',
                backgroundColor: 'rgba(101, 11, 25, 0.08)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                flexShrink: 0
              }}>
                📍
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--color-primary-dark)', fontWeight: 800 }}>
                  Waar?
                </h4>
                <p style={{ margin: '4px 0 0', fontSize: '0.98rem', color: '#333333', lineHeight: 1.4 }}>
                  VP-plein (Industriepark-Noord 33), 9100 Sint-Niklaas
                </p>
              </div>
            </div>

            {/* Card 3: Echo & Contact */}
            <div style={{
              backgroundColor: 'var(--color-bg-white)',
              padding: '22px 24px',
              borderRadius: 'var(--border-radius-md)',
              boxShadow: '0 8px 24px rgba(101, 11, 25, 0.08)',
              border: '1px solid rgba(101, 11, 25, 0.12)',
              borderLeft: '6px solid var(--color-primary)',
              display: 'flex',
              gap: 18,
              alignItems: 'center'
            }}>
              <div style={{
                width: 50,
                height: 50,
                borderRadius: '12px',
                backgroundColor: 'rgba(101, 11, 25, 0.08)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                flexShrink: 0
              }}>
                📄
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--color-primary-dark)', fontWeight: 800 }}>
                  Kriko Echo &amp; Contact
                </h4>
                <p style={{ margin: '4px 0 6px', fontSize: '0.95rem', color: '#333333', lineHeight: 1.4 }}>
                  Maandelijkse planning &amp; leidinggegevens in de Echo.
                </p>
                <Link href="/echos" style={{ fontSize: '0.92rem', color: 'var(--color-primary)', fontWeight: 800, textDecoration: 'underline' }}>
                  Bekijk of download de Echo &raquo;
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* 3. Onze Takken */}
      <section className="vic-takken-section">
        <div className="page-header" style={{ padding: '36px 40px 28px', textAlign: 'center' }}>
          <span style={{
            fontSize: '0.85rem',
            color: 'var(--color-primary)',
            fontWeight: 800,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: 4
          }}>
            Voor elke leeftijd
          </span>
          <h2 className="page-header-title" style={{ margin: 0 }}>Onze Takken</h2>
        </div>
        <div className="vic-takken-grid">
          {[
            { slug: 'kapoenen',   label: 'Kapoenen',   age: '6 – 8 jaar' },
            { slug: 'welpen',     label: 'Welpen',     age: '8 – 11 jaar' },
            { slug: 'jonggivers', label: 'Jonggivers', age: '11 – 14 jaar' },
            { slug: 'givers',     label: 'Givers',     age: '14 – 17 jaar' },
          ].map(({ slug, label, age }) => (
            <Link
              key={slug}
              href={`/takken/${slug}`}
              className={`vic-tak-card tak-${slug}`}
              style={{ backgroundImage: `url(/images/tak_${slug}.jpg)` }}
            >
              <span className="vic-tak-name">{label}</span>
              <span className="vic-tak-age">{age}</span>
            </Link>
          ))}
        </div>
      </section>

      <hr className="section-divider" />

      {/* 4. Kalender & Info */}
      <section className="section container">
        <div className="home-grid">

          {/* Kalender */}
          <div className="calendar-card">
            <h3 style={{ fontSize: '1.75rem', borderBottom: '2px solid var(--color-bg-linen)', paddingBottom: 12, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <svg style={{ width: 24, height: 24, fill: 'none', stroke: 'var(--color-primary)' }} strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Aankomende Activiteiten
            </h3>
            <div className="cal-upcoming" style={{ marginTop: 0 }}>
              {events.length === 0 ? (
                <p className="cal-upcoming-empty">Er zijn momenteel geen geplande groepsactiviteiten.</p>
              ) : (
                events.map((event: CalendarEvent) => (
                  <UpcomingEvent key={event.id} event={event} todayMs={today.getTime()} />
                ))
              )}
            </div>
            <Link href="/kalender" className="calendar-view-all" style={{ marginTop: 24 }}>Bekijk alle activiteiten &rarr;</Link>
          </div>

          {/* Info zijbalk */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
            <div className="info-banner">
              <h3>Kriko Echo planning</h3>
              <p>Elke maand brengt onze leiding de &ldquo;Kriko Echo&rdquo; uit: het complete programmaboekje met alle activiteiten en informatie per tak. Zorg dat je op de hoogte bent!</p>
              <Link href="/echos" className="btn btn-primary" style={{ alignSelf: 'flex-start', fontWeight: 700 }}>
                Download de Echo &raquo;
              </Link>
            </div>

            <div style={{ backgroundColor: 'var(--color-bg-white)', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--color-border)', padding: 30 }}>
              <h4 style={{ marginBottom: 12, fontSize: '1.3rem' }}>Praktische Info</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Wanneer?', text: 'Elke zondag van 9:45 tot 12:30.' },
                  { label: 'Waar?',    text: 'VP-plein (Industriepark-Noord 33, naast drankenhandel De Vidts), 9100 Sint-Niklaas.' },
                  { label: 'Scoutswinkel (Hopper)', text: 'Algemene scoutshemden en broeken koop je bij Hopper, groepsdassen en T-shirts koop je in onze webshop.' },
                ].map(({ label, text }) => (
                  <li key={label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '1.2rem', lineHeight: 1 }}>&bull;</span>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--color-primary-dark)' }}>{label}</strong>
                      <span style={{ fontSize: '0.9rem', color: '#4A4A4A' }}>{text}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </section>

      <hr className="section-divider" />

      {/* 5. Waarom Kriko-M? (Troeven) */}
      <section className="section container">
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 800, color: 'var(--color-primary)' }}>
            Waarom kiezen voor ons?
          </span>
          <h2 style={{ fontSize: '2.2rem', color: 'var(--color-primary-dark)', fontWeight: 800, marginTop: 4 }}>
            De Troeven van Kriko-M 🌲
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          <div style={{
            backgroundColor: 'var(--color-bg-white)',
            padding: '36px 28px',
            borderRadius: 'var(--border-radius-md)',
            boxShadow: '0 8px 24px rgba(101, 11, 25, 0.06)',
            textAlign: 'center',
            borderTop: '4px solid var(--color-primary)'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🌲</div>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--color-primary-dark)', marginBottom: 12, fontWeight: 800 }}>
              Bosspelen &amp; Avontuur
            </h3>
            <p style={{ color: '#4A4A4A', fontSize: '0.98rem', lineHeight: 1.6 }}>
              Spel, sjorringen, vuur maken, avonturen in het groen en creatieve uitdagingen aangepast aan elke leeftijd.
            </p>
          </div>

          <div style={{
            backgroundColor: 'var(--color-bg-white)',
            padding: '36px 28px',
            borderRadius: 'var(--border-radius-md)',
            boxShadow: '0 8px 24px rgba(101, 11, 25, 0.06)',
            textAlign: 'center',
            borderTop: '4px solid var(--color-primary)'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🤝</div>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--color-primary-dark)', marginBottom: 12, fontWeight: 800 }}>
              Vriendschap voor het Leven
            </h3>
            <p style={{ color: '#4A4A4A', fontSize: '0.98rem', lineHeight: 1.6 }}>
              Samen lachen, grenzen verleggen en hechte vrienden maken in een warme en hechte groepssfeer.
            </p>
          </div>

          <div style={{
            backgroundColor: 'var(--color-bg-white)',
            padding: '36px 28px',
            borderRadius: 'var(--border-radius-md)',
            boxShadow: '0 8px 24px rgba(101, 11, 25, 0.06)',
            textAlign: 'center',
            borderTop: '4px solid var(--color-primary)'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🛡️</div>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--color-primary-dark)', marginBottom: 12, fontWeight: 800 }}>
              Ervaren &amp; Gedreven Leiding
            </h3>
            <p style={{ color: '#4A4A4A', fontSize: '0.98rem', lineHeight: 1.6 }}>
              Een enthousiaste ploeg vrijwilligers die elke week met vol passie zorgt voor een veilige en plezante omgeving.
            </p>
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* 6. Nieuwe Leden & Lokaalverhuur Banner */}
      <section className="section container" style={{ marginBottom: 60 }}>
        <div style={{
          backgroundColor: 'var(--color-primary-dark)',
          color: 'white',
          borderRadius: 'var(--border-radius-lg)',
          padding: '48px 36px',
          boxShadow: 'var(--shadow-lg)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 32,
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--color-accent)', fontWeight: 800 }}>
              Zin om mee te doen?
            </span>
            <h2 style={{ fontSize: '2.2rem', color: 'white', fontWeight: 800, margin: '8px 0 12px' }}>
              Kom gerust eens proberen! 🏕️
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Nieuwe leden zijn het hele jaar door welkom. Je kan altijd 2 tot 3 zondagen gratis komen proeven van de scoutssfeer.
            </p>
            <div style={{ marginTop: 24, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link href="/inschrijven" className="btn btn-secondary" style={{ padding: '12px 24px', fontWeight: 700 }}>
                Inschrijven &amp; Meer info
              </Link>
            </div>
          </div>

          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(8px)',
            padding: '32px',
            borderRadius: 'var(--border-radius-md)',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-accent)', marginBottom: 8, fontWeight: 800 }}>
              Ons Lokaal Huren? 🏠
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.98rem', marginBottom: 20, lineHeight: 1.5 }}>
              Op zoek naar een terrein of lokaal voor je jeugdbeweging of evenement op het VP-plein in Sint-Niklaas?
            </p>
            <Link href="/verhuur" className="btn btn-outline" style={{ borderColor: 'white', color: 'white', padding: '10px 20px', fontWeight: 700 }}>
              Bekijk ons verhuur &raquo;
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
