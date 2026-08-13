'use client'

import Link from 'next/link'

export default function LeidingPanel() {
  return (
    <div style={{ padding: '40px 24px', maxWidth: 960, margin: '0 auto', fontFamily: 'var(--font-body, Outfit, sans-serif)' }}>
      {/* Welcome header with short explanation */}
      <header style={{ marginBottom: 36, textAlign: 'center' }}>
        <h1 style={{ margin: 0, color: '#1A3D2A', fontWeight: 900, fontSize: '2.2rem', letterSpacing: '-0.02em' }}>
          Welkom op het Leidingsportaal ⚜️
        </h1>
        <p style={{ margin: '10px 0 0', color: '#6A8A75', fontSize: '1.05rem', lineHeight: 1.5 }}>
          Kies hieronder de gewenste pagina om direct aan de slag te gaan:
        </p>
      </header>

      {/* 3 Main Action Buttons Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
        
        {/* Card 1: Echo Upload */}
        <Link
          href="/portaal/echos"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '36px 24px',
            borderRadius: 22,
            background: '#fff',
            border: '2px solid #C2D9C9',
            textDecoration: 'none',
            color: '#1A3D2A',
            boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
            transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
          }}
          className="action-card-hover"
        >
          <div style={{ width: 64, height: 64, borderRadius: 18, background: '#EEF5F1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: 16 }}>
            🗞️
          </div>
          <strong style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: 8, color: '#1A3D2A' }}>
            Kriko Echo Upload
          </strong>
          <span style={{ fontSize: '.88rem', color: '#6A8A75', lineHeight: 1.45 }}>
            Upload en beheer de maandelijkse Kriko Echo per tak.
          </span>
        </Link>

        {/* Card 2: Kalender */}
        <Link
          href="/portaal/leiding/agenda"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '36px 24px',
            borderRadius: 22,
            background: '#fff',
            border: '2px solid #C2D9C9',
            textDecoration: 'none',
            color: '#1A3D2A',
            boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
            transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
          }}
          className="action-card-hover"
        >
          <div style={{ width: 64, height: 64, borderRadius: 18, background: '#EEF5F1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: 16 }}>
            📅
          </div>
          <strong style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: 8, color: '#1A3D2A' }}>
            Kalender & Activiteiten
          </strong>
          <span style={{ fontSize: '.88rem', color: '#6A8A75', lineHeight: 1.45 }}>
            Bekijk en plan activiteiten & synchroniseer met je telefoon.
          </span>
        </Link>

        {/* Card 3: Documenten & Links */}
        <Link
          href="/portaal/algemene-info"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '36px 24px',
            borderRadius: 22,
            background: '#fff',
            border: '2px solid #C2D9C9',
            textDecoration: 'none',
            color: '#1A3D2A',
            boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
            transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
          }}
          className="action-card-hover"
        >
          <div style={{ width: 64, height: 64, borderRadius: 18, background: '#EEF5F1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: 16 }}>
            📁
          </div>
          <strong style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: 8, color: '#1A3D2A' }}>
            Documenten & Links
          </strong>
          <span style={{ fontSize: '.88rem', color: '#6A8A75', lineHeight: 1.45 }}>
            Handige sjablonen, checklists, formulieren & nuttige snelkoppelingen.
          </span>
        </Link>

      </div>
    </div>
  )
}
