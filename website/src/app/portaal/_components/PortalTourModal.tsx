'use client'
import { useState, useEffect } from 'react'

interface PortalTourModalProps {
  isOpen: boolean
  onClose: () => void
}

const SLIDES = [
  {
    title: 'Welkom bij Scouts Kriko-M! 🏕️',
    icon: '⛺',
    text: 'Welkom op ons beveiligde Leden- en Ouderportaal! Hier regel je alles voor je kinderen bij onze scouts op één centrale plek. Laten we je snel rondleiden langs de belangrijkste functies.',
    buttonText: 'Rondleiding starten'
  },
  {
    title: '👶 Leden (Kinderen) Koppelen',
    icon: '👧',
    text: 'Ga naar het tabblad "Leden" om je kinderen te koppelen. Vul eenvoudig hun voornaam, tak en Lidnummer (GA-ID) van Scouts & Gidsen Vlaanderen in. Zo herkent het portaal automatisch welke kalenders en kampen voor jouw gezin gelden!',
    buttonText: 'Volgende'
  },
  {
    title: '🏕️ Kampen & Inpaklijsten',
    icon: '🏕️',
    text: 'Onder "Kampen" schrijf je je kinderen in voor weekenden en kampen. Zodra een kind is ingeschreven, verschijnen hier ook de contactgegevens van de leiding en een interactieve inpaklijst die je op je telefoon kunt afvinken!',
    buttonText: 'Volgende'
  },
  {
    title: '📅 Gepersonaliseerde Kalender',
    icon: '📅',
    text: 'Bij "Kalender" kies je welke takken je wilt volgen. Het portaal voegt deze samen in één overzicht. Kopieer de live iCal-link om de agenda te koppelen aan je eigen Google- of Apple-agenda — nieuwe activiteiten verschijnen dan vanzelf!',
    buttonText: 'Volgende'
  },
  {
    title: '📰 Echo\'s & 🛒 Webshop',
    icon: '📰',
    text: 'Bij "Echo\'s" lees je de maandelijkse takblaadjes met de zondagplanning. Heb je een uniform of kentekens nodig? Bestel ze in de Webshop! We leggen er direct een link bij die toont waar je de insignes op het hemd moet naaien.',
    buttonText: 'Afronden'
  }
]

export default function PortalTourModal({ isOpen, onClose }: PortalTourModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Reset slide index when modal is opened
  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0)
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  function handleNext() {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      // Complete
      try {
        localStorage.setItem('kriko_tour_completed', 'true')
        window.dispatchEvent(new Event('kriko_tour_updated')) // Notify dashboard welcome banner
      } catch {}
      onClose()
    }
  }

  function handlePrev() {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const slide = SLIDES[currentSlide]

  return (
    <div className="portaal-modal-overlay" style={{ zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="portaal-modal-card" style={{ maxWidth: 500, width: '90%', borderRadius: 24, overflow: 'hidden', border: '1px solid #C2D9C9', boxShadow: '0 20px 60px rgba(26,61,42,.2)' }}>
        
        {/* Progress header bar */}
        <div style={{ background: '#EEF5F1', height: 6, width: '100%', display: 'flex' }}>
          {SLIDES.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                background: i <= currentSlide ? '#1A3D2A' : '#EEF5F1',
                transition: 'background-color 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* Modal content */}
        <div style={{ padding: '36px 36px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
          
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              right: 18,
              top: 14,
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6A8A75',
              padding: 5,
              lineHeight: 1
            }}
            aria-label="Rondleiding sluiten"
          >
            &times;
          </button>

          {/* Icon */}
          <span style={{ fontSize: '3.8rem', display: 'block', marginBottom: 20, filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.06))' }}>
            {slide.icon}
          </span>

          {/* Title */}
          <h3 style={{
            fontSize: '1.4rem',
            fontWeight: 900,
            fontFamily: 'var(--font-heading, Nunito, sans-serif)',
            color: '#1A3D2A',
            margin: '0 0 12px',
            lineHeight: 1.2
          }}>
            {slide.title}
          </h3>

          {/* Body Text */}
          <p style={{
            fontSize: '.92rem',
            lineHeight: 1.6,
            color: '#3A5A42',
            margin: '0 0 32px',
            minHeight: 88,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {slide.text}
          </p>

          {/* Navigation controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: 12 }}>
            {currentSlide > 0 ? (
              <button
                onClick={handlePrev}
                className="btn btn-outline"
                style={{ padding: '10px 20px', fontSize: '.88rem', flexShrink: 0 }}
              >
                Vorige
              </button>
            ) : (
              <div style={{ width: 80 }} /> // Spacer to balance layout
            )}

            {/* Dots */}
            <div style={{ display: 'flex', gap: 6 }}>
              {SLIDES.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i === currentSlide ? 18 : 6,
                    height: 6,
                    borderRadius: 3,
                    background: i === currentSlide ? '#C9963A' : '#C2D9C9',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="btn btn-secondary"
              style={{ padding: '10px 22px', fontSize: '.88rem', fontWeight: 800 }}
            >
              {slide.buttonText}
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}
