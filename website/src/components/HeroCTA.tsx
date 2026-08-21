'use client'

import EditableText from './editing/EditableText'

export default function HeroCTA() {
  return (
    <button
      className="hero-cta"
      onClick={() => document.getElementById('welkom')?.scrollIntoView({ behavior: 'smooth' })}
    >
      <EditableText
        blockKey="home.hero.cta"
        page="home"
        section="hero"
        defaultValue="Leer meer"
        as="span"
      />{' '}
      <i className="fa-solid fa-chevron-down"></i>
    </button>
  )
}
