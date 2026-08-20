'use client'

import Link from 'next/link'
import { Settings } from '@/lib/types'

interface Props {
  isGroepsleiding?: boolean
  naam?: string
  settings?: Settings | null
}

export default function LeidingPanel({ isGroepsleiding = false, naam, settings }: Props) {
  const defaultTitle = isGroepsleiding ? `Welkom, ${naam || 'Groepsleiding'}!` : `Welkom, ${naam || 'Leiding'}!`
  const customTitle = isGroepsleiding ? settings?.home_title_groepsleiding : settings?.home_title_leiding
  const homeTitle = customTitle || (settings?.home_title && settings.home_title !== 'Leidingportaal' ? settings.home_title : defaultTitle)

  const customSubtitle = isGroepsleiding ? settings?.home_subtitle_groepsleiding : settings?.home_subtitle_leiding
  const homeSubtitle = customSubtitle !== undefined ? customSubtitle : (settings?.home_subtitle || 'Je centrale dashboard voor documenten, de Kriko Echo, kalender en beheer.')
  return (
    <div style={{
      maxWidth: 1100,
      margin: '0 auto',
      width: '100%',
      minHeight: 'calc(100vh - 120px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '40px 20px 60px',
      boxSizing: 'border-box',
    }}>
      
      {/* Centered Welcome Title & Description (without emojis or badges) */}
      <div style={{
        textAlign: 'center',
        marginBottom: 44,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
      }}>
        <h1 style={{
          fontFamily: 'var(--font-heading, Nunito, sans-serif)',
          fontSize: '2.2rem',
          fontWeight: 900,
          color: '#1A3D2A',
          margin: 0,
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
        }}>
          {homeTitle}
        </h1>
        {homeSubtitle && (
          <p style={{
            margin: 0,
            fontSize: '1.02rem',
            color: '#4A6855',
            fontWeight: 600,
            maxWidth: 640,
            lineHeight: 1.5,
          }}>
            {homeSubtitle}
          </p>
        )}
      </div>

      {/* Main Action Cards Grid (Narrower vertical cards, uniform green) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(210px, 1fr))`,
        gap: 22,
        width: '100%',
      }}>
        
        {/* Card 1: Kriko Echo */}
        <Link
          href="/portaal/echos"
          style={{
            background: '#FFFFFF',
            borderRadius: 20,
            padding: '28px 20px',
            border: '1.5px solid #C2D9C9',
            boxShadow: '0 4px 16px rgba(26,61,42,0.05)',
            textDecoration: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease-in-out',
            minHeight: 250,
          }}
          className="portaal-home-card"
        >
          <div>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: '#EEF5F1',
              border: '1.5px solid #C2D9C9',
              color: '#1A3D2A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              marginBottom: 20,
            }}>
              <i className="fa-solid fa-newspaper"></i>
            </div>
            <strong style={{
              display: 'block',
              fontFamily: 'var(--font-heading, Nunito, sans-serif)',
              fontSize: '1.2rem',
              fontWeight: 900,
              color: '#1A3D2A',
              marginBottom: 8,
              lineHeight: 1.25,
            }}>
              Kriko Echo
            </strong>
            <p style={{
              margin: 0,
              fontSize: '0.88rem',
              color: '#4A6855',
              lineHeight: 1.45,
              fontWeight: 500,
            }}>
              Upload en beheer de maandelijkse edities per tak.
            </p>
          </div>

          <div style={{
            marginTop: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 14,
            borderTop: '1px solid #EEF5F1',
            fontSize: '0.84rem',
            fontWeight: 800,
            color: '#1A3D2A',
          }}>
            <span>Echo beheer</span>
            <i className="fa-solid fa-arrow-right" style={{ transition: 'transform 0.2s ease' }}></i>
          </div>
        </Link>

        {/* Card 2: Documenten & Links */}
        <Link
          href="/portaal/algemene-info"
          style={{
            background: '#FFFFFF',
            borderRadius: 20,
            padding: '28px 20px',
            border: '1.5px solid #C2D9C9',
            boxShadow: '0 4px 16px rgba(26,61,42,0.05)',
            textDecoration: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease-in-out',
            minHeight: 250,
          }}
          className="portaal-home-card"
        >
          <div>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: '#EEF5F1',
              border: '1.5px solid #C2D9C9',
              color: '#1A3D2A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              marginBottom: 20,
            }}>
              <i className="fa-solid fa-folder-open"></i>
            </div>
            <strong style={{
              display: 'block',
              fontFamily: 'var(--font-heading, Nunito, sans-serif)',
              fontSize: '1.2rem',
              fontWeight: 900,
              color: '#1A3D2A',
              marginBottom: 8,
              lineHeight: 1.25,
            }}>
              Documenten &amp; Links
            </strong>
            <p style={{
              margin: 0,
              fontSize: '0.88rem',
              color: '#4A6855',
              lineHeight: 1.45,
              fontWeight: 500,
            }}>
              Sjablonen, checklists, formulieren &amp; snelkoppelingen.
            </p>
          </div>

          <div style={{
            marginTop: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 14,
            borderTop: '1px solid #EEF5F1',
            fontSize: '0.84rem',
            fontWeight: 800,
            color: '#1A3D2A',
          }}>
            <span>Documenten</span>
            <i className="fa-solid fa-arrow-right" style={{ transition: 'transform 0.2s ease' }}></i>
          </div>
        </Link>

        {/* Card 3: Kalender */}
        <Link
          href="/portaal/leiding/agenda"
          style={{
            background: '#FFFFFF',
            borderRadius: 20,
            padding: '28px 20px',
            border: '1.5px solid #C2D9C9',
            boxShadow: '0 4px 16px rgba(26,61,42,0.05)',
            textDecoration: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease-in-out',
            minHeight: 250,
          }}
          className="portaal-home-card"
        >
          <div>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: '#EEF5F1',
              border: '1.5px solid #C2D9C9',
              color: '#1A3D2A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              marginBottom: 20,
            }}>
              <i className="fa-solid fa-calendar-days"></i>
            </div>
            <strong style={{
              display: 'block',
              fontFamily: 'var(--font-heading, Nunito, sans-serif)',
              fontSize: '1.2rem',
              fontWeight: 900,
              color: '#1A3D2A',
              marginBottom: 8,
              lineHeight: 1.25,
            }}>
              Kalender &amp; Activiteiten
            </strong>
            <p style={{
              margin: 0,
              fontSize: '0.88rem',
              color: '#4A6855',
              lineHeight: 1.45,
              fontWeight: 500,
            }}>
              Bekijk en plan activiteiten &amp; synchroniseer met je telefoon.
            </p>
          </div>

          <div style={{
            marginTop: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 14,
            borderTop: '1px solid #EEF5F1',
            fontSize: '0.84rem',
            fontWeight: 800,
            color: '#1A3D2A',
          }}>
            <span>Kalender</span>
            <i className="fa-solid fa-arrow-right" style={{ transition: 'transform 0.2s ease' }}></i>
          </div>
        </Link>

        {/* Card 4: Website Beheer (Uniform Groen) */}
        {isGroepsleiding && (
          <Link
            href="/portaal/website-beheer"
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              padding: '28px 20px',
              border: '1.5px solid #C2D9C9',
              boxShadow: '0 4px 16px rgba(26,61,42,0.05)',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease-in-out',
              minHeight: 250,
            }}
            className="portaal-home-card"
          >
            <div>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: '#EEF5F1',
                border: '1.5px solid #C2D9C9',
                color: '#1A3D2A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
                marginBottom: 20,
              }}>
                <i className="fa-solid fa-globe"></i>
              </div>
              <strong style={{
                display: 'block',
                fontFamily: 'var(--font-heading, Nunito, sans-serif)',
                fontSize: '1.2rem',
                fontWeight: 900,
                color: '#1A3D2A',
                marginBottom: 8,
                lineHeight: 1.25,
              }}>
                Website Beheer
              </strong>
              <p style={{
                margin: 0,
                fontSize: '0.88rem',
                color: '#4A6855',
                lineHeight: 1.45,
                fontWeight: 500,
              }}>
                Live website bewerken, instellingen en accounts beheren.
              </p>
            </div>

            <div style={{
              marginTop: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 14,
              borderTop: '1px solid #EEF5F1',
              fontSize: '0.84rem',
              fontWeight: 800,
              color: '#1A3D2A',
            }}>
              <span>Website beheer</span>
              <i className="fa-solid fa-arrow-right" style={{ transition: 'transform 0.2s ease' }}></i>
            </div>
          </Link>
        )}

      </div>
    </div>
  )
}
