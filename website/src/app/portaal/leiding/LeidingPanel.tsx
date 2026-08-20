'use client'

import Link from 'next/link'
import { Settings } from '@/lib/types'

interface Props {
  isGroepsleiding?: boolean
  naam?: string
  settings?: Settings | null
}

export default function LeidingPanel({ isGroepsleiding = false, settings }: Props) {
  const defaultTitle = isGroepsleiding ? 'Welkom Groepsleiding' : 'Welkom Leiding'
  const customTitle = isGroepsleiding ? settings?.home_title_groepsleiding : settings?.home_title_leiding
  const homeTitle = customTitle || (settings?.home_title && settings.home_title !== 'Leidingportaal' ? settings.home_title : defaultTitle)

  const customSubtitle = isGroepsleiding ? settings?.home_subtitle_groepsleiding : settings?.home_subtitle_leiding
  const homeSubtitle = customSubtitle !== undefined ? customSubtitle : (settings?.home_subtitle || 'Je centrale dashboard voor documenten, de Echo, kalender en beheer.')

  return (
    <div>
      {/* Header Banner */}
      <header className="portaal-page-header">
        <div className="portaal-page-header-inner">
          <div>
            <h1 className="portaal-page-header-title">
              <span>⚜️</span> {homeTitle}
            </h1>
            {homeSubtitle && <p className="portaal-page-header-desc">{homeSubtitle}</p>}
          </div>
          <div className="portaal-badge portaal-badge-groenscouts">
            {isGroepsleiding ? 'Groepsleiding Account' : 'Leiding Account'}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="portaal-container">
        {/* Main Action Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 24,
          width: '100%',
        }}>
          
          {/* Card 1: Kriko Echo */}
          <Link
            href="/portaal/echos"
            className="portaal-card portaal-card-interactive"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              textDecoration: 'none',
              color: '#1A1A1A',
            }}
          >
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: '#E2EFE8',
              color: '#1A3D2A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              marginBottom: 16,
            }}>
              <i className="fa-solid fa-newspaper"></i>
            </div>
            <strong style={{ fontFamily: 'var(--font-heading), sans-serif', fontSize: '1.2rem', fontWeight: 900, marginBottom: 6, color: '#1A3D2A' }}>
              Kriko Echo
            </strong>
            <span style={{ fontSize: '.88rem', color: '#567364', lineHeight: 1.4, fontWeight: 500 }}>
              Upload en beheer de maandelijkse Kriko Echo per tak.
            </span>
          </Link>

          {/* Card 2: Documenten & Links */}
          <Link
            href="/portaal/algemene-info"
            className="portaal-card portaal-card-interactive"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              textDecoration: 'none',
              color: '#1A1A1A',
            }}
          >
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: '#E2EFE8',
              color: '#1A3D2A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              marginBottom: 16,
            }}>
              <i className="fa-solid fa-folder-open"></i>
            </div>
            <strong style={{ fontFamily: 'var(--font-heading), sans-serif', fontSize: '1.2rem', fontWeight: 900, marginBottom: 6, color: '#1A3D2A' }}>
              Documenten &amp; Links
            </strong>
            <span style={{ fontSize: '.88rem', color: '#567364', lineHeight: 1.4, fontWeight: 500 }}>
              Handige sjablonen, checklists, formulieren &amp; snelkoppelingen.
            </span>
          </Link>

          {/* Card 3: Kalender */}
          <Link
            href="/portaal/leiding/agenda"
            className="portaal-card portaal-card-interactive"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              textDecoration: 'none',
              color: '#1A1A1A',
            }}
          >
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: '#E2EFE8',
              color: '#1A3D2A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              marginBottom: 16,
            }}>
              <i className="fa-solid fa-calendar-days"></i>
            </div>
            <strong style={{ fontFamily: 'var(--font-heading), sans-serif', fontSize: '1.2rem', fontWeight: 900, marginBottom: 6, color: '#1A3D2A' }}>
              Kalender &amp; Activiteiten
            </strong>
            <span style={{ fontSize: '.88rem', color: '#567364', lineHeight: 1.4, fontWeight: 500 }}>
              Bekijk en plan activiteiten &amp; synchroniseer met je telefoon.
            </span>
          </Link>

          {/* Card 4: Website Beheer (Enkel voor Groepsleiding) */}
          {isGroepsleiding && (
            <Link
              href="/portaal/website-beheer"
              className="portaal-card portaal-card-interactive"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textDecoration: 'none',
                color: '#1A1A1A',
              }}
            >
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'rgba(101, 11, 25, 0.1)',
                color: '#650B19',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
                marginBottom: 16,
              }}>
                <i className="fa-solid fa-globe"></i>
              </div>
              <strong style={{ fontFamily: 'var(--font-heading), sans-serif', fontSize: '1.2rem', fontWeight: 900, marginBottom: 6, color: '#650B19' }}>
                Website Beheer
              </strong>
              <span style={{ fontSize: '.88rem', color: '#567364', lineHeight: 1.4, fontWeight: 500 }}>
                Live website bewerken &amp; algemene instellingen beheren.
              </span>
            </Link>
          )}

        </div>
      </div>
    </div>
  )
}
