'use client'
import { useEffect } from 'react'

export default function ScrollTopButton() {
  useEffect(() => {
    const btn = document.getElementById('scroll-top-btn')
    if (!btn) return
    const onScroll = () => btn.classList.toggle('visible', window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      className="scroll-top-btn"
      id="scroll-top-btn"
      aria-label="Scroll naar boven"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <i className="fa-solid fa-angles-up"></i>
    </button>
  )
}
