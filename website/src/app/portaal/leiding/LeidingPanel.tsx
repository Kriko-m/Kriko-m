'use client'

import Link from 'next/link'
import { Settings } from '@/lib/types'

interface Props {
  isGroepsleiding?: boolean
  naam?: string
  settings?: Settings | null
}

export default function LeidingPanel({ isGroepsleiding = false, settings }: Props) {
  const bgType = settings?.home_bg_type || 'photo'
  const bgValue = settings?.home_bg_value || '/images/hero-nieuw.webp'
  const defaultTitle = isGroepsleiding ? 'Welkom groepsleiding' : 'Welkom leiding'
  const customTitle = isGroepsleiding ? settings?.home_title_groepsleiding : settings?.home_title_leiding
  const homeTitle = customTitle || (settings?.home_title && settings.home_title !== 'Leidingportaal' ? settings.home_title : defaultTitle)

  const customSubtitle = isGroepsleiding ? settings?.home_subtitle_groepsleiding : settings?.home_subtitle_leiding
  const homeSubtitle = customSubtitle !== undefined ? customSubtitle : (settings?.home_subtitle || '')

  const backgroundStyle = bgType === 'color'
    ? { background: bgValue || '#1A3D2A' }
    : {
        backgroundColor: '#1A3D2A',
        backgroundImage: `linear-gradient(rgba(26, 61, 42, 0.62), rgba(26, 61, 42, 0.76)), url(${bgValue})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }

  return (
    <div style={{
      height: '100%',
      maxHeight: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 24px 32px',
      boxSizing: 'border-box',
      overflow: 'hidden',
      fontFamily: 'var(--font-body, Outfit, sans-serif)',
      backgroundColor: '#1A3D2A',
      ...backgroundStyle,
    }}>
      
      {/* Title Container */}
      {homeTitle && (
        <div style={{ textAlign: 'center', marginBottom: 16, color: '#fff' }}>
          <h1 style={{
            fontFamily: 'var(--font-heading, Nunito, sans-serif)',
            fontSize: 'clamp(2.2rem, 4vw, 3.4rem)',
            fontWeight: 900,
            color: '#FFFFFF',
            margin: 0,
            textShadow: '0 4px 16px rgba(0,0,0,0.4)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>
            {homeTitle}
          </h1>
          {homeSubtitle && (
            <p style={{
              margin: '8px 0 0',
              fontSize: '1.1rem',
              color: 'rgba(255, 255, 255, 0.95)',
              maxWidth: 560,
              marginInline: 'auto',
              lineHeight: 1.45,
              textShadow: '0 2px 6px rgba(0,0,0,0.4)',
              fontWeight: 600,
            }}>
              {homeSubtitle}
            </p>
          )}
        </div>
      )}

      {/* Main Action Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isGroepsleiding ? 'repeat(auto-fit, minmax(210px, 1fr))' : 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: isGroepsleiding ? 36 : 48,
        width: '100%',
        maxWidth: isGroepsleiding ? 1160 : 980,
        marginTop: 68,
      }}>
        
        {/* Card 1: Kriko Echo */}
        <Link
          href="/portaal/echos"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '24px 20px 22px',
            borderRadius: 22,
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(255, 255, 255, 0.35)',
            textDecoration: 'none',
            color: '#FFFFFF',
            boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
            transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
          className="portal-home-card"
        >
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            marginBottom: 14,
          }}>
            <i className="fa-solid fa-newspaper"></i>
          </div>
          <strong style={{ fontSize: '1.18rem', fontWeight: 900, marginBottom: 6, color: '#FFFFFF', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            Kriko Echo
          </strong>
          <span style={{ fontSize: '.84rem', color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.4, fontWeight: 500, textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
            Upload en beheer de maandelijkse Kriko Echo per tak.
          </span>
        </Link>

        {/* Card 2: Documenten & Links */}
        <Link
          href="/portaal/algemene-info"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '24px 20px 22px',
            borderRadius: 22,
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(255, 255, 255, 0.35)',
            textDecoration: 'none',
            color: '#FFFFFF',
            boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
            transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
          className="portal-home-card"
        >
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            marginBottom: 14,
          }}>
            <i className="fa-solid fa-folder-open"></i>
          </div>
          <strong style={{ fontSize: '1.18rem', fontWeight: 900, marginBottom: 6, color: '#FFFFFF', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            Documenten &amp; Links
          </strong>
          <span style={{ fontSize: '.84rem', color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.4, fontWeight: 500, textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
            Handige sjablonen, checklists, formulieren &amp; snelkoppelingen.
          </span>
        </Link>

        {/* Card 3: Kalender */}
        <Link
          href="/portaal/leiding/agenda"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '24px 20px 22px',
            borderRadius: 22,
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(255, 255, 255, 0.35)',
            textDecoration: 'none',
            color: '#FFFFFF',
            boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
            transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
          className="portal-home-card"
        >
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            marginBottom: 14,
          }}>
            <i className="fa-solid fa-calendar-days"></i>
          </div>
          <strong style={{ fontSize: '1.18rem', fontWeight: 900, marginBottom: 6, color: '#FFFFFF', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            Kalender &amp; Activiteiten
          </strong>
          <span style={{ fontSize: '.84rem', color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.4, fontWeight: 500, textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
            Bekijk en plan activiteiten &amp; synchroniseer met je telefoon.
          </span>
        </Link>

        {/* Card 4: Website Beheer (Enkel voor Groepsleiding) */}
        {isGroepsleiding && (
          <Link
            href="/portaal/website-beheer"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '24px 20px 22px',
              borderRadius: 22,
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1.5px solid rgba(255, 255, 255, 0.35)',
              textDecoration: 'none',
              color: '#FFFFFF',
              boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
              transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
            className="portal-home-card"
          >
            <div style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              marginBottom: 14,
            }}>
              <i className="fa-solid fa-globe"></i>
            </div>
            <strong style={{ fontSize: '1.18rem', fontWeight: 900, marginBottom: 6, color: '#FFFFFF', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              Website Beheer
            </strong>
            <span style={{ fontSize: '.84rem', color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.4, fontWeight: 500, textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
              Live website bewerken &amp; portaalachtergrond instellen.
            </span>
          </Link>
        )}

      </div>
    </div>
  )
}
