'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import LoadingScreen from './LoadingScreen'

interface HeaderProps {
  alertActive?: boolean
  alertMessage?: string
}

// Korte stabiele hash van de bannertekst, zodat een nieuwe melding opnieuw
// verschijnt ook al heeft de bezoeker de vorige weggeklikt.
function hashMessage(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i)
    h |= 0
  }
  return String(h)
}

export default function Header({ alertActive, alertMessage }: HeaderProps) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [takkenOpen, setTakkenOpen] = useState(false)
  const [alertDismissed, setAlertDismissed] = useState(true) // start verborgen, toon pas na check

  const alertHash = alertMessage ? hashMessage(alertMessage) : ''

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    // Toon de banner tenzij exact deze tekst al is weggeklikt.
    const dismissedHash = localStorage.getItem('kriko_alert_dismissed')
    setAlertDismissed(dismissedHash === alertHash && alertHash !== '')
  }, [alertHash])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      <LoadingScreen />

      {/* Aankondigingsbanner */}
      {alertActive && alertMessage && !alertDismissed && (
        <div className="alert-banner">
          <div className="container alert-container">
            <div className="alert-text">
              <svg style={{ width: 20, height: 20, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              <span>{alertMessage}</span>
            </div>
            <button className="alert-close" onClick={() => { localStorage.setItem('kriko_alert_dismissed', alertHash); setAlertDismissed(true) }} aria-label="Melding sluiten">&times;</button>
          </div>
        </div>
      )}

      {/* Hoofdnavigatie */}
      <header className="site-header">
        <nav className={`mainnav${menuOpen ? ' nav-open' : ''}`} id="mainnav">
          <div className="mainnav-inner">
            <Link href="/" className="nav-logo">
              <Image src="/images/logo-finaal.png" alt="Kriko-M logo" width={140} height={140} priority />
            </Link>
            <ul className="nav-links">
              <li><Link href="/info" className={isActive('/info') ? 'nav-active' : ''}>INFO</Link></li>
              <li
                className={`has-dropdown${takkenOpen ? ' open' : ''}`}
                onClick={() => setTakkenOpen(!takkenOpen)}
              >
                <Link href="/takken" className={isActive('/takken') ? 'nav-active' : ''}>
                  TAKKEN <span className="arrow">▼</span>
                </Link>
                <ul className="dropdown">
                  <li><Link href="/takken/kapoenen">Kapoenen</Link></li>
                  <li><Link href="/takken/welpen">Welpen</Link></li>
                  <li><Link href="/takken/jonggivers">Jonggivers</Link></li>
                  <li><Link href="/takken/givers">Givers</Link></li>
                </ul>
              </li>
              <li><Link href="/echos" className={isActive('/echos') ? 'nav-active' : ''}>KRIKO ECHO</Link></li>
              <li><Link href="/kalender" className={isActive('/kalender') ? 'nav-active' : ''}>KALENDER</Link></li>
              <li><Link href="/verhuur" className={isActive('/verhuur') ? 'nav-active' : ''}>VERHUUR</Link></li>
              <li className="nav-mobile-only">
                <Link href="/inschrijven" className={isActive('/inschrijven') ? 'nav-active' : ''}>INSCHRIJVEN</Link>
              </li>
            </ul>
            <Link href="/inschrijven" className="nav-cta">INSCHRIJVEN</Link>
            <button
              className="nav-hamburger"
              id="nav-hamburger"
              aria-label="Menu openen"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span></span><span></span><span></span>
            </button>
          </div>
        </nav>
      </header>

      {/* GDPR Cookiebanner */}
      <CookieBanner />
    </>
  )
}

function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('kriko_cookies')
    if (!accepted) setVisible(true)
  }, [])

  if (!visible) return null

  return (
    <div id="cookie-banner" role="dialog" aria-label="Cookie-melding">
      <span className="cookie-icon">🍪</span>
      <div className="cookie-text">
        <p>
          Scouts Kriko-M gebruikt enkel <strong>functionele cookies</strong> om je winkelmandje, voorkeuren en instellingen te onthouden — geen tracking of advertenties. Meer in onze{' '}
          <Link href="/privacy" style={{ color: 'inherit', textDecoration: 'underline' }}>privacyverklaring</Link>.
        </p>
        <div className="cookie-actions">
          <button className="cookie-btn-accept" onClick={() => { localStorage.setItem('kriko_cookies', 'yes'); setVisible(false) }}>
            Begrepen
          </button>
        </div>
      </div>
    </div>
  )
}
