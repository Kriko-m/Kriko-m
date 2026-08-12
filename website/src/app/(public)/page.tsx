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

      {/* 2. Welkom & Foto */}
      <section className="section container" id="welkom">
        <div className="welcome-grid" style={{ alignItems: 'stretch' }}>
          
          {/* Linker kolom: Welkomsttekst */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 style={{
              fontSize: '2.4rem',
              marginBottom: 16,
              color: 'var(--color-primary-dark)',
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: '-0.5px'
            }}>
              Welkom bij Kriko-M!
            </h2>

            <p style={{ marginBottom: 20, fontSize: '1.05rem', color: '#2B2B2B', lineHeight: 1.65 }}>
              Wat fijn dat je een kijkje komt nemen! Bij Kriko-M draait alles om avontuur, vriendschap en samen ontdekken. Elke week staat onze enthousiaste leidingsploeg klaar om onze leden een onvergetelijke tijd vol uitdagende spelen, bosrafels en fantastische herinneringen te bezorgen. Of je nu voor het eerst komt proeven van scouting of al jaren meegaat: bij ons is iedereen welkom!
            </p>

            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary-dark)', fontWeight: 800, marginBottom: 6 }}>
                Zin om mee te doen?
              </h3>
              <p style={{ marginBottom: 20, fontSize: '1.05rem', color: '#2B2B2B', lineHeight: 1.65 }}>
                Wil je lid worden of kom je graag een keertje proberen? Neem een kijkje op onze inschrijvingspagina om je aan te melden! Benieuwd waar en wanneer jouw tak afspreekt? De maandelijkse planningen en verzamelplekken vind je overzichtelijk in onze Kriko Echo.
              </p>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <Link href="/inschrijven" className="btn btn-secondary" style={{ padding: '10px 20px', fontWeight: 700 }}>
                  Naar de Inschrijvingen
                </Link>
                <Link href="/echos" className="btn btn-outline" style={{ padding: '10px 20px', fontWeight: 700 }}>
                  Bekijk de Kriko Echo
                </Link>
              </div>
            </div>
          </div>

          {/* Rechter kolom: Foto */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Image
              src="/images/leiding_25-26.jpg"
              alt="Scouts Kriko-M Leiding"
              width={800}
              height={533}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: 'var(--border-radius-lg)',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid rgba(101, 11, 25, 0.12)',
                display: 'block'
              }}
            />
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* 3. Onze Takken */}
      <section className="vic-takken-section">
        <div className="page-header" style={{ padding: '36px 40px 28px', textAlign: 'center' }}>
          <h2 className="page-header-title" style={{ margin: 0 }}>Onze Takken</h2>
        </div>
        <div className="vic-takken-grid">
          {[
            { slug: 'kapoenen',   label: 'Kapoenen' },
            { slug: 'welpen',     label: 'Welpen' },
            { slug: 'jonggivers', label: 'Jonggivers' },
            { slug: 'givers',     label: 'Givers' },
          ].map(({ slug, label }) => (
            <Link
              key={slug}
              href={`/takken/${slug}`}
              className={`vic-tak-card tak-${slug}`}
              style={{ backgroundImage: `url(/images/tak_${slug}.jpg)` }}
            >
              <span className="vic-tak-name">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      <hr className="section-divider" />

      {/* 4. Kalender & Info */}
      <section className="section container" style={{ marginBottom: 40 }}>
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
    </>
  )
}
