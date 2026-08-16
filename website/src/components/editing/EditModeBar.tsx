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
      backgroundColor: '#650B19',
      color: '#fff',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '0.88rem',
      fontWeight: 700,
      fontFamily: 'var(--font-body, Outfit, sans-serif)',
      boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
      flexWrap: 'wrap',
      gap: 12,
      borderBottom: '2px solid #C9963A',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ backgroundColor: '#C9963A', color: '#1A3D2A', padding: '3px 10px', borderRadius: 6, fontSize: '0.76rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.05em' }}>
          GROEPSLEIDING
        </span>
        <span style={{ fontSize: '0.92rem' }}>
          ✏️ <strong>Live Bewerkmodus Actief</strong> — Surfen op de site blijft bewerkbaar tot je afsluit.
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link
          href="/portaal/website-beheer"
          style={{
            color: 'rgba(255,255,255,0.9)',
            textDecoration: 'none',
            fontSize: '0.84rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          &larr; Naar Portaal
        </Link>

        <button
          onClick={handleStopEditing}
          type="button"
          style={{
            backgroundColor: '#C9963A',
            color: '#1A3D2A',
            border: 'none',
            padding: '7px 16px',
            borderRadius: 8,
            fontWeight: 900,
            cursor: 'pointer',
            fontSize: '0.84rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            transition: 'transform 0.15s ease',
          }}
        >
          ✕ Sluiten &amp; Bekijken als Bezoeker
        </button>
      </div>
    </div>
  )
}
