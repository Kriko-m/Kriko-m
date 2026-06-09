'use client'
import { useState, useEffect } from 'react'

export default function TourBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function checkStatus() {
      try {
        const completed = localStorage.getItem('kriko_tour_completed')
        setVisible(completed !== 'true')
      } catch {
        setVisible(false)
      }
    }

    checkStatus()

    // Listen for completion updates from the modal
    window.addEventListener('kriko_tour_updated', checkStatus)
    return () => window.removeEventListener('kriko_tour_updated', checkStatus)
  }, [])

  if (!visible) return null

  function startTour() {
    window.dispatchEvent(new Event('kriko_trigger_tour'))
  }

  function dismissTour() {
    try {
      localStorage.setItem('kriko_tour_completed', 'true')
    } catch {}
    setVisible(false)
  }

  return (
    <div
      style={{
        background: 'hsla(145,33%,36%,0.08)',
        border: '1.5px solid #C2D9C9',
        borderRadius: 16,
        padding: '16px 20px',
        marginBottom: 28,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
        fontFamily: 'var(--font-body, Outfit, sans-serif)',
        boxShadow: '0 4px 12px rgba(26,61,42,0.02)',
        animation: 'fadeIn 0.3s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 240 }}>
        <span style={{ fontSize: '1.4rem' }}>💡</span>
        <div style={{ lineHeight: 1.4 }}>
          <strong style={{ display: 'block', color: '#1A3D2A', fontSize: '.92rem' }}>
            Nieuw op het ouderportaal?
          </strong>
          <span style={{ fontSize: '.84rem', color: '#3A5A42' }}>
            Volg onze snelle rondleiding van 1 minuut om alle functies te ontdekken.
          </span>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <button
          onClick={startTour}
          className="btn btn-secondary"
          style={{ padding: '8px 16px', fontSize: '.8rem', fontWeight: 800 }}
        >
          Rondleiding starten →
        </button>
        <button
          onClick={dismissTour}
          style={{
            background: 'none',
            border: 'none',
            color: '#6A8A75',
            fontSize: '.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '6px 10px',
            textDecoration: 'underline'
          }}
        >
          Niet meer tonen
        </button>
      </div>
    </div>
  )
}
