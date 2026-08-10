import Link from 'next/link'
import Image from 'next/image'
import { getPublicCalendarEvents } from '@/lib/db'
import HeroCTA from '@/components/HeroCTA'
import UpcomingEvent from '@/components/EventDetailModal'
import { CalendarEvent } from '@/lib/types'

export default async function HomePage() {
  const allEvents = (await getPublicCalendarEvents()) as CalendarEvent[]
  // Toon enkel aankomende activiteiten (vanaf vandaag), max. 5.
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
            <span className="hero-sub">Scouts &amp; Gidsen</span>
            <span className="hero-title">Kriko-M</span>
            <HeroCTA />
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* 2. Welkom & Introductie */}
      <section className="section container" id="welkom">
        <div className="welcome-grid">
          <div>
            <h3 style={{ fontSize: '2rem', marginBottom: 16, color: 'var(--color-primary-dark)' }}>
              Al meer dan 80 jaar scouting in Sint-Niklaas
            </h3>
            <p style={{ marginBottom: 16, fontSize: '1.05rem', color: 'var(--color-text-dark)' }}>
              Scouts Kriko-M staat voor actie, vriendschap en zelfstandigheid. Elke zondagochtend van{' '}
              <strong>9:45 tot 12:30</strong> openen wij ons lokaal op het VP-plein voor een namiddag vol
              bosspelen, sjorringen, sportieve uitdagingen en gezelligheid.
            </p>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Onze leiding is een enthousiaste en ervaren groep vrijwilligers die elke week de leukste en
              veiligste activiteiten bedenken voor onze leden. Ontdek snel in welke tak jouw kind past en
              kom gerust eens gratis proberen!
            </p>
            <div style={{ marginTop: 24, display: 'flex', gap: 16 }}>
              <Link href="/inschrijven" className="btn btn-secondary">Hoe werkt het?</Link>
              <Link href="/verhuur" className="btn btn-outline">Ons lokaal</Link>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '100%', height: 350,
              borderRadius: 'var(--border-radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              border: '4px solid var(--color-bg-white)',
              transform: 'rotate(-2deg)',
              background: 'linear-gradient(rgba(102,12,25,0.2), rgba(102,12,25,0.2)), url(/images/hero-bg.webp) center/cover',
            }} />
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* 3. Takken */}
      <section className="vic-takken-section">
        <div className="page-header" style={{ padding: '32px 40px 28px' }}>
          <h2 className="page-header-title">Onze Takken</h2>
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
              <svg style={{ width: 24, height: 24, fill: 'none', stroke: 'var(--color-secondary)' }} strokeWidth={2} viewBox="0 0 24 24">
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
                    <span style={{ color: 'var(--color-secondary)', fontWeight: 'bold', fontSize: '1.2rem', lineHeight: 1 }}>&bull;</span>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.95rem' }}>{label}</strong>
                      <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{text}</span>
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
