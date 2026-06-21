'use client'
import { useEffect } from 'react'

export default function ScrollTopButton() {
  useEffect(() => {
    const btn = document.getElementById('scroll-top-btn')
    if (!btn) return

    const onScroll = () => btn.classList.toggle('visible', window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })

    const footer = document.querySelector('footer')
    let observer: IntersectionObserver | null = null
    if (footer) {
      observer = new IntersectionObserver(
        ([entry]) => btn.classList.toggle('over-footer', entry.isIntersecting),
        { threshold: 0 }
      )
      observer.observe(footer)
    }

    return () => {
      window.removeEventListener('scroll', onScroll)
      observer?.disconnect()
    }
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
