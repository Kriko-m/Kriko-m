'use client'
import { useEffect, useRef } from 'react'

export default function LoadingScreen() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (sessionStorage.getItem('kriko_seen')) {
      el.style.display = 'none'
    } else {
      sessionStorage.setItem('kriko_seen', '1')
      setTimeout(() => {
        el.style.opacity = '0'
        el.style.transition = 'opacity 0.5s ease'
        setTimeout(() => { el.style.display = 'none' }, 500)
      }, 1200)
    }
  }, [])

  return (
    <div ref={ref} id="loading-screen" aria-hidden="true">
      <img src="/images/logo-finaal.png" alt="Kriko-M laden…" />
      <div className="loading-bar-wrap"><div className="loading-bar"></div></div>
    </div>
  )
}
