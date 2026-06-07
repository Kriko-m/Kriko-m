'use client'

export default function HeroCTA() {
  return (
    <button
      className="hero-cta"
      onClick={() => document.getElementById('welkom')?.scrollIntoView({ behavior: 'smooth' })}
    >
      Leer meer <i className="fa-solid fa-chevron-down"></i>
    </button>
  )
}
