'use client'
import { useEffect } from 'react'

export default function ScrollTopButton() {
  useEffect(() => {
    const btn = document.getElementById('scroll-top-btn')
    if (!btn) return

    let isVisible = false
    let isOverFooter = false

    const onScroll = () => {
      const shouldBeVisible = window.scrollY > 400
      if (shouldBeVisible !== isVisible) {
        isVisible = shouldBeVisible
        btn.classList.toggle('visible', isVisible)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    const footer = document.querySelector('footer')
    let observer: IntersectionObserver | null = null
    if (footer) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting !== isOverFooter) {
            isOverFooter = entry.isIntersecting
            btn.classList.toggle('over-footer', isOverFooter)
          }
        },
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
