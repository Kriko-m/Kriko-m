'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export default function EditModeBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isGroepsleiding, setIsGroepsleiding] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  useEffect(() => {
    // Sync edit mode state with URL parameter and sessionStorage persistence
    const editQuery = searchParams.get('edit') === 'true'
    if (editQuery) {
      try {
        sessionStorage.setItem('kriko_edit_mode', 'true')
        localStorage.removeItem('kriko_edit_mode')
      } catch {}
    }

    const storedEdit = Boolean(
      typeof window !== 'undefined' &&
      (sessionStorage.getItem('kriko_edit_mode') === 'true' || localStorage.getItem('kriko_edit_mode') === 'true')
    )
    const active = editQuery || storedEdit
    setIsEditMode(active)

    // Check strictly if user is groepsleiding / admin
    fetch('/api/admin/check-groepsleiding')
      .then(res => res.json())
      .then(data => setIsGroepsleiding(Boolean(data.isGroepsleiding)))
      .catch(() => setIsGroepsleiding(false))
  }, [searchParams])

  function handleStopEditing() {
    setIsEditMode(false)
    try {
      sessionStorage.removeItem('kriko_edit_mode')
      localStorage.removeItem('kriko_edit_mode')
    } catch {}
    router.push(pathname)
  }

  // Toon de topbalk ENKEL als de gebruiker groepsleiding is én bewerkmodus actief is
  if (!isGroepsleiding || !isEditMode) return null

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 99999,
      backgroundColor: '#162544',
      color: '#ffffff',
      padding: '10px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '0.88rem',
      fontWeight: 700,
      fontFamily: 'var(--font-heading, Nunito, sans-serif)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
      flexWrap: 'wrap',
      gap: 12,
      borderBottom: '2px solid #243B6B',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ backgroundColor: '#243B6B', color: '#FFFFFF', padding: '4px 12px', borderRadius: 8, fontSize: '0.76rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.06em', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
          GROEPSLEIDING
        </span>
        <span style={{ fontSize: '0.92rem', color: '#FFFFFF' }}>
          ✏️ <strong>Live Bewerkmodus Actief</strong> — Surfen op de site blijft bewerkbaar tot je afsluit.
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Link
          href="/portaal/website-beheer"
          style={{
            color: '#FFFFFF',
            textDecoration: 'none',
            fontSize: '0.86rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            transition: 'all 0.15s ease',
          }}
        >
          &larr; Naar Portaal
        </Link>

        <button
          onClick={handleStopEditing}
          type="button"
          style={{
            backgroundColor: '#243B6B',
            color: '#FFFFFF',
            border: '1px solid rgba(255,255,255,0.2)',
            padding: '8px 18px',
            borderRadius: 10,
            fontWeight: 900,
            cursor: 'pointer',
            fontSize: '0.84rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            transition: 'all 0.15s ease',
          }}
        >
          ✕ Sluiten &amp; Bekijken als Bezoeker
        </button>
      </div>
    </div>
  )
}
